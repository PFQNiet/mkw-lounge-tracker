/** @typedef {import("./race.js").Placement} Placement */

import { t } from "./i18n/i18n.js";
import { normalizeName, Player } from "./player.js";

export const ROSTER_SIZE = 12;

export class Roster {
	/** @type {Player[]} */
	#roster = [];

	/** @param {Player} player */
	add(player) {
		if (this.full) throw new Error('Roster is full');
		this.#roster.push(player);
	}

	get size() { return this.#roster.length; }
	get full() { return this.#roster.length === ROSTER_SIZE; }
	[Symbol.iterator]() { return this.#roster.toSorted((a, b) => a.seed - b.seed)[Symbol.iterator](); }

	/** @param {string} id */
	byId(id) { return this.#roster.find(p => p.id === id); }

	/** @param {Placement[]} placements */
	lockIGNsFromPlacements(placements) {
		for (const row of placements){
			if( !row.playerId) continue;
			const ply = this.byId(row.playerId);
			if (!ply) continue;
			const raw = row.ocrText.trim();
			const norm = normalizeName(raw);
			if (!norm) continue;
			ply.activePlayer.ign = raw;
		}
	}

	/** @param {string} input */
	static parse(input) {
		const lines = input.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
		const roster = new Roster();
		const re = /^(\d+)\.\s+(.*?)\s+\((\d+)\s*MMR\)$/;
		for( const line of lines) {
			const m = re.exec(line);
			if(!m) throw new Error(t('rosterSetup.badLine', { line }));
			const seed  = Number(m[1]);
			const names = String(m[2]).split(',').map(x => x.trim()).filter(Boolean);
			const mmr   = Number(m[3]);
			for( let i = 0; i < names.length; i++) {
				const player = new Player(`seed-${seed}-${i}`, names[i], seed, mmr);
				roster.add(player);
			}
		}
		return roster;
	}
}
