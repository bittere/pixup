import { loadImage, upscale } from './image-utils';
import { updateScaleUI, updateSizePreview } from './ui-utils';

const els = {
  fileInput: document.getElementById('fileInput') as HTMLInputElement,
  dropZone: document.getElementById('dropZone') as HTMLElement,
  dropIcon: document.getElementById('dropIcon') as HTMLElement,
  dropHint: document.getElementById('dropHint') as HTMLElement,
  inputCanvas: document.getElementById('inputCanvas') as HTMLCanvasElement,
  inputMeta: document.getElementById('inputMeta') as HTMLElement,
  scaleSlider: document.getElementById('scaleSlider') as HTMLInputElement,
  scaleDisplay: document.getElementById('scaleDisplay') as HTMLElement,
  sizePreview: document.getElementById('sizePreview') as HTMLElement,
  processBtn: document.getElementById('processBtn') as HTMLButtonElement,
  outputCanvas: document.getElementById('outputCanvas') as HTMLCanvasElement,
  outputPlaceholder: document.getElementById('outputPlaceholder') as HTMLElement,
  outputMeta: document.getElementById('outputMeta') as HTMLElement,
  downloadBtn: document.getElementById('downloadBtn') as HTMLButtonElement,
  presetBtns: document.querySelectorAll('.preset-btn') as NodeListOf<HTMLButtonElement>
};

// Simple check for missing elements
Object.entries(els).forEach(([name, el]) => {
  if (!el && name !== 'presetBtns') {
    console.error(`Missing element: ${name}`);
  }
});

let sourceImage: HTMLImageElement | null = null;
let currentScale = 2;

function handleScaleChange(val: number): void {
  currentScale = val;
  updateSizePreview(sourceImage, currentScale, els.sizePreview);
}

els.scaleSlider?.addEventListener('input', () => {
    updateScaleUI(parseInt(els.scaleSlider.value), els.scaleDisplay, els.scaleSlider, els.presetBtns, handleScaleChange);
});

els.presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
      updateScaleUI(parseInt(btn.dataset.scale || '0'), els.scaleDisplay, els.scaleSlider, els.presetBtns, handleScaleChange);
  });
});

async function processFile(file: File | undefined): Promise<void> {
  if (!file) return;
  try {
    const img = await loadImage(file);
    sourceImage = img;
    const ctx = els.inputCanvas.getContext('2d');
    if (!ctx) return;
    
    els.inputCanvas.width = img.width;
    els.inputCanvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    els.inputCanvas.style.display = 'block';
    if (els.dropIcon) els.dropIcon.style.display = 'none';
    if (els.dropHint) els.dropHint.style.display = 'none';
    if (els.inputMeta) els.inputMeta.textContent = `${img.width} × ${img.height} px`;
    if (els.processBtn) els.processBtn.disabled = false;
    
    updateSizePreview(sourceImage, currentScale, els.sizePreview);
    
    // reset output
    els.outputCanvas.style.display = 'none';
    if (els.outputPlaceholder) els.outputPlaceholder.style.display = 'flex';
    if (els.outputMeta) els.outputMeta.textContent = '';
    if (els.downloadBtn) els.downloadBtn.disabled = true;
  } catch (err) {
    console.error(err);
  }
}

els.fileInput?.addEventListener('change', (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) processFile(target.files[0]);
});

els.dropZone?.addEventListener('dragover', (e: DragEvent) => {
  e.preventDefault();
  els.dropZone.classList.add('drag-over');
});

els.dropZone?.addEventListener('dragleave', () => {
  els.dropZone.classList.remove('drag-over');
});

els.dropZone?.addEventListener('drop', (e: DragEvent) => {
  e.preventDefault();
  els.dropZone.classList.remove('drag-over');
  if (e.dataTransfer?.files) processFile(e.dataTransfer.files[0]);
});

els.processBtn?.addEventListener('click', () => {
  if (!sourceImage) return;
  const { width, height } = upscale(sourceImage, currentScale, els.inputCanvas, els.outputCanvas);

  els.outputCanvas.style.display = 'block';
  if (els.outputPlaceholder) els.outputPlaceholder.style.display = 'none';
  if (els.outputMeta) els.outputMeta.textContent = `${width} × ${height} px`;
  if (els.downloadBtn) els.downloadBtn.disabled = false;
});

els.downloadBtn?.addEventListener('click', () => {
  els.outputCanvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `upscaled_${currentScale}x.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, 'image/png');
});
