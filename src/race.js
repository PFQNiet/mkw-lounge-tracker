export const POINTS_BY_PLACEMENT = [15,12,10,9,8,7,6,5,4,3,2,1];

export class Placement {
	/** @type {number} */ #placement;
	get placement() { return this.#placement; }

	/** @type {(string|null)} */ #playerId;
	get playerId() { return this.#playerId; }

	/** @type {string} */ #resolvedName;
	get resolvedName() { return this.#resolvedName; }

	/** @type {string} */ #ocrText;
	get ocrText() { return this.#ocrText; }

	/** @type {number} */ #ocrConfidence;
	get ocrConfidence() { return this.#ocrConfidence; }

	/** @type {boolean} */ #dc;
	get dc() { return this.#dc; }

	/**
	 * @param {number} placement
	 * @param {(string|null)} playerId
	 * @param {string} resolvedName
	 * @param {string} ocrText
	 * @param {number} ocrConfidence
	 * @param {boolean} dc
	 */
	constructor(placement, playerId, resolvedName, ocrText, ocrConfidence, dc) {
		this.#placement = placement;
		this.#playerId = playerId;
		this.#resolvedName = resolvedName;
		this.#ocrText = ocrText;
		this.#ocrConfidence = ocrConfidence;
		this.#dc = dc;
	}

	/**
	 * @param {string|null} playerId
	 * @param {string} resolvedName
	 */
	withPlayerIdAndResolvedName(playerId, resolvedName) {
		return new Placement(this.#placement, playerId, resolvedName, this.#ocrText, this.#ocrConfidence, this.#dc);
	}

	/**
	 * @param {number} placement
	 * @param {boolean} dc
	 */
	withPlacement(placement, dc) {
		return new Placement(placement, this.#playerId, this.#resolvedName, this.#ocrText, this.#ocrConfidence, dc);
	}

	get score() {
		if (this.#dc) return 1;
		return POINTS_BY_PLACEMENT[this.#placement - 1] ?? 0;
	}

	get ordinal() {
		if (this.#dc) return '—';
		const ordinal = ['st','nd','rd'][this.#placement-1] ?? 'th';
		return `${this.#placement < 10 ? '\u2007' : ''}${this.#placement}${ordinal}`;
	}
}

export class Race {
	/** @type {number} */ #timestamp;
	get timestamp() { return this.#timestamp; }

	/** @type {Placement[]} */ #placements;
	get placements() { return [...this.#placements]; }

	/** @type {string} */ #snapshotUrl;
	get snapshotUrl() { return this.#snapshotUrl; }

	/**
	 * @param {number} timestamp
	 * @param {Placement[]} placements
	 * @param {string} snapshotUrl
	 */
	constructor(timestamp, placements, snapshotUrl) {
		this.#timestamp = timestamp;
		this.#placements = placements;
		this.#snapshotUrl = snapshotUrl;
	}

	/** @param {Placement[]} placements */
	withPlacements(placements) {
		return new Race(this.#timestamp, placements, this.#snapshotUrl);
	}

	/** @returns {Map<string,number>} Player ID => Score */
	calculatePlayerScores() {
		const scores = new Map();
		for (const placement of this.#placements) {
			const playerId = placement.playerId;
			if (!playerId) continue;
			const score = scores.get(playerId) ?? 0;
			scores.set(playerId, score + placement.score);
		}
		return scores;
	}
}
