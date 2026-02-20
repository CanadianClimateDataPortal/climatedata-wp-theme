/**
 * Ladle stories for shapefile processing — extraction demo, pipeline, and map display.
 */

import {
	useContext,
	useEffect,
	useState,
} from 'react';
import type { Story } from '@ladle/react';
import { useSelector } from '@xstate/react';
import L from 'leaflet';
import {
	GeoJSON,
	MapContainer,
	TileLayer,
	useMap,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

import {
	ShapefileProvider,
	ShapefileContext,
} from '@/context/shapefile-provider';
import { useShapefile } from '@/hooks/use-shapefile';
import FileInput from '@/components/ui/file-input';
import { MAP_CONFIG } from '@/config/map.config';
import {
	DEFAULT_MAX_ZOOM,
	DEFAULT_MIN_ZOOM,
} from '@/lib/constants';

import {
	detectZip,
	type ZipDetectionResult,
} from './detect-zip';
import { extractShapefileFromZip } from './extract-shapefile';
import type { ExtractedShapefile } from './contracts';
import {
	ShapefileError,
	InvalidGeometryTypeError,
} from './errors';

// STORY Extraction
export const StoryExtraction: Story = () => <StoryBodyExtraction />;

StoryExtraction.storyName = 'Shapefile Extraction';

// STORY Pipeline
export const StoryPipeline: Story = () => (
	<ShapefileProvider>
		<div className="p-8 max-w-4xl font-sans">
			<h2 className="text-xl font-semibold mb-2">Shapefile Pipeline Demo</h2>
			<p className="text-gray-500 mb-6">
				Upload a ZIP shapefile to exercise the full XState machine pipeline:
				idle &rarr; extracting &rarr; validating &rarr; transforming &rarr;
				displaying
			</p>
			<PipelineUpload />
		</div>
	</ShapefileProvider>
);

StoryPipeline.storyName = 'Shapefile Pipeline';

// STORY DisplayMap
export const StoryDisplayMap: Story = () => (
	<ShapefileProvider>
		<div className="font-sans">
			<div className="p-8 max-w-4xl">
				<h2 className="text-xl font-semibold mb-2">
					Shapefile Display on a Map
				</h2>
				<p className="text-gray-500 mb-6">
					Upload a shapefile ZIP to run the pipeline and display the resulting
					polygons on a Leaflet map.
				</p>
				<PipelineUpload />
			</div>
			<ShapefileMap />
		</div>
	</ShapefileProvider>
);

StoryDisplayMap.storyName = 'Shapefile Display on a Map';

// ============================================================================
// STORY Extraction —
// ============================================================================

type ExtractionState =
	| { status: 'idle' }
	| { status: 'detecting' }
	| { status: 'extracting' }
	| {	status: 'success';
			detection: ZipDetectionResult;
			extracted: ExtractedShapefile; }
	| {	status: 'error';
			detection: ZipDetectionResult | null;
			error: ShapefileError; };

const StoryBodyExtraction = () => {
	const [file, setFile] = useState<File | null>(null);
	const [state, setState] = useState<ExtractionState>({ status: 'idle' });

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const files = event.target.files;
		if (!files || files.length === 0) {
			setFile(null);
			setState({ status: 'idle' });
			return;
		}

		const selectedFile = files[0];
		setFile(selectedFile);

		// Step 1: Detect ZIP
		setState({ status: 'detecting' });
		const detection = await detectZip(selectedFile);

		// Step 2: Extract shapefile
		setState({ status: 'extracting' });
		const result = await extractShapefileFromZip(selectedFile);

		if (result.ok) {
			setState({
				status: 'success',
				detection,
				extracted: result.value,
			});
		} else {
			setState({
				status: 'error',
				detection,
				error: result.error,
			});
		}
	};

	return (
		<div
			style={{
				padding: '2rem',
				maxWidth: '900px',
				fontFamily: 'system-ui',
			}}
		>
			<h2>Shapefile Extraction Demo</h2>
			<p style={{ color: '#666', marginBottom: '1.5rem' }}>
				Upload a ZIP file containing .shp and .prj files to test extraction
			</p>

			<input
				type="file"
				accept=".zip"
				onChange={handleFileChange}
				style={{ marginBottom: '1.5rem' }}
			/>

			{file && (
				<section
					style={{
						padding: '1rem',
						border: '1px solid #ddd',
						borderRadius: '4px',
						marginBottom: '1rem',
					}}
				>
					<h3 style={{ marginTop: 0 }}>File Info</h3>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<tbody>
							<tr>
								<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
									Name:
								</td>
								<td>{file.name}</td>
							</tr>
							<tr>
								<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
									Size:
								</td>
								<td>{file.size.toLocaleString()} bytes</td>
							</tr>
							<tr>
								<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
									Type:
								</td>
								<td>{file.type || '(empty)'}</td>
							</tr>
						</tbody>
					</table>
				</section>
			)}

			{state.status === 'detecting' && (
				<div
					style={{
						padding: '1rem',
						backgroundColor: '#f0f7ff',
						borderRadius: '4px',
					}}
				>
					Detecting ZIP format...
				</div>
			)}

			{state.status === 'extracting' && (
				<div
					style={{
						padding: '1rem',
						backgroundColor: '#f0f7ff',
						borderRadius: '4px',
					}}
				>
					Extracting shapefile...
				</div>
			)}

			{(state.status === 'success' || state.status === 'error') &&
				state.detection && (
					<section
						style={{
							padding: '1rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
							marginBottom: '1rem',
						}}
					>
						<h3 style={{ marginTop: 0 }}>ZIP Detection Result</h3>
						<table style={{ width: '100%', borderCollapse: 'collapse' }}>
							<tbody>
								<tr>
									<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
										Is ZIP:
									</td>
									<td>
										<span
											style={{ color: state.detection.isZip ? 'green' : 'red' }}
										>
											{state.detection.isZip ? '✓ Yes' : '✗ No'}
										</span>
									</td>
								</tr>
								<tr>
									<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
										Is Empty:
									</td>
									<td>
										<span
											style={{
												color: state.detection.isEmpty ? 'red' : 'green',
											}}
										>
											{state.detection.isEmpty ? '✗ Yes' : '✓ No'}
										</span>
									</td>
								</tr>
								<tr>
									<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
										First Bytes:
									</td>
									<td>
										<code
											style={{
												backgroundColor: '#f5f5f5',
												padding: '0.25rem',
												borderRadius: '2px',
											}}
										>
											{state.detection.firstBytes || '(empty)'}
										</code>
									</td>
								</tr>
							</tbody>
						</table>
						<p
							style={{
								fontSize: '0.875rem',
								color: '#666',
								marginTop: '0.5rem',
								marginBottom: 0,
							}}
						>
							ZIP files start with: <code>50 4b 03 04</code> (ASCII "PK..")
						</p>
					</section>
				)}

			{state.status === 'success' && (
				<section
					style={{
						padding: '1rem',
						border: '2px solid green',
						borderRadius: '4px',
						backgroundColor: '#f0fff0',
					}}
				>
					<h3 style={{ marginTop: 0, color: 'green' }}>
						✓ Extraction Successful
					</h3>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<tbody>
							<tr>
								<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
									file.shp:
								</td>
								<td>
									{state.extracted['file.shp'].byteLength.toLocaleString()}{' '}
									bytes
								</td>
							</tr>
							<tr>
								<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
									file.prj:
								</td>
								<td>
									{state.extracted['file.prj'].length.toLocaleString()}{' '}
									characters
								</td>
							</tr>
						</tbody>
					</table>
					<details style={{ marginTop: '1rem' }}>
						<summary style={{ cursor: 'pointer', color: '#666' }}>
							View .prj content
						</summary>
						<pre
							style={{
								fontFamily: 'monospace',
								fontSize: '0.75rem',
								backgroundColor: '#fff',
								padding: '0.5rem',
								borderRadius: '4px',
								overflow: 'auto',
								whiteSpace: 'pre-wrap',
								wordBreak: 'break-all',
								marginTop: '0.5rem',
							}}
						>
							{state.extracted['file.prj']}
						</pre>
					</details>
				</section>
			)}

			{state.status === 'error' && (
				<section
					style={{
						padding: '1rem',
						border: '2px solid red',
						borderRadius: '4px',
						backgroundColor: '#fff0f0',
					}}
				>
					<h3 style={{ marginTop: 0, color: 'red' }}>✗ Extraction Failed</h3>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<tbody>
							<tr>
								<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
									Error Code:
								</td>
								<td>
									<code
										style={{
											backgroundColor: '#ffe0e0',
											padding: '0.25rem 0.5rem',
											borderRadius: '2px',
										}}
									>
										{state.error.code}
									</code>
								</td>
							</tr>
							<tr>
								<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
									Message:
								</td>
								<td>{state.error.message}</td>
							</tr>
						</tbody>
					</table>
				</section>
			)}

			<div
				style={{
					marginTop: '2rem',
					padding: '1rem',
					backgroundColor: '#f0f7ff',
					borderRadius: '4px',
					fontSize: '0.875rem',
				}}
			>
				<h4 style={{ marginTop: 0 }}>Error Codes:</h4>
				<ul style={{ marginBottom: 0, columns: 2 }}>
					<li><code>extraction/empty-file</code></li>
					<li><code>extraction/not-a-zip</code></li>
					<li><code>extraction/missing-shp</code></li>
					<li><code>extraction/missing-prj</code></li>
					<li><code>extraction/zip-parse-failed</code></li>
				</ul>
			</div>
		</div>
	);
};

// ============================================================================
// Shared — PipelineUpload (self-contained upload + machine state display)
// ============================================================================

const STATE_LABELS: Record<string, { label: string; className: string }> = {
	idle: {
		label: 'Idle',
		className: 'text-gray-500 bg-gray-100',
	},
	extracting: {
		label: 'Extracting...',
		className: 'text-blue-600 bg-blue-50',
	},
	validating: {
		label: 'Validating...',
		className: 'text-blue-600 bg-blue-50',
	},
	transforming: {
		label: 'Transforming...',
		className: 'text-blue-600 bg-blue-50',
	},
	displaying: {
		label: 'Displaying',
		className: 'text-green-600 bg-green-50',
	},
	selected: {
		label: 'Selected',
		className: 'text-violet-600 bg-violet-50',
	},
	ready: {
		label: 'Ready',
		className: 'text-green-600 bg-green-50',
	},
};

/**
 * Self-contained pipeline upload component.
 *
 * Uses ShapefileContext internally — must be rendered inside a ShapefileProvider.
 * Handles file upload, displays machine state, errors, and success info.
 * Reused by both the Pipeline and DisplayMap stories.
 */
const PipelineUpload = () => {
	const {
		file,
		isProcessingFile,
		isFileValid,
		setFile,
		reset,
	} = useShapefile();

	const isFileInvalid = file !==null && !isFileValid;

	const context = useContext(ShapefileContext);
	const snapshot = useSelector(context!.actor, (s) => s);
	const machineState = String(snapshot.value);

	const stateInfo = STATE_LABELS[machineState] ?? {
		label: machineState,
		className: 'text-gray-500 bg-gray-100',
	};

	return (
		<div className="space-y-4">
			{/* File input + reset */}
			<div className="flex gap-3 items-center">
				<div className="flex-1">
					<FileInput
						file={file}
						accept=".zip"
						isProcessing={isProcessingFile}
						isInvalid={isFileInvalid}
						onChange={(f) => (f ? setFile(f) : reset())}
						onClear={reset}
					/>
				</div>
				<button
					type="button"
					onClick={reset}
					className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
				>
					Reset
				</button>
			</div>
			<ShapefileErrorMessage />

			{/* Machine state */}
			<section className="p-4 border border-gray-300 rounded">
				<h3 className="mt-0 mb-2 text-sm font-semibold">Machine State</h3>
				<table className="w-full border-collapse text-sm">
					<tbody>
						<tr>
							<td className="p-1 font-bold w-36">State:</td>
							<td>
								<code
									className={`px-2 py-0.5 rounded font-bold ${stateInfo.className}`}
								>
									{stateInfo.label}
								</code>
							</td>
						</tr>
						<tr>
							<td className="p-1 font-bold">File:</td>
							<td>
								{file
									? `${file.name} (${file.size.toLocaleString()} bytes)`
									: '(none)'}
							</td>
						</tr>
						<tr>
							<td className="p-1 font-bold">Processing:</td>
							<td>{isProcessingFile ? 'Yes' : 'No'}</td>
						</tr>
					</tbody>
				</table>
			</section>

			{/* Error display */}
			{isFileInvalid && snapshot.context.error && (
				<section className="p-4 border-2 border-red-500 rounded bg-red-50">
					<h3 className="mt-0 mb-2 text-red-600 font-semibold">
						Pipeline Error
					</h3>
					<table className="w-full border-collapse text-sm">
						<tbody>
							<tr>
								<td className="p-1 font-bold w-36">Error:</td>
								<td>{snapshot.context.error.name}</td>
							</tr>
							<tr>
								<td className="p-1 font-bold">Code:</td>
								<td>
									<code className="bg-red-100 px-2 py-0.5 rounded">
										{'code' in snapshot.context.error
											? String(snapshot.context.error.code)
											: '(none)'}
									</code>
								</td>
							</tr>
							<tr>
								<td className="p-1 font-bold">Message:</td>
								<td>{snapshot.context.error.message}</td>
							</tr>
						</tbody>
					</table>
				</section>
			)}

			{/* Success — machine reached displaying */}
			{machineState === 'displaying' && snapshot.context.simplifiedGeometry && (
				<section className="p-4 border-2 border-green-500 rounded bg-green-50">
					<h3 className="mt-0 mb-2 text-green-600 font-semibold">
						Pipeline Complete
					</h3>
					<table className="w-full border-collapse text-sm">
						<tbody>
							<tr>
								<td className="p-1 font-bold w-36">Features:</td>
								<td>
									{snapshot.context.simplifiedGeometry.featureCount}
									{snapshot.context.simplifiedGeometry.featureCount === 0 && (
										<span className="text-gray-400 ml-2">
											(no features remained after simplification)
										</span>
									)}
								</td>
							</tr>
							{snapshot.context.extractedShapefile && (
								<>
									<tr>
										<td className="p-1 font-bold">file.shp:</td>
										<td>
											{snapshot.context.extractedShapefile[
												'file.shp'
											].byteLength.toLocaleString()}{' '}
											bytes
										</td>
									</tr>
									<tr>
										<td className="p-1 font-bold">file.prj:</td>
										<td>
											{snapshot.context.extractedShapefile[
												'file.prj'
											].length.toLocaleString()}{' '}
											characters
										</td>
									</tr>
								</>
							)}
						</tbody>
					</table>
					{snapshot.context.extractedShapefile && (
						<details className="mt-4">
							<summary className="cursor-pointer text-gray-500 text-sm">
								View .prj content
							</summary>
							<pre className="font-mono text-xs bg-white p-2 rounded overflow-auto whitespace-pre-wrap break-all mt-2">
								{snapshot.context.extractedShapefile['file.prj']}
							</pre>
						</details>
					)}
				</section>
			)}
		</div>
	);
};

// ============================================================================
// Shared — ShapefileMap (Leaflet map with GeoJSON from machine context)
// ============================================================================

/**
 * Reads simplifiedGeometry from the machine context and renders it
 * as a GeoJSON layer, fitting the map bounds to the data.
 */
const GeoJsonFromMachine = () => {
	const context = useContext(ShapefileContext);
	const snapshot = useSelector(context!.actor, (s) => s);
	const { simplifiedGeometry, file } = snapshot.context;
	const map = useMap();

	useEffect(() => {
		if (simplifiedGeometry?.featureCollection) {
			const layer = L.geoJSON(simplifiedGeometry.featureCollection);
			const bounds = layer.getBounds();
			if (bounds.isValid()) {
				map.fitBounds(bounds, { padding: [20, 20] });
			}
		}
	}, [simplifiedGeometry, map]);

	if (!simplifiedGeometry?.featureCollection) return null;

	return (
		<GeoJSON
			key={file?.name ?? 'empty'}
			data={simplifiedGeometry.featureCollection}
			style={{
				color: '#3B82F6',
				weight: 2,
				fillColor: '#3B82F6',
				fillOpacity: 0.15,
			}}
		/>
	);
};

// ============================================================================
// Shared — ShapefileErrorMessage (precise error from machine context)
//
// Future work: move to apps/src/components/download/ and replace the
// generic "The selected file is not a supported shapefile" in
// shapefile-upload.tsx. When moving to production:
//   - Wrap message strings in __() for i18n
//   - Consider extending useShapefile() to expose the error directly
//     so consumers don't need ShapefileContext access
// ============================================================================

/**
 * Maps a machine error to a user-facing message string.
 *
 * - InvalidGeometryTypeError → includes the actual geometry type found
 * - ShapefileError with known code → specific message from map
 * - Unknown code or non-ShapefileError → generic fallback
 */
const getShapefileErrorMessage = (error: Error): string => {
	if (error instanceof InvalidGeometryTypeError) {
		return (
			`The shapefile contains ${error.geometryType} geometry.` +
			' Only polygons are supported.'
		);
	}

	if (error instanceof ShapefileError) {
		return error.code ?? 'The selected file is not a supported shapefile.';
	}

	return 'An unexpected error occurred while processing the file.';
};

/**
 * Displays a precise error message from the shapefile state machine.
 *
 * Reads error state via ShapefileContext. Renders nothing when no error.
 * Same visual footprint as the current generic error in shapefile-upload.tsx
 * (text-xs text-red-600 mt-1) so it serves as a drop-in replacement.
 *
 * Must be rendered inside a ShapefileProvider.
 */
const ShapefileErrorMessage = () => {
	const {
		file,
		isFileValid,
	} = useShapefile();
	const isFileInvalid = file !==null && !isFileValid;

	const context = useContext(ShapefileContext);
	const error = useSelector(context!.actor, (s) => s.context.error);

	if (!isFileInvalid || !error) return null;

	return (
		<div className="text-xs text-red-600 mt-1">
			{getShapefileErrorMessage(error)}
		</div>
	);
};

// ============================================================================
// Shared — ShapefileMap (Leaflet map with GeoJSON from machine context)
// ============================================================================

const ShapefileMap = () => (
	<div className="h-[560px] w-full">
		<MapContainer
			attributionControl={false}
			center={MAP_CONFIG.center}
			zoom={MAP_CONFIG.zoom}
			minZoom={DEFAULT_MIN_ZOOM}
			maxZoom={DEFAULT_MAX_ZOOM}
			scrollWheelZoom={true}
			className="h-full w-full rounded"
		>
			<TileLayer
				url={MAP_CONFIG.baseTileUrl}
				attribution=""
				subdomains="abcd"
				maxZoom={DEFAULT_MAX_ZOOM}
			/>
			<TileLayer url={MAP_CONFIG.labelsTileUrl} />
			<GeoJsonFromMachine />
		</MapContainer>
	</div>
);
