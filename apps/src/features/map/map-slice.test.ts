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

	// Raster mode is entered via the server's reload, when they call `$.fn.prepare_raster`
	// which may fire more than once for the same export.
	// Applying the same value twice must be indistinguishable from applying it once.
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
