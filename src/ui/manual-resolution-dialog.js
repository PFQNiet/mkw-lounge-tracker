/** @typedef {import("../race.js").Placement} Placement */

function makeDialog() {
	const dialog = document.createElement('dialog');
	dialog.innerHTML = `
		<form method="dialog" class="modal">
			<h3>Resolve unmatched players</h3>
			<div class="grid"></div>
			<footer>
				<button value="cancel">Cancel</button>
				<button value="confirm" type="button" class="btn--primary">Confirm</button>
			</footer>
		</form>
	`;
	const grid = /** @type {HTMLDivElement} */(dialog.querySelector('div.grid'));
	const cancel = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=cancel]'));
	const confirm = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=confirm]'));
	document.body.append(dialog);
	dialog.addEventListener('close', () => dialog.remove());
	return { dialog, grid, cancel, confirm };
}

/**
 * @param {Placement[]} placements
 * @param {{id:string,name:string}[]} remaining
 * @returns {Promise<boolean>} true = confirmed/applied, false = canceled
 */
export function manualResolve(placements, remaining) {
	return new Promise((resolve) => {
		const { dialog, grid, cancel, confirm } = makeDialog();
		grid.innerHTML = '';

		const unresolved = placements.filter(p => !p.playerId);

		for (const row of unresolved) {
			const y1 = document.createElement('div'); y1.className = 'mono muted'; y1.textContent = `${row.placement}.`;
			const y2 = document.createElement('div'); y2.textContent = 'OCR: ';
			const chip = document.createElement('span'); chip.className = 'badge';
			chip.textContent = `${row.ocrText || '(blank)'} · ${Math.round(row.ocrConfidence)}%`;
			y2.appendChild(chip);
			const y3 = document.createElement('div');
			const sel = document.createElement('select'); sel.dataset.placement = String(row.placement);
			const empty = document.createElement('option'); empty.value = ''; empty.textContent = '— Select player —'; sel.appendChild(empty);
			for (const p of remaining) { const opt = document.createElement('option'); opt.value = p.id; opt.textContent = p.name; sel.appendChild(opt); }
			y3.appendChild(sel);
			grid.append(y1, y2, y3);
		}

		confirm.addEventListener('click', () => {
			const selects = [...grid.querySelectorAll('select')];
			const chosen = selects.map(s => s.value).filter(Boolean);

			// Require all unresolved rows to be chosen and choices to be unique
			if (chosen.length !== selects.length) return;
			if (new Set(chosen).size !== chosen.length) return;

			// Apply mappings
			for (const s of selects) {
				const placement = Number(s.dataset.placement);
				const idx = placements.findIndex(p => p.placement === placement);
				const row = placements.find(p => p.placement === placement);
				if( !row) return;
				const p = remaining.find(pp => pp.id === s.value);
				if( !p) return;
				placements[idx] = row.withPlayerIdAndResolvedName(p.id, p.name);
			}

			dialog.close();
			resolve(true);
		});

		cancel.addEventListener('click', () => {
			dialog.close();
			resolve(false);
		});

		dialog.addEventListener('cancel', ()=>resolve(false));

		dialog.showModal();
	});
}
