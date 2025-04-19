import { useState, useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import { motion, AnimatePresence } from "framer-motion";
import useDebounce from "@/components/hooks/useDebounce";
import { Trash, Star, Edit, Loader, X, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditProductSchema } from "@/_auth/schema/productSchema";
import { EditProductRequest, Product } from "@/types/product";
import { cn } from "@/lib/utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useProducts } from "./hooks/useProducts";
import { useQueryClient } from "@tanstack/react-query";
import ProductNotFound from "./ProductNotFound";

const ProductsList = () => {
  /*** Pagination & Search ***/
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 600);
  const queryClient = useQueryClient();

  /*** Fetch Products ***/
  const { data, isLoading, error, isFetching } = useProducts({
    page,
    keyword: debouncedKeyword,
  });

  /*** Product Store Actions ***/
  const {
    deleteProduct,
    toggleFeatureProduct,
    openEditForm,
    closeEditForm,
    isEditing,
    editProductData,
    editProduct,
  } = useProductStore();

  /*** Form Setup for Editing Product ***/
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EditProductRequest>({
    resolver: zodResolver(EditProductSchema),
    defaultValues: {
      ...editProductData,
      price: editProductData ? Number(editProductData.price) : 0,
      stock: editProductData ? Number(editProductData.stock) : 0,
      discount: editProductData ? Number(editProductData.discount) : 0,
      saleStart: editProductData?.saleStart
        ? new Date(editProductData.saleStart)
        : undefined,
      saleEnd: editProductData?.saleEnd
        ? new Date(editProductData.saleEnd)
        : undefined,
      images:
        editProductData?.images?.map((image) =>
          typeof image === "string" ? { base64: image } : image
        ) || [],
    },
  });

  /*** Local State for Colors & Sizes ***/
  const [colors, setColors] = useState<string[]>(editProductData?.colors || []);
  const [sizes, setSizes] = useState<string[]>(editProductData?.sizes || []);
  const isSale = watch("isSale");

  /*** Reset discount if product is not on sale ***/
  useEffect(() => {
    if (!isSale) {
      setValue("discount", 0);
    }
  }, [isSale, setValue]);

  /*** Handler: Editing a Product ***/
  const handleEditProduct = (product: Product) => {
    openEditForm(product);
    reset({
      ...product,
      price: Number(product.price),
      stock: Number(product.stock),
      discount: Number(product.discount),
      saleStart: product.saleStart ? new Date(product.saleStart) : undefined,
      saleEnd: product.saleEnd ? new Date(product.saleEnd) : undefined,
      images:
        product.images?.map((image) =>
          typeof image === "string" ? { base64: image } : image
        ) || [],
    });
    setColors(product.colors || []);
    setSizes(product.sizes || []);
  };

  /*** Handler: Delete a Product ***/
  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  /*** Handler: Toggle Featured Status ***/
  const handleToggleFeature = async (productId: string) => {
    try {
      await toggleFeatureProduct(productId);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error) {
      console.error("Error toggling feature status:", error);
    }
  };

  /*** Form Submission Handler ***/
  const onSubmit = async (data: EditProductRequest) => {
    if (isEditing && editProductData?._id) {
      try {
        const completeData = {
          ...data,
          price: Number(data.price),
          stock: Number(data.stock),
          discount: data.isSale ? Number(data.discount) : 0,
          saleStart: data.isSale ? data.saleStart : undefined,
          saleEnd: data.isSale ? data.saleEnd : undefined,
          colors,
          sizes,
        };
        await editProduct(editProductData._id, completeData);
        queryClient.invalidateQueries({ queryKey: ["products"] });
        closeEditForm();
      } catch (error) {
        console.error("Error updating product:", error);
      }
    }
  };

  /*** Handlers: Add & Remove Colors and Sizes ***/
  const handleAddColor = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = (e.target as HTMLInputElement).value.trim();
      if (value && !colors.includes(value)) {
        setColors([...colors, value]);
        (e.target as HTMLInputElement).value = "";
      }
    }
  };

  const handleAddSize = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = (e.target as HTMLInputElement).value.trim();
      if (value && !sizes.includes(value)) {
        setSizes([...sizes, value]);
        (e.target as HTMLInputElement).value = "";
      }
    }
  };

  const removeColor = (colorToRemove: string) =>
    setColors(colors.filter((color) => color !== colorToRemove));

  const removeSize = (sizeToRemove: string) =>
    setSizes(sizes.filter((size) => size !== sizeToRemove));

  /*** Handler: Pagination ***/
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <motion.div
      className="rounded-xl overflow-hidden w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Search Input */}
      <div className="relative w-full">
      {/* Search Icon */}
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      
      {/* Input Field */}
      <input
        type="text"
        placeholder="Search products..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="w-full p-2 pl-10 pr-10 border rounded-lg  outline-none border-none  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-200"
      />
      
      {/* Clear Button */}
      {keyword && (
        <button 
          onClick={() => setKeyword("")} 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>

      {/* Loading & Error States */}
      {isLoading && <p>Loading products...</p>}
      {error && <div className="text-red-500">Error: {error.message}</div>}

      {/* Product List or Not Found */}
      {data && data.products.length === 0 ? (
        <ProductNotFound />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block w-full mt-4">
            <div className="overflow-x-auto pb-4">
              <table className="min-w-full divide-y divide-gray-700 bg-gradient-to-br from-gray-800 to-gray-900">
                <thead className="bg-gray-700/50 backdrop-blur-sm">
                  <tr>
                    {["Product", "Price", "Category", "Featured", "Actions"].map(
                      (header) => (
                        <th
                          key={header}
                          className="px-4 py-3 sm:px-6 sm:py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  <AnimatePresence>
                    {data?.products.map((product: Product) => (
                      <motion.tr
                        key={product._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-700/20 transition-colors group"
                      >
                        {/* Product Info */}
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="relative flex-shrink-0"
                            >
                              <img
                                className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover border-2 border-gray-600/30"
                                src={product.images[0] as string}
                                alt={product.title}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/placeholder.jpg";
                                }}
                              />
                              {product.isFeatured && (
                                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-gray-900" />
                                </div>
                              )}
                            </motion.div>
                            <div className="min-w-0">
                              <h3 className="text-sm sm:text-base font-medium text-white truncate">
                                {product.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2">
                                {product.description &&
                                product.description.length > 40
                                  ? `${product.description.slice(0, 40)}...`
                                  : product.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* Price */}
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                          <span className="text-sm sm:text-base font-semibold text-emerald-400">
                            ${product.price.toFixed(2)}
                          </span>
                        </td>
                        {/* Category */}
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                          <span className="inline-block px-2 py-1 text-xs sm:text-sm rounded-full bg-purple-500/20 text-purple-300">
                            {product.category}
                          </span>
                        </td>
                        {/* Featured Toggle */}
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleToggleFeature(product._id)}
                            className={cn(
                              "p-1.5 sm:p-2 rounded-lg transition-all",
                              product.isFeatured
                                ? "bg-yellow-400/90 text-gray-900"
                                : "bg-gray-600/30 text-gray-400 hover:bg-yellow-400/20"
                            )}
                          >
                            <Star className="h-5 w-5" />
                          </motion.button>
                        </td>
                        {/* Actions: Edit & Delete */}
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEditProduct(product)}
                              className="p-1.5 sm:p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                            >
                              <Edit className="h-5 w-5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteProduct(product._id)}
                              className="p-1.5 sm:p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            >
                              <Trash className="h-5 w-5" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}

        </div>
              <div className="lg:hidden space-y-3 p-2 sm:p-3 bg-gray-900/80 rounded-xl">
      <AnimatePresence>
        {data?.products.map((product: Product) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800/70 backdrop-blur-lg rounded-xl p-3 sm:p-4 shadow-lg border border-gray-700 w-full"
          >
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {/* Product Image */}
                <motion.div className="relative flex-shrink-0" whileHover={{ scale: 1.05 }}>
                  <img
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg object-cover border-2 border-gray-700/50"
                    src={product.images[0] as string}
                    alt={product.title}
                  />
                  {product.isFeatured && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 shadow-md">
                      <Star className="h-4 w-4 text-gray-900" />
                    </div>
                  )}
                </motion.div>

                {/* Product Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                    {product.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300 mt-1 line-clamp-2">
                    {product.description && product.description.length > 50
                      ? `${product.description.slice(0, 50)}...`
                      : product.description}
                  </p>
                  <p className="text-sm sm:text-base text-emerald-400 font-bold mt-1">
                    ${product.price.toFixed(2)}
                  </p>
                  <span className="text-xs text-purple-300 bg-purple-600/30 px-2 py-1 rounded-full mt-1 inline-block">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between w-full sm:w-auto sm:gap-3">
                <motion.button
                  onClick={() => handleToggleFeature(product._id)}
                  className={cn(
                    "p-2 rounded-lg shadow-md transition-all duration-200",
                    product.isFeatured
                      ? "bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                      : "bg-gray-700/50 text-gray-400 hover:bg-yellow-400/20"
                  )}
                >
                  <Star className="h-5 w-5" />
                </motion.button>

                <div className="flex gap-2">
                  <motion.button
                    onClick={() => handleEditProduct(product)}
                    className="p-2 rounded-lg bg-blue-500/30 text-blue-400 hover:bg-blue-500/50 transition-all duration-200"
                  >
                    <Edit className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="p-2 rounded-lg bg-red-500/30 text-red-400 hover:bg-red-500/50 transition-all duration-200"
                  >
                    <Trash className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>

          {/* Pagination Controls */}
          {data?.totalPages && data.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 flex justify-center items-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || isFetching}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </motion.button>
              <div className="flex gap-2">
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((num) => (
                  <motion.button
                    key={num}
                    whileHover={{ scale: 1.1 }}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      page === num ? "bg-blue-500 text-white" : "hover:bg-gray-100"
                    }`}
                    onClick={() => handlePageChange(num)}
                  >
                    {num}
                  </motion.button>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= data.totalPages || isFetching}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </motion.button>
            </motion.div>
          )}
          {isFetching && !isLoading && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg"
            >
              Updating results...
            </motion.div>
          )}
        </>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && editProductData && (
          <motion.div
            className="fixed inset-2 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800/90 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl mx-2 sm:mx-4 border border-gray-700/30"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Edit Product
                </h2>
                <button
                  onClick={closeEditForm}
                  className="p-1 sm:p-2 rounded-full hover:bg-gray-700/30 transition-colors"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                </button>
              </div>
              <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { label: "Title", name: "title", type: "text" },
                    { label: "Price", name: "price", type: "number" },
                    { label: "Category", name: "category", type: "text" },
                    { label: "Stock", name: "stock", type: "number" },
                    {
                      label: "Discount Percentage",
                      name: "discount",
                      type: "number",
                      disabled: !isSale,
                    },
                  ].map((field) => (
                    <div key={field.name} className="w-full">
                      <label className="block text-sm sm:text-base font-medium text-gray-300 mb-1">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        step={field.type === "number" ? "any" : undefined}
                        {...register(field.name as keyof EditProductRequest, {
                          valueAsNumber: field.type === "number",
                        })}
                        disabled={field.disabled}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700/30 rounded-lg border border-gray-600/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-sm sm:text-base text-white placeholder-gray-500 transition-all"
                      />
                      {errors[field.name as keyof typeof errors] && (
                        <p className="text-red-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          {errors[field.name as keyof typeof errors]?.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="isSale"
                    {...register("isSale")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isSale" className="text-sm font-medium text-gray-300">
                    On Sale
                  </label>
                </div>
                {watch("isSale") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Sale Start</label>
                      <DatePicker
                        selected={watch("saleStart") || undefined}
                        onChange={(date) => setValue("saleStart", date || undefined)}
                        className="w-full px-3 py-2 bg-gray-700/30 rounded-lg border border-gray-600/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-sm text-white placeholder-gray-500 transition-all"
                        placeholderText="Select sale start date"
                      />
                      {errors.saleStart && (
                        <p className="text-red-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          {errors.saleStart.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Sale End</label>
                      <DatePicker
                        selected={watch("saleEnd") || undefined}
                        onChange={(date) => setValue("saleEnd", date || undefined)}
                        className="w-full px-3 py-2 bg-gray-700/30 rounded-lg border border-gray-600/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-sm text-white placeholder-gray-500 transition-all"
                        placeholderText="Select sale end date"
                      />
                      {errors.saleEnd && (
                        <p className="text-red-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          {errors.saleEnd.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div className="w-full">
                  <label className="block text-sm sm:text-base font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    {...register("description")}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700/30 rounded-lg border border-gray-600/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-sm sm:text-base text-white placeholder-gray-500 min-h-[100px] sm:min-h-[120px] transition-all"
                  />
                  {errors.description && (
                    <p className="text-red-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      {errors.description.message}
                    </p>
                  )}
                </div>
                <div className="w-full">
                  <label className="block text-sm sm:text-base font-medium text-gray-300 mb-1">Colors</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded bg-blue-700 text-blue-300 text-xs">
                        {color}
                        <button type="button" onClick={() => removeColor(color)} className="ml-1 text-red-400 hover:text-red-300">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a color and press Enter"
                    onKeyDown={handleAddColor}
                    className="mt-1 w-full px-3 py-2 bg-gray-700/30 rounded-lg border border-gray-600/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-sm text-white placeholder-gray-500 transition-all"
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm sm:text-base font-medium text-gray-300 mb-1">Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded bg-blue-700 text-blue-300 text-xs">
                        {size}
                        <button type="button" onClick={() => removeSize(size)} className="ml-1 text-red-400 hover:text-red-300">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a size and press Enter"
                    onKeyDown={handleAddSize}
                    className="mt-1 w-full px-3 py-2 bg-gray-700/30 rounded-lg border border-gray-600/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-sm text-white placeholder-gray-500 transition-all"
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={closeEditForm}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700/70 text-sm sm:text-base transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 text-sm sm:text-base transition-all"
                    disabled={isFetching}
                  >
                    {isFetching ? (
                      <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mx-auto" />
                    ) : (
                      "Save Changes"
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductsList;
