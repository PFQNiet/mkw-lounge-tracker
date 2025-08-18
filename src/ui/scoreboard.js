/** @typedef {import("../mogi.js").Mogi} Mogi */

import { RACE_COUNT } from "../mogi.js";
import { openEditRace } from "./edit-race-dialog.js";

/**
 * @param {HTMLTableElement} scoreTable
 * @param {Mogi} mogi
 */
export function connectScoreboard(scoreTable, mogi) {
	mogi.addEventListener('update', () => {
		const totals = mogi.calculatePlayerScores();
		const races = mogi.races;

		// Build <thead>
		const thead = document.createElement('thead');
		const hr = document.createElement('tr');
		const hPlayer = document.createElement('th'); hPlayer.textContent = 'Player'; hr.appendChild(hPlayer);
		for (let i = 0; i < RACE_COUNT; i++) {
			const th = document.createElement('th'); th.textContent = `R${i + 1}`; hr.appendChild(th);
		}
		const hTot = document.createElement('th'); hTot.textContent = 'Total'; hr.appendChild(hTot);
		thead.appendChild(hr);

		// Build <tbody>
		const tbody = document.createElement('tbody');

		for (const p of mogi.roster) {
			const tr = document.createElement('tr');

			const tdName = document.createElement('td'); tdName.textContent = p.name; tr.appendChild(tdName);

			// Each race: show placement number; use '—' if not present
			for (const r of mogi.races) {
				const td = document.createElement('td');
				// find this player's placement in this race
				const row = r.placements.find(x => x.playerId === p.id);
				td.textContent = row?.ordinal ?? '—';
				tr.appendChild(td);
			}
			for (let i = races.length; i < RACE_COUNT; i++) {
				const td = document.createElement('td');
				td.classList.add('muted');
				td.textContent = '—';
				tr.appendChild(td);
			}

			const tdTotal = document.createElement('td');
			tdTotal.textContent = String(totals.get(p.id) || 0);
			tr.appendChild(tdTotal);

			tbody.appendChild(tr);
		}

		// Build <tfoot> with Edit buttons per race column
		const tfoot = document.createElement('tfoot');
		const fr = document.createElement('tr');
		fr.appendChild(document.createElement('td')); // Commands...
		for (let i = 0; i < RACE_COUNT; i++) {
			const td = document.createElement('td');
			const btn = document.createElement('button');
			btn.textContent = 'Edit';
			if( i < races.length) {
				btn.addEventListener('click', () => openEditRace(mogi, i));
			}
			else {
				btn.disabled = true;
			}
			td.appendChild(btn);
			fr.appendChild(td);
		}
		fr.appendChild(document.createElement('td'));
		tfoot.appendChild(fr);

		// Swap table content
		scoreTable.replaceChildren(thead, tbody, tfoot);
	});
}
