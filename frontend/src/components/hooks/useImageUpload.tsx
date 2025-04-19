import { useState } from 'react';

export function useImageUpload() {
  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const processFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const uniqueFiles = imageFiles.filter(file =>
      !images.some(existingFile => existingFile.name === file.name)
    );

    if (uniqueFiles.length > 0) {
      uniqueFiles.forEach(file => {
        const reader = new FileReader();
        
        reader.onloadend = () => {
          if (reader.result) {
            // Here we store the base64 data URL in previewImages
            setImages(prev => [...prev, file]);
            setPreviewImages(prev => [...prev, reader.result as string]);
          }
        };

        reader.readAsDataURL(file);
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Check if the dropped items are files
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    }
  };

  const removeImage = (previewToRemove: string) => {
    const index = previewImages.indexOf(previewToRemove);
    if (index !== -1) {
      setPreviewImages(prev => prev.filter(preview => preview !== previewToRemove));
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const resetImages = () => {
    setImages([]);
    setPreviewImages([]);
  };

  return {
    images,
    isDragging,
    previewImages,
    handleImageChange,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    removeImage,
    resetImages,
  };
}
