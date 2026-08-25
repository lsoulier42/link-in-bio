import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from './admin/Toast';
import ImageCropper from './ImageCropper';

export default function ImageUpload({
  value,
  onChange,
  previewClassName = 'w-16 h-16 rounded-full',
  uploadDir = 'avatars',
  crop = true,
  banner = false,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [cropSource, setCropSource] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (cropSource) URL.revokeObjectURL(cropSource);
    };
  }, [cropSource]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // GIFs skip the crop step (it exports webp) so their animation is preserved.
    const isGif = file.type === 'image/gif';
    if (!crop || isGif) {
      setUploading(true);
      try {
        const data = await api.uploadImage(file, uploadDir);
        onChange(data.url);
      } catch (err) {
        toast(err.message || 'Error uploading the image', 'error');
      } finally {
        setUploading(false);
      }
    } else {
      setCropSource(URL.createObjectURL(file));
    }

    if (inputRef.current) inputRef.current.value = '';
  };

  const closeCropper = () => {
    if (cropSource) URL.revokeObjectURL(cropSource);
    setCropSource(null);
  };

  const handleCropConfirm = async (blob) => {
    setUploading(true);
    try {
      const data = await api.uploadImage(blob, uploadDir);
      onChange(data.url);
    } catch (err) {
      toast(err.message || 'Error uploading the image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const isRemoteUrl = Boolean(value && value.startsWith('http'));

  const controls = (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFile}
        className="hidden"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-slate-200 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="w-4 h-4" aria-hidden="true" />}
          {uploading ? 'Upload...' : 'Choose an image'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={uploading}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-slate-400 hover:text-red-300 hover:bg-red-500/15 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Remove
          </button>
        )}
      </div>
      <input
        type="url"
        placeholder="or paste a URL https://..."
        value={isRemoteUrl ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 transition-colors"
      />
    </>
  );

  if (banner) {
    return (
      <div className="space-y-3">
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center">
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus className="w-7 h-7 text-slate-500" aria-hidden="true" />
          )}
        </div>
        <div className="space-y-2">{controls}</div>

        <ImageCropper
          open={Boolean(cropSource)}
          imageSrc={cropSource}
          onClose={closeCropper}
          onConfirm={handleCropConfirm}
        />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4">
      <div className={`${previewClassName} shrink-0 overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center`}>
        {value ? (
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <ImagePlus className="w-6 h-6 text-slate-500" aria-hidden="true" />
        )}
      </div>

      <div className="flex-1 space-y-2 min-w-0">{controls}</div>

      <ImageCropper
        open={Boolean(cropSource)}
        imageSrc={cropSource}
        onClose={closeCropper}
        onConfirm={handleCropConfirm}
      />
    </div>
  );
}
