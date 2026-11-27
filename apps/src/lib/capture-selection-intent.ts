
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

	/**
	 * `onPointerUp` and `onClick` here are React props, not the HTML
	 * attributes `onpointerup` and `onclick`. React uses the same names, but
	 * it does not put them on the element. In the browser, the item gets no
	 * `onclick` attribute and no `addEventListener` call. React listens once,
	 * on the element that `createRoot` renders into. When an event bubbles up
	 * there, React calls the handler props of each element on the path of
	 * that event.
	 *
	 * The caller spreads these props on a Radix item, not on a bare element.
	 * Radix already handles `pointerup` and `click` on that item. It joins the
	 * handler of the caller and its own handler through `composeEventHandlers`
	 * (`@radix-ui/primitive`), which does this:
	 *
	 *     callerHandler(event);
	 *     if (!event.defaultPrevented) radixHandler(event);
	 *
	 * So `handlePick` runs first. Then Radix selects the item, as it does
	 * without these props. `handlePick` never calls `preventDefault()`, so the
	 * Radix handler always runs.
	 *
	 * The element and its accessibility stay the ones that Radix renders:
	 * - A list item (`@radix-ui/react-select`) is a `div` with
	 *   `role="option"`, `tabindex="-1"`, `aria-selected` and `data-state`.
	 *   The list moves the focus and handles the keys.
	 * - A radio item (`@radix-ui/react-radio-group`) is a native `button`
	 *   with `role="radio"` and `aria-checked`.
	 *
	 * These props add no attribute, no role and no key handling. The HTML of
	 * the item is the same with and without them.
	 *
	 * @see `SelectItem` in `@radix-ui/react-select`: its `onPointerUp` and `onClick`.
	 * @see `Radio` in `@radix-ui/react-radio-group`: its `onClick`.
	 * @see `composeEventHandlers` in `@radix-ui/primitive`.
	 */
	return kind === 'listItem'
		? { onPointerUp: handlePick }
		: { onClick: handlePick };
};

export {
	captureSelectionIntent,
}
