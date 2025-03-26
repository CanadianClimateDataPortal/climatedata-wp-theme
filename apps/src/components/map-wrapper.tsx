import { useClimateVariable } from "@/hooks/use-climate-variable.ts";

const MapWrapper = () => {
	const { climateVariable } = useClimateVariable();
	return climateVariable?.renderMap();
}

export {
	MapWrapper
}
