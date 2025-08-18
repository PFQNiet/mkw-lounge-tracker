/** @typedef {import("../mogi.js").Mogi} Mogi */

import { RACE_COUNT } from "../mogi.js";

/**
 * @param {HTMLDivElement} raceGallery
 * @param {Mogi} mogi
 */
export function connectGallery(raceGallery, mogi) {
	mogi.addEventListener('update', () => {
		raceGallery.innerHTML = '';
		const races = mogi.races;
		for( let i=0; i<RACE_COUNT; i++) {
			const race = i < races.length ? races[i] : null;
			const a = document.createElement('a');
			if( race) {
				a.href = race.snapshotUrl; a.target = '_blank'; a.rel = 'noreferrer';
			}
			const img = document.createElement('img');
			img.alt = `Race ${i + 1} snapshot`;
			img.src = race ? race.snapshotUrl : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==';
			const cap = document.createElement('div');
			cap.className = 'cap';
			cap.textContent = `Race ${i + 1} · ${race ? new Date(race.timestamp).toLocaleTimeString() : '—'}`;
			a.append(img, cap);
			raceGallery.appendChild(a);
		}
	});
}
