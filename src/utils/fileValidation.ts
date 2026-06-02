import { ACCEPTED_MIME_TYPES, HEIC_MIME_TYPES } from './constants';

export interface ValidationLimits {
  maxFiles: number;
  maxFileBytes: number;
  maxTotalBytes: number;
  /** When true, limit messages nudge toward upgrading to Pro. */
  isFree: boolean;
}

interface ValidationResult {
  accepted: File[];
  rejected: string[];
}

const acceptedTypeSet = new Set<string>(ACCEPTED_MIME_TYPES);
const heicTypeSet = new Set<string>(HEIC_MIME_TYPES);

function mb(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

const PRO_HINT = ' Upgrade to Pro for more.';

export function validateIncomingFiles(
  incoming: File[],
  existingFiles: File[],
  limits: ValidationLimits,
): ValidationResult {
  const accepted: File[] = [];
  const rejected: string[] = [];
  let runningTotalBytes = existingFiles.reduce((total, file) => total + file.size, 0);
  let runningCount = existingFiles.length;

  const hint = limits.isFree ? PRO_HINT : '';

  for (const file of incoming) {
    if (runningCount >= limits.maxFiles) {
      rejected.push(`"${file.name}" was skipped: batch limit is ${limits.maxFiles} files.${hint}`);
      continue;
    }

    if (heicTypeSet.has(file.type)) {
      rejected.push(
        `"${file.name}" is HEIC/HEIF. Export as JPG/PNG from your phone or convert HEIC first.`,
      );
      continue;
    }

    if (!acceptedTypeSet.has(file.type)) {
      rejected.push(`"${file.name}" is unsupported. Use JPEG, PNG, or WebP.`);
      continue;
    }

    if (file.size > limits.maxFileBytes) {
      rejected.push(`"${file.name}" is too large (max ${mb(limits.maxFileBytes)} MB per file).${hint}`);
      continue;
    }

    if (runningTotalBytes + file.size > limits.maxTotalBytes) {
      rejected.push(
        `"${file.name}" exceeds the total batch limit (max ${mb(limits.maxTotalBytes)} MB combined). Remove some files and try again.${hint}`,
      );
      continue;
    }

    accepted.push(file);
    runningTotalBytes += file.size;
    runningCount += 1;
  }

  return { accepted, rejected };
}
