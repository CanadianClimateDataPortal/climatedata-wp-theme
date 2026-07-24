import {
	describe,
	expect,
	test,
} from 'vitest';
import type { RootState } from '@/app/store';
import mapReducer, {
	selectIsRasterMode,
	setRasterMode,
} from './map-slice';

/** The slice's own initial state, as the store would build it. */
const initialMapState = mapReducer(undefined, { type: '@@INIT' });

/**
 * Wrap a map-slice state so a `RootState` selector can read it. Only the `map`
 * branch is populated — every selector under test reads nothing else.
 */
const asRootState = (
	map: ReturnType<typeof mapReducer>,
) => ({ map }) as RootState;

describe('map slice — raster mode', () => {
	test('starts disabled, so a normal page load renders the normal app', () => {
		expect(initialMapState.isRasterMode).toBe(false);
	});

	test('setRasterMode(true) enables it', () => {
		const next = mapReducer(initialMapState, setRasterMode(true));
		expect(next.isRasterMode).toBe(true);
	});

	test('setRasterMode(false) disables it', () => {
		const enabled = mapReducer(initialMapState, setRasterMode(true));
		const next = mapReducer(enabled, setRasterMode(false));
		expect(next.isRasterMode).toBe(false);
	});

	// This is the property that matters. Raster mode is entered via the server's
	// `prepare_raster()` closure, and the old export path failed precisely because
	// it *toggled* rather than *set* — a repeated trigger undid the first. Applying
	// the same value twice must be indistinguishable from applying it once.
	test('is a set, not a toggle — applying true twice stays true', () => {
		let state = mapReducer(initialMapState, setRasterMode(true));
		state = mapReducer(state, setRasterMode(true));
		expect(state.isRasterMode).toBe(true);
	});

	test('selectIsRasterMode reads the flag', () => {
		expect(selectIsRasterMode(asRootState(initialMapState))).toBe(false);

		const enabled = mapReducer(initialMapState, setRasterMode(true));
		expect(selectIsRasterMode(asRootState(enabled))).toBe(true);
	});
});
