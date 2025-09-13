/**
 * @typedef {import("./player.js").Player} Player
 */

export const TEAM_COLOURS = [
	"#e54924",
	"#1a63dd",
	"#f69a12",
	"#008071",
	"#8e3eb4",
	"#00a6d6"
];

export const TEAM_ICONS = [
	"🍄",
	"🐢",
	"🦍",
	"🌌",
	"💰",
	"🦖"
];

export class Team {
	/** @type {number} */ #index;
	get index() { return this.#index; }
	set index(index) { this.#index = index; }

	/** @type {number} */ #seed;
	get seed() { return this.#seed; }

	/** @type {string} */ #tag;
	get tag() { return this.#tag; }
	set tag(tag) { this.#tag = tag; }

	/** @type {Player[]} */ #players;
	get players() { return [...this.#players]; }

	get colour() { return TEAM_COLOURS[this.#index] || "#000000"; }
	get icon() { return TEAM_ICONS[this.#index] || "⚫"; }

	/**
	 * @param {number} seed
	 * @param {Player[]} players
	 */
	constructor(seed, players) {
		this.#index = seed-1;
		this.#seed = seed;
		this.#tag = '';
		this.#players = players;
		players.forEach(p => p.team = this);
	}
}
