/** @typedef {import("../mogi.js").Mogi} Mogi */
/** @typedef {import("../race.js").Placement} Placement */

import { fmt, t } from "../i18n/i18n.js";
import { error } from "./toast.js";

function makeDialog() {
	const dialog = document.createElement('dialog');
	dialog.innerHTML = `
		<form method="dialog" class="modal">
			<h3>${t('editRace.title')}</h3>
			<div class="grid" style="grid-template-columns: 1fr 160px;"></div>
			<footer>
				<button value="delete" type="button" class="btn--danger push-left">${t('editRace.deleteRaceButton')}</button>
				<button value="cancel">${t('cancel')}</button>
				<button value="save" type="button" class="btn--primary">${t('save')}</button>
			</footer>
		</form>
	`;
	const grid = /** @type {HTMLDivElement} */(dialog.querySelector('div.grid'));
	const save = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=save]'));
	const cancel = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=cancel]'));
	const del = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=delete]'));
	document.body.append(dialog);
	dialog.addEventListener('close', () => dialog.remove());
	return { dialog, grid, save, cancel, del };
}

/**
 * @param {Mogi} mogi
 * @param {number} idx
 */
export function openEditRace(mogi, idx) {
	const race = mogi.races[idx];
	if( !race) return;
	const { dialog, grid, save, cancel, del } = makeDialog();

	// Build per-player selects. Preselect from current placements.
	for (const p of mogi.roster) {
		const row = race.placements.find(r => r.playerId === p.id) || null;
		const isDC = row ? (row.dc === true) : true;

		const name = document.createElement('div');
		name.textContent = p.name;

		const sel = document.createElement('select');
		sel.dataset.playerId = p.id;

		// Placements 1..12
		for (let k = 1; k <= 12; k++) {
			sel.add(new Option(fmt.place(k), String(k)));
		}
		// DC option
		sel.add(new Option(t('editRace.disconnectedPlace'), 'dc'));

		// Preselect
		sel.value = isDC ? 'dc' : String(row?.placement ?? '');

		grid.append(name, sel);
	}

	save.addEventListener('click', () => {
		// Collect choices
		/** @type {Map<string,'dc'|number>} */
		const picks = new Map();
		const usedPlaces = new Set();
		[...grid.querySelectorAll('select')].forEach(sel => {
			const pid = sel.dataset.playerId || '';
			const val = sel.value === 'dc' ? 'dc' : Number(sel.value);
			if( val !== 'dc' && usedPlaces.has(val) ) {
				error(t('editRace.uniquePlacementError'));
				return;
			}
			usedPlaces.add(val);
			picks.set(pid, val);
		});

		// Validate choices
		if (picks.size !== race.placements.length) {
			return;
		}

		// Rebuild a new placements array for this race:
		const newRows = race.placements;
		for (const [pid, choice] of picks) {
			const idx = newRows.findIndex(r => r.playerId === pid);
			if (idx === -1) continue;
			const oldRow = newRows.at(idx);
			if (!oldRow) continue;
			const newRow = (choice === 'dc') ? oldRow.withPlacement(oldRow.placement, true) : oldRow.withPlacement(choice, false);
			newRows.splice(idx, 1, newRow);
		}

		dialog.close();
		mogi.updateRace(idx, newRows);
	});

	cancel.addEventListener('click', () => {
		dialog.close();
	});

	del.addEventListener('click', () => {
		if (!confirm(t('editRace.confirmDelete'))) return;
		try { URL.revokeObjectURL(race.snapshotUrl); } catch { }

		dialog.close();
		mogi.deleteRace(idx);
	});

	dialog.showModal();
}
