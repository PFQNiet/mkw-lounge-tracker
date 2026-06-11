/** @typedef {import("../mogi.js").Mogi} Mogi */
/** @typedef {import("../race.js").Placement} Placement */

import { captureResultsScreen } from "../capture.js";
import { t } from "../i18n/i18n.js";
import { ROSTER_SIZE } from "../roster.js";
import { Config, toLetter } from "../util.js";
import { error, info, success, warning } from "./toast.js";

const lastCameraConfigKey = 'lastSelectedCamera';

/**
 * @param {HTMLSelectElement} cameraSelect
 * @param {HTMLVideoElement} video
 */
export async function setupCameraList(cameraSelect, video) {
	try { const s = await navigator.mediaDevices.getUserMedia({ video: true }); s.getTracks().forEach(t => t.stop()); } catch { }
	const devices = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput');
	cameraSelect.innerHTML = '';
	if (!devices.length) cameraSelect.add(new Option(t('capture.noCameras'), ''));
	else {
		cameraSelect.add(new Option(t('capture.selectCamera'), ''));
		for (const d of devices) {
			cameraSelect.add(new Option(d.label || t('capture.cameraFallbackLabel', { deviceId: d.deviceId.slice(0, 6) }), d.deviceId));
		}
	}
	cameraSelect.addEventListener('change', async () => await startSelectedCamera(cameraSelect.value, video));

	const lastSelectedCamera = Config.get(lastCameraConfigKey);
	if (lastSelectedCamera) {
		cameraSelect.value = lastSelectedCamera;
		await startSelectedCamera(lastSelectedCamera, video);
	}
}

/**
 * @param {string} deviceId
 * @param {HTMLVideoElement} video
 */
async function startSelectedCamera(deviceId, video) {
	const old = /** @type {MediaStream|null} */(video.srcObject);
	if (old) old.getTracks().forEach(t => t.stop());

	if (!deviceId) {
		video.srcObject = null;
		info(t('capture.cameraStopped'));
		return;
	}
	try {
		Config.set(lastCameraConfigKey, deviceId);
		const stream = await navigator.mediaDevices.getUserMedia({
			video: { deviceId: { exact: deviceId } }, audio: false
		});
		video.srcObject = stream;
		await video.play();
		success(t('capture.cameraStarted', { label: stream.getVideoTracks()[0]?.label || deviceId.slice(0, 6) }));
	} catch (err) {
		console.error(err);
		video.srcObject = null;
		error(t('capture.cameraFailedToStart'));
	}
}

/**
 * @param {HTMLButtonElement} captureButton
 * @param {HTMLVideoElement} video
 * @param {HTMLOListElement} resultsList
 * @param {Mogi} mogi
 */
export function setupCaptureButton(captureButton, video, resultsList, mogi) {
	captureButton.addEventListener('click', async () => {
		if( mogi.ended) {
			warning(t('capture.maxRacesReached'));
			return;
		}
		captureButton.disabled = true;
		captureButton.textContent = t('processing');
		await captureResultsScreen(video, mogi);
		captureButton.disabled = false;
		captureButton.textContent = t('capture.captureButton');
	});

	mogi.addEventListener('update', () => {
		const latest = mogi.races.at(-1);
		if (!latest) renderEmptyResults(resultsList);
		else renderResults(resultsList, latest.placements, mogi);
	});
}

/**
 * @param {HTMLOListElement} resultsList
 */
function renderEmptyResults(resultsList) {
	resultsList.innerHTML = '';
	for( let i=0; i<ROSTER_SIZE; i++) {
		const li = document.createElement('li');
		const rank = document.createElement('span');
		rank.className = 'mono';
		rank.style.width = '3ch';
		rank.textContent = `${i+1}.`.padStart(3, ' ');
		const name = document.createElement('span');
		name.style.flex = '1 1 auto';
		name.textContent = t('blank');
		const ocr = document.createElement('span');
		ocr.className = 'muted mono';
		ocr.textContent = t('blank');
		li.append(rank, name, ocr);
		resultsList.appendChild(li);
	}
}

/**
 * @param {Placement} r
 * @param {string} colour
 * @param {Mogi} mogi
 */
function makePlacementLi(r, colour, mogi) {
	const li = document.createElement('li');
	if (colour) li.style.background = `linear-gradient(to right, ${colour}80, ${colour}20)`;

	const rank = document.createElement('span');
	rank.className = 'mono';
	rank.style.width = '3ch';
	rank.textContent = `${r.placement}.`.padStart(3, ' ');

	const name = document.createElement('span');
	name.style.flex = '1 1 auto';
	if (r.resolvedName) name.textContent = r.resolvedName;
	else {
		const em = document.createElement('em');
		em.className = 'muted';
		em.textContent = t('capture.unresolved');
		name.appendChild(em);
	}

	const ocr = document.createElement('span');
	ocr.className = 'muted mono';
	ocr.textContent = t('capture.ocrResult', { ocrText: r.ocrText, ocrConfidence: r.ocrConfidence });

	li.append(rank, name, ocr);
	return li;
}

/**
 * @param {HTMLOListElement} resultsList
 * @param {Placement[]} placements
 * @param {Mogi} mogi
 */
function renderResults(resultsList, placements, mogi) {
	resultsList.innerHTML = '';

	if (mogi.roster.isWar) {
		// Calculate each team's score for this race
		const teamScores = new Map();
		for (const r of placements) {
			const player = mogi.roster.byId(r.playerId ?? '');
			if (!player) continue;
			teamScores.set(player.seed, (teamScores.get(player.seed) || 0) + r.score);
		}
		const totalScore = [...teamScores.values()].reduce((a, b) => a + b, 0);
		const numTeams = teamScores.size || 1;

		// Group placements by team seed (preserving placement order within each group)
		const groups = new Map();
		for (const r of placements) {
			const seed = mogi.roster.byId(r.playerId ?? '')?.seed ?? 0;
			if (!groups.has(seed)) groups.set(seed, []);
			groups.get(seed).push(r);
		}

		for (const [seed, group] of [...groups].sort((a, b) => a[0] - b[0])) {
			const teamData = mogi.teamBySeed(seed);
			const colour = teamData?.colour || '#000000';
			const teamScore = teamScores.get(seed) || 0;
			const delta = numTeams > 1 ? teamScore - (totalScore - teamScore) / (numTeams - 1) : 0;

			const headerLi = document.createElement('li');
			headerLi.className = 'team-result-header';
			headerLi.style.background = `${colour}30`;

			const tag = document.createElement('strong');
			tag.textContent = teamData?.tag || toLetter(seed);

			const spacer = document.createElement('ins');
			spacer.className = 'spacer';

			const score = document.createElement('span');
			score.className = 'mono';
			score.textContent = String(teamScore);

			const diff = document.createElement('span');
			diff.className = `mono ${delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'muted'}`;
			diff.textContent = delta > 0 ? `+${delta}` : `${delta}`;

			headerLi.append(tag, spacer, score, diff);
			resultsList.appendChild(headerLi);

			for (const r of group) {
				resultsList.appendChild(makePlacementLi(r, colour, mogi));
			}
		}
	} else {
		for (const r of placements) {
			resultsList.appendChild(makePlacementLi(r, '', mogi));
		}
	}
}
