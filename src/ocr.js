import Tesseract from 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js';
import { preprocessCrop } from './capture.js';
import { normalizeName } from './player.js';
import { Placement } from './race.js';
import { manualResolve } from './ui/manual-resolution-dialog.js';
import { popcount } from './util.js';

/** @typedef {import("./roster.js").Roster} Roster */

/**
 * Build row rectangles from simple parameters
 * @param {{count:number,startY:number,rowHeight:number,vPad:number,x:number,w:number}} p
 */
function generateRowRects(p) {
	const rects = [];
	for (let i = 0; i < p.count; i++) {
		rects.push({
			x: p.x,
			y: Math.round(p.startY + i * p.rowHeight) + p.vPad,
			w: p.w,
			h: p.rowHeight - 2 * p.vPad
		});
	}
	return rects;
}
export const OCR_GRID = {
	canvasWidth: 1920,
	canvasHeight: 1080,
	nameRects: generateRowRects({ count: 12, startY: 40, rowHeight: 77, vPad: 15, x: 1270, w: 340 }),
};

/**
 * Directional, weighted edit distance from a -> b.
 * Costs are integers (keeps the assignment DP happy).
 * @param {string} a
 * @param {string} b
 * @param {{ins:number, del:number, sub:number}} w
 */
function levenshteinWeighted(a, b, w = { ins: 1, del: 1, sub: 1 }) {
	if (a === b) return 0;
	const al = a.length, bl = b.length;
	if (!al) return bl * w.ins;
	if (!bl) return al * w.del;

	const v0 = new Array(bl + 1);
	const v1 = new Array(bl + 1);
	for (let j = 0; j <= bl; j++) v0[j] = j * w.ins;

	for (let i = 0; i < al; i++) {
		v1[0] = (i + 1) * w.del;
		const ca = a.charCodeAt(i);
		for (let j = 0; j < bl; j++) {
			const cb = b.charCodeAt(j);
			const costSub = ca === cb ? 0 : w.sub;
			v1[j + 1] = Math.min(
				v1[j] + w.ins,        // insert into a (extra char in b)
				v0[j + 1] + w.del,    // delete from a
				v0[j] + costSub       // substitute / match
			);
		}
		for (let j = 0; j <= bl; j++) v0[j] = v1[j];
	}
	return v1[bl];
}

/**
 * Solve the assignment (player i -> row j) minimizing total integer costs.
 * @param {number[][]} cost - NxN matrix where cost[i][j] is the cost to map player i to row j
 * @returns {number[]} assignment array A of length N where A[i] = j (row index for player i)
 */
function solveAssignmentDP(cost) {
	const n = cost.length, SIZE = 1 << n;
	/** @type {number[]} */ const dp = new Array(SIZE).fill(Infinity);
	/** @type {number[]} */ const parent = new Array(SIZE).fill(-1);
	/** @type {number[]} */ const choice = new Array(SIZE).fill(-1);
	dp[0] = 0;

	for (let mask = 0; mask < SIZE; mask++) {
		const i = popcount(mask);                 // next player index
		if (i >= n) continue;
		const base = dp[mask] ?? NaN;
		for (let j = 0; j < n; j++) {
			if (mask & (1 << j)) continue;          // row j already used
			const cell = cost[i]?.[j] ?? NaN;
			const m2 = mask | (1 << j);
			const val = base + cell;
			if (val < (dp[m2] ?? NaN)) {
				dp[m2] = val;
				parent[m2] = mask;
				choice[m2] = j;
			}
		}
	}

	// reconstruct
	const assign = new Array(n).fill(-1);
	let mask = SIZE - 1;
	for (let i = n - 1; i >= 0; i--) {
		const j = choice[mask];
		assign[i] = j;
		mask = parent[mask] ?? NaN;
	}
	return assign;
}

let _worker = /** @type {any} */(null);
async function getWorker() {
	if (_worker) return _worker;
	_worker = await Tesseract.createWorker('eng', 1, { logger: () => { } });
	return _worker;
}

const scratch = document.createElement('canvas');

/**
 * Core API — kicks off capture, OCR, fuzzy match, optional manual resolve, then resolves placements.
 * @param {HTMLCanvasElement} canvas
 * @param {Roster} roster
 * @returns {Promise<Placement[]>}
 */
export async function processResultsScreen(canvas, roster) {
	const { nameRects } = OCR_GRID;
	const whitelist = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 -_[]|.',
		levCosts = { ins: 3, del: 1, sub: 2 },
		maxEditDistance = 10;

	const worker = await getWorker();
	await worker.setParameters({
		tessedit_char_whitelist: whitelist,
		preserve_interword_spaces: '1', user_defined_dpi: '300',
		load_system_dawg: 'F', load_freq_dawg: 'F', textord_heavy_nr: '1',
		tessedit_pageseg_mode: '7' // SINGLE_LINE
	});

	/** @type {{ text:string, confidence:number }[]} */
	const rawRows = [];
	for (const rect of nameRects) {
		const { canvas: img, whiteRatio } = preprocessCrop(canvas, rect, 2, scratch);
		if (whiteRatio < 0.02) {
			rawRows.push({ text: '', confidence: 0 });
			continue;
		}
		const { data } = await worker.recognize(img);
		const best = (data?.text ?? '').replace(/\s+/g, ' ').trim();
		const conf = (data && Number.isFinite(data.confidence)) ? data.confidence : 0;
		rawRows.push({ text: best, confidence: conf });
	}

	// Prepare normalized data
	const normRoster = [...roster].map(p => ({ id: p.id, name: p.name, norm: normalizeName(p.name) }));
	const placements = rawRows.map((row, i) => new Placement(i + 1, null, row.text, row.text, row.confidence, false));
	const normRows = rawRows.map(r => normalizeName(r.text));

	// Early exit if 2+ blanks
	if (normRows.filter(s => !s).length > 2) {
		const err = new Error('No scoreboard detected');
		// @ts-ignore add a code for easy identification
		err.code = 'NO_SCOREBOARD';
		throw err;
	}

	// Build an integer cost matrix: players (rows) × OCR rows (cols)
	const N = normRoster.length; // expect 12
	const isBlankCol = normRows.map(s => !s);

	// Use IGN if available, else roster name, for each player
	const targetNorm = [...roster].map(p => normalizeName(p.ign ?? p.name));

	// Map known IGNs -> owner index (for strong preference)
	/** @type {Map<string, number>} */
	const ignOwner = new Map();
	[...roster].forEach((p, i) => {
		if (p.ign) {
			ignOwner.set(normalizeName(p.ign), i);
		}
	});

	/** @type {number[][]} */
	const cost = Array.from({ length: N }, () => Array(N).fill(0));

	let maxNonBlankCost = 0;
	// Pass 1: fill non-blank base costs and track the maximum seen
	for (let i = 0; i < N; i++) {
		for (let j = 0; j < N; j++) {
			if (isBlankCol[j]) continue;
			const d = levenshteinWeighted(targetNorm[i], normRows[j], levCosts);
			cost[i][j] = d;
			if (d > maxNonBlankCost) maxNonBlankCost = d;
		}
	}

	// Choose penalties
	const BLANK_COST = maxNonBlankCost + 2;        // blanks are strictly worse than any non-blank match
	const IGN_MISMATCH_PENALTY = maxNonBlankCost + 50; // big stick for stealing someone else's IGN

	// Pass 2: assign blank costs
	for (let i = 0; i < N; i++) {
		for (let j = 0; j < N; j++) {
			if (isBlankCol[j]) cost[i][j] = BLANK_COST;
		}
	}

	// Pass 3: if a row exactly matches a known IGN, heavily penalize assigning it to anyone else.
	for (let j = 0; j < N; j++) {
		if (isBlankCol[j]) continue;
		const owner = ignOwner.get(normRows[j]);
		if (owner == null) continue;
		for (let i = 0; i < N; i++) {
			if (i === owner) continue;
			cost[i][j] += IGN_MISMATCH_PENALTY;
		}
	}

	// Solve globally: which OCR row should each player map to?
	const assign = solveAssignmentDP(cost);

	// Apply assignment (invert to fill per-row placements) and record distances
	/** @type {number[]} */ const assignedDist = new Array(N).fill(0);
	for (let i = 0; i < N; i++) {
		const j = assign[i];
		placements[j] = placements[j].withPlayerIdAndResolvedName(normRoster[i].id, normRoster[i].name);
		assignedDist[j] = cost[i][j];
	}

	// Ambiguity handling:
	//  - Mark blank rows as disconnected
	//  - If a row has *non-blank* OCR and its assigned distance exceeds maxEditDistance, revoke assignment
	for (let j = 0; j < N; j++) {
		const isBlank = !normRows[j];
		if (isBlank) {
			placements[j] = placements[j].withPlacement(placements[j].placement, true);
		}
		else if (assignedDist[j] > maxEditDistance) {
			placements[j] = placements[j].withPlayerIdAndResolvedName(null, placements[j].ocrText);
		}
	}

	// If anything is unresolved, open the manual resolver with the remaining players
	if (placements.some(p => !p.playerId)) {
		const remaining = normRoster.filter(p => !placements.some(r => r.playerId === p.id));
		if (remaining.length === 1) {
			// One mismatch: just auto-assign it
			const missingIndex = placements.findIndex(p => !p.playerId);
			placements[missingIndex] = placements[missingIndex].withPlayerIdAndResolvedName(remaining[0].id, remaining[0].name);
		}
		else {
			const confirmed = await manualResolve(placements, remaining);
			if (!confirmed) {
				const err = new Error('Manual resolve canceled');
				// @ts-ignore add a code for easy identification
				err.code = 'MANUAL_CANCELLED';
				throw err;
			}
		}
	}

	return placements;
}
