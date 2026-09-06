import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 4 * 1024 * 1024; // 4MB

export function ImageUpload({
  onUpload,
  currentUrl,
}: {
  onUpload: (url: string | null) => void;
  currentUrl?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Image must be smaller than 4MB.');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('item-images')
        .upload(fileName, file);

      if (upErr) throw upErr;

      const { data } = supabase.storage.from('item-images').getPublicUrl(fileName);
      setPreview(data.publicUrl);
      onUpload(data.publicUrl);
    } catch {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const remove = () => {
    setPreview(null);
    onUpload(null);
    setError(null);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Image (Optional)</label>
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="w-40 h-40 object-cover rounded-lg border border-gray-200" />
          <button
            type="button"
            onClick={remove}
            className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
          <div className="flex flex-col items-center gap-2 text-gray-500">
            {uploading ? (
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Upload className="w-7 h-7" />
                <span className="text-sm">Click to upload an image</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> JPG, PNG, WEBP up to 4MB
                </span>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            disabled={uploading}
          />
        </label>
      )}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
