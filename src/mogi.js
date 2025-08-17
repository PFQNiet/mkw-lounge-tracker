import { Roster } from './roster.js';
import { Placement, Race } from './race.js';

export const RACE_COUNT = 12;

export class Mogi extends EventTarget {
	/** @type {Roster} */ #roster;
	get roster() { return this.#roster; }

	/** @type {Race[]} */ #races = [];
	get races() { return [...this.#races]; }

	get ended() { return this.#races.length >= RACE_COUNT; }

	/** @param {Roster} roster */
	constructor(roster) {
		super();
		this.#roster = roster;
	}

	/**
	 * @param {Race} race
	 */
	addRace(race) {
		if( this.ended) throw new Error('Too many races');
		this.#races.push(race);
		this.dispatchEvent(new Event('update'));
		if( this.#races.length === 1) this.#roster.lockIGNsFromPlacements(race.placements);
	}

	/**
	 * @param {number} idx
	 * @param {Placement[]} placements
	 */
	updateRace(idx, placements) {
		const oldRace = this.#races.at(idx);
		if( !oldRace) throw new Error('Race not found');
		const newRace = oldRace.withPlacements(placements);
		this.#races.splice(idx, 1, newRace);
		this.dispatchEvent(new Event('update'));
	}

	/**
	 * @param {number} idx
	 */
	deleteRace(idx) {
		const race = this.#races.at(idx);
		if( !race) throw new Error('Race not found');
		this.#races.splice(idx, 1);
		this.dispatchEvent(new Event('update'));
	}

	/**
	 * @returns {Map<string,number>} Player ID => Score
	 */
	calculatePlayerScores() {
		const scores = new Map();
		for (const race of this.#races) {
			const playerScores = race.calculatePlayerScores();
			for (const [playerId, score] of playerScores) {
				const oldScore = scores.get(playerId) ?? 0;
				scores.set(playerId, oldScore + score);
			}
		}
		return scores;
	}
}
