'use client';

import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UploadCloud, Loader2, CheckCircle2 } from 'lucide-react';

interface ImageUploaderProps {
  currentImageUrl?: string;
  productId: string;
  onUploadComplete: (newUrl: string) => void;
  className?: string;
}

export function ImageUploader({
  currentImageUrl,
  productId,
  onUploadComplete,
  className,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentImageUrl) {
      setPreview(currentImageUrl);
    }
  }, [currentImageUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant local preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanProductId = productId || 'new-product';
      const fileName = `${cleanProductId}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('product-images').getPublicUrl(filePath);

      // If existing product, persist directly to products table
      if (productId && !productId.startsWith('temp-')) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: publicUrl })
          .eq('id', productId);

        if (updateError) {
          console.warn('Could not update product image_url column directly:', updateError);
        }
      }

      setPreview(publicUrl);
      onUploadComplete(publicUrl);
    } catch (err: any) {
      console.error('Upload failed:', err?.message || err);
      alert('Failed to upload image. Please check your Supabase Storage permissions and try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer group transition-all shrink-0"
        title="Click to choose a photo from camera or disk"
      >
        {preview ? (
          <img
            src={preview}
            alt="Product"
            className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
          />
        ) : (
          <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-orange-500" />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-lg border border-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer"
      >
        <UploadCloud className="w-3.5 h-3.5" />
        {uploading ? 'Uploading...' : 'Change Photo'}
      </button>
    </div>
  );
}
