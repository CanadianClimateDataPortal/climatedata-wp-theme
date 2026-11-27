
/**
 * React Event handlers to respond to when a person interacts with a palpable element.
 *
 * @see {@link CaptureSelectionIntent} for the type of the function that returns these handlers.
 */
interface SelectionIntentHandlers {
	onPointerUp?: () => void;
	onClick?: () => void;
}

type SelectableItemKind =
	| 'listItem'
	| 'radioItem';

type SelectionIntentCallback<T extends string> = (value: T) => void;

export type CaptureSelectionIntent = typeof captureSelectionIntent;

/**
 * The props that make a click on the item that a control already shows
 * count as a pick.
 *
 * Radix Select and RadioGroup call `onValueChange` only when the value
 * changes. So a click on the item already shown reaches no handler, even when
 * it is the only item of a list. These props call `onSelectionIntent` for that click.
 * For a click on another item, `onValueChange` reports the pick, once.
 *
 * This is the one place that knows which event a pick listens to. A list
 * item listens to `pointerup`, which every kind of pointer sends on release
 * before any `click`, so the pick does not depend on whether the item still
 * gets a `click` once the list closes. The release of the press that opens a
 * list cannot count as a pick only because `SelectContent` places the list
 * beside its trigger (`position` 'popper'), not over it. A radio item listens
 * to `click`, which a click on its label also sends. Space on the checked
 * radio button sends a `click` too, so it counts as a pick. These props add
 * nothing for a pick in a list with the keyboard.
 */
const captureSelectionIntent = <T extends string>(
	kind: SelectableItemKind,
	itemValue: T,
	shownValue: T | undefined,
	onSelectionIntent: SelectionIntentCallback<T>,
): SelectionIntentHandlers => {
	const handlePick = () => {
		if (itemValue === shownValue) {
			onSelectionIntent(itemValue);
		}
	};

	return kind === 'listItem'
		? { onPointerUp: handlePick }
		: { onClick: handlePick };
};

export {
	captureSelectionIntent,
}
