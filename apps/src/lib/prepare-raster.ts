/**
 * Make an image out of the current map view and prepare it for download.
 *
 * Formerly known as `$.fn.prepare_raster` outside of `apps/`.
 */

export interface PrepareRasterPostHttpPayload {
	/**
	 * The innerHTML of all LocationModal element(s)
	 */
	locationPopupHtml: [string, string?];
	markerLatLon: [number, number];
}

/**
 * This function is called JUST before sending as a POST request to the server-side screenshot service
 * so it can pass that back at `$.fn.prepare_raster` {@link prepareRaster} to prepare the map page for a screenshot. It removes interactive UI elements and tooltips, and dispatches a `resize` event so the map re-lays out at the new size.
 *
 * @remarks
 * This function is designed to be from the web browser used by the person who wants
 * to download a screenshot.
 */
export const getLocationModalInnerHTML = (): null | [string, string?] => {
	const locationModal = document.querySelectorAll('[id^="location-modal-"]');
	if (locationModal.length === 0) {
		return null;
	}

	const [left, right] = [...locationModal].map((child) => {
		const foo = child.innerHTML;
		// TODO: Document Fragment
		// [...child.querySelectorAll('[data-raster]')].map(i => { i.remove(); return i; })
		// do things in HTML here, or not.
		return foo;
	});

	const outcome = [left];
	if (right) {
		outcome.push(right);
	}

	return outcome as [string, string?];
};

/**
 * This function is called from a Selenium (server-side screenshot service) (`climatedata-api`, `climatedata_api/raster.py`) in a headless browser to prepare the map page for a screenshot. It removes interactive UI elements and tooltips, and dispatches a `resize` event so the map re-lays out at the new size.
 * and it expects a payload to be passed to it BEFORE doing what this does.
 *
 * ----
 *
 * Modify the DOM of this app's map page to prepare it for a screenshot.
 *
 * This function is designed to be executed by an external script (e.g. via Selenium)
 * before taking a screenshot. It removes the surrounding chrome (sidebar, headers,
 * sidebar toggle, search and zoom controls) along with any tooltips, then dispatches
 * a `resize` event so the map re-lays out at the new size.
 *
 * Opening the legend is deliberately *not* done here — the caller dispatches
 * `setLegendOpen(true)` instead, because Redux owns that state. This function used
 * to click the `#legend-toggle` button, which flips whatever state it finds rather
 * than setting one. The legend auto-opens once the map container is wide enough and
 * the screenshot runs far above that width, so the click reliably *closed* an
 * already-open legend a moment before the capture. A set cannot misfire that way;
 * do not reintroduce the click. (CLIM-1454 R3.)
 *
 * It does not add the `to-raster` class the screenshot service waits for: that class
 * marks which element gets captured, and this app renders it statically on
 * `#wrapper-map` in `apps/src/components/map.tsx`, so it is already in place.
 *
 * Note: This function does not revert changes. A full page reload is required to restore the original UI.
 *
 * @remarks
 * Nothing inside `apps/` calls this — the caller is outside the bundle.
 * `download-map-modal.tsx` assigns it to `window.$.fn.prepare_raster` while the
 * modal is mounted; the server-side screenshot service (`climatedata-api`,
 * `climatedata_api/raster.py`) then loads this page in a headless browser and
 * evaluates `$.fn.prepare_raster()` to strip the interactive UI before capturing
 * the "Save map as image" PNG. That is the entire call path.
 *
 * The name is a trap: `fw-child/resources/js/map.js` defines its own
 * `$.fn.prepare_raster` for the legacy jQuery Explore Maps page, and a grep for
 * the name finds that one first. It does not apply here, and does not need
 * checking — `fw-child/apps/app-map.php` calls no `wp_head()`/`wp_footer()`, and
 * WordPress fires `wp_enqueue_scripts` from inside `wp_head()`, so nothing the
 * theme enqueues reaches this page, jQuery and `map.js` included. The assignment
 * made by the modal is the only definition present.
 *
 * This is live production behaviour, not scaffolding.
 */
export function prepareRaster(payload?: PrepareRasterPostHttpPayload): void {
	// Flag raster mode on the root element, so the export's CSS can reach every
	// node on the page.
	//
	// `App.tsx` sets this same attribute on a div inside the React tree, and that
	// one drives the export-only content React renders. It cannot also be the
	// *hiding* flag, for two reasons.
	//
	// Reach: modals render through a portal into `document.body`
	// (`components/ui/modal.tsx`), so they are not DOM descendants of that div and
	// no rule anchored on it can match them. They still have to be hidable,
	// because the screenshot is a rectangle taken at the map wrapper's bounding
	// box — anything painting over that rectangle is in the image, whatever its
	// position in the tree.
	//
	// Timing: the React attribute lands on a commit, which is asynchronous. This
	// function runs synchronously right after the dispatch that asks for it, so
	// that attribute is not on the page yet at this point. `<html>` sits above
	// React's mount, so setting it here applies immediately and reconciliation
	// cannot revert it — which is also precisely why the same imperative move on a
	// node React owns would *not* be safe.
	//
	// Two carriers is deliberate, not an oversight: the React-committed flag
	// reveals React-rendered content, this one hides anything anywhere.
	//
	// Deliberately never unset — see this function's docblock on not reverting.
	// (CLIM-1454 R5.)
	document.documentElement.setAttribute('data-raster', 'true');

	// Remove elements that should not appear in the screenshot
	[
		'map-sidebar',
		'header',
		'sidebar-toggle',
		'header-map',
	].forEach(id => {
		const el = document.getElementById(id);
		if (el) {
			el.remove();
		}
	});

	// Remove all tooltip elements
	document.querySelectorAll('.tooltip').forEach(el => el.remove());

	// Resize the window to force a layout update.
	window.dispatchEvent(new Event('resize'));
}
