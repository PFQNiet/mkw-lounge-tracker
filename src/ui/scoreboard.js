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
		const roster = [...mogi.roster];
		const totals = mogi.calculatePlayerScores();
		/** @type {Map<number, number>} */
		const totalsPerTeam = new Map();
		totals.forEach((score, playerId) => {
			const teamId = roster.find(p => p.id === playerId)?.seed || 0;
			totalsPerTeam.set(teamId, (totalsPerTeam.get(teamId) || 0) + score);
		});
		roster.sort((p1, p2) => (totalsPerTeam.get(p2.seed)||0) - (totalsPerTeam.get(p1.seed)||0) // decreasing team score
			|| p1.seed - p2.seed // increasing seed (to keep teams together)
			|| (totals.get(p2.id)||0) - (totals.get(p1.id)||0) // decreasing player score
			|| p1.id.localeCompare(p2.id) // alphabetically by ID
		);

		const races = mogi.races;
		let totalScore = 0;

		// Build <thead>
		const thead = document.createElement('thead');
		const hr = document.createElement('tr');
		if (mogi.playersPerTeam > 1) {
			const hTeam = document.createElement('th'); hTeam.textContent = t('scoreboard.team'); hr.appendChild(hTeam);
		}
		const hPlayer = document.createElement('th'); hPlayer.textContent = t('scoreboard.player'); hr.appendChild(hPlayer);
		for (let i = 0; i < RACE_COUNT; i++) {
			const th = document.createElement('th'); th.textContent = t('scoreboard.raceNumber', { number: i + 1 }); hr.appendChild(th);
		}
		const hTot = document.createElement('th'); hTot.textContent = t('scoreboard.total'); hr.appendChild(hTot);
		if (mogi.playersPerTeam > 1) {
			hTot.colSpan = 2;
		}
		thead.appendChild(hr);

		// Build <tbody>
		const tbody = document.createElement('tbody');
		tbody.classList.toggle('team-mode', mogi.playersPerTeam > 1);
		let team = null;
		for (const p of roster) {
			const tr = document.createElement('tr');
			const teamScore = totalsPerTeam.get(p.seed) || 0;
			const playerScore = totals.get(p.id) || 0;
			const teamRank = teamScore > 0 ? Array.from(totalsPerTeam.values()).filter(x => x > teamScore).length + 1 : 0;
			const playerRank = playerScore > 0 ? Array.from(totals.values()).filter(x => x > playerScore).length + 1 : 0;

			if (mogi.playersPerTeam > 1 && team !== p.seed) {
				const teamData = mogi.teamBySeed(p.seed);
				const tdTeam = document.createElement('td');
				tdTeam.rowSpan = mogi.playersPerTeam;
				const icon = document.createElement('div');
				icon.textContent = teamData?.icon || '👥';
				icon.classList.add('team-icon');
				tdTeam.append(icon, `${teamData?.tag || String(p.seed)}`);
				tr.appendChild(tdTeam);
				tdTeam.style.background = `${teamData?.colour || '#000000'}20`;
			}
			const tdName = document.createElement('td');
			tdName.textContent = p.activePlayer.name;
			tdName.classList.add('player', `rank-${playerRank}`);
			tr.appendChild(tdName);

			// Each race: show placement number; use '—' if not present
			for (const r of mogi.races) {
				const td = document.createElement('td');
				// find this player's placement in this race
				const row = r.placements.find(x => x.playerId === p.id);
				const placement = row && !row.dc ? row.placement : null;
				td.classList.add('place', `place-${placement ?? 0}`, `rank-${playerRank}`);
				td.textContent = placement ? fmt.place(placement) : t('blank');
				tr.appendChild(td);
			}
			for (let i = races.length; i < RACE_COUNT; i++) {
				const td = document.createElement('td');
				td.classList.add('muted', `rank-${playerRank}`);
				td.textContent = t('blank');
				tr.appendChild(td);
			}

			const tdTotal = document.createElement('td');
			tdTotal.classList.add(`rank-${playerRank}`);
			tdTotal.textContent = String(playerScore).padStart(3, '\u2007');
			tr.appendChild(tdTotal);

			if (mogi.playersPerTeam > 1 && team !== p.seed) {
				team = p.seed;
				const tdTeam = document.createElement('td');
				tdTeam.classList.add(`rank-${teamRank}`);
				tdTeam.rowSpan = mogi.playersPerTeam;
				tdTeam.textContent = String(teamScore).padStart(3, '\u2007');
				tr.appendChild(tdTeam);
			}

			tbody.appendChild(tr);

			totalScore += playerScore;
		}

		// Build <tfoot> with Edit buttons per race column
		const tfoot = document.createElement('tfoot');
		const fr = document.createElement('tr');
		const rosterButton = document.createElement('button');
		rosterButton.textContent = t('scoreboard.editRosterButton');
		rosterButton.addEventListener('click', () => openEditRoster(mogi));
		const fEditRoster = document.createElement('td');
		fEditRoster.append(rosterButton);
		if (mogi.playersPerTeam > 1) {
			fEditRoster.colSpan = 2;
		}
		fr.appendChild(fEditRoster);
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
		const fTotal = document.createElement('td');
		fTotal.append(`${totalScore}`, document.createElement('br'), `/ ${mogi.maxScore}`);
		if (mogi.playersPerTeam > 1) {
			fTotal.colSpan = 2;
		}
		fr.appendChild(fTotal);
		tfoot.appendChild(fr);

		// Swap table content
		scoreTable.replaceChildren(thead, tbody, tfoot);
	});
}
