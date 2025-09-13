/**
 * @typedef {import("./team.js").Team} Team
 */

import { RACE_COUNT } from "./mogi.js";
import { ROSTER_SIZE } from "./roster.js";

/**
 * @param {string & {normalized?:never}} s
 * @returns {string & {normalized:true}}
 */
export function normalizeName(s) {
	return /** @type {string & {normalized:true}} */ (
		s.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g,'')
		.replace(/[^A-Za-z0-9 _\-\[\]\|\.]/g,'')
		.replace(/\s+/g,' ')
		.trim()
		.toLowerCase()
	);
}

export class Player {
	/** @type {string} */ #id;
	get id() { return this.#id; }

	/** @type {string} */ #name;
	get name() { return this.#name; }

	/** @type {number} */ #seed;
	get seed() { return this.#seed; }

	/** @type {number} */ #mmr;
	get mmr() { return this.#mmr; }

	/** @type {string} */ #ign = '';
	get ign() { return this.#ign === '' ? this.#name : this.#ign; } // use given name if ign not set
	set ign(ign) { this.#ign = this.#ign === '' ? ign : this.#ign; } // only allow setting once
	get rawIgn() { return this.#ign; }
	set rawIgn(ign) { this.#ign = ign; }

	/** @type {Substitute[]} */ #substitutes = [];
	get substitutes() { return [...this.#substitutes]; }
	/** @param {Substitute} sub */
	addSubstitute(sub) { this.#substitutes.push(sub); }
	/** @param {Substitute} sub */
	removeSubstitute(sub) { this.#substitutes = this.#substitutes.filter(s => s !== sub); }
	/** @returns {Player|Substitute} */
	get activePlayer() { return this.#substitutes.at(-1) ?? this; }

	/** @param {number} pos */
	nameOfPlayerToCredit(pos) {
		// Rule 6 d: Players who substitute into an event:
		// i. Will receive normal MMR gains/losses if they substitute in before the first race has been completed.
		// ii. Do not lose MMR on a losing team if they substitute in after the first race has been completed.
		// iii. Only gain MMR on a winning team if they play 4 or more races in the event.
		// Players will replace the player who substituted out on the table if condition d.i. or d.iii. is satisfied.
		const p = this.activePlayer;
		if( p instanceof Player) return this.name; // original player
		if( p.joinedAt === 0) return p.name; // played all races, gets credit according to 6.d.i.
		if( pos <= ROSTER_SIZE/2) {
			// winning position
			return RACE_COUNT - p.joinedAt >= 4 ? p.name : this.name; // must play 4 or more races to get credit according to 6.d.iii.
			// TODO: Seek clarification on Rule 6.e. on how to report scores for players who did not play 4 or more races
		}
		// losing position
		return this.name; // sub does not lose MMR according to 6.d.ii.
	}

	/** @type {Team|null} */
	team = null;

	/**
	 * @param {string} id
	 * @param {string} name
	 * @param {number} seed
	 * @param {number} mmr
	 */
	constructor(id, name, seed, mmr) {
		this.#id = id;
		this.#name = name;
		this.#seed = seed;
		this.#mmr = mmr;
	}
}

export class Substitute {
	/** @type {string} */ #id;
	get id() { return this.#id; }

	/** @type {string} */ #name;
	get name() { return this.#name; }

	/** @type {string} */ #ign = '';
	get ign() { return this.#ign == '' ? this.#name : this.#ign; } // use given name if ign not set
	set ign(ign) { this.#ign = this.#ign == '' ? ign : this.#ign; } // only allow setting once
	get rawIgn() { return this.#ign; }
	set rawIgn(ign) { this.#ign = ign; }

	/** @type {number} */ #joinedAt;
	get joinedAt() { return this.#joinedAt; }
	set joinedAt(joinedAt) { this.#joinedAt = joinedAt; }

	/**
	 * @param {string} id
	 * @param {string} name
	 * @param {number} joinedAt
	 */
	constructor(id, name, joinedAt) {
		this.#id = id;
		this.#name = name;
		this.#joinedAt = joinedAt;
	}
}
