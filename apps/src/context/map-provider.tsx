/**
 * MapContext and Provider
 *
 * Provides a context for managing the map instance within the application.
 * Allows components to access and update the map instance globally.
 *
 */
import React, { createContext, useState } from 'react';

const MapContext = createContext<{
	map: L.Map | null;
	setMap: (map: L.Map) => void;
	extendInfo: boolean;
	setExtendInfo: (extendInfo: boolean) => void;
} | null>(null);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [map, setMap] = useState<L.Map | null>(null);
	const [extendInfo, setExtendInfo] = useState<boolean>(false);

	return (
		<MapContext.Provider value={{ map, setMap, extendInfo, setExtendInfo }}>
			{children}
		</MapContext.Provider>
	);
};

export { MapContext };
