/** @typedef {import("./race.js").Placement} Placement */

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
			ply.ign = raw;
		}
	}

	/** @param {string} input */
	static parse(input) {
		const lines = input.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
		if (lines.length !== ROSTER_SIZE) throw new Error(`Expected ${ROSTER_SIZE} lines, got ${lines.length}`);
		const roster = new Roster();
		for( const line of lines) {
			roster.add(Player.parse(line));
		}
		return roster;
	}
}
