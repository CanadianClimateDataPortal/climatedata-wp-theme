/**
 * AnimatedPanelProvider
 *
 * This provider manages the state and behavior of a global animated sliding panel.
 * It allows any child component to open, close, or toggle the panel by using
 * the `useAnimatedPanel` hook.
 *
 * The panel can display dynamic content, and its props (e.g., position, direction) can be
 * customized when opening it.
 *
 * Key Features:
 * - Only one panel can be open at a time.
 * - The panel slides in and out based on the specified direction (e.g., left, right, top, bottom).
 * - Supports custom positioning via `position` (e.g., `{ top: 0, left: 50 }`) or Tailwind classes (e.g., `top-0 left-1/2`).
 * - Provides methods to open, close, and toggle the panel.
 *
 * Example usage:
 * ```
 * import { useAnimatedPanel } from '@/context/animated-panel-provider';
 *
 * const SomeComponent = () => {
 *   const { togglePanel } = useAnimatedPanel();
 *
 *   const handleTogglePanel1 = () => {
 *     // using a position object
 *     togglePanel(<div>Some content</div>, { direction: 'right', position: { top: 0 } });
 *   };
 *
 *   // using a Tailwind class
 *   const handleTogglePanel2 = () => {
 *      togglePanel(<div>Some content</div>, { direction: 'right', className: 'top-0' });
 *   };
 *
 *   return <button onClick={handleTogglePanel1}>Open Panel 1</button>;
 *   return <button onClick={handleTogglePanel2}>Open Panel 2</button>;
 * };
 * ```
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import AnimatedPanel from '@/components/ui/animated-panel';
import { AnimatedPanelContextType, ProviderPanelProps } from '@/types/types';

// Create the context
const AnimatedPanelContext = createContext<
	AnimatedPanelContextType | undefined
>(undefined);

// AnimatedPanelProvider component
export const AnimatedPanelProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [activePanel, setActivePanel] = useState<React.ReactNode | null>(
		null
	);
	const [panelProps, setPanelProps] = useState<
		ProviderPanelProps | undefined
	>(undefined);

	const openPanel = (
		content: React.ReactNode,
		props: ProviderPanelProps = {}
	) => {
		setActivePanel(content);
		setPanelProps(props);
	};

	const closePanel = () => {
		setActivePanel(null);
	};

	const togglePanel = (
		content: React.ReactNode,
		props: ProviderPanelProps = {}
	) => {
		if (activePanel) {
			closePanel();
		} else {
			openPanel(content, props);
		}
	};

	return (
		<AnimatedPanelContext.Provider
			value={{ activePanel, openPanel, closePanel, togglePanel }}
		>
			{children}

			{/* this will render the panel as a direct child of the root element */}
			<AnimatedPanel
				isOpen={!!activePanel}
				{...panelProps}
				onClose={closePanel}
			>
				{activePanel}
			</AnimatedPanel>
		</AnimatedPanelContext.Provider>
	);
};

export const useAnimatedPanel = () => {
	const context = useContext(AnimatedPanelContext);
	if (!context) {
		throw new Error(
			'useAnimatedPanel must be used within a AnimatedPanelProvider'
		);
	}
	return context;
};
