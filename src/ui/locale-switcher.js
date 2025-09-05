import { onLocaleChange, setLocale } from "../i18n/i18n.js";

/**
 * @param {HTMLSelectElement} localeSelect
 */
export function setupLocaleSwitcher(localeSelect) {
	onLocaleChange(locale => localeSelect.value = locale);
	localeSelect.addEventListener('change', () => setLocale(localeSelect.value));
}
