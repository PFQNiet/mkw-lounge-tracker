import { Roster, ROSTER_SIZE } from "../roster.js";

function makeDialog() {
	const dialog = document.createElement('dialog');
	dialog.innerHTML = `
		<form method="dialog" class="modal">
			<h3 style="margin:0 0 12px 0; font-size:16px">Paste player roster</h3>
			<p class="muted" style="margin:0 0 8px 0">Paste 12 lines like: <code>1. Adam (12345 MMR)</code></p>
			<textarea rows="${ROSTER_SIZE}"></textarea>
			<footer>
				<button type="button" class="btn--primary">Use roster</button>
			</footer>
		</form>
	`;
	const input = /** @type {HTMLTextAreaElement} */(dialog.querySelector('textarea'));
	const confirm = /** @type {HTMLButtonElement} */(dialog.querySelector('button'));
	dialog.addEventListener('cancel', e=>e.preventDefault());
	document.body.append(dialog);
	dialog.addEventListener('close', () => dialog.remove());
	return { dialog, input, confirm };
}

/** @returns {Promise<Roster>} */
export function requestRoster() {
	return new Promise(resolve => {
		const { dialog, input, confirm } = makeDialog();
		dialog.showModal();
		input.focus();
		confirm.addEventListener('click', () => {
			try {
				const roster = Roster.parse(input.value);
				if( !roster.full ) throw new Error(`Expected ${ROSTER_SIZE} players, got ${roster.size}`);
				dialog.close();
				resolve(roster);
			} catch(err) {
				alert(/** @type {any} */(err).message || err);
			}
		});
	});
}
