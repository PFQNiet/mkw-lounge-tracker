import { Roster } from './roster.js';
import { Placement, POINTS_BY_PLACEMENT, Race } from './race.js';
import { info, success } from './ui/toast.js';
import { onLocaleChange, t } from './i18n/i18n.js';
import { Team } from './team.js';

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

	playersPerTeam = 1;
	/** @type {Team[]} */ #teams = [];
	get teams() { return [...this.#teams]; }
	/** @param {number} seed */
	teamBySeed(seed) { return this.#teams.find(t => t.seed === seed); }

	/** @param {Roster} roster */
	constructor(roster) {
		super();
		this.#roster = roster;
		const players = [...roster];
		this.playersPerTeam = players.filter(p => p.seed === 1).length;
		if( this.playersPerTeam > 1) {
			const teamCount = Math.max(...players.map(p=>p.seed));
			for( let i = 1; i <= teamCount; i++) {
				this.#teams.push(new Team(i, players.filter(p => p.seed === i)));
			}
		}
		window.addEventListener('beforeunload', e => {
			if( this.#races.length > 0 && !this.ended) {
				e.preventDefault();
				e.returnValue = '';
			}
		});
		queueMicrotask(() => this.triggerUpdate());
		onLocaleChange(() => this.triggerUpdate()); // refresh all dynamic UI elements
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
		success(t('capture.raceSaved', { number: this.#races.length }));
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
		success(t('editRace.raceUpdated', { number: idx+1 }));
	}

	/**
	 * @param {number} idx
	 */
	deleteRace(idx) {
		const race = this.#races.at(idx);
		if( !race) throw new Error('Race not found');
		this.#races.splice(idx, 1);
		this.triggerUpdate();
		info(t('editRace.raceDeleted', { number: idx+1 }));
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
