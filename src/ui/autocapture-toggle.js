/** @typedef {import("../mogi.js").Mogi} Mogi */

import { checkOverlay } from "../autocapture.js";
import { performCapture } from "../capture.js";
import { Config } from "../util.js";

const configKey = 'autoCapture';

/**
 * @param {HTMLInputElement} toggle
 * @param {HTMLButtonElement} captureButton
 * @param {HTMLVideoElement} video
 * @param {Mogi} mogi
 */
export function setupAutoCapture(toggle, captureButton, video, mogi) {
	let interval = 0;
	let hits = 0;
	let cooldown = false;
	function startPoll() {
		interval = setInterval(() => {
			if( mogi.ended ) return;
			if( cooldown ) return;
			if( checkOverlay(video) ) hits += 1;
			if( hits > 2 ) {
				performCapture(video, mogi);
				hits = 0;
				cooldown = true;
				setTimeout(() => cooldown = false, 5000);
			}
		}, 200);
		captureButton.disabled = true;
		Config.set(configKey, 'on');
	}
	function stopPoll() {
		clearInterval(interval);
		interval = 0;
		captureButton.disabled = false;
		Config.set(configKey, 'off');
	}

	if( Config.get(configKey) === 'on' ) {
		toggle.checked = true;
		startPoll();
	}
	toggle.addEventListener('change', () => toggle.checked ? startPoll() : stopPoll());
}
