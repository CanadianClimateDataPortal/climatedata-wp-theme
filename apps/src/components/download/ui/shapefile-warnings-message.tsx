import { sprintf } from '@wordpress/i18n';

import { _n, __ } from '@/context/locale-provider';
import {
	type ShapefileWarningCode,
	type PipelineWarning,
} from '@/lib/shapefile';

export interface ShapefileWarningsMessageProps {
	warnings: PipelineWarning[];
	className?: string;
}

const WARNING_MESSAGES: Record<ShapefileWarningCode, { one: string; many: string }> = {
	'extraction/orphan-shp-skipped': {
		one: '%d file was skipped because it has no matching .prj file:',
		many: '%d files were skipped because they have no matching .prj file:',
	},
	'validation/non-polygon-skipped': {
		one: 'Only Polygon geometry is supported. %d file was skipped:',
		many: 'Only Polygon geometry is supported. %d files were skipped:',
	},
};

function groupByCode(warnings: PipelineWarning[]): Map<ShapefileWarningCode, string[]> {
	const groups = new Map<ShapefileWarningCode, string[]>();
	for (const w of warnings) {
		const list = groups.get(w.code) ?? [];
		list.push(w.extractedPath);
		groups.set(w.code, list);
	}
	return groups;
}

/**
 * Displays pipeline warnings (skipped entries) from extraction and validation.
 *
 * Warnings are independent of errors — a successful pipeline can still
 * have warnings (e.g., non-polygon .shp files skipped, orphan .shp without .prj).
 *
 * Uses `__` and `_n` from `@/context/locale-provider` for translated output.
 */
const ShapefileWarningsMessage: React.FC<ShapefileWarningsMessageProps> = ({
	warnings,
	className,
}) => {
	if (warnings.length === 0) {
		return null;
	}

	const groups = groupByCode(warnings);

	return (
		<div className={className}>
			<h3 className="mt-0 mb-2 text-amber-700 font-semibold">
				{sprintf(
					_n(
						'%d warning was found while processing your shapefile',
						'%d warnings were found while processing your shapefile',
						warnings.length,
					),
					warnings.length,
				)}
			</h3>
			<p className="mb-2">
				{__('Your file is supported and it was correctly processed, but some of its content has not been used:')}
			</p>
			<ul className="list-disc ml-4">
				{[...groups.entries()].map(([code, extractedPaths]) => {
					const templates = WARNING_MESSAGES[code];
					const summary = templates
						? sprintf(
								_n(
									templates.one,
									templates.many,
									extractedPaths.length,
								),
								extractedPaths.length,
							)
						: code;

					return (
						<li key={code} className="mb-2 last:mb-0">
							<p className="mb-1">{summary}</p>
							<ul className="list-disc list-inside space-y-0.5 ml-2">
								{extractedPaths.map((name) => (
									<li key={name}>{name}.shp</li>
								))}
							</ul>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

ShapefileWarningsMessage.displayName = 'ShapefileWarningsMessage';

export default ShapefileWarningsMessage;
