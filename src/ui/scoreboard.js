/** @typedef {import("../mogi.js").Mogi} Mogi */

import { fmt, t } from "../i18n/i18n.js";
import { RACE_COUNT } from "../mogi.js";
import { openEditRace } from "./edit-race-dialog.js";
import { openEditRoster } from "./edit-roster-dialog.js";

/**
 * @param {HTMLTableElement} scoreTable
 * @param {Mogi} mogi
 */
export function connectScoreboard(scoreTable, mogi) {
	mogi.addEventListener('update', () => {
		const totals = mogi.calculatePlayerScores();
		const races = mogi.races;
		let totalScore = 0;

		// Build <thead>
		const thead = document.createElement('thead');
		const hr = document.createElement('tr');
		const hPlayer = document.createElement('th'); hPlayer.textContent = t('scoreboard.player'); hr.appendChild(hPlayer);
		for (let i = 0; i < RACE_COUNT; i++) {
			const th = document.createElement('th'); th.textContent = t('scoreboard.raceNumber', { number: i + 1 }); hr.appendChild(th);
		}
		const hTot = document.createElement('th'); hTot.textContent = t('scoreboard.total'); hr.appendChild(hTot);
		thead.appendChild(hr);

		// Build <tbody>
		const tbody = document.createElement('tbody');
		const roster = [...mogi.roster].toSorted((a, b) => (totals.get(b.id)||0) - (totals.get(a.id)||0));
		for (const p of roster) {
			const tr = document.createElement('tr');

			const tdName = document.createElement('td'); tdName.textContent = p.activePlayer.name; tr.appendChild(tdName);

			// Each race: show placement number; use '—' if not present
			for (const r of mogi.races) {
				const td = document.createElement('td');
				// find this player's placement in this race
				const row = r.placements.find(x => x.playerId === p.id);
				td.classList.add(`place-${row?.placement ?? 0}`);
				td.textContent = row ? fmt.place(row.placement) : t('blank');
				tr.appendChild(td);
			}
			for (let i = races.length; i < RACE_COUNT; i++) {
				const td = document.createElement('td');
				td.classList.add('muted');
				td.textContent = t('blank');
				tr.appendChild(td);
			}

			const tdTotal = document.createElement('td');
			tdTotal.textContent = String(totals.get(p.id) || 0).padStart(3, '\u2007');
			tr.appendChild(tdTotal);

			tbody.appendChild(tr);

			totalScore += totals.get(p.id) || 0;
		}

		// Build <tfoot> with Edit buttons per race column
		const tfoot = document.createElement('tfoot');
		const fr = document.createElement('tr');
		const rosterButton = document.createElement('button');
		rosterButton.textContent = t('scoreboard.editRosterButton');
		rosterButton.addEventListener('click', () => openEditRoster(mogi));
		fr.appendChild(document.createElement('td')).appendChild(rosterButton);
		for (let i = 0; i < RACE_COUNT; i++) {
			const td = document.createElement('td');
			const btn = document.createElement('button');
			btn.textContent = "✏️";
			if( i < races.length) {
				btn.addEventListener('click', () => openEditRace(mogi, i));
			}
			else {
				btn.disabled = true;
			}
			td.appendChild(btn);
			fr.appendChild(td);
		}
		fr.appendChild(document.createElement('td')).append(`${totalScore}`, document.createElement('br'), `/ ${mogi.maxScore}`);
		tfoot.appendChild(fr);

		// Swap table content
		scoreTable.replaceChildren(thead, tbody, tfoot);
	});
}
