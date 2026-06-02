export type PresetId = 'etsy-listing' | 'web' | 'custom';

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

export interface ProcessingOptions {
  presetId: PresetId;
  maxLongestSidePx: number;
  quality: number;
  formats: OutputFormat[];
  stripExif: boolean;
  targetMaxBytes?: number;
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
