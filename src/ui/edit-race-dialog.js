/** @typedef {import("../mogi.js").Mogi} Mogi */
/** @typedef {import("../race.js").Placement} Placement */

import { fmt, t } from "../i18n/i18n.js";
import { ROSTER_SIZE } from "../roster.js";

const MAX_DC_SLOTS = 2;

function makeDialog() {
	const dialog = document.createElement('dialog');
	dialog.innerHTML = `
		<form method="dialog" class="modal">
			<h3>${t('editRace.title')}</h3>
			<div class="grid" style="grid-template-columns: 1fr 220px;">
				<div>
					<a href="#" class="race-screenshot" target="_blank" rel="noopener noreferrer">
						<img src="" alt="${t('gallery.imageAltText', { number: 1 })}" />
					</a>
				</div>
				<div class="editrace-list">
					${Array.from({length:ROSTER_SIZE}).map((_, i) => `<label>
						<input type="checkbox" />
						<span class="place mono">${fmt.place(i+1)}</span>
						<span class="name"></span>
					</label>`).join('')}
					<hr style="width:100px" />
					${Array.from({length:MAX_DC_SLOTS}).map(() => `<label>
						<input type="checkbox" />
						<span class="place mono">${t('editRace.disconnectedPlace')}</span>
						<span class="name"></span>
					</label>`).join('')}
					<span class="muted">${t('editRace.instructions')}</span>
				</div>
			</div>
			<footer>
				<button value="delete" type="button" class="btn--danger">${t('editRace.deleteRaceButton')}</button>
				<button value="cancel">${t('cancel')}</button>
				<button value="save" type="button" class="btn--primary">${t('save')}</button>
			</footer>
		</form>
	`;
	const raceList = /** @type {HTMLDivElement} */(dialog.querySelector('div.editrace-list'));
	raceList.addEventListener('input', () => {
		const checked = /** @type {NodeListOf<HTMLInputElement>} */(raceList.querySelectorAll('input:checked'));
		if( checked.length === 2) {
			const label1 = /** @type {HTMLLabelElement} */(checked[0].closest("label"));
			const label2 = /** @type {HTMLLabelElement} */(checked[1].closest("label"));
			[label1.dataset.playerId, label2.dataset.playerId] = [label2.dataset.playerId || '', label1.dataset.playerId || ''];
			const name1 = /** @type {HTMLSpanElement} */(label1.querySelector('span.name'));
			const name2 = /** @type {HTMLSpanElement} */(label2.querySelector('span.name'));
			[name1.textContent, name2.textContent] = [name2.textContent, name1.textContent];
			checked[0].checked = checked[1].checked = false;
		}
	});
	const slots = /** @type {HTMLElement[]} */([...dialog.querySelectorAll('div.editrace-list label')]);
	const screenshotLink = /** @type {HTMLAnchorElement} */(dialog.querySelector('a.race-screenshot'));
	const screenshotImage = /** @type {HTMLImageElement} */(dialog.querySelector('a.race-screenshot img'));
	const save = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=save]'));
	const cancel = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=cancel]'));
	const del = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=delete]'));
	document.body.append(dialog);
	dialog.addEventListener('close', () => dialog.remove());
	return { dialog, slots, screenshotLink, screenshotImage, save, cancel, del };
}

/**
 * @param {Mogi} mogi
 * @param {number} idx
 */
export function openEditRace(mogi, idx) {
	const race = mogi.races[idx];
	if( !race) return;
	const { dialog, slots, screenshotLink, screenshotImage, save, cancel, del } = makeDialog();

	screenshotLink.href = screenshotImage.src = race.snapshotUrl;
	screenshotImage.alt = t('gallery.imageAltText', { number: idx + 1 });

	let dcCount = 0;
	// Build per-player selects. Preselect from current placements.
	for (const p of mogi.roster) {
		const row = race.placements.find(r => r.playerId === p.id) || null;
		if( !row) continue;
		const place = row.placement;
		const isDC = row.dc;
		const name = p.activePlayer.name;
		const slot = isDC ? slots[ROSTER_SIZE + dcCount++] : slots[place - 1];
		slot.dataset.playerId = p.id;
		/** @type {HTMLSpanElement} */ (slot.querySelector('span.name')).textContent = name;
	}

	save.addEventListener('click', () => {
		// Collect choices
		/** @type {Map<string,'dc'|number>} */
		const picks = new Map();
		let place = 1;
		slots.forEach((sel,i) => {
			const pid = sel.dataset.playerId || '';
			if( !pid ) return;
			const val = i >= ROSTER_SIZE ? 'dc' : place++;
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
