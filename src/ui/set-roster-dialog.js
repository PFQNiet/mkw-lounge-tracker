import { t } from "../i18n/i18n.js";
import { Roster, ROSTER_SIZE } from "../roster.js";
import { error, success } from "./toast.js";

function makeDialog() {
	const dialog = document.createElement('dialog');
	dialog.innerHTML = `
		<form method="dialog" class="modal">
			<h3>${t('rosterSetup.title')}</h3>
			<p class="muted">${t('rosterSetup.instructions', { count: ROSTER_SIZE })}</p>
			<textarea rows="${ROSTER_SIZE}"></textarea>
			<footer>
				<button type="button" class="btn--primary">${t('confirm')}</button>
			</footer>
		</form>
	`;
	const input = /** @type {HTMLTextAreaElement} */(dialog.querySelector('textarea'));
	const confirm = /** @type {HTMLButtonElement} */(dialog.querySelector('button'));
	document.body.append(dialog);
	dialog.addEventListener('close', () => dialog.remove());
	return { dialog, input, confirm };
}

/**
 * @param {HTMLButtonElement} btn
 * @returns {Promise<Roster>}
 */
export function requestRoster(btn) {
	return new Promise(resolve => {
		btn.addEventListener('click', () => {
			const { dialog, input, confirm } = makeDialog();
			dialog.showModal();
			input.focus();
			confirm.addEventListener('click', () => {
				try {
					const roster = Roster.parse(input.value);
					if( !roster.full ) throw new Error(t('rosterSetup.wrongLength', { count: ROSTER_SIZE, actual: roster.size }));
					dialog.close();
					success(t('rosterSetup.rosterLoaded'));
					resolve(roster);
				} catch(err) {
					error(/** @type {any} */(err).message || err);
				}
			});
		});
	});
}
