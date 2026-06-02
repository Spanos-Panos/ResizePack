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
  presetId: ProcessingOptions['presetId'],
  format: OutputFormat,
  index: number,
): string {
  const baseName = sanitizeBaseName(originalName) || 'image';
  const indexPrefix = String(index + 1).padStart(3, '0');
  const suffix = PRESET_SUFFIX[presetId];
  const ext = EXTENSION_BY_FORMAT[format];
  return `${indexPrefix}-${baseName}-${suffix}.${ext}`;
}

async function convertSingleFormat(
  file: File,
  options: ProcessingOptions,
  format: OutputFormat,
  fileIndex: number,
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
    fileName: buildOutputFileName(file.name, options.presetId, format, fileIndex),
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

  for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
    const file = files[fileIndex];
    onProgress?.(fileIndex, 'processing');

    try {
      for (const format of options.formats) {
        const output = await convertSingleFormat(file, options, format, fileIndex);
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
