import { Mogi } from "./src/mogi.js";
import { setupCameraList, setupCaptureButton } from "./src/ui/capture-button.js";
import { connectExportButton } from "./src/ui/export-results-dialog.js";
import { connectGallery } from "./src/ui/gallery.js";
import { connectScoreboard } from "./src/ui/scoreboard.js";
import { requestRoster } from "./src/ui/set-roster-dialog.js";

async function main() {
	const video = /** @type {HTMLVideoElement} */(document.getElementById('preview'));
	const cameraSelect = /** @type {HTMLSelectElement} */(document.getElementById('camera'));
	const captureBtn = /** @type {HTMLButtonElement} */(document.getElementById('capture'));
	const outputOl = /** @type {HTMLOListElement} */(document.getElementById('output'));
	const scoreTable = /** @type {HTMLTableElement} */(document.getElementById('scoreTable'));
	const raceGallery = /** @type {HTMLDivElement} */(document.getElementById('raceGallery'));
	const exportBtn = /** @type {HTMLButtonElement} */(document.getElementById('exportScores'));

	setupCameraList(cameraSelect, video);
	const roster = await requestRoster();
	const mogi = new Mogi(roster);
	setupCaptureButton(captureBtn, video, outputOl, mogi);

	connectScoreboard(scoreTable, mogi);
	connectExportButton(exportBtn, mogi);
	connectGallery(raceGallery, mogi);
}

main();
