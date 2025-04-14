import React, { useRef } from 'react';
import { RadioGroupFactory } from '@/components/ui/radio-group';
import { setSelectionMode } from '@/features/download/download-slice';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { ControlTitle } from '@/components/ui/control-title';
import { cn } from '@/lib/utils';
import { MapContainer, TileLayer } from 'react-leaflet';
import { DEFAULT_MAX_ZOOM, DEFAULT_MIN_ZOOM } from '@/lib/constants';
import MapEvents from '@/components/map-layers/map-events';
import CustomPanesLayer from '@/components/map-layers/custom-panes';
import ZoomControl from '@/components/map-layers/zoom-control';
import SearchControl from '@/components/map-layers/search-control';
import InteractiveRegionSelect from '@/components/interactive-region-select';
import SelectableCellsGridLayer from '@/components/map-layers/selectable-cells-grid-layer';
import SelectableRectangleGridLayer from '@/components/map-layers/selectable-rectangle-grid-layer';
import SelectableRegionLayer from '@/components/map-layers/selectable-region-layer';
import { useI18n } from '@wordpress/react-i18n';
import { useMap } from '@/hooks/use-map';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { InteractiveRegionOption } from '@/types/climate-variable-interface';

export default function RasterDownloadMap(): React.ReactElement {
	const { __, _n } = useI18n();

	const gridLayerRef = useRef<{
		clearSelection: () => void;
	}>(null);

	const { climateVariable } = useClimateVariable();
	const { setMap } = useMap();
	const { zoom, center, selectionMode, selectionCount } = useAppSelector(
		(state) => state.download
	);
	const dispatch = useAppDispatch();

	const clearSelection = () => {
		gridLayerRef.current?.clearSelection();
	};

	const renderGrid = () => {
		switch (climateVariable?.getInteractiveRegion()) {
			case InteractiveRegionOption.GRIDDED_DATA:
				return selectionMode === 'cells' ? (
					<SelectableCellsGridLayer ref={gridLayerRef} />
				) : (
					<SelectableRectangleGridLayer ref={gridLayerRef} />
				);
			default:
				return <SelectableRegionLayer />
		}
	};

	return (
		<>
			<div className="mb-8 sm:w-64">
				<InteractiveRegionSelect />
			</div>

			{climateVariable?.getInteractiveRegion() === InteractiveRegionOption.GRIDDED_DATA && (
				<div className="mb-4">
					<div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
						<RadioGroupFactory
							title={__('Ways to select on the map')}
							name="map-selection-mode"
							value={selectionMode}
							orientation="horizontal"
							className="mb-0"
							optionClassName="me-8"
							onValueChange={(value) => {
								dispatch(setSelectionMode(value));
								clearSelection();
							}}
							options={[
								{ value: 'cells', label: __('Grid cells') },
								{
									value: 'region',
									label: __('Draw region'),
								},
							]}
						/>
						<div className="flex flex-row items-start gap-4">
							{selectionCount > 0 && (
								<Button
									variant="ghost"
									className="text-xs text-brand-red font-semibold leading-4 tracking-wider uppercase h-auto p-0"
									onClick={clearSelection}
								>
									<RefreshCw size={16} />
									{__('Clear')}
								</Button>
							)}
							<div>
								<ControlTitle
									title={__('You selected:')}
									className="my-0"
								/>
								<div
									className={cn(
										'text-2xl font-semibold leading-7 text-right',
										selectionCount > 0
											? 'text-brand-blue'
											: 'text-neutral-grey-medium'
									)}
								>
									{_n(
										'1 Cell',
										`${selectionCount} Cells`,
										selectionCount
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			<MapContainer
				center={center}
				zoomControl={false}
				zoom={zoom}
				minZoom={DEFAULT_MIN_ZOOM}
				maxZoom={DEFAULT_MAX_ZOOM}
				scrollWheelZoom={true}
				className="h-[560px] font-sans"
			>
				<MapEvents onMapReady={(map: L.Map) => setMap(map)} />
				<CustomPanesLayer />
				<ZoomControl />
				<SearchControl className="top-6 left-6" />

				{renderGrid()}

				{/* Basemap TileLayer */}
				<TileLayer
					url="//cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png"
					attribution=""
					subdomains="abcd"
					pane="basemap"
					maxZoom={DEFAULT_MAX_ZOOM}
				/>

				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
			</MapContainer>
		</>
	);
}
