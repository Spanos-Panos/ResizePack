import imageCompression from 'browser-image-compression';
import type { BatchResult, OutputFormat, ProcessedOutput, ProcessingOptions } from '../types/image';

const MIME_BY_FORMAT: Record<OutputFormat, string> = {
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

const EXTENSION_BY_FORMAT: Record<OutputFormat, string> = {
  jpeg: 'jpg',
  webp: 'webp',
};

const PRESET_SUFFIX: Record<ProcessingOptions['presetId'], string> = {
  'etsy-listing': 'etsy',
  web: 'web',
  shopify: 'shopify',
  amazon: 'amazon',
  instagram: 'instagram',
  custom: 'custom',
};

function sanitizeBaseName(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^/.]+$/, '');
  return withoutExt.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function buildOutputFileName(
  originalName: string,
  options: ProcessingOptions,
  format: OutputFormat,
  index: number,
  padWidth: number,
): string {
  const ext = EXTENSION_BY_FORMAT[format];

  // Pro sequential renaming: "summer-collection-001.jpg" etc. The extension
  // differs per format, so jpeg+webp of the same file never collide.
  if (options.rename) {
    const base = sanitizeBaseName(options.rename.baseName) || 'image';
    const seq = String(options.rename.startAt + index).padStart(padWidth, '0');
    return `${base}-${seq}.${ext}`;
  }

  const baseName = sanitizeBaseName(originalName) || 'image';
  const indexPrefix = String(index + 1).padStart(3, '0');
  const suffix = PRESET_SUFFIX[options.presetId];
  return `${indexPrefix}-${baseName}-${suffix}.${ext}`;
}

async function convertSingleFormat(
  file: File,
  options: ProcessingOptions,
  format: OutputFormat,
  fileIndex: number,
  padWidth: number,
): Promise<ProcessedOutput> {
  const compressedBlob = await imageCompression(file, {
    maxWidthOrHeight: options.maxLongestSidePx,
    useWebWorker: true,
    initialQuality: options.quality / 100,
    alwaysKeepResolution: false,
    preserveExif: !options.stripExif,
    fileType: MIME_BY_FORMAT[format],
    maxSizeMB: options.targetMaxBytes ? options.targetMaxBytes / (1024 * 1024) : undefined,
  });

  const outputBlob = compressedBlob instanceof Blob ? compressedBlob : new Blob([compressedBlob]);
  return {
    fileName: buildOutputFileName(file.name, options, format, fileIndex, padWidth),
    blob: outputBlob,
    format,
    originalName: file.name,
    originalSize: file.size,
    outputSize: outputBlob.size,
  };
}

export async function processBatch(
  files: File[],
  options: ProcessingOptions,
  onProgress?: (fileIndex: number, status: 'processing' | 'success' | 'failed', message?: string) => void,
): Promise<BatchResult> {
  const outputs: ProcessedOutput[] = [];
  const failures: BatchResult['failures'] = [];

  // Zero-pad sequence numbers to a consistent width so renamed files sort
  // correctly (…-09, -10) in file managers. Default naming stays at 3.
  const padWidth = options.rename
    ? Math.max(2, String(options.rename.startAt + files.length - 1).length)
    : 3;

  for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
    const file = files[fileIndex];
    onProgress?.(fileIndex, 'processing');

    try {
      for (const format of options.formats) {
        const output = await convertSingleFormat(file, options, format, fileIndex, padWidth);
        outputs.push(output);
      }

      onProgress?.(fileIndex, 'success');
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : 'Image conversion failed for this file.';
      failures.push({
        fileName: file.name,
        reason,
      });
      onProgress?.(fileIndex, 'failed', reason);
    }
  }

  const originalTotalBytes = files.reduce((total, file) => total + file.size, 0);
  const outputTotalBytes = outputs.reduce((total, output) => total + output.outputSize, 0);

  return {
    outputs,
    failures,
    originalTotalBytes,
    outputTotalBytes,
  };
}
