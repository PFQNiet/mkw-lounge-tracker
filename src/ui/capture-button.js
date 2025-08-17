/** @typedef {import("../mogi.js").Mogi} Mogi */
/** @typedef {import("../race.js").Placement} Placement */

import { captureFrame, snapshotBlobUrlFromCanvas } from "../capture.js";
import { OCR_GRID, processResultsScreen } from "../ocr.js";
import { Race } from "../race.js";

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

	if (!deviceId) { video.srcObject = null; return; }
	try {
		localStorage.setItem('lastSelectedCamera', deviceId);
		const stream = await navigator.mediaDevices.getUserMedia({
			video: { deviceId: { exact: deviceId } }, audio: false
		});
		video.srcObject = stream;
		await video.play();
	} catch (err) {
		console.error(err);
		video.srcObject = null;
		alert('Could not start the selected camera.');
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
			alert('You have reached the maximum number of races.');
			return;
		}
		captureButton.disabled = true;
		captureButton.textContent = 'Processing…';
		try {
			const base = captureFrame(video, OCR_GRID.canvasWidth, OCR_GRID.canvasHeight);
			// Do OCR first; this may throw MANUAL_CANCELLED
			const placements = await processResultsScreen(base, mogi.roster);

			// Only if successful, make the snapshot and push the race
			const snapshotUrl = await snapshotBlobUrlFromCanvas(base);
			const race = new Race(Date.now(), placements, snapshotUrl);
			mogi.addRace(race);
		} catch (e) {
			// If the user canceled manual resolve, just abort quietly
			if (/** @type {any} */(e)?.code === 'MANUAL_CANCELLED') {
				console.log('Capture canceled by user.');
				return;
			}
			// Otherwise, surface the error
			console.error(e);
			alert('OCR failed. See console for details.');
		} finally {
			captureButton.disabled = false;
			captureButton.textContent = captureButtonText;
		}
	});

	mogi.addEventListener('update', () => {
		const latest = mogi.races.at(-1);
		if (!latest) return;
		renderResults(resultsList, latest.placements);
	});
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
