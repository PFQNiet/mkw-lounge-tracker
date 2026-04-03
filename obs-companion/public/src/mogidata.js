export class MogiData {
	/**
	 * @param {MogiData_Meta} meta
	 * @param {MogiData_Player[]} roster
	 * @param {MogiData_Team[]} teams
	 * @param {MogiData_Race[]} races
	 */
	constructor(meta, roster, teams, races) {
		this.meta = meta;
		this.roster = roster;
		this.teams = teams;
		this.races = races;
	}

	/** @param {any} data */
	static fromRaw(data) {
		return new this(
			MogiData_Meta.fromRaw(data.meta),
			/** @type {any[]} */(data.roster).map(p => MogiData_Player.fromRaw(p)),
			/** @type {any[]} */(data.teams).map(t => MogiData_Team.fromRaw(t)),
			/** @type {any[]} */(data.races).map(r => MogiData_Race.fromRaw(r))
		);
	}
}

class MogiData_Meta {
	/**
	 * @param {Date} createdAt
	 * @param {number} playersPerTeam
	 * @param {string} tier
	 */
	constructor(createdAt, playersPerTeam, tier) {
		this.createdAt = createdAt;
		this.playersPerTeam = playersPerTeam;
		this.tier = tier;
	}

	/** @param {any} data */
	static fromRaw(data) {
		return new this(
			new Date(data.createdAt),
			data.playersPerTeam,
			data.tier
		);
	}
}

class MogiData_Player {
	/**
	 * @param {string} id
	 * @param {string} name
	 * @param {number} seed
	 * @param {number} mmr
	 * @param {string} ign
	 * @param {MogiData_Sub[]} substitutes
	 * @param {?number} team
	 */
	constructor(id, name, seed, mmr, ign, substitutes, team) {
		this.id = id;
		this.name = name;
		this.seed = seed;
		this.mmr = mmr;
		this.ign = ign;
		this.substitutes = substitutes;
		this.team = team;
	}

	/** @param {any} data */
	static fromRaw(data) {
		return new this(
			data.id,
			data.name,
			data.seed,
			data.mmr,
			data.ign,
			/** @type {any[]} */(data.substitutes).map(s => MogiData_Sub.fromRaw(s)),
			data.team
		);
	}
}

class MogiData_Sub {
	/**
	 * @param {string} id
	 * @param {string} name
	 * @param {string} ign
	 * @param {number} joinedAt
	 */
	constructor(id, name, ign, joinedAt) {
		this.id = id;
		this.name = name;
		this.ign = ign;
		this.joinedAt = joinedAt;
	}

	/** @param {any} data */
	static fromRaw(data) {
		return new this(
			data.id,
			data.name,
			data.ign,
			data.joinedAt
		);
	}
}

class MogiData_Team {
	/**
	 * @param {number} index
	 * @param {number} seed
	 * @param {string} tag
	 * @param {string} colour #rrggbb
	 * @param {string} icon emoji
	 * @param {string[]} players list of ID
	 */
	constructor(index, seed, tag, colour, icon, players) {
		this.index = index;
		this.seed = seed;
		this.tag = tag;
		this.colour = colour;
		this.icon = icon;
		this.players = players;
	}

	/** @param {any} data */
	static fromRaw(data) {
		return new this(
			data.index,
			data.seed,
			data.tag,
			data.colour,
			data.icon,
			data.players
		);
	}
}

class MogiData_Race {
	/**
	 * @param {Date} completedAt
	 * @param {MogiData_Placement[]} placements
	 */
	constructor(completedAt, placements) {
		this.timestamp = completedAt;
		this.placements = placements;
	}

	/** @param {any} data */
	static fromRaw(data) {
		return new this(
			new Date(data.completedAt),
			/** @type {any[]} */(data.placements).map(p => MogiData_Placement.fromRaw(p))
		);
	}
}

class MogiData_Placement {
	/**
	 * @param {number} placement
	 * @param {string} playerId
	 * @param {boolean} dc
	 * @param {number} score
	 */
	constructor(placement, playerId, dc, score) {
		this.placement = placement;
		this.playerId = playerId;
		this.dc = dc;
		this.score = score;
	}

	/** @param {any} data */
	static fromRaw(data) {
		return new this(
			data.placement,
			data.playerId,
			data.dc,
			data.score
		);
	}
}
