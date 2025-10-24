import React, { useState } from 'react';

import { type Story } from '@ladle/react';

import {
	//
	type ColourMap,
	type ColourSchemeType,
} from '@/types/types';

import MapLegendControlS2D from '@/components/map-legend-control-s2d';

const HARDCODED_LEGEND_DATA: ColourMap = {
	colours: ['#317CB7', '#4D94C3', '#67001F'],
	quantities: [-50, -38, -25],
	type: 'sequential' as ColourSchemeType,
	isDivergent: true,
};

export const MapLegendControlS2DStory: Story = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	return (
		<div>
			<div className="space-y-[5px] w-[91px]">
				{/* BEGIN Story markup */}

				<MapLegendControlS2D
					data={HARDCODED_LEGEND_DATA}
					isOpen={isOpen}
					toggleOpen={() => setIsOpen((prev) => !prev)}
				>

					<div className="flex flex-col items-end gap-1 bg-white border border-cold-grey-3 rounded-md py-2 px-1 overflow-y-auto">
						<div className="font-sans text-zinc-900 font-semibold text-lg leading-5 text-right">
							cm
						</div>
						<svg height="1030" className="w-full">
							<g fill-opacity="1">
								<rect
									width="22"
									height="93.63636363636364"
									fill="#67001F"
									x="59"
									y="0"
								></rect>
								<rect
									width="22"
									height="93.63636363636364"
									fill="#B2182B"
									x="59"
									y="93.63636363636364"
								></rect>
								<rect
									width="22"
									height="93.63636363636364"
									fill="#D6604D"
									x="59"
									y="187.27272727272728"
								></rect>
								<rect
									width="22"
									height="93.63636363636364"
									fill="#F4A582"
									x="59"
									y="280.90909090909093"
								></rect>
								<rect
									width="22"
									height="93.63636363636364"
									fill="#FDDBC7"
									x="59"
									y="374.54545454545456"
								></rect>
								<rect
									width="22"
									height="93.63636363636364"
									fill="#FBF8BF"
									x="59"
									y="468.1818181818182"
								></rect>
								<rect
									width="22"
									height="93.63636363636364"
									fill="#D1E5F0"
									x="59"
									y="561.8181818181819"
								></rect>
								<rect
									width="22"
									height="93.63636363636364"
									fill="#92C5DE"
									x="59"
									y="655.4545454545455"
								></rect>
								<rect
									width="22"
									height="93.63636363636364"
									fill="#4393C3"
									x="59"
									y="749.0909090909091"
								></rect>
								<rect
									width="22"
									height="93.63636363636364"
									fill="#2166AC"
									x="59"
									y="842.7272727272727"
								></rect>
								<rect
									width="22"
									height="93.63636363636364"
									fill="#053061"
									x="59"
									y="936.3636363636364"
								></rect>
							</g>
							<g>
								<text
									x="44"
									y="93.63636363636364"
									className="legend-temp-text"
									dominant-baseline="middle"
									text-anchor="end"
								>
									150
								</text>
								<line
									x1="49"
									y1="93.63636363636364"
									x2="59"
									y2="93.63636363636364"
									stroke="black"
									stroke-width="1"
								></line>
							</g>
							<g>
								<text
									x="44"
									y="187.27272727272728"
									className="legend-temp-text"
									dominant-baseline="middle"
									text-anchor="end"
								>
									117
								</text>
								<line
									x1="49"
									y1="187.27272727272728"
									x2="59"
									y2="187.27272727272728"
									stroke="black"
									stroke-width="1"
								></line>
							</g>
							<g>
								<text
									x="44"
									y="280.90909090909093"
									className="legend-temp-text"
									dominant-baseline="middle"
									text-anchor="end"
								>
									83
								</text>
								<line
									x1="49"
									y1="280.90909090909093"
									x2="59"
									y2="280.90909090909093"
									stroke="black"
									stroke-width="1"
								></line>
							</g>
							<g>
								<text
									x="44"
									y="374.54545454545456"
									className="legend-temp-text"
									dominant-baseline="middle"
									text-anchor="end"
								>
									50
								</text>
								<line
									x1="49"
									y1="374.54545454545456"
									x2="59"
									y2="374.54545454545456"
									stroke="black"
									stroke-width="1"
								></line>
							</g>
							<g>
								<text
									x="44"
									y="468.1818181818182"
									className="legend-temp-text"
									dominant-baseline="middle"
									text-anchor="end"
								>
									17
								</text>
								<line
									x1="49"
									y1="468.1818181818182"
									x2="59"
									y2="468.1818181818182"
									stroke="black"
									stroke-width="1"
								></line>
							</g>
							<g>
								<text
									x="44"
									y="561.8181818181819"
									className="legend-temp-text"
									dominant-baseline="middle"
									text-anchor="end"
								>
									-17
								</text>
								<line
									x1="49"
									y1="561.8181818181819"
									x2="59"
									y2="561.8181818181819"
									stroke="black"
									stroke-width="1"
								></line>
							</g>
							<g>
								<text
									x="44"
									y="655.4545454545455"
									className="legend-temp-text"
									dominant-baseline="middle"
									text-anchor="end"
								>
									-50
								</text>
								<line
									x1="49"
									y1="655.4545454545455"
									x2="59"
									y2="655.4545454545455"
									stroke="black"
									stroke-width="1"
								></line>
							</g>
							<g>
								<text
									x="44"
									y="749.0909090909091"
									className="legend-temp-text"
									dominant-baseline="middle"
									text-anchor="end"
								>
									-83
								</text>
								<line
									x1="49"
									y1="749.0909090909091"
									x2="59"
									y2="749.0909090909091"
									stroke="black"
									stroke-width="1"
								></line>
							</g>
							<g>
								<text
									x="44"
									y="842.7272727272727"
									className="legend-temp-text"
									dominant-baseline="middle"
									text-anchor="end"
								>
									-117
								</text>
								<line
									x1="49"
									y1="842.7272727272727"
									x2="59"
									y2="842.7272727272727"
									stroke="black"
									stroke-width="1"
								></line>
							</g>
							<g>
								<text
									x="44"
									y="936.3636363636364"
									className="legend-temp-text"
									dominant-baseline="middle"
									text-anchor="end"
								>
									-150
								</text>
								<line
									x1="49"
									y1="936.3636363636364"
									x2="59"
									y2="936.3636363636364"
									stroke="black"
									stroke-width="1"
								></line>
							</g>
						</svg>
					</div>


				</MapLegendControlS2D>

				{/* END Story markup */}
			</div>
		</div>
	);
};

MapLegendControlS2DStory.args = {
	//
};
