import React, { useCallback, useMemo, useRef } from 'react';
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
import InteractiveStationsLayer from '@/components/map-layers/interactive-stations-layer';
import { useI18n } from '@wordpress/react-i18n';
import { useMap } from '@/hooks/use-map';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { DownloadType, InteractiveRegionOption } from '@/types/climate-variable-interface';

export default function RasterDownloadMap(): React.ReactElement {
	const { __, _n } = useI18n();

	const interactiveLayerRef = useRef<{
		clearSelection: () => void;
	}>(null);

	const { climateVariable } = useClimateVariable();
	const { setMap } = useMap();
	const { zoom, center, selectionMode } = useAppSelector(
		(state) => state.download
	);
	const dispatch = useAppDispatch();

	const clearSelection = () => {
		interactiveLayerRef.current?.clearSelection();
	};

	const renderInteractiveLayer = useCallback(() => {
		const mode = climateVariable?.getInteractiveMode();
		const datasetType = climateVariable?.getDatasetType();

		if (mode === 'station' || datasetType === 'ahccd') {
			return <InteractiveStationsLayer ref={interactiveLayerRef} selectable />;
		}

		const region = climateVariable?.getInteractiveRegion();

		if (region === InteractiveRegionOption.GRIDDED_DATA) {
			return selectionMode === 'cells'
				? <SelectableCellsGridLayer ref={interactiveLayerRef} />
				: <SelectableRectangleGridLayer ref={interactiveLayerRef} />;
		}

		return <SelectableRegionLayer />;
	}, [climateVariable, selectionMode]);

	const renderSelectionModeControls = useCallback(() => {
		// TODO: is this assumption correct?
		if (climateVariable?.getInteractiveMode() !== 'station') {
			return (
				<RadioGroupFactory
					title={__('Ways to select on the map')}
					name="map-selection-mode"
					value={selectionMode}
					orientation="horizontal"
					className="mb-0"
					optionClassName="me-8"
					options={selectionModeOptions}
					onValueChange={(value) => {
						dispatch(setSelectionMode(value));
						clearSelection();
					}}
				/>
			);
		}

		// returning an empty div to keep the layout consistent
		return <div />;
	}, [climateVariable]);

	const selectionModeOptions = useMemo(() => {
		const selectionModes = [
			{
				value: 'cells',
				label: __('Grid cells'),
			},
		];

		if (climateVariable?.getDownloadType() !== DownloadType.ANALYZED) {
			selectionModes.push({
				value: 'region',
				label: __('Draw region'),
			})
		}

		return selectionModes;
	}, [climateVariable]);

	const selectedCells = useMemo(() => {
		if (selectionMode === 'cells') {
			return climateVariable?.getSelectedPointsCount() ?? 0;
		}

		const selectedRegion  = climateVariable?.getSelectedRegion();
		if (selectedRegion) {
			return selectedRegion?.cellCount ?? 0;
		}

		return 0;
	}, [selectionMode, climateVariable]);

	return (
		<>
			{climateVariable?.getDownloadType() === DownloadType.ANALYZED && (
				<div className="mb-8 sm:w-64">
					<InteractiveRegionSelect />
				</div>
			)}

			{climateVariable?.getInteractiveRegion() === InteractiveRegionOption.GRIDDED_DATA && (
				<div className="mb-4">
					<div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
						{renderSelectionModeControls()}
						<div className="flex flex-row items-start gap-4">
							{selectedCells > 0 && (
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
										selectedCells > 0
											? 'text-brand-blue'
											: 'text-neutral-grey-medium'
									)}
								>
									{_n(
										'1 Cell',
										`${selectedCells} Cells`,
										selectedCells
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

				{renderInteractiveLayer()}

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
