/**
 * @typedef {import("../mogi.js").Mogi} Mogi
 * @typedef {import("../player.js").Player} Player
 * @typedef {import("../team.js").Team} Team
 */

import { capturePauseScreen } from "../capture.js";
import { t } from "../i18n/i18n.js";
import { TEAM_COLOURS, TEAM_ICONS } from "../team.js";
import { openSubstitutePlayer } from "./substitute-player-dialog.js";
import { success } from "./toast.js";

function makeDialog() {
	const dialog = document.createElement('dialog');
	dialog.innerHTML = `
		<form method="dialog" class="modal">
			<h3>${t('editRoster.title')}</h3>
			<div class="editroster-container"></div>
			<footer>
				<button value="autofill" type="button">${t('editRoster.autofill')}</button>
				<button value="cancel" type="button">${t('cancel')}</button>
				<button value="save" type="button" class="btn--primary">${t('save')}</button>
			</footer>
		</form>
	`;
	const container = /** @type {HTMLDivElement} */(dialog.querySelector('div.editroster-container'));
	const save = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=save]'));
	const cancel = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=cancel]'));
	const autofill = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=autofill]'));
	document.body.append(dialog);
	dialog.addEventListener('close', () => dialog.remove());
	return { dialog, container, save, cancel, autofill };
}

/**
 * @param {HTMLElement} container
 */
function createGridHost(container) {
	const grid = document.createElement('div');
	grid.classList.add('grid');
	grid.style.gridTemplateColumns = '1fr 1fr 160px';
	container.append(grid);
	return grid;
}

/**
 * @param {HTMLElement} grid
 * @param {Team} team
 */
function createTeamRow(grid, team) {
	const name = document.createElement('b');
	name.textContent = t('editRoster.team', { id: team.seed });
	const tag = document.createElement('input');
	tag.name = 'tag';
	tag.autocomplete = "off";
	tag.dataset.teamId = String(team.seed);
	tag.placeholder = t('editRoster.tag');
	tag.value = team.tag;
	const colour = document.createElement('select');
	colour.name = 'index';
	colour.dataset.teamId = String(team.seed);
	for( let i=0; i<TEAM_ICONS.length; i++ ) {
		const opt = new Option(TEAM_ICONS[i], String(i));
		opt.style.background = TEAM_COLOURS[i];
		colour.add(opt);
	}
	colour.dataset.previousValue = colour.value = String(team.index);
	grid.append(name, tag, colour);
}

/**
 * @param {HTMLElement} grid
 */
function createHeaderRow(grid) {
	const name = document.createElement('b');
	name.textContent = t('editRoster.loungeName');
	const ingame = document.createElement('b');
	ingame.textContent = t('editRoster.ingameName');
	const sub = document.createElement('b');
	sub.textContent = t('editRoster.substitute');
	grid.append(name, ingame, sub);
}

/**
 * @param {HTMLElement} grid
 * @param {Player} player
 */
function createPlayerRow(grid, player) {
	const name = document.createElement('div');
	name.textContent = player.name;

	const input = document.createElement('input');
	input.name = 'ign';
	input.autocomplete = "off";
	input.dataset.playerId = player.id;
	input.placeholder = t('editRoster.autodetect');
	input.value = player.rawIgn;

	const subcontainer = document.createElement('div');
	const sub = player.substitutes.at(-1);
	const subname = document.createElement('span');
	if (sub) subname.textContent = sub.name;
	else {
		subname.textContent = t('editRoster.noSubstitute');
		subname.classList.add('muted');
	}
	const subbutton = document.createElement('button');
	subbutton.dataset.subPlayerId = player.id;
	subbutton.textContent = t('editRoster.editSubButton');
	subcontainer.append(subname, ' ', subbutton);

	grid.append(name, input, subcontainer);
}

/**
 * @param {Mogi} mogi
 * @param {HTMLVideoElement} video
 */
export function openEditRoster(mogi, video) {
	const { dialog, container, save, cancel, autofill } = makeDialog();
	
	if (mogi.playersPerTeam === 1) {
		const grid = createGridHost(container);
		createHeaderRow(grid);
		// Build player rows
		for (const player of mogi.roster) {
			createPlayerRow(grid, player);
		}
	}
	else {
		// Build team rows
		for (const team of mogi.teams) {
			const grid = createGridHost(container);
			createTeamRow(grid, team);
			createHeaderRow(grid);
			for (const player of team.players) {
				createPlayerRow(grid, player);
			}
			grid.style.background = `linear-gradient(to bottom, ${TEAM_COLOURS[team.index]}80 16px, ${TEAM_COLOURS[team.index]}40 48px)`;
		}

		container.addEventListener('input', e => {
			const select = /** @type {HTMLElement} */(e.target).closest("select");
			if (select && select.name === 'index' && select.value !== select.dataset.previousValue) {
				// if another select has this value, switch their values
				const otherSelect = [...container.querySelectorAll('select')].find(s => s !== select && s.name === select.name && s.value === select.value);
				if (otherSelect && select.dataset.previousValue) {
					otherSelect.dataset.previousValue = otherSelect.value = select.dataset.previousValue;
					const grid = /** @type {HTMLDivElement} */(otherSelect.closest('div.grid'));
					if( grid) grid.style.background = `linear-gradient(to bottom, ${TEAM_COLOURS[+otherSelect.value]}80 16px, ${TEAM_COLOURS[+otherSelect.value]}40 48px)`;
				}
				// in all cases, update previous value
				select.dataset.previousValue = select.value;
				const grid = /** @type {HTMLDivElement} */(select.closest('div.grid'));
				if( grid) grid.style.background = `linear-gradient(to bottom, ${TEAM_COLOURS[+select.value]}80 16px, ${TEAM_COLOURS[+select.value]}40 48px)`;
			}
		});
	}

	container.addEventListener('click', e => {
		const button = /** @type {HTMLElement} */(e.target).closest("button");
		if (button && button.dataset.subPlayerId) {
			const p = mogi.roster.byId(button.dataset.subPlayerId);
			if (p) {
				dialog.close();
				openSubstitutePlayer(mogi, p);
			}
		}
	});

	save.addEventListener('click', () => {
		const formFields = [...container.querySelectorAll('input'), ...container.querySelectorAll('select')];

		// Edit roster
		formFields.forEach(input => {
			const pid = input.dataset.playerId || '';
			const player = mogi.roster.byId(pid);
			if( player) {
				switch( input.name) {
					case 'ign': player.rawIgn = input.value; break;
				}
			}
		});

		if( mogi.playersPerTeam > 1) {
			// Edit teams
			formFields.forEach(input => {
				const tid = Number(input.dataset.teamId || 0);
				const team = mogi.teamBySeed(tid);
				if( team) {
					switch( input.name) {
						case 'index': team.index = Number(input.value); break;
						case 'tag': team.tag = input.value; break;
					}
				}
			});
		}

		dialog.close();
		success(t('editRoster.rosterUpdated'));
		mogi.triggerUpdate();
	});

	autofill.addEventListener('click', async () => {
		const targets = /** @type {HTMLInputElement[]} */([...container.querySelectorAll('input[name=ign]')]);
		const placements = await capturePauseScreen(video, mogi);
		if( placements) {
			placements.forEach(p => {
				const t = targets.find(t => t.dataset.playerId === p.playerId);
				if( t && t.value === '') t.value = p.ocrText.trim();
			});
		}
	});

	cancel.addEventListener('click', () => {
		dialog.close();
	});

	dialog.showModal();
}
