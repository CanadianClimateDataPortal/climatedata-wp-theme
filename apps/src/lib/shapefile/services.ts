/**
 * Partial pipeline services factory for CLIM-1267.
 *
 * Wires the 3 async pipeline stages implemented in this ticket.
 * Downstream tickets (CLIM-1270, etc.) compose the full PipelineServices
 * by spreading this with the remaining sync functions.
 *
 * @example
 * ```typescript
 * const services: PipelineServices = {
 *   ...createAsyncPipelineServices(),
 *   validateSelectedArea,   // CLIM-1270
 *   prepareFinchPayload,    // downstream
 * };
 * ```
 */

import type { PipelineServices } from './shapefile-machine';

import { extractShapefileFromZip } from './extraction';
import { validateShapefileGeometry } from './validate-geometry';
import { simplifyShapefile } from './simplify-shapefile';

export const createAsyncPipelineServices = (): Pick<
	PipelineServices,
	'extractShapefileFromZip' | 'validateShapefileGeometry' | 'simplifyShapefile'
> => ({
	extractShapefileFromZip,
	validateShapefileGeometry,
	simplifyShapefile,
});
