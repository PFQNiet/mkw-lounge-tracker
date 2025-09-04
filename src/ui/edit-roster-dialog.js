/** @typedef {import("../mogi.js").Mogi} Mogi */

import { openSubstitutePlayer } from "./substitute-player-dialog.js";
import { success } from "./toast.js";

function makeDialog() {
	const dialog = document.createElement('dialog');
	dialog.innerHTML = `
		<form method="dialog" class="modal">
			<h3>Edit roster</h3>
			<div class="grid" style="grid-template-columns: 1fr 1fr 160px;">
				<b>Lounge name</b>
				<b>In-game name</b>
				<b>Substitute</b>
			</div>
			<footer>
				<button value="cancel">Cancel</button>
				<button value="save" type="button" class="btn--primary">Save</button>
			</footer>
		</form>
	`;
	const grid = /** @type {HTMLDivElement} */(dialog.querySelector('div.grid'));
	const save = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=save]'));
	const cancel = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=cancel]'));
	document.body.append(dialog);
	dialog.addEventListener('close', () => dialog.remove());
	return { dialog, grid, save, cancel };
}

/**
 * @param {Mogi} mogi
 */
export function openEditRoster(mogi) {
	const { dialog, grid, save, cancel } = makeDialog();

	// Build player rows
	for (const p of mogi.roster) {
		const name = document.createElement('div');
		name.textContent = p.name;

		const input = document.createElement('input');
		input.dataset.playerId = p.id;
		input.placeholder = '(autodetect)';
		input.value = p.rawIgn;

		const subcontainer = document.createElement('div');
		const sub = p.substitutes.at(-1);
		const subbutton = document.createElement('button');
		subbutton.textContent = 'Edit';
		subbutton.addEventListener('click', () => {
			dialog.close();
			openSubstitutePlayer(mogi, p);
		});
		subcontainer.append(sub ? sub.name : '(none)', ' ', subbutton);

		grid.append(name, input, subcontainer);
	}

	save.addEventListener('click', () => {
		// Collect choices
		/** @type {Map<string,string>} */
		const picks = new Map();
		[...grid.querySelectorAll('input')].forEach(input => {
			const pid = input.dataset.playerId || '';
			const val = input.value;
			picks.set(pid, val);
		});

		// Edit roster
		for (const p of mogi.roster) {
			const pid = p.id;
			const val = picks.get(pid) || '';
			p.rawIgn = val;
		}

		dialog.close();
		success('Roster updated!');
		mogi.triggerUpdate();
	});

	cancel.addEventListener('click', () => {
		dialog.close();
	});

	dialog.showModal();
}
