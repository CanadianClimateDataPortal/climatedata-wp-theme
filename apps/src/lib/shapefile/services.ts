/**
 * Pipeline services factory.
 */

import type { PipelineServices } from './shapefile-machine';

import { extractShapefileFromZip } from './extract-shapefile';
import { validateShapefileGeometry } from './validate-geometry';
import { simplifyShapefile } from './simplify-shapefile';
import { prepareFinchPayload } from './prepare-finch-payload';
import { validateSelectedArea } from './validate-selected-area';

export const createPipelineServices = (): PipelineServices => ({
	extractShapefileFromZip,
	validateShapefileGeometry,
	simplifyShapefile,
	prepareFinchPayload,
	validateSelectedArea,
});
