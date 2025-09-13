/** @typedef {import("../mogi.js").Mogi} Mogi */
import { exportZip } from "../export-zip.js";
import { t } from "../i18n/i18n.js";
import { ROSTER_SIZE } from "../roster.js";
import { success, warning } from "./toast.js";

function makeDialog() {
	const dialog = document.createElement('dialog');
	dialog.innerHTML = `
		<form method="dialog" class="modal">
			<h3>${t('exportScores.title')}</h3>
			<textarea rows="${ROSTER_SIZE}" readonly></textarea>
			<footer>
				<button value="cancel">${t('exportScores.close')}</button>
				<button value="copy" type="button" class="btn--primary">${t('exportScores.copy')}</button>
			</footer>
		</form>
	`;
	const output = /** @type {HTMLTextAreaElement} */(dialog.querySelector('textarea'));
	const close = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=cancel]'));
	const copy = /** @type {HTMLButtonElement} */(dialog.querySelector('button[value=copy]'));
	document.body.append(dialog);
	dialog.addEventListener('close', () => dialog.remove());
	return { dialog, output, close, copy };
}

/** @param {Mogi} mogi */
function formatResults(mogi) {
	const scores = mogi.calculatePlayerScores();
	const scoresArray = [...scores.values()];
	const roster = [...mogi.roster];
	return `!submit ${mogi.playersPerTeam} Q\n` + roster.map((p,i) => {
		const score = scores.get(p.id) ?? 0;
		const rank = scoresArray.filter(x => x > score).length + 1;
		return `${p.nameOfPlayerToCredit(rank)} ${score}` + (mogi.playersPerTeam > 1 && (++i) % mogi.playersPerTeam === 0 ? '\n' : '');
	}).join('\n').trim();
}

/** @param {Mogi} mogi */
function showResults(mogi) {
	const { dialog, output, close, copy } = makeDialog();
	output.value = formatResults(mogi);
	output.rows = output.value.split('\n').length;
	dialog.showModal();
	close.addEventListener('click', () => dialog.close());

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
