/**
 * Runs in the user's browser.
 *
 * Captures the currently open LocationModal's HTML so it can travel in the
 * outgoing payload — the screenshot service's browser has no popup of its
 * own to read.
 *
 * @returns One entry per open modal, left pane first, or `null` when none is open.
 */
export const getLocationModalInnerHTML = (
): null | [string, string?] => {
	const locationModal = document.querySelectorAll('[id^="location-modal-"]');
	if (locationModal.length === 0) {
		return null;
	}

	// Compare mode puts two maps side by side, each with its own modal.
	const [left, right] = [...locationModal].map((child) => child.innerHTML);

	const outcome = [left];
	if (right) {
		outcome.push(right);
	}

	return outcome as [string, string?];
};
