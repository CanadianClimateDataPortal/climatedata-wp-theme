import React, { useState, useMemo, useCallback } from 'react';
import Highcharts, { Options, SeriesOptionsType } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import 'highcharts/highcharts-more';
import 'highcharts/modules/exporting';
import 'highcharts/modules/export-data';
import { ClimateDataProps } from '@/types/types.ts';
import { useI18n } from '@wordpress/react-i18n';

// Helper to sort an array of tuples by the first element (x-value / timestamp).
function sortByTimestamp(seriesData: number[][]) {
	return seriesData.slice().sort((a, b) => a[0] - b[0]);
}

const ClimateDataChart: React.FC<{ title: string; data: ClimateDataProps }> = ({
	title,
	data,
}) => {
	const [activeTab, setActiveTab] = useState('annual-values');
	const { __ } = useI18n();

	const formatData = (dataset: Record<string, number[]> = {}) =>
		Object.entries(dataset).map(([timestamp, values]) => [
			parseInt(timestamp, 10),
			...values,
		]);

	const getFilteredSeries = useCallback((): SeriesOptionsType[] => {
		switch (activeTab) {
			case 'annual-values':
				return [
					{
						name: __('Gridded Historical Data'),
						type: 'line',
						data: sortByTimestamp(data.observations),
						color: 'gray',
						lineWidth: 1.5,
						dashStyle: 'ShortDash',
					} as Highcharts.SeriesLineOptions,
					{
						name: __('Modeled Historical'),
						type: 'line',
						data: sortByTimestamp(data.modeled_historical_median),
						color: 'black',
						lineWidth: 2,
					} as Highcharts.SeriesLineOptions,
					{
						name: __('Historical Range'),
						type: 'arearange',
						data: sortByTimestamp(data.modeled_historical_range),
						color: 'lightgray',
						fillOpacity: 0.3,
						zIndex: 0,
					} as Highcharts.SeriesArearangeOptions,
					{
						name: __('SSP1-2.6 Median'),
						type: 'line',
						data: sortByTimestamp(data.ssp126_median),
						color: 'blue',
						lineWidth: 2,
					} as Highcharts.SeriesLineOptions,
					{
						name: __('SSP1-2.6 Range'),
						type: 'arearange',
						data: sortByTimestamp(data.ssp126_range),
						color: 'lightblue',
						fillOpacity: 0.3,
					} as Highcharts.SeriesArearangeOptions,
					{
						name: __('SSP2-4.5 Median'),
						type: 'line',
						data: sortByTimestamp(data.ssp245_median),
						color: 'green',
						lineWidth: 2,
					} as Highcharts.SeriesLineOptions,
					{
						name: __('SSP2-4.5 Range'),
						type: 'arearange',
						data: sortByTimestamp(data.ssp245_range),
						color: 'lightgreen',
						fillOpacity: 0.3,
					} as Highcharts.SeriesArearangeOptions,
					{
						name: __('SSP5-8.5 Median'),
						type: 'line',
						data: sortByTimestamp(data.ssp585_median),
						color: 'red',
						lineWidth: 2,
					} as Highcharts.SeriesLineOptions,
					{
						name: __('SSP5-8.5 Range'),
						type: 'arearange',
						data: sortByTimestamp(data.ssp585_range),
						color: 'pink',
						fillOpacity: 0.3,
					} as Highcharts.SeriesArearangeOptions,
				];
			case '30-year-averages':
				return [
					{
						name: __('30y Observations'),
						type: 'line',
						data: sortByTimestamp(
							formatData(data['30y_observations'])
						),
						color: 'black',
						lineWidth: 2,
					} as Highcharts.SeriesLineOptions,
					{
						name: __('30y SSP1-2.6 Median'),
						type: 'line',
						data: sortByTimestamp(
							formatData(data['30y_ssp126_median'])
						),
						color: 'blue',
						lineWidth: 2,
					} as Highcharts.SeriesLineOptions,
					{
						name: __('30y SSP1-2.6 Range'),
						type: 'arearange',
						data: sortByTimestamp(
							formatData(data['30y_ssp126_range'])
						),
						color: 'lightblue',
						fillOpacity: 0.3,
					} as Highcharts.SeriesArearangeOptions,
					{
						name: __('30y SSP2-4.5 Median'),
						type: 'line',
						data: sortByTimestamp(
							formatData(data['30y_ssp245_median'])
						),
						color: 'green',
						lineWidth: 2,
					} as Highcharts.SeriesLineOptions,
					{
						name: __('30y SSP2-4.5 Range'),
						type: 'arearange',
						data: sortByTimestamp(
							formatData(data['30y_ssp245_range'])
						),
						color: 'lightgreen',
						fillOpacity: 0.3,
					} as Highcharts.SeriesArearangeOptions,
					{
						name: __('30y SSP5-8.5 Median'),
						type: 'line',
						data: sortByTimestamp(
							formatData(data['30y_ssp585_median'])
						),
						color: 'red',
						lineWidth: 2,
					} as Highcharts.SeriesLineOptions,
					{
						name: __('30y SSP5-8.5 Range'),
						type: 'arearange',
						data: sortByTimestamp(
							formatData(data['30y_ssp585_range'])
						),
						color: 'pink',
						fillOpacity: 0.3,
					} as Highcharts.SeriesArearangeOptions,
				];
			case '30-year-changes':
				return [
					{
						name: __('Delta 7100 SSP1-2.6 Median'),
						type: 'line',
						data: sortByTimestamp(
							formatData(data['delta7100_ssp126_median'])
						),
						color: 'blue',
						lineWidth: 2,
					} as Highcharts.SeriesLineOptions,
					{
						name: __('Delta 7100 SSP1-2.6 Range'),
						type: 'arearange',
						data: sortByTimestamp(
							formatData(data['delta7100_ssp126_range'])
						),
						color: 'lightblue',
						fillOpacity: 0.3,
					} as Highcharts.SeriesArearangeOptions,
					{
						name: __('Delta 7100 SSP2-4.5 Median'),
						type: 'line',
						data: sortByTimestamp(
							formatData(data['delta7100_ssp245_median'])
						),
						color: 'green',
						lineWidth: 2,
					} as Highcharts.SeriesLineOptions,
					{
						name: __('Delta 7100 SSP2-4.5 Range'),
						type: 'arearange',
						data: sortByTimestamp(
							formatData(data['delta7100_ssp245_range'])
						),
						color: 'lightgreen',
						fillOpacity: 0.3,
					} as Highcharts.SeriesArearangeOptions,
					{
						name: __('Delta 7100 SSP5-8.5 Median'),
						type: 'line',
						data: sortByTimestamp(
							formatData(data['delta7100_ssp585_median'])
						),
						color: 'red',
						lineWidth: 2,
					} as Highcharts.SeriesLineOptions,
					{
						name: __('Delta 7100 SSP5-8.5 Range'),
						type: 'arearange',
						data: sortByTimestamp(
							formatData(data['delta7100_ssp585_range'])
						),
						color: 'pink',
						fillOpacity: 0.3,
					} as Highcharts.SeriesArearangeOptions,
				];
			default:
				return [];
		}
	}, [__, activeTab, data]);

	const chartOptions = useMemo<Options>(() => {
		return {
			chart: {
				type: 'line',
				zoomType: 'x',
			},
			title: {
				text: '',
			},
			xAxis: {
				type: 'datetime',
				title: {
					text: __('Year'),
				},
			},
			yAxis: {
				title: {
					text: __('Temperature (°C)'),
				},
				opposite: true,
			},
			series: getFilteredSeries(),
			legend: {
				layout: 'horizontal',
				align: 'center',
				verticalAlign: 'bottom',
			},
		};
	}, [__, getFilteredSeries]);

	const handleExport = (format: string) => {
		alert(__(`Exporting chart as ${format}`));
	};

	return (
		<div className="climate-chart z-[500] px-5 py-5">
			<div className="flex justify-between items-start mb-4">
				<div className="text-left">
					<h2 className="text-2xl font-bold m-0">{title}</h2>
					<p className="text-base text-gray-500 m-0">
						{__(
							'Historical Canadian Climate Normals – Hottest Day – CMIP6'
						)}
					</p>
				</div>
				<div className="flex justify-end items-center gap-5 my-2 text-sm text-gray-500">
					<span>{__('35.5°C Median (2011–2040)')}</span>
					<span>{__('+2.1°C Relative to Baseline (1971–2000)')}</span>
					<span>{__('31.2°C to 34.8°C Range')}</span>
				</div>
			</div>
			<div className="flex justify-between items-center mb-4">
				<div className="flex justify-center">
					<button
						className={`px-5 py-2 mx-2 border border-gray-300 bg-gray-50 cursor-pointer text-sm ${
							activeTab === 'annual-values'
								? 'border-b-2 border-blue-500 text-blue-500 font-bold'
								: ''
						}`}
						onClick={() => setActiveTab('annual-values')}
					>
						{__('Annual Values')}
					</button>
					<button
						className={`px-5 py-2 mx-2 border border-gray-300 bg-gray-50 cursor-pointer text-sm ${
							activeTab === '30-year-averages'
								? 'border-b-2 border-blue-500 text-blue-500 font-bold'
								: ''
						}`}
						onClick={() => setActiveTab('30-year-averages')}
					>
						{__('30 Year Averages')}
					</button>
					<button
						className={`px-5 py-2 mx-2 border border-gray-300 bg-gray-50 cursor-pointer text-sm ${
							activeTab === '30-year-changes'
								? 'border-b-2 border-blue-500 text-blue-500 font-bold'
								: ''
						}`}
						onClick={() => setActiveTab('30-year-changes')}
					>
						{__('30 Year Changes')}
					</button>
				</div>
				<div className="flex justify-end gap-3">
					<button
						className="px-4 py-2 text-sm border border-gray-300 bg-gray-50 cursor-pointer"
						onClick={() => handleExport('PDF')}
					>
						{__('PDF')}
					</button>
					<button
						className="px-4 py-2 text-sm border border-gray-300 bg-gray-50 cursor-pointer"
						onClick={() => handleExport('PNG')}
					>
						{__('PNG')}
					</button>
					<button
						className="px-4 py-2 text-sm border border-gray-300 bg-gray-50 cursor-pointer"
						onClick={() => handleExport('CSV')}
					>
						{__('CSV')}
					</button>
					<button
						className="px-4 py-2 text-sm border border-gray-300 bg-gray-50 cursor-pointer"
						onClick={() => handleExport('PRINT')}
					>
						{__('Print')}
					</button>
				</div>
			</div>
			<HighchartsReact highcharts={Highcharts} options={chartOptions} />
		</div>
	);
};
ClimateDataChart.displayName = 'ClimateDataChart';

export default ClimateDataChart;
