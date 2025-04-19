import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '../schema/formSchema';
import { z } from 'zod';
import { useUserStore } from '../../stores/useUserStore';
import { ArrowRight, UserCircle2, Lock, Loader, LogIn } from 'lucide-react';


type ResetFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>(); // Extract token from URL params
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ResetFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });
  const navigate = useNavigate();
  const { loading, resetPassword } = useUserStore();

  const onSubmit = (data: ResetFormData) => {
    console.log('form submitted', data);
    if (token) {
      const resetData = { ...data, token };
      resetPassword(resetData);
      setTimeout(() => {
        reset();
        navigate('/login');
      }, 3000);
    }
  };

  return (
    <div className="flex justify-center h-fit pt-20">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col items-center mb-8">
          <UserCircle2 className="w-16 h-16 text-white mb-2" />
            <h3 className="text-3xl font-bold text-white">Reset Password</h3>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-white/80" htmlFor="newPassword">
                New Password
              </label>
              <Lock className="w-6 h-6 text-sm absolute text-gray-700 top-9 left-2" />
              <input
                id="newPassword"
                type="password"
                {...register('newPassword')}
                className="mt-1 w-full px-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
                aria-invalid={!!errors.newPassword}
                aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
                autoComplete="new-password"
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-400" id="newPassword-error" aria-live="polite">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-white/80" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <Lock className="w-6 h-6 text-sm absolute text-gray-700 top-9 left-2" />
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className="mt-1 w-full px-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                autoComplete="confirm-password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400" id="confirmPassword-error" aria-live="polite">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              {!loading ? (
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all"
                  >
                    <LogIn className="w-5 h-5 mr-2" /> Reset Password
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full flex items-center justify-center py-3 px-4 bg-gray-500 rounded-lg text-white font-medium cursor-not-allowed"
                  >
                    <Loader className="w-5 h-5 mr-2 animate-spin" /> Loading...
                  </button>
                )}
            </div>

            {/* Back to Login Link */}
            <div className="text-center mt-4">
              <p className="text-sm text-white/80">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-white hover:text-purple-300 transition-colors"
                >
                  Login here <ArrowRight className="inline w-4 h-4" />
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
