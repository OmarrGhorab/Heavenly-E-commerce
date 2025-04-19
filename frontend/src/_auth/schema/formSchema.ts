import { z } from 'zod';

export const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters long")
      .max(20, "Username must be less than 20 characters long")
      .regex(/^[a-zA-Z0-9_ ]+$/, "Username can only contain letters, numbers, underscores, and spaces"),
      
    email: z
      .string()
      .email("Please enter a valid email address")
      .min(5, "Email must be at least 5 characters long")
      .max(255, "Email is too long"),
      
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(20, "Password must be less than 20 characters")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "Password must contain at least one letter, one number, and one special character"
      ),
      
    confirmPassword: z
      .string()
      .min(8, "Confirmation password must be at least 8 characters long")
      .max(20, "Confirmation password must be less than 20 characters"),
      
    // Gender is now required so that its type is strictly "male" or "female"
    gender: z.enum(['male', 'female'], {
      errorMap: () => ({ message: 'Gender is required' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .min(3, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotSchema = z.object({
  email: z.string().email("Please provide a valid email address").nonempty("Email is required"),
});

export type ForgotFormData = z.infer<typeof forgotSchema>;

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters long'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ResetFormData = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters long")
    .optional(),

  oldPassword: z.string().optional(),

  newPassword: z.string()
    .optional()
    .refine(val => 
      !val || val.length >= 8, 
      { message: "Password must be at least 8 characters long" }
    )
    .refine(val => 
      !val || /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(val), 
      { message: "Password must contain at least one letter, one number, and one special character" }
    ),

  confirmNewPassword: z.string().optional(),

  image: z.union([
    z.instanceof(File), 
    z.string()
  ]).optional()
})
.superRefine((data, ctx) => {
  // Password validation
  if (data.newPassword) {
    if (!data.oldPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Old password is required to update password",
        path: ["oldPassword"]
      });
    }
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match",
        path: ["confirmNewPassword"]
      });
    }
  }
})
.superRefine((data, ctx) => {
  // Image validation
  if (!data.image) return true;

  if (typeof data.image === 'string') {
    if (!/^(data:image\/(png|jpeg|gif)|https?:\/\/.+\.(jpg|jpeg|png|gif))$/i.test(data.image)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid image URL or format",
        path: ["image"]
      });
    }
  } else if (data.image instanceof File) {
    if (!['image/png', 'image/jpeg', 'image/gif'].includes(data.image.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid image type. Only PNG/JPEG/GIF allowed",
        path: ["image"]
      });
    }
  }
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
