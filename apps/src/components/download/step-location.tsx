import React, { useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useI18n } from '@wordpress/react-i18n';
import { RefreshCw } from 'lucide-react';

import 'leaflet/dist/leaflet.css';

import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';
import { ControlTitle } from '@/components/ui/control-title';
import { RadioGroupFactory } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import Dropdown from '@/components/ui/dropdown';
import ZoomControl from '@/components/map-layers/zoom-control';
import SearchControl from '@/components/map-layers/search-control';
import SelectableRectangleGridLayer from '@/components/map-layers/selectable-rectangle-grid-layer';
import CustomPanesLayer from '@/components/map-layers/custom-panes';
import SelectableCellsGridLayer from '@/components/map-layers/selectable-cells-grid-layer';
import MapEvents from '@/components/map-layers/map-events';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { cn } from '@/lib/utils';
import { DEFAULT_MIN_ZOOM, DEFAULT_MAX_ZOOM } from '@/lib/constants';
import {
	setSelectionMode,
} from '@/features/download/download-slice';
import { useMap } from '@/hooks/use-map';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import { InteractiveRegionConfig, InteractiveRegionOption } from "@/types/climate-variable-interface";

/**
 * Location step, allows the user to make a selection on the map and choose what type of region to select
 */
const StepLocation: React.FC = () => {
	const { __, _n } = useI18n();
	const  { climateVariable, setInteractiveRegion } = useClimateVariable();

	const gridLayerRef = useRef<{
		clearSelection: () => void;
	}>(null);

	const { setMap } = useMap();
	const { zoom, center, selectionMode, selectionCount } = useAppSelector((state) => state.download);
	const dispatch = useAppDispatch();

	const interactiveRegion =climateVariable?.getInteractiveRegion() ?? InteractiveRegionOption.GRIDDED_DATA

	const options = [
		{ value: InteractiveRegionOption.GRIDDED_DATA, label: __('Grid Cells') },
		{ value: InteractiveRegionOption.CENSUS, label: __('Census Subdivisions') },
		{ value: InteractiveRegionOption.HEALTH, label: __('Health Regions') },
		{ value: InteractiveRegionOption.WATERSHED, label: __('Watersheds') },
	];

	const interactiveRegionConfig = climateVariable?.getInteractiveRegionConfig() ?? {} as InteractiveRegionConfig;

	const availableOptions = options.filter((option) =>
		(option.value in interactiveRegionConfig) && interactiveRegionConfig[option.value as InteractiveRegionOption]
	);

	const clearSelection = () => {
		gridLayerRef.current?.clearSelection();
	};

	// conditionally render the grid layer based on the selected interactive region and selection mode
	const renderGrid = () => {
		if (interactiveRegion === InteractiveRegionOption.GRIDDED_DATA) {
			if (selectionMode === 'cells') {
				return <SelectableCellsGridLayer ref={gridLayerRef} />;
			}

			return <SelectableRectangleGridLayer ref={gridLayerRef} />;
		}

		// TODO: add other types of interactive regions
		return null;
	};

	return (
		<StepContainer title={__('Select a location or area')}>
			<StepContainerDescription>
				{__(
					'Using the tool below, you can select or draw a selection to include in your download file.'
				)}
			</StepContainerDescription>

			<div className="gap-4">
				<div className="mb-8">
					<Dropdown
						className="sm:w-64"
						value={interactiveRegion}
						options={availableOptions}
						label={__('Interactive Regions')}
						tooltip={__('Select an option')}
						onChange={setInteractiveRegion}
					/>
				</div>

				{/* these are only relevant for grid cells interactive region */}
				{interactiveRegion === InteractiveRegionOption.GRIDDED_DATA && (
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
											'text-2xl font-semibold leading-7',
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
			</div>

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
		</StepContainer>
	);
};
StepLocation.displayName = 'StepLocation';

export default StepLocation;
