export type PresetId =
  | 'etsy-listing'
  | 'web'
  | 'shopify'
  | 'amazon'
  | 'instagram'
  | 'custom';

export type OutputFormat = 'jpeg' | 'webp';

export interface PresetConfig {
  id: PresetId;
  label: string;
  maxLongestSidePx: number;
  defaultFormat: OutputFormat;
  defaultQuality: number;
  targetMaxBytes?: number;
  description: string;
}

export interface RenameOptions {
  /** User-supplied base name, already trimmed (non-empty when active). */
  baseName: string;
  /** First sequence number, e.g. 1 → "summer-001". */
  startAt: number;
}

export interface ProcessingOptions {
  presetId: PresetId;
  maxLongestSidePx: number;
  quality: number;
  formats: OutputFormat[];
  stripExif: boolean;
  targetMaxBytes?: number;
  /** Pro-only: rename outputs to a sequential pattern instead of the default. */
  rename?: RenameOptions;
  /** Pro-only: center-crop each image to this aspect ratio before resizing. */
  cropAspect?: { w: number; h: number };
}

export interface ProcessedOutput {
  fileName: string;
  blob: Blob;
  format: OutputFormat;
  originalName: string;
  originalSize: number;
  outputSize: number;
}

export interface FailedFile {
  fileName: string;
  reason: string;
}

export interface BatchResult {
  outputs: ProcessedOutput[];
  failures: FailedFile[];
  originalTotalBytes: number;
  outputTotalBytes: number;
}

export type FileProgressStatus = 'queued' | 'processing' | 'success' | 'failed';

export interface FileProgress {
  fileName: string;
  status: FileProgressStatus;
  message?: string;
}
