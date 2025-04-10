import React, { useState } from 'react';
import { ColorPaletteOption, ColorSelectProps } from '@/types/types.ts';

/**
 * A dropdown component for selecting palettes of colors, visually representing them as striped blocks.
 */
export const ColorSelect: React.FC<ColorSelectProps> = ({
	options,
	onChange,
}) => {
	const [selectedOption, setSelectedOption] =
		useState<ColorPaletteOption | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	/**
	 * handles the selecting of the color palette
	 * @param option - this is the selected palette option
	 */
	const handleSelect = (option: ColorPaletteOption) => {
		setSelectedOption(option);
		setIsOpen(false);
		if (onChange) {
			onChange(option);
		}
	};

	return (
		<div className="relative w-52">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				className="block w-full p-2 border border-gray-300 rounded cursor-pointer bg-white text-left"
			>
				<div className="flex items-center gap-2">
					{selectedOption ? (
						<div className="flex w-full">
							{selectedOption.colors.map((color, index) => (
								<div
									key={index}
									className="flex-1 h-5"
									style={{
										backgroundColor: color,
									}}
								></div>
							))}
						</div>
					) : (
						'Choose a palette'
					)}
				</div>
			</button>
			{isOpen && (
				<ul
					role="listbox"
					className="absolute top-full left-0 z-50 bg-white border border-gray-300 rounded mt-1 p-0 list-none w-full"
				>
					{options.map((option, index) => (
						<li
							key={index}
							role="option"
							onClick={() => handleSelect(option)}
							className="relative flex h-10 items-center cursor-pointer"
						>
							<div className="flex w-full h-full">
								{option.colors.map((color, colorIndex) => (
									<div
										key={colorIndex}
										className="flex-1"
										style={{
											backgroundColor: color,
										}}
									></div>
								))}
							</div>
							<span className="absolute w-full text-center text-sm font-bold text-white pointer-events-none">
								{option.name}
							</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};
