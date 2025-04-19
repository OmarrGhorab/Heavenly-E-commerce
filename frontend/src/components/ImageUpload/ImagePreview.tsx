import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImagePreviewProps {
  images: string[];
  onRemove: (preview: string) => void;
}

export function ImagePreview({ images, onRemove }: ImagePreviewProps) {
  return (
    <motion.div 
    className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-4" 
    layout
  >
    <AnimatePresence>
      {images.map((preview) => (
        <motion.div
          key={preview}
          className="relative aspect-square"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          layout
        >
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={() => onRemove(preview)}
            className="absolute top-1 right-1 p-1 bg-red-100 rounded-full text-red-500 hover:bg-red-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </motion.div>
  );
}