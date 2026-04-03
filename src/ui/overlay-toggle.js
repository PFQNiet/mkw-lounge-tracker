/** @typedef {import("../mogi.js").Mogi} Mogi */

import { t } from "../i18n/i18n.js";
import { Config } from "../util.js";
import { error, success } from "./toast.js";

function makeDialog() {
	const dialog = document.createElement('dialog');
	dialog.innerHTML = `
		<form method="dialog" class="modal">
			<h3>${t('overlay.title')}</h3>
			<p>${t('overlay.about')}</p>
			<p>${t('overlay.firstTime')}</p>
			<p>${t('overlay.instructions')}</p>
			<footer>
				<button value="cancel">${t('overlay.close')}</button>
			</footer>
		</form>
	`;
	const close = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=cancel]'));
	document.body.append(dialog);
	dialog.addEventListener('close', () => dialog.remove());
	return { dialog, close };
}

const configKey = 'useOverlay';
const bridge = 'http://localhost:52323/events';

/**
 * @param {HTMLInputElement} toggle
 * @param {Mogi} mogi
 */
export function setupOverlay(toggle, mogi) {
	const sendData = () => new Promise((res,rej) => {
		fetch(bridge, {method:"POST", body:JSON.stringify(mogi.export())})
			.then(r => {
				if( r.ok) res(true);
				else rej();
			})
			.catch(()=>{rej();});
	});

	mogi.addEventListener('update', () => {
		if( toggle.checked && !toggle.indeterminate) {
			sendData().catch(()=>{
				toggle.checked = false;
				Config.set(configKey, 'off');
				error(t("overlay.failed"));
			});
		}
	});

	function testBridge() {
		toggle.indeterminate = true;
		const fail = function() {
			toggle.indeterminate = toggle.checked = false;
			Config.set(configKey, 'off');
			error(t("overlay.failed"));

			const { dialog, close } = makeDialog();
			dialog.showModal();
			close.addEventListener('click', () => dialog.close());
		}
		fetch(bridge, {method:"OPTIONS"})
			.then(r => {
				if( r.ok) {
					toggle.indeterminate = false;
					success(t("overlay.connected"));
					sendData().catch(fail);
				}
				else fail();
			})
			.catch(fail);
	}

	if( Config.get(configKey) === 'on' ) {
		toggle.checked = true;
		testBridge();
	}
	toggle.addEventListener('change', e => {
		if( toggle.indeterminate) {
			e.preventDefault();
		}
		else if( toggle.checked) {
			Config.set(configKey, 'on');
			testBridge();
		}
		else {
			Config.set(configKey, 'off');
		}
	});
}
