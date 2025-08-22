import { Mogi } from "./src/mogi.js";
import { setupAutoCapture } from "./src/ui/autocapture-toggle.js";
import { setupCameraList, setupCaptureButton } from "./src/ui/capture-button.js";
import { connectExportButton } from "./src/ui/export-results-dialog.js";
import { connectGallery } from "./src/ui/gallery.js";
import { connectScoreboard } from "./src/ui/scoreboard.js";
import { requestRoster } from "./src/ui/set-roster-dialog.js";

async function main() {
	const step1 = /** @type {HTMLDivElement} */(document.getElementById('step1'));
	const step2 = /** @type {HTMLDivElement} */(document.getElementById('step2'));

	const startButton = /** @type {HTMLButtonElement} */(document.getElementById('start'));

	const video = /** @type {HTMLVideoElement} */(document.getElementById('preview'));
	const cameraSelect = /** @type {HTMLSelectElement} */(document.getElementById('camera'));
	const captureBtn = /** @type {HTMLButtonElement} */(document.getElementById('capture'));
	const autoCaptureToggle = /** @type {HTMLInputElement} */(document.getElementById('autoCapture'));
	const outputOl = /** @type {HTMLOListElement} */(document.getElementById('output'));
	const scoreTable = /** @type {HTMLTableElement} */(document.getElementById('scoreTable'));
	const raceGallery = /** @type {HTMLDivElement} */(document.getElementById('raceGallery'));
	const exportBtn = /** @type {HTMLButtonElement} */(document.getElementById('exportScores'));

	const roster = await requestRoster(startButton);

	step1.style.display = 'none';
	step2.style.display = 'block';

	const mogi = new Mogi(roster);
	setupCameraList(cameraSelect, video);
	setupCaptureButton(captureBtn, video, outputOl, mogi);
	setupAutoCapture(autoCaptureToggle, captureBtn, video, mogi);
	connectScoreboard(scoreTable, mogi);
	connectExportButton(exportBtn, mogi);
	connectGallery(raceGallery, mogi);
}

main();
