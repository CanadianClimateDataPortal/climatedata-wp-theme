/**
 * useSidebar hook to access the SidebarContext
 */
import React from 'react';
import { SidebarContext } from '@/context/sidebar-provider';

export const useSidebar = () => {
	const context = React.useContext(SidebarContext);
	if (!context) {
		throw new Error('useSidebar must be used within a SidebarProvider.');
	}

	return context;
};
