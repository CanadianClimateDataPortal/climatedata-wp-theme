/**
 * useAnimatedPanel hook to get the animated panel context from the AnimatedPanelProvider
 */
import { useContext } from 'react';
import { AnimatedPanelContext } from '@/context/animated-panel-provider';

export const useAnimatedPanel = () => {
	const context = useContext(AnimatedPanelContext);
	if (!context) {
		throw new Error(
			'useAnimatedPanel must be used within a AnimatedPanelProvider'
		);
	}
	return context;
};
