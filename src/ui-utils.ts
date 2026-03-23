export function updateScaleUI(
  val: number,
  scaleDisplay: HTMLElement,
  scaleSlider: HTMLInputElement,
  presetBtns: NodeListOf<HTMLButtonElement>,
  callback?: (val: number) => void
): void {
  scaleDisplay.innerHTML = `${val}<span>×</span>`;
  scaleSlider.value = val.toString();
  presetBtns.forEach((b: HTMLButtonElement) => {
    b.classList.toggle('active', parseInt(b.dataset.scale || '0') === val);
  });
  if (callback) callback(val);
}

export function updateSizePreview(
  sourceImage: HTMLImageElement | null,
  currentScale: number,
  sizePreview: HTMLElement
): void {
  if (!sourceImage) {
    sizePreview.textContent = '—';
    return;
  }
  const w = sourceImage.width * currentScale;
  const h = sourceImage.height * currentScale;
  sizePreview.textContent = `${w} × ${h} px`;
}
