/** @typedef {import("../ocr.js").OCRDebugReport} OCRDebugReport */
/** @typedef {import("../ocr.js").OCRDebugRow} OCRDebugRow */

// import { t } from "../i18n/i18n.js";
/** @param {string} _ */ function t(_) { return ""; } // dummy out i18n for debug window
import { getLastDebugReport } from "../ocr.js";
import { success, warning } from "./toast.js";

function makeDialog() {
	const dialog = document.createElement('dialog');
	dialog.classList.add('modal-ocr-debug');
	dialog.innerHTML = `
		<form method="dialog" class="modal ocr-debug">
			<h3>${t('ocrDebug.title') || 'OCR Debug'}</h3>

			<div class="ocrdbg-grid">
				<!-- Left: snapshot with overlay -->
				<div class="ocrdbg-canvas-col">
					<div class="ocrdbg-snapshot-wrap">
						<img class="ocrdbg-snapshot" alt="${t('ocrDebug.snapshotAlt') || 'OCR snapshot'}" />
						<div class="ocrdbg-overlay"></div>
					</div>
					<div class="ocrdbg-controls">
						<label><input type="checkbox" class="ocrdbg-toggle-labels" checked /> ${t('ocrDebug.showLabels') || 'Show labels'}</label>
						<a class="ocrdbg-open-snapshot" target="_blank" rel="noopener noreferrer">${t('ocrDebug.openSnapshot') || 'Open snapshot in new tab'}</a>
					</div>
				</div>

				<!-- Right: rows list -->
				<div class="ocrdbg-side">
					<div class="ocrdbg-meta">
						<div><b>${t('ocrDebug.outcome') || 'Outcome'}:</b> <span data-k="outcome"></span></div>
						<div><b>${t('ocrDebug.time') || 'Time'}:</b> <span data-k="timestampISO"></span></div>
						<div><b>${t('ocrDebug.mode') || 'Team mode'}:</b> <span data-k="teamMode"></span></div>
						<div class="muted">${t('ocrDebug.note') || 'Blob URLs are temporary. Please keep this dialog open while gathering info.'}</div>
					</div>

					<div class="ocrdbg-rows"></div>

					<div class="ocrdbg-actions">
						<button type="button" class="ocrdbg-copy-json">${t('ocrDebug.copyJson') || 'Copy JSON'}</button>
						<button value="close" class="btn--primary">${t('close') || 'Close'}</button>
					</div>
				</div>
			</div>
		</form>
	`;
	document.body.append(dialog);
	dialog.addEventListener('close', () => dialog.remove());

	const img = /** @type {HTMLImageElement} */ (dialog.querySelector('.ocrdbg-snapshot'));
	const grid = /** @type {HTMLDivElement} */ (dialog.querySelector('.ocrdbg-grid'));
	const overlay = /** @type {HTMLDivElement} */ (dialog.querySelector('.ocrdbg-overlay'));
	const rowsWrap = /** @type {HTMLDivElement} */ (dialog.querySelector('.ocrdbg-rows'));
	const openLink = /** @type {HTMLAnchorElement} */ (dialog.querySelector('.ocrdbg-open-snapshot'));
	const meta = {};
	meta.outcome = /** @type {HTMLSpanElement} */ (dialog.querySelector('.ocrdbg-meta [data-k="outcome"]'));
	meta.timestampISO = /** @type {HTMLSpanElement} */ (dialog.querySelector('.ocrdbg-meta [data-k="timestampISO"]'));
	meta.teamMode = /** @type {HTMLSpanElement} */ (dialog.querySelector('.ocrdbg-meta [data-k="teamMode"]'));
	const copyBtn = /** @type {HTMLButtonElement} */ (dialog.querySelector('.ocrdbg-copy-json'));
	const toggleLabels = /** @type {HTMLInputElement} */ (dialog.querySelector('.ocrdbg-toggle-labels'));
	return { dialog, img, grid, overlay, rowsWrap, openLink, meta, copyBtn, toggleLabels };
}

/**
 * Helper: computes scale factors from natural image -> displayed box
 * @param {HTMLImageElement} imgEl
 */
function computeScale(imgEl) {
	const naturalW = imgEl.naturalWidth || 1;
	const naturalH = imgEl.naturalHeight || 1;
	const displayW = imgEl.clientWidth || naturalW;
	const displayH = imgEl.clientHeight || naturalH;
	return { sx: displayW / naturalW, sy: displayH / naturalH };
}

/**
 * Helper: make a human label for a row
 * @param {OCRDebugRow} row
 */
function rowBadgeText(row) {
	if (row.wasBlank) return 'blank';
	if (row.revokedAssign) return `revoked (${row.assignedDistance})`;
	if (Number.isFinite(row.assignedDistance) && row.assignedDistance > 0) return `cost ${row.assignedDistance}`;
	return 'ok';
}

/**
 * Build overlay boxes (positioned/zoomed to the snapshot)
 * @param {HTMLDivElement} overlay
 * @param {HTMLImageElement} imgEl
 * @param {OCRDebugReport} report
 * @param {boolean} showLabels
 */
function drawOverlay(overlay, imgEl, report, showLabels) {
	const { sx, sy } = computeScale(imgEl);
	overlay.innerHTML = '';

	for (const r of report.rows) {
		const box = document.createElement('div');
		box.className = 'ocrdbg-box';

		// Status classes
		if (r.wasBlank || r.disconnected) box.classList.add('is-blank');
		else if (r.revokedAssign) box.classList.add('is-revoked');
		else box.classList.add('is-assigned');

		// Position/size scaled from natural coords
		const x = Math.round(r.rect.x * sx);
		const y = Math.round(r.rect.y * sy);
		const w = Math.round(r.rect.w * sx);
		const h = Math.round(r.rect.h * sy);
		box.style.left = `${x}px`;
		box.style.top = `${y}px`;
		box.style.width = `${w}px`;
		box.style.height = `${h}px`;

		if (showLabels) {
			const label = document.createElement('span');
			label.className = 'ocrdbg-tag';
			label.textContent = `${r.idx + 1}: ${rowBadgeText(r)}`;
			box.append(label);
		}

		overlay.append(box);
	}
}

/**
 * Build the side list with crop thumbnails + quick facts
 * @param {HTMLDivElement} rowsWrap
 * @param {OCRDebugReport} report
 */
function buildRowsList(rowsWrap, report) {
	rowsWrap.innerHTML = '';
	for (const r of report.rows) {
		const item = document.createElement('div');
		item.className = 'ocrdbg-row';

		// Thumb: cropSnapshotUrl is a 2× canvas of rect; render at CSS size (rect.w × rect.h)
		const thumb = document.createElement('img');
		thumb.className = 'ocrdbg-thumb';
		if (r.rectSnapshotUrl) thumb.src = r.rectSnapshotUrl;
		thumb.alt = `Row ${r.idx + 1}`;

		const meta = document.createElement('div');
		meta.className = 'ocrdbg-row-meta';
		const lines = [
			`#${r.idx + 1} ${r.wasBlank ? 'blank' : (r.revokedAssign ? 'revoked' : 'assigned')}`,
			`ocr: ${r.ocrText || '—'}`,
			`norm: ${r.normalized || '—'}`,
			`conf: ${Number.isFinite(r.confidence) ? r.confidence : 0}`,
			`white: ${r.whiteRatio?.toFixed(3) ?? '—'}`,
			`dist: ${Number.isFinite(r.assignedDistance) ? r.assignedDistance : '—'}`,
			typeof r.assignedTo === 'number' ? `playerIdx: ${r.assignedTo}` : ''
		].filter(Boolean);

		// nothing in `lines` can include HTML characters, so safe to just inject
		meta.innerHTML = lines.map(s => `<div class="line">${s}</div>`).join('');

		item.append(thumb, meta);
		rowsWrap.append(item);
	}
}

/**
 * Copy JSON report to clipboard
 * @param {OCRDebugReport} report
 */
async function copyReportJSON(report) {
	const text = JSON.stringify(report, null, 2)
		// put simple arrays on a single line
		.replace(/\[[^\[\{\}\]]+\]/g, m=>m.replace(/\r?\n\s+/g, ' '));
	try {
		await navigator.clipboard.writeText('```json\n'+text+'\n```');
		success(t('ocrDebug.reportCopied') || 'Report copied to clipboard');
	} catch {
		warning(t('ocrDebug.reportCopyFailed') || 'Failed to copy report to clipboard');
	}
}

/**
 * Opens the OCR Debug dialog using the last captured report.
 * If there is no report (or debug was off), it shows a friendly empty state.
 */
function openOcrDebugDialog() {
	const report = getLastDebugReport();
	const { dialog, img, grid, overlay, rowsWrap, openLink, meta, copyBtn, toggleLabels } = makeDialog();

	if (!report) {
		grid.innerHTML = `
			<div class="muted" style="padding:1rem;">
				${t('ocrDebug.noReport') || 'No OCR debug report available. Run a capture with debug mode enabled.'}
			</div>
			<div class="ocrdbg-side">
				<div class="ocrdbg-actions">
					<button value="close" class="btn--primary">${t('close') || 'Close'}</button>
				</div>
			</div>
		`;
		dialog.showModal();
		return;
	}

	// Populate meta
	meta.outcome.textContent = report.outcome;
	meta.timestampISO.textContent = report.timestampISO;
	meta.teamMode.textContent = report.teamMode ? 'on' : 'off';

	// Snapshot
	if (report.canvasSnapshotUrl) {
		img.src = report.canvasSnapshotUrl;
		openLink.href = report.canvasSnapshotUrl;
		openLink.style.display = '';
	} else {
		openLink.style.display = 'none';
	}

	// When the image loads (or resizes), draw the overlay to the correct scale
	const redraw = () => drawOverlay(overlay, img, report, !!toggleLabels.checked);
	img.addEventListener('load', redraw, { once: true });
	window.addEventListener('resize', redraw);
	toggleLabels.addEventListener('change', redraw);

	// Build side rows list (with crop thumbnails)
	buildRowsList(rowsWrap, report);

	// Copy JSON
	copyBtn.addEventListener('click', () => copyReportJSON(report));

	dialog.addEventListener('close', () => {
		window.removeEventListener('resize', redraw);
	});

	dialog.showModal();
}

export function setupDebugOcrButton() {
	const debugButton = document.createElement('button');
	debugButton.className = 'btn--danger';
	debugButton.textContent = 'OCR Debug';
	debugButton.id = 'debugOcrButton';
	debugButton.addEventListener('click', async () => {
		openOcrDebugDialog();
	});
	document.body.append(debugButton);
}
