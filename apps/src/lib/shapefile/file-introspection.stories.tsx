/**
 * Experiments made before working on CLIM-1324.
 * THIS FILE WILL BE GROSSLY SIMPLIFIED BEFORE MERGING.
 *
 * Ladle stories for shapefile file upload - exploring native File API capabilities.
 */

import type { Story } from '@ladle/react';
import { useState } from 'react';
import {
	introspectFile,
	type FileIntrospection
} from './file-introspection';

const FileExplorer = () => {
	const [file, setFile] = useState<File | null>(null);
	const [introspection, setIntrospection] = useState<FileIntrospection | null>(
		null
	);

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const files = event.target.files;
		if (!files || files.length === 0) {
			setFile(null);
			setIntrospection(null);
			return;
		}

		const selectedFile = files[0];
		setFile(selectedFile);

		const result = await introspectFile(selectedFile);
		setIntrospection(result);
	};

	return (
		<div
			style={{ padding: '2rem', maxWidth: '800px', fontFamily: 'system-ui' }}
		>
			<h2>File API Explorer</h2>
			<p style={{ color: '#666', marginBottom: '1.5rem' }}>
				Upload any file to explore what the native File API can tell us
			</p>

			<input
				type="file"
				onChange={handleFileChange}
				style={{ marginBottom: '1.5rem' }}
			/>

			{file && introspection && (
				<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
					<section
						style={{
							padding: '1rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
						}}
					>
						<h3 style={{ marginTop: 0 }}>
							File Properties (native File object)
						</h3>
						<table style={{ width: '100%', borderCollapse: 'collapse' }}>
							<tbody>
								<tr>
									<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
										name:
									</td>
									<td>{file.name}</td>
								</tr>
								<tr>
									<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
										size:
									</td>
									<td>{file.size.toLocaleString()} bytes</td>
								</tr>
								<tr>
									<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
										type:
									</td>
									<td>{file.type || '(empty)'}</td>
								</tr>
								<tr>
									<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
										lastModified:
									</td>
									<td>{new Date(file.lastModified).toLocaleString()}</td>
								</tr>
							</tbody>
						</table>
					</section>

					<section
						style={{
							padding: '1rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
						}}
					>
						<h3 style={{ marginTop: 0 }}>Validation (native introspection)</h3>
						<table style={{ width: '100%', borderCollapse: 'collapse' }}>
							<tbody>
								<tr>
									<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
										Is ZIP:
									</td>
									<td>
										<span
											style={{ color: introspection.isZip ? 'green' : 'red' }}
										>
											{introspection.isZip ? '✓ Yes' : '✗ No'}
										</span>
									</td>
								</tr>
								<tr>
									<td style={{ padding: '0.25rem', fontWeight: 'bold' }}>
										Is Empty:
									</td>
									<td>
										<span
											style={{ color: introspection.isEmpty ? 'red' : 'green' }}
										>
											{introspection.isEmpty ? '✗ Yes' : '✓ No'}
										</span>
									</td>
								</tr>
							</tbody>
						</table>
					</section>

					<section
						style={{
							padding: '1rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
						}}
					>
						<h3 style={{ marginTop: 0 }}>Magic Bytes (first 16 bytes)</h3>
						<p
							style={{
								fontFamily: 'monospace',
								backgroundColor: '#f5f5f5',
								padding: '0.5rem',
								borderRadius: '4px',
							}}
						>
							{introspection.firstBytes}
						</p>
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

					<section
						style={{
							padding: '1rem',
							border: '1px solid #ddd',
							borderRadius: '4px',
						}}
					>
						<h3 style={{ marginTop: 0 }}>Raw Data Preview (first 100 bytes)</h3>
						<pre
							style={{
								fontFamily: 'monospace',
								fontSize: '0.75rem',
								backgroundColor: '#f5f5f5',
								padding: '0.5rem',
								borderRadius: '4px',
								overflow: 'auto',
								whiteSpace: 'pre-wrap',
								wordBreak: 'break-all',
							}}
						>
							{introspection.rawDataPreview}
						</pre>
					</section>
				</div>
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
				<h4 style={{ marginTop: 0 }}>Native capabilities (no libraries):</h4>
				<ul style={{ marginBottom: 0 }}>
					<li>
						Use native <code>File</code> object directly - no need to copy
						properties
					</li>
					<li>
						<code>file.arrayBuffer()</code> - read entire file as binary
					</li>
					<li>Validate ZIP magic bytes (50 4B 03 04) - no library needed</li>
					<li>Check if file is empty (size === 0 or buffer.length === 0)</li>
					<li>
						MIME type (<code>file.type</code>) is often unreliable - prefer
						magic bytes
					</li>
				</ul>
				<h4 style={{ marginTop: '1rem' }}>What requires a library:</h4>
				<ul style={{ marginBottom: 0 }}>
					<li>Parsing ZIP central directory to list file entries</li>
					<li>Extracting individual files from ZIP archive</li>
					<li>Handling compression (DEFLATE, etc.)</li>
				</ul>
			</div>
		</div>
	);
};

export const NativeFileAPI: Story = () => <FileExplorer />;

NativeFileAPI.storyName = 'Shapefile File Loader';
