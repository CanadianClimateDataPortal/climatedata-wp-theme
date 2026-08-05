/**
 * Shared test utilities for the image-rastering sender-side tests.
 */

import { createExampleLocationPopupHtml } from './types.examples';

/**
 * Mounts a `LocationModal` fixture at `#location-modal-{id}`, matching the
 * DOM shape `getLocationModalInnerHTML` scrapes from the real component.
 *
 * @param id - Suffix for the mounted element's id, e.g. `'a'` for the left/main pane.
 * @param title - Forwarded to {@link createExampleLocationPopupHtml}.
 * @returns The mounted host element, for assertions against its own `innerHTML`.
 */
export const renderLocationModal = (
	id: string,
	title: string,
): HTMLElement => {
	const el = document.createElement('div');
	el.id = `location-modal-${id}`;
	el.innerHTML = createExampleLocationPopupHtml(title);
	document.body.appendChild(el);
	return el;
};
