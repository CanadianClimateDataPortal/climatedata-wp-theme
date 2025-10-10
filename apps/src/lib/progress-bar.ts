
export type ClassNameKeysTuple = Record<
	| 'fillColor'
	| 'textColor',
	string
>;

export interface ProgressBarProps extends Record<keyof ClassNameKeysTuple, string> {
	label: string;
	percent: number;
}

const classMaps = new Map([
	[
		'warm',
		{ fillColor: 'bg-orange-400', textColor: 'text-orange-600' },
	],
	[
		'neutral',
		{ fillColor: 'bg-blue-400', textColor: 'text-blue-600' },
	],
	[
		'cool',
		{ fillColor: 'bg-cyan-300', textColor: 'text-cyan-600' },
	],
]) as ReadonlyMap<
	string,
	ClassNameKeysTuple
>;

export const getProgressBarClassNames = (key: string): ClassNameKeysTuple => {
	const colors = classMaps.get(key);
	if (!colors) {
		throw new Error(`No colors for key: "${key}"`);
	}

	return colors;
};

export function buildProgressBarProps(
  label: string,
  percent: number,
  colorKey: string,
): ProgressBarProps {
  const output = getProgressBarClassNames(colorKey);

  return {
    label,
    percent,
		...output,
  };
}
