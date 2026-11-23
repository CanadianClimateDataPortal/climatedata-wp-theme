/**
 * The props that make a click on the item that a control already shows
 * count as a pick.
 *
 * Radix Select and RadioGroup call `onValueChange` only when the value
 * changes. So a click on the item already shown reaches no handler, even when
 * it is the only item of a list. These props call `onPick` for that click.
 * For a click on another item, `onValueChange` reports the pick, once.
 *
 * This is the one place that knows which event a pick listens to. A list
 * item listens to `pointerup`, because Radix closes the list on it and the
 * item gets no `click`. A radio item listens to `click`, which a click on its
 * label also sends. These props add nothing for a pick with the keyboard.
 */
export const pickProps = <T extends string>(
	kind: 'listItem' | 'radioItem',
	itemValue: T,
	shownValue: T | undefined,
	onPick: (value: T) => void,
): { onPointerUp?: () => void; onClick?: () => void } => {
	const handlePick = () => {
		if (itemValue === shownValue) {
			onPick(itemValue);
		}
	};

	return kind === 'listItem'
		? { onPointerUp: handlePick }
		: { onClick: handlePick };
};
