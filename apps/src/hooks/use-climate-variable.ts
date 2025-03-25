import { createContext, useContext } from "react";
import { PostData } from "@/types/types.ts";
import { ClimateVariableInterface } from "@/types/climate-variable-interface.ts";

export type ClimateVariableContextType = {
	climateVariable: ClimateVariableInterface | null;
	selectClimateVariable: (variable: PostData) => void;
	setVersion: (version: string) => void;
	setScenario: (scenario: string) => void;
	setThreshold: (threshold: string) => void;
}

const ClimateVariableContext = createContext<ClimateVariableContextType | null>(null);

export const useClimateVariable = () => {
	const context = useContext(ClimateVariableContext);
	if (!context) {
		throw new Error('useClimateVariable must be used within an ClimateVariableProvider');
	}
	return context;
}

export default ClimateVariableContext;
