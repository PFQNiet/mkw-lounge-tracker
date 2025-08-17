/** @typedef {import("../mogi.js").Mogi} Mogi */

/**
 * @param {HTMLDivElement} raceGallery
 * @param {Mogi} mogi
 */
export function connectGallery(raceGallery, mogi) {
	mogi.addEventListener('update', () => {
		raceGallery.innerHTML = '';
		mogi.races.forEach((race, idx) => {
			const a = document.createElement('a');
			a.href = race.snapshotUrl; a.target = '_blank'; a.rel = 'noreferrer';
			const img = document.createElement('img');
			img.alt = `Race ${idx + 1} snapshot`;
			img.src = race.snapshotUrl;
			const cap = document.createElement('div');
			cap.className = 'cap';
			const t = new Date(race.timestamp);
			cap.textContent = `Race ${idx + 1} · ${t.toLocaleTimeString()}`;
			a.append(img, cap);
			raceGallery.appendChild(a);
		});
	});
}
