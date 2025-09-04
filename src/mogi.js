import { Roster } from './roster.js';
import { Placement, POINTS_BY_PLACEMENT, Race } from './race.js';
import { info, success } from './ui/toast.js';

export const RACE_COUNT = 12;

export class Mogi extends EventTarget {
	/** @type {Roster} */ #roster;
	get roster() { return this.#roster; }

	/** @type {Race[]} */ #races = [];
	get races() { return [...this.#races]; }

	get size() { return this.#races.length; }
	get ended() { return this.#races.length >= RACE_COUNT; }
	get maxScore() { return POINTS_BY_PLACEMENT.reduce((a, b) => a + b) * RACE_COUNT; }

	/** @type {number} */
	#startTime = Date.now();
	get startDate() { return new Date(this.#startTime); }

	/** @param {Roster} roster */
	constructor(roster) {
		super();
		this.#roster = roster;
		window.addEventListener('beforeunload', e => {
			if( this.#races.length > 0 && !this.ended) {
				e.preventDefault();
				e.returnValue = '';
			}
		});
		queueMicrotask(() => this.triggerUpdate());
	}

	triggerUpdate() {
		this.dispatchEvent(new Event('update'));
	}

	/**
	 * @param {Race} race
	 */
	addRace(race) {
		if( this.ended) throw new Error('Too many races');
		this.#races.push(race);
		this.triggerUpdate();
		success(`Race ${this.#races.length} saved!`);
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
		this.triggerUpdate();
		success(`Race ${idx + 1} updated`);
	}

	/**
	 * @param {number} idx
	 */
	deleteRace(idx) {
		const race = this.#races.at(idx);
		if( !race) throw new Error('Race not found');
		this.#races.splice(idx, 1);
		this.triggerUpdate();
		info(`Race ${idx + 1} deleted`);
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
