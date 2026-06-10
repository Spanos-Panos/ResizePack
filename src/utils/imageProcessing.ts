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

/**
 * Center-crop `file` to the given aspect ratio, trimming the longer dimension
 * evenly from both sides. Returns a fresh PNG File (lossless intermediate, so
 * the later compression pass owns the only quality loss). EXIF orientation is
 * honoured via `imageOrientation: 'from-image'`.
 */
async function cropToAspect(file: File, aspect: { w: number; h: number }): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const targetRatio = aspect.w / aspect.h;
    const srcRatio = bitmap.width / bitmap.height;

    let cropW = bitmap.width;
    let cropH = bitmap.height;
    if (srcRatio > targetRatio) {
      // Too wide: trim the sides.
      cropW = Math.round(bitmap.height * targetRatio);
    } else {
      // Too tall: trim top/bottom.
      cropH = Math.round(bitmap.width / targetRatio);
    }
    const offsetX = Math.round((bitmap.width - cropW) / 2);
    const offsetY = Math.round((bitmap.height - cropH) / 2);

    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not crop image (canvas unavailable).');
    }
    ctx.drawImage(bitmap, offsetX, offsetY, cropW, cropH, 0, 0, cropW, cropH);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('Could not crop image.'))),
        'image/png',
      );
    });
    return new File([blob], file.name, { type: 'image/png' });
  } finally {
    bitmap.close();
  }
}

async function convertSingleFormat(
  sourceFile: File,
  originalFile: File,
  options: ProcessingOptions,
  format: OutputFormat,
  fileIndex: number,
  padWidth: number,
): Promise<ProcessedOutput> {
  const compressedBlob = await imageCompression(sourceFile, {
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
    fileName: buildOutputFileName(originalFile.name, options, format, fileIndex, padWidth),
    blob: outputBlob,
    format,
    originalName: originalFile.name,
    originalSize: originalFile.size,
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
      // Crop once per file (not per output format) when a ratio is selected.
      const sourceFile = options.cropAspect
        ? await cropToAspect(file, options.cropAspect)
        : file;

      for (const format of options.formats) {
        const output = await convertSingleFormat(
          sourceFile,
          file,
          options,
          format,
          fileIndex,
          padWidth,
        );
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
