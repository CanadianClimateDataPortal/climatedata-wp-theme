import React, { useCallback, useMemo, useRef, useState } from 'react';
import { setMessageDisplay, setSelectedStation, setSelectionMode } from '@/features/download/download-slice';
import { MapContainer, TileLayer } from 'react-leaflet';
import MapEvents from '@/components/map-layers/map-events';
import CustomPanesLayer from '@/components/map-layers/custom-panes';
import ZoomControl from '@/components/map-layers/zoom-control';
import SearchControl from '@/components/map-layers/search-control';
import SelectableCellsGridLayer from '@/components/map-layers/selectable-cells-grid-layer';
import SelectableRectangleGridLayer from '@/components/map-layers/selectable-rectangle-grid-layer';
import SelectableRegionLayer from '@/components/map-layers/selectable-region-layer';
import InteractiveStationsLayer from '@/components/map-layers/interactive-stations-layer';
import InteractiveRegionSelect from '@/components/interactive-region-select';
import TagSelector from '@/components/ui/tag-selector';
import StationTypeFilter from '@/components/download/ui/station-type-filter';
import SelectionModeControls from '@/components/download/ui/selection-mode-controls';
import SelectedCellsSummary from '@/components/download/ui/selected-cells-summary';
import { __, _n } from '@/context/locale-provider';
import { useMap } from '@/hooks/use-map';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { DownloadType, InteractiveRegionOption } from '@/types/climate-variable-interface';
import { Station } from '@/types/types';
import {
	DEFAULT_MAX_ZOOM,
	DEFAULT_MIN_ZOOM,
} from '@/lib/constants';
import WarningRSLCCMIP6 from '@/components/warning-rslc-cmip6';

export default function RasterDownloadMap(): React.ReactElement {
	const interactiveLayerRef = useRef<{
		clearSelection: () => void;
	}>(null);

	const { climateVariable, removeSelectedPoint, addSelectedPoints, setSelectedPoints, resetSelectedPoints } = useClimateVariable();
	const { setMap } = useMap();
	const { zoom, center, selectionMode } = useAppSelector(
		(state) => state.download
	);
	const messageDisplayStates = useAppSelector(state => state.download.messageDisplayStates);
	const dispatch = useAppDispatch();

	const warningRSLCCMIP6Id = 'warningRSLCCMIP6';
	const warningRSLCCMIP6Displayed = messageDisplayStates[warningRSLCCMIP6Id] ?? true;

	let stationTypeFilters = climateVariable?.getStationTypeFilter() ?? ['T', 'P', 'B'];
	// Add B if not included to the default enabled filters.
	if (!stationTypeFilters.includes('B')) {
		stationTypeFilters = [...stationTypeFilters, 'B'];
	}
	const [ahccdStationTypes, setAhccdStationTypes] = useState<string[]>(stationTypeFilters);
	const [stations, setStations] = useState<{ id: string, name: string, coordinates: { lat: number, lng: number }, type?: string }[]>([]);

	const selectedIds = React.useMemo(
		() => Object.keys(climateVariable?.getSelectedPoints() ?? {}),
		[climateVariable]
	);

	const selectedCells = useMemo(() => {
		if (selectionMode === 'cells') {
			return climateVariable?.getSelectedPointsCount() ?? 0;
		}

		const selectedRegion  = climateVariable?.getSelectedRegion();
		if (selectedRegion) {
			const cellCount = selectedRegion?.cellCount ?? 0;
			return isNaN(cellCount) ? 0 : cellCount;
		}

		return 0;
	}, [selectionMode, climateVariable]);

	const showStationTypesFilter = climateVariable?.getId() === 'daily_ahccd_temperature_and_precipitation' || climateVariable?.getDatasetType() === 'ahccd';
	const isInteractiveModeStation = climateVariable?.getInteractiveMode() === 'station' || climateVariable?.getDatasetType() === 'ahccd';
	const isInteractiveGridMode = !isInteractiveModeStation && climateVariable?.getInteractiveRegion() === InteractiveRegionOption.GRIDDED_DATA;
	const multipleStationSelect = ! [
		'future_building_design_value_summaries',
		'short_duration_rainfall_idf_data'
	].includes(climateVariable?.getId() ?? '') || climateVariable?.getDatasetType() === 'ahccd';

	const stationOptions = stations.map(station => ({ value: String(station.id), label: station.name }))
	.sort((a, b) => a.label.localeCompare(b.label));

	const handleTagSelectorChange = (ids: string[]) => {
		if (!climateVariable) {
			return;
		}

		if (!multipleStationSelect) {
			const id = ids[0];
			const station = stations.find(s => s.id === id);

			if (!id || !station?.coordinates) {
				resetSelectedPoints();
				return;
			}

			dispatch(setSelectedStation(station));
			setSelectedPoints({
				[station.id]: {
					lat: station.coordinates.lat,
					lng: station.coordinates.lng,
					name: station.name,
				}
			});
			return;
		}

		const toBeRemoved = selectedIds.filter(id => !ids.includes(id));
		const toBeAdded = ids.filter(id => !selectedIds.includes(id));

		toBeRemoved.forEach(removeSelectedPoint);
		toBeAdded.forEach(id => {
			const station = stations.find(s => s.id === id);
			if (station?.coordinates) {
				addSelectedPoints({
					[station.id]: {
						lat: station.coordinates.lat,
						lng: station.coordinates.lng,
						name: station.name,
					}
				});
			}
		});
	};

	const handleStationSelect = (station: Station) => {
		const stationId = String(station.id);

		if (selectedIds.includes(stationId)) {
			removeSelectedPoint(stationId);
			return;
		}

		const selectedPoint = {
			[stationId]: {
				lat: station.coordinates.lat,
				lng: station.coordinates.lng,
				name: station.name,
			}
		};

		if (multipleStationSelect) {
			addSelectedPoints(selectedPoint)
		} else {
			dispatch(setSelectedStation(station));
			setSelectedPoints(selectedPoint);
		}
	};

	const clearSelection = () => {
		interactiveLayerRef.current?.clearSelection();
	};

	const handleHideWarning = () => {
		dispatch(setMessageDisplay({message: warningRSLCCMIP6Id, displayed: false}));
	}

	const renderInteractiveLayer = useCallback(() => {
		// For station type maps
		if (isInteractiveModeStation) {
			// Only one id currently will show the station type filters
			if (showStationTypesFilter) {
				return (
					<InteractiveStationsLayer
						ref={interactiveLayerRef}
						stationTypes={ahccdStationTypes}
						onStationSelect={handleStationSelect}
						onStationsLoaded={setStations}
					/>
				);
			}

			// Default to map without station types filter
			return (
				<InteractiveStationsLayer
					ref={interactiveLayerRef}
					onStationSelect={handleStationSelect}
					onStationsLoaded={setStations}
				/>
			);
		}

		if (isInteractiveGridMode) {
			return selectionMode === 'cells'
				? <SelectableCellsGridLayer ref={interactiveLayerRef} maxCellsAllowed={1000} />
				: <SelectableRectangleGridLayer ref={interactiveLayerRef} maxCellsAllowed={1000} />;
		}

		// Default to the multi-purpose region layer
		return <SelectableRegionLayer ref={interactiveLayerRef} />;
	}, [climateVariable, selectionMode, ahccdStationTypes]);

	const selectionModeOptions = useMemo(() => {
		if (!isInteractiveGridMode) {
			return [];
		}

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
	}, [climateVariable, isInteractiveGridMode]);

	return (
		<>
			{showStationTypesFilter && (
				<StationTypeFilter
					stationTypes={ahccdStationTypes}
					setStationTypes={setAhccdStationTypes}
					stationTypesOptions={stationTypeFilters}
				/>
			)}

			<div className="mb-8">
				{isInteractiveModeStation ? (
					<TagSelector
						options={stationOptions}
						value={selectedIds}
						onChange={handleTagSelectorChange}
						multiple={multipleStationSelect}
						placeholder={__('Select station(s)')}
					/>
				) : (
					<div className="sm:w-64">
						<InteractiveRegionSelect
							onChange={(_) => {
								clearSelection();
							}}
						/>
					</div>
				)}
			</div>

			{selectionModeOptions.length > 0 && (
				<div className="mb-4">
					<div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
						<SelectionModeControls
							selectionMode={selectionMode}
							selectionModeOptions={selectionModeOptions}
							onChange={(value) => {
								dispatch(setSelectionMode(value));
								clearSelection();
							}}
						/>
						<div className="flex flex-row items-start gap-4">
							<SelectedCellsSummary
								selectedCells={selectedCells}
								onClear={clearSelection}
								isEstimate={selectedCells !== 0 && selectionMode === 'region'}
								showClearButton={selectedCells > 0}
								__={__}
								_n={_n}
							/>
						</div>
					</div>
				</div>
			)}

			<div className="h-[560px] font-sans relative">
				<WarningRSLCCMIP6
					className="absolute top-20 z-30 w-full px-4"
					displayed={warningRSLCCMIP6Displayed}
					onHide={handleHideWarning}
				/>

				<MapContainer
					attributionControl={false}
					center={center}
					zoomControl={false}
					zoom={zoom}
					minZoom={DEFAULT_MIN_ZOOM}
					maxZoom={DEFAULT_MAX_ZOOM}
					scrollWheelZoom={true}
					className="h-full"
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
			</div>
		</>
	);
}
