import { useMemo, useState } from 'react';
import { DropZone } from './components/DropZone/DropZone';
import { FileList } from './components/FileList/FileList';
import { OptionsPanel } from './components/OptionsPanel/OptionsPanel';
import { PresetSelector } from './components/PresetSelector/PresetSelector';
import { ProgressSummary } from './components/ProgressSummary/ProgressSummary';
import { PRESETS, PRESET_STORAGE_KEY } from './presets/presets';
import type { BatchResult, FileProgress, OutputFormat, PresetId, ProcessingOptions } from './types/image';
import { validateIncomingFiles } from './utils/fileValidation';
import { processBatch } from './utils/imageProcessing';
import { createZipBlob, downloadBlob } from './utils/zip';
import styles from './App.module.css';

function clampValue(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
}

function getDefaultPreset(): PresetId {
  const savedPreset = localStorage.getItem(PRESET_STORAGE_KEY);
  return savedPreset === 'web' || savedPreset === 'custom' || savedPreset === 'etsy-listing'
    ? savedPreset
    : 'etsy-listing';
}

function formatTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}-${hours}${minutes}`;
}

function App() {
  const [selectedPreset, setSelectedPreset] = useState<PresetId>(() => getDefaultPreset());
  const [files, setFiles] = useState<File[]>([]);
  const [customMaxWidth, setCustomMaxWidth] = useState<number>(1920);
  const [customQuality, setCustomQuality] = useState<number>(82);
  const [includeJpeg, setIncludeJpeg] = useState(true);
  const [includeWebp, setIncludeWebp] = useState(false);
  const [stripExif, setStripExif] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [progress, setProgress] = useState<FileProgress[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  const presetDescription = useMemo(() => {
    if (selectedPreset === 'custom') {
      return 'Set your own max width and quality values.';
    }
    return PRESETS[selectedPreset].description;
  }, [selectedPreset]);

  const outputFormats = useMemo<OutputFormat[]>(() => {
    const formats: OutputFormat[] = [];
    if (includeJpeg) {
      formats.push('jpeg');
    }
    if (includeWebp) {
      formats.push('webp');
    }
    return formats;
  }, [includeJpeg, includeWebp]);

  const activeProcessingOptions = useMemo<ProcessingOptions>(() => {
    if (selectedPreset === 'custom') {
      return {
        presetId: 'custom',
        maxLongestSidePx: clampValue(customMaxWidth, 400, 4000),
        quality: clampValue(customQuality, 50, 95),
        formats: outputFormats,
        stripExif,
      };
    }

    const preset = PRESETS[selectedPreset];
    return {
      presetId: preset.id,
      maxLongestSidePx: preset.maxLongestSidePx,
      quality: preset.defaultQuality,
      formats: outputFormats,
      stripExif,
      targetMaxBytes: preset.targetMaxBytes,
    };
  }, [selectedPreset, customMaxWidth, customQuality, outputFormats, stripExif]);

  const handlePresetChange = (presetId: PresetId) => {
    setSelectedPreset(presetId);
    localStorage.setItem(PRESET_STORAGE_KEY, presetId);
  };

  const handleIncomingFiles = (incoming: File[]) => {
    const validation = validateIncomingFiles(incoming, files);
    setErrors(validation.rejected);
    if (validation.accepted.length > 0) {
      setFiles((previous) => [...previous, ...validation.accepted]);
    }
  };

  const handleRemoveFile = (fileIndex: number) => {
    setFiles((previous) => previous.filter((_, index) => index !== fileIndex));
  };

  const handleClearAllFiles = () => {
    setFiles([]);
    setProgress([]);
    setResult(null);
    setErrors([]);
    setZipBlob(null);
  };

  const handleProcessFiles = async () => {
    if (files.length === 0) {
      setErrors(['Add at least one image before processing.']);
      return;
    }

    if (outputFormats.length === 0) {
      setErrors(['Select at least one output format (JPEG or WebP).']);
      return;
    }

    setErrors([]);
    setResult(null);
    setZipBlob(null);
    setIsProcessing(true);
    setProgress(files.map((file) => ({ fileName: file.name, status: 'queued' })));

    try {
      const batchResult = await processBatch(
        files,
        activeProcessingOptions,
        (fileIndex, status, message) => {
          setProgress((previous) =>
            previous.map((item, index) =>
              index === fileIndex ? { ...item, status, message } : item,
            ),
          );
        },
      );

      setResult(batchResult);
      if (batchResult.outputs.length > 0) {
        const zip = await createZipBlob(batchResult.outputs);
        setZipBlob(zip);
        downloadBlob(zip, `resizepack-${formatTimestamp()}.zip`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unexpected error while building ZIP.';
      setErrors([message]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.brandPill}>ResizePack</p>
        <h1>Bulk Resize &amp; Compress Images</h1>
        <p className={styles.subhead}>Perfect for Etsy, Shopify, blogs, and websites.</p>
        <p className={styles.highlights}>
          Batch processing • One ZIP download • In-browser privacy
        </p>
        <div className={styles.ctaRow}>
          <a className={styles.primaryCta} href="#tool">
            Start optimizing now
          </a>
          <a className={styles.secondaryCta} href="/privacy.html" target="_blank" rel="noreferrer">
            Privacy first
          </a>
        </div>
        <PresetSelector selectedPreset={selectedPreset} onChange={handlePresetChange} />
        <p className={styles.presetDescription}>{presetDescription}</p>
      </header>

      <section id="tool" className={styles.toolCard}>
        <DropZone onFilesSelected={handleIncomingFiles} disabled={isProcessing} />
        {errors.length > 0 ? (
          <ul className={styles.errorList}>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ) : null}

        <FileList files={files} onRemove={handleRemoveFile} onClearAll={handleClearAllFiles} />

        <OptionsPanel
          selectedPreset={selectedPreset}
          customMaxWidth={customMaxWidth}
          customQuality={customQuality}
          includeJpeg={includeJpeg}
          includeWebp={includeWebp}
          stripExif={stripExif}
          onCustomMaxWidthChange={(value) => setCustomMaxWidth(clampValue(value, 400, 4000))}
          onCustomQualityChange={(value) => setCustomQuality(clampValue(value, 50, 95))}
          onIncludeJpegChange={setIncludeJpeg}
          onIncludeWebpChange={setIncludeWebp}
          onStripExifChange={setStripExif}
        />

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.processButton}
            onClick={handleProcessFiles}
            disabled={isProcessing || files.length === 0}
          >
            {isProcessing ? 'Processing...' : 'Process and download ZIP'}
          </button>
          {zipBlob ? (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => downloadBlob(zipBlob, `resizepack-${formatTimestamp()}.zip`)}
            >
              Download ZIP again
            </button>
          ) : null}
        </div>

        <ProgressSummary progress={progress} result={result} isProcessing={isProcessing} />
      </section>

      <section className={styles.seoSection}>
        <h2>Bulk image optimizer for Etsy listings and websites</h2>
        <p>
          ResizePack helps you bulk resize images for Etsy, Shopify, blogs, and product pages in
          one flow. Drop your photos, choose a preset, and download one compressed ZIP.
        </p>
        <div className={styles.seoGrid}>
          <article>
            <h3>Bulk resize images for Etsy listings</h3>
            <p>
              Use the Etsy listing preset to fit common listing photo dimensions while keeping good
              visual quality.
            </p>
          </article>
          <article>
            <h3>Bulk compress images for websites</h3>
            <p>
              Optimize page speed with smaller images and keep a clean workflow for launches and
              content updates.
            </p>
          </article>
          <article>
            <h3>Private browser processing</h3>
            <p>
              Your files are processed in-browser for v1, so images are not uploaded for server-side
              storage.
            </p>
          </article>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>ResizePack is not affiliated with Etsy, Inc.</span>
        <a href="/privacy.html" target="_blank" rel="noreferrer">
          Privacy
        </a>
      </footer>
    </main>
  );
}

export default App;
