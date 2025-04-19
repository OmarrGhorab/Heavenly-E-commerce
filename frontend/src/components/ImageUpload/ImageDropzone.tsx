import { Upload } from 'lucide-react';

interface ImageDropzoneProps {
  isDragging: boolean;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageDropzone({
  isDragging,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onImageChange,
}: ImageDropzoneProps) {
  return (
    <div
      className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 ${
        isDragging 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 border-dashed'
      } rounded-md transition-colors duration-200`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
    >
      <div className="space-y-1 text-center">
        <Upload className={`mx-auto h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
        <div className="flex text-sm text-gray-600">
          <label
            htmlFor="image-upload"
            className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
          >
            <span>Upload files</span>
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={onImageChange}
              className="sr-only"
            />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
      </div>
    </div>
  );
}