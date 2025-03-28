import { createContext } from 'react';

const SectionContext = createContext<'map' | 'download'>('map');

export default SectionContext;
