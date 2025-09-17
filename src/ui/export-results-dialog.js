/** @typedef {import("../mogi.js").Mogi} Mogi */
import { exportZip } from "../export-zip.js";
import { t } from "../i18n/i18n.js";
import { ROSTER_SIZE } from "../roster.js";
import { toLetter } from "../util.js";
import { success, warning } from "./toast.js";

function makeDialog() {
	const dialog = document.createElement('dialog');
	dialog.innerHTML = `
		<form method="dialog" class="modal">
			<h3>${t('exportScores.title')}</h3>
			<div class="export-format-toggle">
				${t('exportScores.format')}
				<label><input type="radio" name="format" value="q" checked /> ${t('exportScores.qFormat')}</label>
				<label><input type="radio" name="format" value="sq" /> ${t('exportScores.sqFormat')}</label>
			</div>
			<textarea rows="${ROSTER_SIZE}" readonly></textarea>
			<footer>
				<button value="cancel">${t('exportScores.close')}</button>
				<button value="copy" type="button" class="btn--primary">${t('exportScores.copy')}</button>
			</footer>
		</form>
	`;
	const toggle = /** @type {HTMLDivElement} */(dialog.querySelector('div.export-format-toggle'));
	const output = /** @type {HTMLTextAreaElement} */(dialog.querySelector('textarea'));
	const close = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=cancel]'));
	const copy = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=copy]'));
	document.body.append(dialog);
	dialog.addEventListener('close', () => dialog.remove());
	return { dialog, toggle, output, close, copy };
}

/**
 * @param {Mogi} mogi
 * @param {"q"|"sq"} [mode]
 */
function formatResults(mogi, mode="q") {
	const scores = mogi.calculatePlayerScores();
	const scoresArray = [...scores.values()];
	const roster = [...mogi.roster];
	const marker = mode === "q" ? "Q" : "sq";
	return `!submit ${mogi.playersPerTeam} ${marker}\n` + roster.map((p,i) => {
		const score = scores.get(p.id) ?? 0;
		const rank = scoresArray.filter(x => x > score).length + 1;
		return (mogi.playersPerTeam > 1 && i % mogi.playersPerTeam === 0 && mode === "sq" ? `Team ${p.seed} - ${mogi.teamBySeed(p.seed)?.tag || toLetter(p.seed)}\n` : '')
			+ `${p.nameOfPlayerToCredit(rank)} ${mode === "sq" ? '[] ' : ''}${score}`
			+ (mogi.playersPerTeam > 1 && (i+1) % mogi.playersPerTeam === 0 ? '\n' : '');
	}).join('\n').trim();
}

/** @param {Mogi} mogi */
function showResults(mogi) {
	const { dialog, toggle, output, close, copy } = makeDialog();
	output.value = formatResults(mogi);
	output.rows = output.value.split('\n').length;
	dialog.showModal();
	close.addEventListener('click', () => dialog.close());

	toggle.addEventListener('change', () => {
		const checked = /** @type {HTMLInputElement} */(toggle.querySelector('input:checked')).value;
		if( checked === 'q' || checked === 'sq' ) {
			output.value = formatResults(mogi, checked);
			output.rows = output.value.split('\n').length;
		}
	});

	copy.addEventListener('click', async () => {
		try {
			await navigator.clipboard.writeText(output.value);
			success(t('exportScores.copiedToClipboard'));
		} catch {
			// Fallback: focus + select so the user can Cmd/Ctrl+C
			output.focus(); output.select();
			warning(t('exportScores.failedToCopy'));
		}
	});
}

/**
 * @param {HTMLButtonElement} resultsButton
 * @param {HTMLButtonElement} downloadButton
 * @param {Mogi} mogi
 */
export function connectExportButton(resultsButton, downloadButton, mogi) {
	resultsButton.addEventListener('click', () => showResults(mogi));
	downloadButton.addEventListener('click', async () => {
		downloadButton.disabled = true;
		await exportZip(mogi);
		downloadButton.disabled = false;
	});
	mogi.addEventListener('update', () => {
		resultsButton.disabled = !mogi.ended;
		downloadButton.disabled = !mogi.ended;
	});
}
