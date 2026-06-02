import {
  ACCEPTED_MIME_TYPES,
  HEIC_MIME_TYPES,
  MAX_FILE_BYTES,
  MAX_FILES_PER_BATCH,
  MAX_TOTAL_BATCH_BYTES,
} from './constants';

interface ValidationResult {
  accepted: File[];
  rejected: string[];
}

const acceptedTypeSet = new Set<string>(ACCEPTED_MIME_TYPES);
const heicTypeSet = new Set<string>(HEIC_MIME_TYPES);

export function validateIncomingFiles(incoming: File[], existingFiles: File[]): ValidationResult {
  const accepted: File[] = [];
  const rejected: string[] = [];
  let runningTotalBytes = existingFiles.reduce((total, file) => total + file.size, 0);
  let runningCount = existingFiles.length;

  for (const file of incoming) {
    if (runningCount >= MAX_FILES_PER_BATCH) {
      rejected.push(`"${file.name}" was skipped: batch limit is ${MAX_FILES_PER_BATCH} files.`);
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

    if (file.size > MAX_FILE_BYTES) {
      rejected.push(`"${file.name}" is too large (max 25 MB per file).`);
      continue;
    }

    if (runningTotalBytes + file.size > MAX_TOTAL_BATCH_BYTES) {
      rejected.push(
        `"${file.name}" exceeds total batch limit (max 200 MB combined). Remove some files and try again.`,
      );
      continue;
    }

    accepted.push(file);
    runningTotalBytes += file.size;
    runningCount += 1;
  }

  return { accepted, rejected };
}
