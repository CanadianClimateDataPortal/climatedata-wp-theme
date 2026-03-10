import { sprintf } from '@wordpress/i18n';

import { _n } from '@/context/locale-provider';
import {
	type ShapefileWarningCode,
	type PipelineWarning,
} from '@/lib/shapefile';

export interface ShapefileWarningsMessageProps {
	warnings: PipelineWarning[];
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
}) => {
	if (warnings.length === 0) {
		return null;
	}

	const groups = groupByCode(warnings);

	return (
		<section className="p-4 border-2 border-amber-400 rounded bg-amber-50">
			<h3 className="mt-0 mb-2 text-amber-700 font-semibold">
				{sprintf(
					_n(
						'%d Warning',
						'%d Warnings',
						warnings.length,
					),
					warnings.length,
				)}
			</h3>
			{[...groups.entries()].map(([code, basenames]) => {
				const templates = WARNING_MESSAGES[code];
				const summary = templates
					? sprintf(
							_n(
								templates.one,
								templates.many,
								basenames.length,
							),
							basenames.length,
						)
					: code;

				return (
					<div key={code} className="mb-2 last:mb-0">
						<p className="text-sm text-amber-800 mb-1">{summary}</p>
						<ul className="list-disc list-inside text-sm text-amber-800 space-y-0.5 ml-2">
							{basenames.map((name) => (
								<li key={name}>{name}.shp</li>
							))}
						</ul>
					</div>
				);
			})}
		</section>
	);
};

export default ShapefileWarningsMessage;
