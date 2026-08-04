/**
 * Runs in the user's browser.
 *
 * Captures the currently open LocationModal's HTML so it can travel in the
 * outgoing payload — the screenshot service's browser has no popup of its
 * own to read.
 */
export const getLocationModalInnerHTML = (
): null | [string, string?] => {
	const locationModal = document.querySelectorAll('[id^="location-modal-"]');
	if (locationModal.length === 0) {
		return null;
	}

	// We may have two maps side-by side
	const [left, right] = [...locationModal].map((child) => child.innerHTML);

	const outcome = [left];
	if (right) {
		outcome.push(right);
	}

	return outcome as [string, string?];
};
