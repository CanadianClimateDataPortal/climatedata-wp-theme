import type { PrepareRasterPostHttpPayload } from './types';

/**
 * The last value assigned to `window.mapPrepareRasterPostHttpPayload`.
 *
 * Backs the accessor's getter, so a read always reflects the latest
 * assignment regardless of whether the debugger module has finished loading.
 */
let stash: PrepareRasterPostHttpPayload | null | undefined;

/**
 * Marks that the dynamic import below has already been kicked off.
 *
 * Guards the setter against re-entry — unlike a one-shot click handler, this
 * setter can fire on every console assignment, so this flag is what keeps
 * `create-raster-debugger.ts` loaded exactly once.
 */
let loadStarted = false;

/**
 * Installs `window.mapPrepareRasterPostHttpPayload` as an accessor property,
 * so assigning it any non-`undefined` value is what loads
 * `create-raster-debugger.ts` and sets up {@link PrepareRasterPostHttpPayloadDebugger}.
 *
 * The assigned value is stashed synchronously, independent of whether the
 * dynamic import has resolved — nothing assigned through this setter is ever
 * lost.
 * {@link loadStarted} guards re-entry, because unlike a one-shot click this
 * setter can fire repeatedly.
 *
 * This is the only debug-related code that ships eagerly in the main bundle —
 * everything else in this namespace's debug surface loads through the
 * dynamic `import()` below.
 *
 * @remark Where does this run?: In the user's browser, eagerly at module scope.
 */
export const installDebugPayloadAccessor = (): void => {
	Object.defineProperty(window, 'mapPrepareRasterPostHttpPayload', {
		configurable: true,
		get: () => stash,
		set(value) {
			stash = value;
			if (value !== undefined && !loadStarted) {
				loadStarted = true;
				void import('./create-raster-debugger').then(({ createRasterDebugger }) => {
					window.mapPrepareRasterPostHttpPayloadDebugger = createRasterDebugger();
				});
			}
		},
	});
};
