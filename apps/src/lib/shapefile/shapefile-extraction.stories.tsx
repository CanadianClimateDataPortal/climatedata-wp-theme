/**
 * Ladle stories for shapefile processing — extraction demo and full machine pipeline.
 */

import type { Story } from '@ladle/react';

import { useContext, useState } from 'react';
import { useSelector } from '@xstate/react';
import { detectZip, type ZipDetectionResult } from './detect-zip';
import { extractShapefileFromZip } from './extraction';
import type { ExtractedShapefile } from './contracts';
import type { ShapefileError } from './errors';
import {
	ShapefileProvider,
	ShapefileContext,
} from '@/context/shapefile-provider';
import { useShapefile } from '@/hooks/use-shapefile';

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

const ShapefileExtractor = () => {
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
			setState({ status: 'error',
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

export const Extraction: Story = () => <ShapefileExtractor />;

Extraction.storyName = 'Shapefile Extraction';

// ============================================================================
// PIPELINE STORY — full XState machine via ShapefileProvider + useShapefile
// ============================================================================

const STATE_LABELS: Record<string, { label: string; color: string }> = {
	idle: { label: 'Idle', color: '#666' },
	extracting: { label: 'Extracting...', color: '#0070f3' },
	validating: { label: 'Validating...', color: '#0070f3' },
	transforming: { label: 'Transforming...', color: '#0070f3' },
	displaying: { label: 'Displaying', color: 'green' },
	selected: { label: 'Selected', color: '#8b5cf6' },
	ready: { label: 'Ready', color: 'green' },
};

const PipelineInner = () => {
	const {
		file,
		isProcessingFile,
		isFileInvalid,
		setFile,
		reset,
	} = useShapefile();

	const context = useContext(ShapefileContext);
	const snapshot = useSelector(context!.actor, (s) => s);
	const machineState = String(snapshot.value);

	const stateInfo = STATE_LABELS[machineState] ?? {
		label: machineState,
		color: '#666',
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files || files.length === 0) {
			reset();
			return;
		}
		setFile(files[0]);
	};

	return (
		<div
			style={{ padding: '2rem', maxWidth: '900px', fontFamily: 'system-ui' }}
		>
			<h2>Shapefile Pipeline Demo</h2>
			<p style={{ color: '#666', marginBottom: '1.5rem' }}>
				Upload a ZIP shapefile to exercise the full XState machine pipeline:
				idle &rarr; extracting &rarr; validating &rarr; transforming &rarr;
				displaying
			</p>

			<div
				style={{
					display: 'flex',
					gap: '1rem',
					alignItems: 'center',
					marginBottom: '1.5rem',
				}}
			>
				<input type="file" accept=".zip" onChange={handleFileChange} />
				<button
					type="button"
					onClick={reset}
					style={{
						padding: '0.25rem 0.75rem',
						border: '1px solid #ccc',
						borderRadius: '4px',
						cursor: 'pointer',
					}}
				>
					Reset
				</button>
			</div>

			{/* Machine state badge */}
			<section
				style={{
					padding: '1rem',
					border: '1px solid #ddd',
					borderRadius: '4px',
					marginBottom: '1rem',
				}}
			>
				<h3 style={{ marginTop: 0 }}>Machine State</h3>
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<tbody>
						<tr>
							<td
								style={{
									padding: '0.25rem',
									fontWeight: 'bold',
									width: '140px',
								}}
							>
								State:
							</td>
							<td>
								<code
									style={{
										backgroundColor: '#f5f5f5',
										padding: '0.25rem 0.5rem',
										borderRadius: '4px',
										color: stateInfo.color,
										fontWeight: 'bold',
									}}
								>
									{stateInfo.label}
								</code>
							</td>
						</tr>
						<tr>
							<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>File:</td>
							<td>
								{file
									? `${file.name} (${file.size.toLocaleString()} bytes)`
									: '(none)'}
							</td>
						</tr>
						<tr>
							<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
								Processing:
							</td>
							<td>{isProcessingFile ? 'Yes' : 'No'}</td>
						</tr>
					</tbody>
				</table>
			</section>

			{/* Error display */}
			{isFileInvalid && snapshot.context.error && (
				<section
					style={{
						padding: '1rem',
						border: '2px solid red',
						borderRadius: '4px',
						backgroundColor: '#fff0f0',
						marginBottom: '1rem',
					}}
				>
					<h3 style={{ marginTop: 0, color: 'red' }}>Pipeline Error</h3>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<tbody>
							<tr>
								<td
									style={{
										padding: '0.25rem',
										fontWeight: 'bold',
										width: '140px',
									}}
								>
									Error:
								</td>
								<td>{snapshot.context.error.name}</td>
							</tr>
							<tr>
								<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
									Code:
								</td>
								<td>
									<code
										style={{
											backgroundColor: '#ffe0e0',
											padding: '0.25rem 0.5rem',
											borderRadius: '2px',
										}}
									>
										{'code' in snapshot.context.error
											? String(snapshot.context.error.code)
											: '(none)'}
									</code>
								</td>
							</tr>
							<tr>
								<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
									Message:
								</td>
								<td>{snapshot.context.error.message}</td>
							</tr>
						</tbody>
					</table>
				</section>
			)}

			{/* Success — machine reached displaying */}
			{machineState === 'displaying' && snapshot.context.simplifiedGeometry && (
				<section
					style={{
						padding: '1rem',
						border: '2px solid green',
						borderRadius: '4px',
						backgroundColor: '#f0fff0',
						marginBottom: '1rem',
					}}
				>
					<h3 style={{ marginTop: 0, color: 'green' }}>Pipeline Complete</h3>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<tbody>
							<tr>
								<td
									style={{
										padding: '0.25rem',
										fontWeight: 'bold',
										width: '140px',
									}}
								>
									Features:
								</td>
								<td>
									{snapshot.context.simplifiedGeometry.featureCount}
									{snapshot.context.simplifiedGeometry.featureCount === 0 && (
										<span style={{ color: '#999', marginLeft: '0.5rem' }}>
											(stub — real simplification in follow-up PR)
										</span>
									)}
								</td>
							</tr>
							{snapshot.context.extractedShapefile && (
								<>
									<tr>
										<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
											file.shp:
										</td>
										<td>
											{snapshot.context.extractedShapefile[
												'file.shp'
											].byteLength.toLocaleString()}{' '}
											bytes
										</td>
									</tr>
									<tr>
										<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
											file.prj:
										</td>
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
								{snapshot.context.extractedShapefile['file.prj']}
							</pre>
						</details>
					)}
				</section>
			)}
		</div>
	);
};

export const Pipeline: Story = () => (
	<ShapefileProvider>
		<PipelineInner />
	</ShapefileProvider>
);

Pipeline.storyName = 'Shapefile Pipeline';
