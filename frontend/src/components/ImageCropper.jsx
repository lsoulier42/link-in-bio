import { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { Crop } from 'lucide-react';
import Drawer from './admin/Drawer';
import Button from './admin/Button';

const TARGET_SIZE = 512;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load the image'));
    image.src = src;
  });
}

async function createCroppedBlob(imageSrc, pixelCrop) {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = TARGET_SIZE;
  canvas.height = TARGET_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported by this browser');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    TARGET_SIZE,
    TARGET_SIZE,
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Unable to export the cropped image'));
    }, 'image/webp', 0.85);
  });
}

export default function ImageCropper({ open, imageSrc, onClose, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixelCrop, setPixelCrop] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setPixelCrop(null);
    setProcessing(false);
  }, [open]);

  const handleCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setPixelCrop(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!pixelCrop) return;
    setProcessing(true);
    try {
      const blob = await createCroppedBlob(imageSrc, pixelCrop);
      onConfirm(blob);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Crop image"
      description="Move and zoom, then confirm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} loading={processing} disabled={!pixelCrop}>
            {!processing && <Crop className="w-4 h-4" aria-hidden="true" />}
            Crop
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="relative h-80 rounded-[var(--radius-md)] overflow-hidden bg-black/60 border border-white/10">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>
        <div>
          <label htmlFor="crop-zoom" className="block text-xs font-medium text-slate-400 mb-1.5">
            Zoom
          </label>
          <input
            id="crop-zoom"
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
        </div>
      </div>
    </Drawer>
  );
}
