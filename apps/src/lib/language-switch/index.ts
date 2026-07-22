export {
	buildSwitchUrl,
	type BuildSwitchUrlInput,
} from './build-switch-url';
// The production apex hosts are the one place a live hostname is written down,
// so anything that needs to recognise production reads them from here rather
// than re-typing the strings.
export {
	PROD_APEX_HOST_EN,
	PROD_APEX_HOST_FR,
} from './resolve-origin-for-locale';
