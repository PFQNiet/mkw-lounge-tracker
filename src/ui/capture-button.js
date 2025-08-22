/** @typedef {import("../mogi.js").Mogi} Mogi */
/** @typedef {import("../race.js").Placement} Placement */

import { performCapture } from "../capture.js";
import { ROSTER_SIZE } from "../roster.js";
import { error, info, success, warning } from "./toast.js";

/**
 * @param {HTMLSelectElement} cameraSelect
 * @param {HTMLVideoElement} video
 */
export async function setupCameraList(cameraSelect, video) {
	try { const s = await navigator.mediaDevices.getUserMedia({ video: true }); s.getTracks().forEach(t => t.stop()); } catch { }
	const devices = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput');
	cameraSelect.innerHTML = '';
	if (!devices.length) cameraSelect.add(new Option('(no cameras)', ''));
	else {
		cameraSelect.add(new Option('— Select camera —', ''));
		for (const d of devices) {
			cameraSelect.add(new Option(d.label || `Camera ${d.deviceId.slice(0, 6)}`, d.deviceId));
		}
	}
	cameraSelect.addEventListener('change', async () => await startSelectedCamera(cameraSelect.value, video));

	const lastSelectedCamera = localStorage.getItem('lastSelectedCamera');
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
		info('Camera stopped.');
		return;
	}
	try {
		localStorage.setItem('lastSelectedCamera', deviceId);
		const stream = await navigator.mediaDevices.getUserMedia({
			video: { deviceId: { exact: deviceId } }, audio: false
		});
		video.srcObject = stream;
		await video.play();
		success(`Camera started: ${stream.getVideoTracks()[0]?.label || deviceId.slice(0, 6)}`);
	} catch (err) {
		console.error(err);
		video.srcObject = null;
		error('Could not start the selected camera.');
	}
}

/**
 * @param {HTMLButtonElement} captureButton
 * @param {HTMLVideoElement} video
 * @param {HTMLOListElement} resultsList
 * @param {Mogi} mogi
 */
export function setupCaptureButton(captureButton, video, resultsList, mogi) {
	const captureButtonText = captureButton.textContent;
	captureButton.addEventListener('click', async () => {
		if( mogi.ended) {
			warning('You have reached the maximum number of races.');
			return;
		}
		captureButton.disabled = true;
		captureButton.textContent = 'Processing…';
		await performCapture(video, mogi);
		captureButton.disabled = false;
		captureButton.textContent = captureButtonText;
	});

	mogi.addEventListener('update', () => {
		const latest = mogi.races.at(-1);
		if (!latest) renderEmptyResults(resultsList);
		else renderResults(resultsList, latest.placements);
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
		rank.style.width = '2ch';
		rank.textContent = `${i+1}.`;
		const name = document.createElement('span');
		name.style.flex = '1 1 auto';
		name.textContent = '—';
		const ocr = document.createElement('span');
		ocr.className = 'muted mono';
		ocr.textContent = 'OCR: —';
		li.append(rank, name, ocr);
		resultsList.appendChild(li);
	}
}

/**
 * @param {HTMLOListElement} resultsList
 * @param {Placement[]} placements
 */
function renderResults(resultsList, placements) {
	resultsList.innerHTML = '';
	for (const r of placements) {
		const li = document.createElement('li');

		const rank = document.createElement('span');
		rank.className = 'mono';
		rank.style.width = '2ch';
		rank.textContent = `${r.placement}.`;

		const name = document.createElement('span');
		name.style.flex = '1 1 auto';
		if (r.resolvedName) name.textContent = r.resolvedName;
		else {
			const em = document.createElement('em');
			em.className = 'muted';
			em.textContent = '(unresolved)';
			name.appendChild(em);
		}

		const ocr = document.createElement('span');
		ocr.className = 'muted mono';
		ocr.textContent = `OCR: “${r.ocrText}” · ${Math.round(r.ocrConfidence)}%`;

		li.append(rank, name, ocr);
		resultsList.appendChild(li);
	}
}
