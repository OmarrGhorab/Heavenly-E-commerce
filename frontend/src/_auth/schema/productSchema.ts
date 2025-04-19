import { z } from 'zod';

export const CreateProductSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  stock: z.number().min(0, 'Stock must be greater than or equal to 0'),
  discount: z.number().min(0).max(100).optional(),
  saleStart: z.date().nullable(),
  saleEnd: z.date().nullable(),
});

export const EditProductSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  stock: z.number().min(0, 'Stock must be greater than or equal to 0'),
  discount: z.number().min(0).max(100).optional(),
  saleStart: z.date().nullable().optional(),
  saleEnd: z.date().nullable().optional(),
  isSale: z.boolean().optional(),  // now optional
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
});

export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type EditProduct = z.infer<typeof EditProductSchema>;