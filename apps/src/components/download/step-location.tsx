import React, { useState } from 'react';
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
import GridLayer from '@/components/map-layers/grid-layer';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setInteractiveRegion } from '@/features/download/download-slice';
import {
	CANADA_CENTER,
	DEFAULT_ZOOM,
	DEFAULT_MIN_ZOOM,
	DEFAULT_MAX_ZOOM,
} from '@/lib/constants';

/**
 * Location step
 */
const StepLocation: React.FC = () => {
	const { __ } = useI18n();

	const dispatch = useAppDispatch();
	const { interactiveRegion, selectedCells } = useAppSelector(
		(state) => state.download
	);

	const [selectionMode, setSelectionMode] = useState<string>('cells');

	// TODO: when selecting inside the map, update the selected cells
	// const handleRegionSelected = (cells: number) => {
	// 	dispatch(setSelectedCells(cells));
	// }

	// TODO: fetch these values from the API
	const options = [
		{ value: 'gridded_data', label: __('Grid Cells') },
		{ value: 'census', label: __('Census Subdivisions') },
		{ value: 'health', label: __('Health Regions') },
		{ value: 'watershed', label: __('Watersheds') },
	];

	return (
		<StepContainer title="Select a location or area">
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
							dispatch(setInteractiveRegion(value));
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
								title={__('You selected')}
								className="my-0"
							/>
							<div className="text-2xl text-neutral-grey-medium font-semibold">
								{selectedCells} {__('Cells')}
							</div>
						</div>
					</div>
				</div>
			</div>

			<MapContainer
				center={CANADA_CENTER}
				zoomControl={false}
				zoom={DEFAULT_ZOOM}
				minZoom={DEFAULT_MIN_ZOOM}
				maxZoom={DEFAULT_MAX_ZOOM}
				scrollWheelZoom={false}
				className="h-[560px]"
			>
				{selectionMode === 'region' && <GeometryControls />}

				{selectionMode === 'cells' && <GridLayer />}

				<ZoomControl />
				<SearchControl className="top-6 left-6" />

				<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					attribution="&copy; OpenStreetMap contributors"
				/>
			</MapContainer>
		</StepContainer>
	);
};
StepLocation.displayName = 'StepLocation';

export default StepLocation;
