// Only the composed decision is public. The host gate and the parameter name
// are steps inside it, exercised directly by the co-located test via a relative
// import; exporting them here would widen the namespace's surface for nothing.
export {
	readRasterPreviewRequest,
} from './read-raster-preview-request';
