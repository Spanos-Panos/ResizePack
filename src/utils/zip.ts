import { zipSync } from 'fflate';
import type { ProcessedOutput } from '../types/image';

export async function createZipBlob(outputs: ProcessedOutput[]): Promise<Blob> {
  const zipInput: Record<string, Uint8Array> = {};

  for (const output of outputs) {
    const bytes = new Uint8Array(await output.blob.arrayBuffer());
    zipInput[output.fileName] = bytes;
  }

  const zipped = zipSync(zipInput, { level: 6 });
  return new Blob([zipped], { type: 'application/zip' });
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(downloadUrl);
}
