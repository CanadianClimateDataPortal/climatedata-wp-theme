import React, { useCallback, useMemo, useRef, useState } from 'react';
import { setSelectionMode } from '@/features/download/download-slice';
import { MapContainer, TileLayer } from 'react-leaflet';
import MapEvents from '@/components/map-layers/map-events';
import CustomPanesLayer from '@/components/map-layers/custom-panes';
import ZoomControl from '@/components/map-layers/zoom-control';
import SearchControl from '@/components/map-layers/search-control';
import SelectableCellsGridLayer from '@/components/map-layers/selectable-cells-grid-layer';
import SelectableRectangleGridLayer from '@/components/map-layers/selectable-rectangle-grid-layer';
import SelectableRegionLayer from '@/components/map-layers/selectable-region-layer';
import InteractiveStationsLayer from '@/components/map-layers/interactive-stations-layer';
import TagSelector from '@/components/ui/tag-selector';
import StationTypeFilter from '@/components/download/ui/station-type-filter';
import SelectionModeControls from '@/components/download/ui/selection-mode-controls';
import SelectedCellsSummary from '@/components/download/ui/selected-cells-summary';
import { useI18n } from '@wordpress/react-i18n';
import { useMap } from '@/hooks/use-map';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { DownloadType, InteractiveRegionOption } from '@/types/climate-variable-interface';
import {
	DEFAULT_MAX_ZOOM,
	DEFAULT_MIN_ZOOM,
} from '@/lib/constants';

export default function RasterDownloadMap(): React.ReactElement {
	const { __, _n } = useI18n();

	const interactiveLayerRef = useRef<{
		clearSelection: () => void;
	}>(null);

	const { climateVariable, removeSelectedPoint, addSelectedPoints } = useClimateVariable();
	const { setMap } = useMap();
	const { zoom, center, selectionMode } = useAppSelector(
		(state) => state.download
	);
	const dispatch = useAppDispatch();

	const [stationTypes, setStationTypes] = useState<string[]>(['T', 'P', 'B']);
	const [stations, setStations] = useState<{ id: string, name: string, coordinates: { lat: number, lng: number }, type?: string }[]>([]);

	const selectedPoints = climateVariable?.getSelectedPoints() ?? {};
	const selectedIds = Object.keys(selectedPoints);

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

	const showStationTypesFilter = climateVariable?.getDatasetType() === 'ahccd';
	const showStationsListSelector = climateVariable?.getDatasetType() === 'ahccd' || climateVariable?.getInteractiveMode() === 'station'; // TODO: is it ok to also show this for other station maps?
	const showSelectionModeControls = climateVariable?.getDatasetType() !== 'ahccd' && climateVariable?.getInteractiveMode() !== 'station';
	const showSelectedCellsSummary = showSelectionModeControls && selectedCells > 0;

	const stationOptions = stations.map(station => ({ value: String(station.id), label: station.name }))
	.sort((a, b) => a.label.localeCompare(b.label));

	const handleTagSelectorChange = (ids: string[]) => {
		if (!climateVariable) {
			return;
		}

		const currentIds = Object.keys(climateVariable.getSelectedPoints() ?? {});

		// Remove any deselected points
		currentIds.forEach(id => {
			if (!ids.includes(id)) {
				removeSelectedPoint(Number(id));
			}
		});

		// Add any newly selected points
		ids.forEach(id => {
			if (!currentIds.includes(id)) {
				const station = stations.find(s => String(s.id) === id);
				if (station && station.coordinates) {
					addSelectedPoints({ [station.id]: { lat: station.coordinates.lat, lng: station.coordinates.lng, name: station.name } });
				}
			}
		});
	};

	const clearSelection = () => {
		interactiveLayerRef.current?.clearSelection();
	};

	// TODO: there should be a better way of choosing which interactive layer to show, depending on variable config
	const renderInteractiveLayer = useCallback(() => {
		const mode = climateVariable?.getInteractiveMode();
		const region = climateVariable?.getInteractiveRegion();
		const datasetType = climateVariable?.getDatasetType();

		if (datasetType === 'ahccd' || mode === 'station') {
			return (
				<InteractiveStationsLayer
					ref={interactiveLayerRef}
					selectable
					type={datasetType === 'ahccd' ? 'ahccd' : undefined}
					stationTypes={stationTypes}
					onStationsLoaded={setStations}
				/>
			);
		}

		if (region === InteractiveRegionOption.GRIDDED_DATA) {
			return selectionMode === 'cells'
				? <SelectableCellsGridLayer ref={interactiveLayerRef} />
				: <SelectableRectangleGridLayer ref={interactiveLayerRef} />;
		}

		return <SelectableRegionLayer />;
	}, [climateVariable, selectionMode, stationTypes]);

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

	return (
		<>
			{showStationTypesFilter && (
				<StationTypeFilter
					stationTypes={stationTypes}
					setStationTypes={setStationTypes}
				/>
			)}

			{showStationsListSelector && (
				<TagSelector
					options={stationOptions}
					value={selectedIds}
					onChange={handleTagSelectorChange}
					placeholder={__('Select stations')}
					className="mb-8 w-full"
				/>
			)}

			{showSelectionModeControls && (
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
							{showSelectedCellsSummary && (
								<SelectedCellsSummary
									selectedCells={selectedCells}
									onClear={clearSelection}
									__={__}
									_n={_n}
								/>
							)}
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
