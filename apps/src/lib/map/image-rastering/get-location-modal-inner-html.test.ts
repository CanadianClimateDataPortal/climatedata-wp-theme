import { afterEach, describe, expect, test } from 'vitest';

import { getLocationModalInnerHTML } from './get-location-modal-inner-html';
import { renderLocationModal } from './test-utils';

afterEach(() => {
	document.body.innerHTML = '';
});

describe('getLocationModalInnerHTML', () => {
	test('returns null when no LocationModal is mounted', () => {
		expect(getLocationModalInnerHTML()).toBeNull();
	});

	test('returns a 1-tuple when a single LocationModal is mounted', () => {
		renderLocationModal('a', 'Left Example');

		expect(getLocationModalInnerHTML()).toHaveLength(1);
	});

	test('returns a 2-tuple in document order when two LocationModals are mounted', () => {
		renderLocationModal('a', 'Left Example');
		renderLocationModal('b', 'Right Example');

		const outcome = getLocationModalInnerHTML();

		// Index 0 is the left/main pane, index 1 the right pane — the same
		// order prepareRaster replays them back into on the receiver side.
		expect(outcome?.[0]).toContain('Left Example');
		expect(outcome?.[1]).toContain('Right Example');
	});

	test(`captures innerHTML only, excluding the host element's own tag`, () => {
		const host = renderLocationModal('a', 'Left Example');

		const [content] = getLocationModalInnerHTML() ?? [];

		expect(content).toBe(host.innerHTML);
		expect(content).not.toContain('location-modal-a');
	});
});
