import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useI18n } from '@wordpress/react-i18n';

import 'leaflet/dist/leaflet.css';

import {
	StepContainer,
	StepContainerDescription,
} from '@/components/download/step-container';
import { ControlTitle } from '@/components/ui/control-title';
import { RadioGroupFactory } from '@/components/ui/radio-group';
import Dropdown from '@/components/ui/dropdown';
import ZoomControl from '@/components/map-layers/zoom-control';
import SearchControl from '@/components/map-layers/search-control';
import GeometryControls from '@/components/map-layers/geometry-controls';
import CustomPanesLayer from '@/components/map-layers/custom-panes';
import InteractiveRegionsLayer from '@/components/map-layers/interactive-regions';
import SelectableCellsGridLayer from '@/components/map-layers/selectable-cells-grid-layer';
import MapEvents from '@/components/map-layers/map-events';

import { cn } from '@/lib/utils';
import { DEFAULT_MIN_ZOOM, DEFAULT_MAX_ZOOM } from '@/lib/constants';
import { useDownload } from '@/hooks/use-download';
import { useMap } from '@/hooks/use-map';
import L from 'leaflet';

/**
 * Location step
 */
const StepLocation: React.FC = () => {
	const { __, _n } = useI18n();

	const { setMap } = useMap();
	const { setField, fields } = useDownload();
	const { interactiveRegion, selectedCells, zoom, center } = fields;

	const [selected, setSelected] = useState<Set<number>>(
		new Set(selectedCells)
	);
	const [selectionMode, setSelectionMode] = useState<string>('cells');

	// TODO: when selecting inside the map, update the selected cells
	// const handleRegionSelected = (cells: number) => {
	// 	setField('selectedCells', cells);
	// }

	// TODO: fetch these values from the API
	const options = [
		{ value: 'gridded_data', label: __('Grid Cells') },
		{ value: 'census', label: __('Census Subdivisions') },
		{ value: 'health', label: __('Health Regions') },
		{ value: 'watershed', label: __('Watersheds') },
	];

	const handleSelectCell = (updatedCells: Set<number>) => {
		// using state (Set) to avoid duplicates and for better performance
		setSelected(updatedCells);
	};

	useEffect(() => {
		// we still need to send the selected cells as an array to redux, since
		// redux does not support Set because it's not serializable
		setField('selectedCells', Array.from(selected));
	}, [selected, setField]);

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
						options={options}
						label={__('Interactive Regions')}
						tooltip={__('Select an option')}
						onChange={(value) => {
							setField('interactiveRegion', value);
						}}
					/>
				</div>

				<div className="mb-4">
					<div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
						<RadioGroupFactory
							title={__('Ways to select on the map')}
							name="map-selection-mode"
							value={selectionMode}
							orientation="horizontal"
							className="mb-0"
							optionClassName="me-8"
							onValueChange={(value) => setSelectionMode(value)}
							options={[
								{ value: 'cells', label: __('Grid cells') },
								{ value: 'region', label: __('Draw region') },
							]}
						/>
						<div>
							<ControlTitle
								title={__('You selected:')}
								className="my-0"
							/>
							<div
								className={cn(
									'text-2xl font-semibold leading-7',
									selected.size > 0
										? 'text-brand-blue'
										: 'text-neutral-grey-medium'
								)}
							>
								{_n(
									'1 Cell',
									`${selected.size} Cells`,
									selected.size
								)}
							</div>
						</div>
					</div>
				</div>
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
				<InteractiveRegionsLayer />
				<ZoomControl />
				<SearchControl className="top-6 left-6" />

				{selectionMode === 'region' && <GeometryControls />}
				{selectionMode === 'cells' && (
					<SelectableCellsGridLayer
						selectedCells={new Set(selectedCells)}
						onSelectCell={handleSelectCell}
					/>
				)}

				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				{/* Basemap TileLayer */}
				<TileLayer
					url="//cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png"
					attribution=""
					subdomains="abcd"
					pane="basemap"
					maxZoom={DEFAULT_MAX_ZOOM}
				/>

				{/*<TileLayer*/}
				{/*	url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"*/}
				{/*	attribution="&copy; OpenStreetMap contributors"*/}
				{/*/>*/}
			</MapContainer>
		</StepContainer>
	);
};
StepLocation.displayName = 'StepLocation';

export default StepLocation;
