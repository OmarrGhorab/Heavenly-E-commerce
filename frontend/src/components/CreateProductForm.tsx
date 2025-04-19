import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader } from 'lucide-react';
import { CreateProductSchema } from '../_auth/schema/productSchema';
import type { CreateProduct } from '../_auth/schema/productSchema';
import { ImageDropzone } from '../components/ImageUpload/ImageDropzone';
import { ImagePreview } from '../components/ImageUpload/ImagePreview';
import { useImageUpload } from './hooks/useImageUpload';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useProductStore } from '../stores/useProductStore'
import { useQueryClient } from '@tanstack/react-query';


function App() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<CreateProduct>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      price: 0,
      stock: 0,
      discount: 0,
      saleStart: null,
      saleEnd: null,
    },
  });

  const {
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
  } = useImageUpload();

  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [isSale, setIsSale] = useState<boolean>(false);
  const { createProduct, loading } = useProductStore();
  const queryClient = useQueryClient();

  const handleSaleToggle = (value: string) => {
    setIsSale(value === 'yes');
    if (value === 'no') {
      setValue('discount', 0);
      setValue('saleStart', null);
      setValue('saleEnd', null);
    }
  };

  const handleAddColor = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = (e.target as HTMLInputElement).value.trim();
      if (value && !colors.includes(value)) {
        setColors([...colors, value]);
        (e.target as HTMLInputElement).value = '';
      }
    }
  };

  const handleAddSize = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = (e.target as HTMLInputElement).value.trim();
      if (value && !sizes.includes(value)) {
        setSizes([...sizes, value]);
        (e.target as HTMLInputElement).value = '';
      }
    }
  };

  const removeColor = (colorToRemove: string) => {
    setColors(colors.filter((color) => color !== colorToRemove));
  };

  const removeSize = (sizeToRemove: string) => {
    setSizes(sizes.filter((size) => size !== sizeToRemove));
  };
  const onSubmit = async (data: CreateProduct) => {
    console.log("data here", data);
    try {
      // Create a complete payload with all form data
      const completePayload = {
        ...data,
        colors,
        sizes,
        isSale,
        images: images.map((file, index) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          base64: previewImages[index], // Match Base64 string using index
        })),
      };
  
      // Call createProduct and handle response
      await createProduct(completePayload);
      console.log("Product created successfully:", completePayload);
  
      // Invalidate the 'products' query so the list updates immediately
      queryClient.invalidateQueries({ queryKey: ['products'] });
  
      // Reset form after a delay
      setTimeout(() => {
        reset();
        setColors([]);
        setSizes([]);
        setIsSale(false);
        resetImages();
      }, 2000);
    } catch (error: any) {
      console.error("Error in onSubmit:", error);
    }
  };
  
  
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto rounded-xl shadow-lg overflow-hidden">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Create New Product</h2>
          <p className="mt-2 text-gray-600">Fill in the details to create a new product listing</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800">Product Title</label>
                  <input
                    {...register('title')}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-400 rounded-md shadow-sm focus:outline-none focus:border-gray-500"
                    placeholder="Enter product title"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">Category</label>
                  <select
                    {...register('category')}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-400 rounded-md shadow-sm focus:outline-none focus:border-gray-500"
                  >
                    <option value="">Select Category</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                    <option value="men">Men</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-400 rounded-md shadow-sm focus:outline-none focus:border-gray-500"
                    placeholder="0.00"
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">Stock</label>
                  <input
                    type="number"
                    {...register('stock', { valueAsNumber: true })}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-400 rounded-md shadow-sm focus:outline-none focus:border-gray-500"
                    placeholder="0"
                  />
                  {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800">Description</label>
                  <textarea
                    {...register('description')}
                    rows={2}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-400 rounded-md shadow-sm focus:outline-none focus:border-gray-500"
                    placeholder="Enter product description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">Colors</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colors.map((color, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-200 text-blue-500"
                      >
                        {color}
                        <button type="button" onClick={() => removeColor(color)} className="ml-2">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-400 rounded-md shadow-sm focus:outline-none focus:border-gray-500"
                    placeholder="Type a color and press Enter"
                    onKeyDown={handleAddColor}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">Sizes</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sizes.map((size, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-blue-200 text-blue-500 font-semibold"
                      >
                        {size}
                        <button type="button" onClick={() => removeSize(size)} className="ml-2">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-400 rounded-md shadow-sm focus:outline-none focus:border-gray-500"
                    placeholder="Type a size and press Enter"
                    onKeyDown={handleAddSize}
                  />
                </div>
              </div>
            </div>

            {/* Images Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 my-2">Product Images</label>
              <ImageDropzone
                isDragging={isDragging}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onImageChange={handleImageChange}
              />
              {previewImages.length > 0 && <ImagePreview images={previewImages} onRemove={removeImage} />}
            </div>

            {/* Sale Fields */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 my-2">Sale Status</label>
              <select
                onChange={(e) => handleSaleToggle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-400 rounded-md shadow-sm"
              >
                <option value="no">No Sale</option>
                <option value="yes">On Sale</option>
              </select>
              {isSale && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 my-1">Discount (%)</label>
                    <input
                      type="number"
                      {...register('discount', { valueAsNumber: true })}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-400 rounded-md shadow-sm"
                      placeholder="Enter Discount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 my-1">Sale Start</label>
                    <DatePicker
                      selected={watch('saleStart')}
                      onChange={(date) => setValue('saleStart', date)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-400 rounded-md shadow-sm"
                      placeholderText="Select sale start date"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 my-1">Sale End</label>
                    <DatePicker
                      selected={watch('saleEnd')}
                      onChange={(date) => setValue('saleEnd', date)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-400 rounded-md shadow-sm"
                      placeholderText="Select sale end date"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? <Loader className="animate-spin w-5 h-5 mx-auto" /> : 'Submit Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;