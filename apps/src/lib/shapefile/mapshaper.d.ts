/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Minimal type declarations for mapshaper.
 *
 * Mapshaper does not ship TypeScript types.
 * Only the `applyCommands` function is declared here —
 * the sole entry point used by the shapefile pipeline.
 *
 * @see {@link https://github.com/mbloch/mapshaper/wiki/Using-mapshaper-programmatically}
 */
declare module 'mapshaper' {
	type ApplyCommandsInput = Record<string, ArrayBuffer | string>;
	type ApplyCommandsOutput = Record<string, string>;

	/**
	 * Run mapshaper commands programmatically.
	 *
	 * When called without a callback, returns a Promise.
	 *
	 * @param commands - CLI-style command string (e.g. `'file.shp -info save-to=info'`)
	 * @param input - Virtual file system: filenames mapped to content
	 * @returns Output files as a record of filename → string content
	 */
	function applyCommands(
		commands: string,
		input?: ApplyCommandsInput,
	): Promise<ApplyCommandsOutput>;

	const mapshaper: {
		applyCommands: typeof applyCommands;
	};

	export = mapshaper;
}
