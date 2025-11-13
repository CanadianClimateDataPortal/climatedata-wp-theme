import { cn } from '@/lib/utils';

/**
 * Represents a single definition term (dt) with zero or more definition details (dd)
 *
 * Describes what each probability category means in terms of historical distribution
 *
 * @example
 * ```tsx
 * // Single detail string
 * { term: 'Unusually high', details: 'Above the 80th percentile (top fifth of historical data)' }
 *
 * // Multiple details
 * { term: 'Complex term', details: ['First explanation', 'Second explanation'] }
 *
 * // No details (just a term)
 * { term: 'Simple term' }
 * ```
 */
export interface DefinitionItem {
	/**
	 * The term being defined (rendered as <dt>)
	 *
	 * @example 'Unusually high', 'Above normal'
	 */
	term: string;

	/**
	 * Zero, one, or more definitions for the term (each rendered as <dd>)
	 * - undefined: No details, just the term
	 * - string: Single detail
	 * - string[]: Multiple details
	 *
	 * @example 'Above the 66th percentile (upper third of historical data)'
	 * @example ['First detail', 'Second detail']
	 */
	details?: string | string[];
}

/**
 * Reusable definition list renderer for dl/dt/dd pattern
 *
 * Handles the flexible details type (undefined | string | string[])
 * and provides consistent styling for definition lists.
 *
 * Accepts optional className props to customize styling for dl, dt, and dd elements.
 */
interface DefinitionListProps {
	items: DefinitionItem[];
	className?: string;
	dtClassName?: string;
	ddClassName?: string;
}

export const DefinitionList = ({
	items,
	className,
	dtClassName,
	ddClassName,
}: DefinitionListProps) => {
	const normalizeDetails = (details?: string | string[]): string[] => {
		if (!details) {
			return [];
		}
		return Array.isArray(details) ? details : [details];
	};

	return (
		<dl className={cn('border-l-2 border-gray-300', className)}>
			{items.map(({ term, details = [] }, idx) => {
				const detailsArray = normalizeDetails(details);
				return (
					<div key={idx} className="space-y-0.5">
						<dt className={cn('font-semibold text-gray-800', dtClassName)}>
							{term}
						</dt>
						{detailsArray.map((detail, detailIdx) => (
							<dd key={detailIdx} className={cn('text-gray-700', ddClassName)}>
								{detail}
							</dd>
						))}
					</div>
				);
			})}
		</dl>
	);
};
