import { createContext, useContext } from "react";
import { ClimateVariableContextType } from "@/context/climate-variable-provider";

const ClimateVariableContext = createContext<ClimateVariableContextType | null>(null);

export const useClimateVariable = () => {
	const context = useContext(ClimateVariableContext);
	if (!context) {
		throw new Error('useClimateVariable must be used within an ClimateVariableProvider');
	}
	return context;
}

export default ClimateVariableContext;
