/** @typedef {import("../mogi.js").Mogi} Mogi */
/** @typedef {import("../player.js").Player} Player */

import { RACE_COUNT } from "../mogi.js";
import { Substitute } from "../player.js";
import { openEditRoster } from "./edit-roster-dialog.js";
import { success } from "./toast.js";

function makeDialog() {
	const dialog = document.createElement('dialog');
	dialog.innerHTML = `
		<form method="dialog" class="modal">
			<h3>Substitute player <span class="name"></span></h3>
			<div class="grid" style="grid-template-columns: 1fr 1fr 160px;">
				<b>Lounge name</b>
				<b>In-game name</b>
				<b>Joined race #</b>
			</div>
			<footer>
				<button value="cancel">Cancel</button>
				<button value="save" type="button" class="btn--primary">Save</button>
			</footer>
		</form>
	`;
	const name = /** @type {HTMLSpanElement} */(dialog.querySelector('.name'));
	const grid = /** @type {HTMLDivElement} */(dialog.querySelector('div.grid'));
	const save = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=save]'));
	const cancel = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=cancel]'));
	document.body.append(dialog);
	dialog.addEventListener('close', () => dialog.remove());
	return { dialog, name, grid, save, cancel };
}

/**
 * @param {Mogi} mogi
 * @param {Player} player
 */
export function openSubstitutePlayer(mogi, player) {
	const { dialog, name, grid, save, cancel } = makeDialog();

	name.textContent = player.name;
	const subs = player.substitutes;

	for( const s of subs) {
		const loungeName = document.createElement('div');
		loungeName.textContent = s.name;

		const ingameName = document.createElement('input');
		ingameName.name = 'ingameName';
		ingameName.dataset.playerId = s.id;
		ingameName.placeholder = '(autodetect)';
		ingameName.value = s.rawIgn;

		const joinedAt = document.createElement('input');
		joinedAt.name = 'joinedAt';
		joinedAt.type = 'number';
		joinedAt.min = '1';
		joinedAt.max = String(RACE_COUNT);
		joinedAt.dataset.playerId = s.id;
		joinedAt.placeholder = `1-${RACE_COUNT}`;
		joinedAt.value = String(s.joinedAt + 1);

		grid.append(loungeName, ingameName, joinedAt);
	}
	{ // new substitute
		const loungeName = document.createElement('input');
		loungeName.name = 'loungeName';
		loungeName.placeholder = 'New Substitute';

		const ingameName = document.createElement('input');
		ingameName.name = 'ingameName';
		ingameName.placeholder = '(autodetect)';

		const joinedAt = document.createElement('input');
		joinedAt.name = 'joinedAt';
		joinedAt.type = 'number';
		joinedAt.min = '1';
		joinedAt.max = String(RACE_COUNT);
		joinedAt.placeholder = `1-${RACE_COUNT}`;
		joinedAt.value = String(mogi.size + 1);

		grid.append(loungeName, ingameName, joinedAt);
	}

	save.addEventListener('click', () => {
		// Edit existing subs
		[...grid.querySelectorAll('input')].slice(0, -3).forEach(input => {
			const pid = input.dataset.playerId || '';
			if( pid === '' ) return;
			const val = input.value;
			const sub = subs.find(s => s.id === pid);
			if( sub ) {
				switch( input.name ) {
					case 'ingameName': sub.rawIgn = val; break;
					case 'joinedAt': sub.joinedAt = Number(val) - 1; break;
				}
			}
		});

		// Create new sub
		const [ loungeName, ingameName, joinedAt ] = [...grid.querySelectorAll('input')].slice(-3);
		if( loungeName.value !== '' ) {
			const sub = new Substitute(`sub-${player.id}-${subs.length}`, loungeName.value, Number(joinedAt.value) - 1);
			sub.rawIgn = ingameName.value;
			player.addSubstitute(sub);
		}

		dialog.close();
		success('Substitutes updated!');
		mogi.triggerUpdate();
		openEditRoster(mogi);
	});

	cancel.addEventListener('click', () => {
		dialog.close();
		openEditRoster(mogi);
	});

	dialog.showModal();
}
