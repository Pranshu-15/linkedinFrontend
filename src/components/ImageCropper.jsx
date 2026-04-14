import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from './ui/Button';
import { ZoomIn, ZoomOut, Check, X } from 'lucide-react';

/**
 * getCroppedImg – draws the cropped region onto a canvas and returns a File blob.
 */
async function getCroppedImg(imageSrc, pixelCrop, aspect) {
  const image = await createImageBitmap(await fetch(imageSrc).then(r => r.blob()));
  const canvas = document.createElement('canvas');

  // Target output size: keep 16:3 cover aspect at 1200×225 or 1:1 avatar at 400×400
  const outputWidth = aspect === 16 / 3 ? 1200 : 400;
  const outputHeight = Math.round(outputWidth / aspect);

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], 'cropped.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.92);
  });
}

/**
 * ImageCropper
 * Props:
 *  imageSrc  – object URL of the raw selected image
 *  aspect    – crop aspect ratio  (e.g. 16/3 for cover,  1 for avatar)
 *  onDone    – (file, previewUrl) => void  called with the cropped File + a local preview URL
 *  onCancel  – () => void
 */
function ImageCropper({ imageSrc, aspect = 16 / 3, onDone, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    setProcessing(true);
    try {
      const file = await getCroppedImg(imageSrc, croppedAreaPixels, aspect);
      const preview = URL.createObjectURL(file);
      onDone(file, preview);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-card border rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full max-w-2xl mx-4">
        {/* Title bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-semibold text-foreground">Crop Image</h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop area */}
        <div className="relative bg-black" style={{ height: aspect >= 3 ? 220 : 340 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={true}
            style={{
              containerStyle: { borderRadius: 0 },
              cropAreaStyle: { border: '2px solid hsl(var(--primary))' },
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="px-6 py-4 flex items-center gap-4 border-t bg-card/80">
          <ZoomOut className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-primary h-1.5 cursor-pointer rounded-full"
          />
          <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-card border-t">
          <Button variant="ghost" onClick={onCancel} disabled={processing}>Cancel</Button>
          <Button onClick={handleApply} isLoading={processing}>
            <Check className="w-4 h-4 mr-1.5" />
            Apply Crop
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropper;
