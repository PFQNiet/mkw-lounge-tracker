/**
 * @typedef {'info'|'success'|'warning'|'error'} ToastType
 * 
 * @typedef {Object} ToastOpts
 * @prop {number} [timeout=3000]
 */

const container = document.createElement('div');
container.classList.add("toasts");
container.setAttribute("aria-live", "polite");
container.setAttribute("aria-atomic", "true");
container.setAttribute("popover", "manual");
document.body.appendChild(container);

/**
 * @param {string} message
 * @param {ToastType} [type='info']
 * @param {ToastOpts} [opts]
 */
function notify(message, type = 'info', opts = {}) {
	const { timeout = 3000 } = opts;

	if (container.matches(':popover-open')) container.hidePopover();
	container.showPopover();

	// Build toast
	const el = document.createElement('div');
	el.className = `toast toast--${type}`;
	el.setAttribute('role', type === 'error' ? 'alert' : 'status');

	const msg = document.createElement('div');
	msg.className = 'msg';
	msg.textContent = message;

	let to = 0;
	const dismiss = () => {
		if (to) clearTimeout(to);
		el.style.opacity = '0';
		el.style.transform = 'translateY(-6px)';
		setTimeout(() => {
			el.remove();
			if (!container.children.length && container.matches(':popover-open')) container.hidePopover();
		}, 200);
	};

	el.append(msg);
	container.appendChild(el);
	// Trigger transition (popover host already open)
	requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });

	to = window.setTimeout(dismiss, timeout);
	el.addEventListener('mouseenter', () => { if (to) { clearTimeout(to); to = 0; } });
	el.addEventListener('mouseleave', () => { if (!to) { to = window.setTimeout(dismiss, timeout); } });

	return { dismiss };
}

/**
 * @param {string} message
 * @param {ToastOpts} [opts]
 */
function info(message, opts) { return notify(message, 'info', opts); }

/**
 * @param {string} message
 * @param {ToastOpts} [opts]
 */
function success(message, opts) { return notify(message, 'success', opts); }

/**
 * @param {string} message
 * @param {ToastOpts} [opts]
 */
function warning(message, opts) { return notify(message, 'warning', opts); }

/**
 * @param {string} message
 * @param {ToastOpts} [opts]
 */
function error(message, opts) { return notify(message, 'error', opts); }

export { notify, info, success, warning, error };
