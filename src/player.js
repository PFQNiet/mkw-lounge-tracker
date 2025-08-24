/** @param {string} s */
export function normalizeName(s) {
	return s.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g,'')
		.replace(/[^A-Za-z0-9 _\-\[\]\|\.]/g,'')
		.replace(/\s+/g,' ')
		.trim()
		.toLowerCase();
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

	/** @param {string} line */
	static parse(line) {
		const re = /^(\d+)\.\s+(.*?)\s+\((\d+)\s*MMR\)$/;
		const m = re.exec(line);
		if(!m) throw new Error(`Bad line: "${line}"`);
		const seed = Number(m[1]);
		const name = String(m[2]);
		const mmr  = Number(m[3]);
		return new Player(`seed-${seed}`, name, seed, mmr);
	}

	toRosterString() {
		return `${this.#seed}. ${this.#name} (${this.#mmr} MMR)`;
	}
}
