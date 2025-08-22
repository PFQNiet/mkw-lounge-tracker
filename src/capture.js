/** @typedef {import("./mogi.js").Mogi} Mogi */

import { OCR_GRID, processResultsScreen } from "./ocr.js";
import { Race } from "./race.js";
import { error, info } from "./ui/toast.js";
import { ctx2d } from "./util.js";

/**
 * Capture a single frame from a video element into a canvas.
 * @param {HTMLVideoElement} videoEl
 * @param {HTMLCanvasElement} [canvas]
 * @returns {HTMLCanvasElement} The given canvas, or a new one
 */
export function captureFrame(videoEl, canvas=document.createElement('canvas')) {
	const { canvasWidth: w, canvasHeight: h } = OCR_GRID;
	canvas.width = w; canvas.height = h;
	const ctx = ctx2d(canvas, { willReadFrequently: true });
	const vidW = videoEl.videoWidth, vidH = videoEl.videoHeight;
	if (!vidW || !vidH) return canvas; // video not loaded, return empty frame
	const scale = Math.min(vidW / w, vidH / h);
	const sx = Math.floor((vidW - w * scale) / 2), sy = Math.floor((vidH - h * scale) / 2);
	const sW = Math.floor(w * scale), sH = Math.floor(h * scale);
	ctx.drawImage(videoEl, sx, sy, sW, sH, 0, 0, w, h);
	return canvas;
}

/**
 * Lightweight pre-processing (scale 2x, grayscale + threshold).
 * @param {HTMLCanvasElement} src
 * @param {{x:number,y:number,w:number,h:number}} r
 * @param {number} [scale]
 * @param {HTMLCanvasElement} [scratch]
 */
export function preprocessCrop(src, r, scale=1, scratch=document.createElement('canvas')) {
	scratch.width = r.w * scale; scratch.height = r.h * scale;
	const pctx = ctx2d(scratch, { willReadFrequently: true });
	pctx.imageSmoothingEnabled = false;
	pctx.drawImage(src, r.x, r.y, r.w, r.h, 0, 0, r.w * scale, r.h * scale);

	const img = pctx.getImageData(0, 0, scratch.width, scratch.height);
	const thr = 240; // aggressive threshold
	let whitePixels = 0;
	for (let i = 0; i < img.data.length; i += 4) {
		const r0 = img.data[i] ?? 0, g0 = img.data[i + 1] ?? 0, b0 = img.data[i + 2] ?? 0;
		const y0 = (r0 * 299 + g0 * 587 + b0 * 114) / 1000;
		const v = y0 > thr ? 255 : 0;
		img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
		if (v === 255) whitePixels++;
	}
	const whiteRatio = whitePixels / (scratch.width * scratch.height);
	pctx.putImageData(img, 0, 0);
	return { canvas: scratch, whiteRatio };
}

/**
 * Turn a pre-captured canvas into a Blob URL.
 * @param {HTMLCanvasElement} base
 * @returns {Promise<string>}
 */
export function snapshotBlobUrlFromCanvas(base) {
	return new Promise((resolve, reject) => {
		base.toBlob(b => {
			b ? resolve(URL.createObjectURL(b)) : reject(new Error('toBlob failed'));
		}, 'image/png');
	});
}

/**
 * Capture a frame and OCR the results screen.
 * @param {HTMLVideoElement} video
 * @param {Mogi} mogi
 */
export async function performCapture(video, mogi) {
	try {
		const base = captureFrame(video);
		// Do OCR first; this may throw MANUAL_CANCELLED or NO_SCOREBOARD
		const placements = await processResultsScreen(base, mogi.roster);

		// Only if successful, make the snapshot and push the race
		const snapshotUrl = await snapshotBlobUrlFromCanvas(base);
		const race = new Race(Date.now(), placements, snapshotUrl);
		mogi.addRace(race);
	} catch (e) {
		// If the user canceled manual resolve, just abort quietly
		if (/** @type {any} */(e)?.code === 'MANUAL_CANCELLED') {
			console.log('Capture canceled by user.');
			info('Capture canceled.');
			return;
		}
		// If no scoreboard found, warn the user
		if (/** @type {any} */(e)?.code === 'NO_SCOREBOARD') {
			console.log('No scoreboard detected in frame.');
			error('No scoreboard detected — try capturing on the results screen.');
			return;
		}
		// Otherwise, surface the error
		console.error(e);
		error('OCR failed. See console for details.');
	}
}
