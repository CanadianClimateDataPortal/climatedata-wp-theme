/**
 * @file
 *
 * Module-scope constant map — constructed once at import time.
 * Each invocation of getStatePathOptions returns the same object identity,
 * so the layers style map for each for geometry is stable.
 *
 * Shared visual vocabulary across interactive layers:
 * @see {@link SHAPE_PATH_STYLE_DEFAULT}
 * @see {@link SHAPE_PATH_STYLE_HOVER}
 * @see {@link SHAPE_PATH_STYLE_SELECTED}
 */

import { type PathOptions } from 'leaflet';

/**
 * Possible states a shape on a map can be
 */
export type SelectableRegionState = 'default' | 'hover' | 'selected';

/**
 * Function type for getting the style of a shape based on its state and the possible variation for another component.
 */
export type ShapePathStyleResolverFn = (
	state: SelectableRegionState
) => PathOptions;

/**
 * Internal representation for {@link SelectableRegionState} used internally for {@link ShapePathStyleResolverFn}
 */
export type ShapePathStyleResolverInnerStateMap = Readonly<
	Record<SelectableRegionState, PathOptions>
>;

/**
 * Normal or default state.
 *
 * Refer to {@link ./selectable-region-layer.tsx} at `tileLayerStyles`
 */
export const SHAPE_PATH_STYLE_DEFAULT: PathOptions = {
	weight: 1,
	color: '#999',
	fillColor: 'transparent',
	opacity: 0.5,
	fill: true,
	fillOpacity: 1,
};

/**
 * When mouse hover.
 *
 * Refer to {@link ./selectable-cells-grid-layer.tsx} at `hoverCellStyles`
 */
export const SHAPE_PATH_STYLE_HOVER: PathOptions = {
	color: '#444',
	fill: true,
	fillColor: '#fff',
	fillOpacity: 0.2,
	opacity: 1,
	weight: 1,
};

/**
 * When Selected.
 *
 * Refer to {@link ./selectable-cells-grid-layer.tsx} at `selectedCellStyles`
 */
export const SHAPE_PATH_STYLE_SELECTED: PathOptions = {
	color: '#f00', // in other words; red
	fill: false,
	opacity: 1,
	weight: 1,
};
