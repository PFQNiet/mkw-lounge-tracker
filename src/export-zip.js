/**
 * @typedef {import("./mogi.js").Mogi} Mogi
 */

import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';

/**
 * @param {Mogi} mogi
 */
function formatManifest(mogi) {
	return JSON.stringify({
		meta: {
			createdAt: mogi.startDate.toISOString(),
			formatVersion: 1
		},
		roster: [...mogi.roster].map(p => ({
			id: p.id,
			name: p.name,
			seed: p.seed ?? null,
			mmr: p.mmr ?? null,
			ign: p.ign ?? null
		})),
		races: mogi.races.map(r => ({
			timestamp: r.timestamp,
			placements: r.placements.map(x => ({
				placement: x.placement,
				playerId: x.playerId,
				resolvedName: x.resolvedName,
				ocrText: x.ocrText,
				ocrConfidence: x.ocrConfidence,
				dc: x.dc === true
			}))
		}))
	}, null, 2);
}

/**
 * @param {Mogi} mogi
 */
function formatRoster(mogi) {
	return [...mogi.roster].map(p => p.toRosterString()).join('\n')+'\n';
}

/**
 * @param {Mogi} mogi
 */
function formatResults(mogi) {
	const races = mogi.races;
	const scores = new Map();
	const longestNameLength = Math.max(...[...mogi.roster].map(p => p.name.length));
	const results = [];
	for (let i=0; i<races.length; i++) {
		const race = races[i];
		const playerScores = race.calculatePlayerScores();
		let raceData = `RACE ${i+1} recorded at ${new Date(race.timestamp).toLocaleTimeString()}\n\n`;
		for (const placement of race.placements) {
			const playerId = placement.playerId ?? "";
			const score = playerScores.get(playerId) ?? 0;
			const oldScore = scores.get(playerId) ?? 0;
			scores.set(playerId, oldScore + score);
			raceData += `${String(placement.placement).padStart(2)}. ${placement.resolvedName.padEnd(longestNameLength)} `
				+ `+${String(score).padStart(2)} (${String(oldScore).padStart(3)} -> ${String(oldScore + score).padStart(3)})\n`;
		}
		results.push(raceData);
	}
	return results.join('\n==========\n\n');
}

/**
 * Create a ZIP Blob for the session.
 * @param {Mogi} mogi
 * @returns {Promise<Blob>}
 */
async function createSessionZip(mogi) {
	const zip = new JSZip();

	const manifest = formatManifest(mogi);
	const rosterText = formatRoster(mogi);
	const scoresText = formatResults(mogi);

	zip.folder('races');
	zip.file('manifest.json', manifest);
	zip.file('roster.txt', rosterText);
	zip.file('scores.txt', scoresText);

	// -- snapshots (JPEG blobs from object URLs)
	const races = mogi.races;
	for (let i=0; i<races.length; i++) {
		const r = races[i];
		const num = String(i+1).padStart(2, '0');
		const jpegName = `races/race-${num}.jpg`;
		const res = await fetch(r.snapshotUrl);
		const blob = await res.blob();
		zip.file(jpegName, blob, { date: new Date(r.timestamp) });
	}

	// -- build ZIP
	const resultBlob = await zip.generateAsync({
		type: 'blob',
		compression: 'DEFLATE',
		compressionOptions: { level: 9 }
	});
	return resultBlob;
}

/**
 * @param {Blob} zipFile
 * @param {string} [fileName]
 */
function downloadZip(zipFile, fileName=defaultZipName()) {
	const url = URL.createObjectURL(zipFile);
	try {
		const a = document.createElement('a');
		a.href = url;
		a.download = `${fileName}.zip`;
		document.body.appendChild(a);
		a.click();
		a.remove();
	} finally {
		// revoke a bit later so Firefox can finish the download binding
		setTimeout(() => URL.revokeObjectURL(url), 2000);
	}
}

/**
 * @param {Date} [d]
 */
function defaultZipName(d) {
	d = d ?? new Date();
	const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
	return `mogi-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

/**
 * @param {Mogi} mogi
 */
export async function exportZip(mogi) {
	const zipFile = await createSessionZip(mogi);
	downloadZip(zipFile, defaultZipName(mogi.startDate));
}
