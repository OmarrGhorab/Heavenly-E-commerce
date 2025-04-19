// UpdateProfileForm.tsx
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateProfileFormData, updateProfileSchema } from '../_auth/schema/formSchema';
import { useUserStore } from '@/stores/useUserStore';
import toast from 'react-hot-toast';

const UpdateProfileForm: React.FC = () => {
  
  const { updateProfile, user, loading } = useUserStore();
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [isFileSelected, setIsFileSelected] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: user?.username || '',
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setValue('image', file, { shouldDirty: true }); 
      };
      reader.readAsDataURL(file);
      setIsFileSelected(true);
    } else {
      setPreviewImage(null);
      setValue('image', undefined, { shouldDirty: true }); 
      setIsFileSelected(false);
    }
  };


  const onSubmit = async (formData: UpdateProfileFormData) => {
    try {
      // Convert File to Base64 if needed
      const payload = {
        ...formData,
        image: formData.image instanceof File 
          ? await fileToBase64(formData.image) 
          : formData.image
      };


      await updateProfile(payload);
      toast.success('profile updated successfully!', {duration: 2000})
      reset({
        username: payload.username || user?.username || '',
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        image: '', // Reset image field
      });
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  // Helper function to convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Profile</h2>

      <div className="space-y-8">
        {/* Profile Picture Section */}
        <div className="border-b pb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Profile Picture</h3>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <img
              src={previewImage || user?.photo || '/default-avatar.png'}
              alt="Profile preview"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 group-hover:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="block">
              <span className="sr-only">Choose profile photo</span>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <span className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold hover:bg-blue-100 transition-colors">
                    Choose File
                  </span>
                  <input
                    {...register('image')}
                    ref={fileInputRef}
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif"
                  />
                </label>
                {isFileSelected && (
                  <span className="text-sm text-gray-600">
                    {previewImage ? 'Image selected' : 'Image uploaded'}
                  </span>
                )}
              </div>
            </label>
            {errors.image && (
              <p className="mt-2 text-sm text-red-600">{errors.image.message as string}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              PNG, JPG, or GIF (Max 5MB)
            </p>
          </div>
        </div>
      </div>

        {/* Username Section */}
        <div className="border-b pb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Account Information</h3>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              {...register('username')}
              className={`block w-full rounded-md border p-2 outline-none ${
                errors.username ? 'border-red-300' : 'border-gray-300'
              } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
              placeholder="Enter your new username"
            />
            {errors.username && (
              <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>
        </div>

        {/* Password Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Change Password</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                id="oldPassword"
                type="password"
                {...register('oldPassword')}
                className={`block w-full rounded-md border p-2 outline-none ${
                  errors.oldPassword ? 'border-red-300' : 'border-gray-300'
                } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                placeholder="Enter current password"
              />
              {errors.oldPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.oldPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                {...register('newPassword')}
                className={`block w-full rounded-md border p-2 outline-none ${
                  errors.newPassword ? 'border-red-300' : 'border-gray-300'
                } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                placeholder="Enter new password"
              />
              {errors.newPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                {...register('confirmNewPassword')}
                className={`block w-full rounded-md border p-2 outline-none ${
                  errors.confirmNewPassword ? 'border-red-300' : 'border-gray-300'
                } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                placeholder="Confirm new password"
              />
              {errors.confirmNewPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmNewPassword.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isDirty || loading}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default UpdateProfileForm;