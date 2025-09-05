import { Config } from '../util.js';
import en from './en.js';
let cur = en;

const listeners = new Set();
const notify = () => listeners.forEach(fn => fn(cur._meta?.code || 'en'));

/**
 * @param {any} obj
 * @param {string} path
 */
const deepGet = (obj, path) => path.split('.').reduce((acc, key) => acc && key in acc ? acc[key] : undefined, obj);

/**
 * @param {any} base
 * @param {any} over
 */
const merge = (base, over) => {
	const out = Array.isArray(base) ? [...base] : { ...base };
	for (const k in over) {
		const v = over[k];
		out[k] = typeof v === 'object' ? merge(base?.[k] ?? {}, v) : v;
	}
	return out;
};

/** @param {string} locale */
export async function setLocale(locale) {
	if( locale === 'en') {
		cur = en;
	}
	else {
		try {
			const mod = await import(`./${locale}.js`);
			cur = merge(en, mod.default || {});
		} catch(e) {
			console.warn('i18n: Failed to load locale', locale, e);
			cur = en;
		}
	}
	document.documentElement.lang = cur._meta?.code || 'en';
	document.documentElement.dir = cur._meta?.dir || 'ltr';
	Config.set('locale', cur._meta?.code || 'en');
	notify();
}

/** @param {(locale:string) => void} fn */
export function onLocaleChange(fn) {
	listeners.add(fn);
	return () => listeners.delete(fn);
};

/**
 * Get translated text
 * 
 * Note HTML is not escaped - all text comes from trusted source files. Sometimes it's HTML, sometimes it's text, check the source.
 * @param {string} key
 * @param {Record<string, any>} vars
 */
export function t(key, vars={}) {
	const raw = deepGet(cur, `text.${key}`) ?? deepGet(en, `text.${key}`) ?? key;
	let str = String(typeof raw === 'function' ? raw(vars) : raw);
	// placeholders
	str = str.replace(/\{(\w+)\}/g, (_, k) => k in vars ? vars[k] : `{${k}}`);
	// italics
	str = str.replace(/__(.*?)__/g, '<em>$1</em>');
	// bold
	str = str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
	// code text
	str = str.replace(/`(.+?)`/g, '<code>$1</code>');
	// links
	str = str.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
	return str;
}

export const fmt = {
	place(/** @type {number} */ n) { return cur.format?.place?.(n) ?? `${n}.`; },
	number(/** @type {number} */ n) { return cur.format?.number?.(n) ?? `${n}`; },
	time(/** @type {Date} */ d) { return cur.format?.time?.(d) ?? `${d.toLocaleTimeString()}`; }
};

function updateStaticElements() {
	document.querySelectorAll('[data-i18n]').forEach(el => {
		if( !(el instanceof HTMLElement)) return;
		el.innerHTML = t(el.dataset.i18n || '');
	});
}

export function initI18n() {
	onLocaleChange(updateStaticElements);
	setLocale(Config.get('locale', 'en'));
}
