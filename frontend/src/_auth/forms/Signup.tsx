import { useForm } from 'react-hook-form';
import { useUserStore } from '../../stores/useUserStore';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../schema/formSchema';
import { z } from 'zod';
import { UserCircle2, UserPlus, Mail, Lock, User, Loader, ArrowRight } from 'lucide-react';


type SignupFormData = z.infer<typeof signupSchema>;

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const { signup, loading } = useUserStore();

  const onSubmit = async (data: SignupFormData) => {
    await signup(data);
    reset();
  };

  return (
    <div className="flex justify-center h-fit">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col items-center mb-8">
           <UserCircle2 className="w-16 h-16 text-white mb-2" />
            <h3 className="text-3xl font-bold text-white">Create Account</h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Field */}
            <div className="relative">
              <label htmlFor="username" className="block text-sm font-medium text-white/80">
                Username
              </label>
              <User className="w-6 h-6 text-sm absolute text-gray-700 top-9 left-2" />
              <input
                id="username"
                {...register('username')}
                className="mt-1 w-full px-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? 'username-error' : undefined}
                autoComplete="username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-400" id="username-error" aria-live="polite">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-white/80">
                Email
              </label>
              <Mail className="w-6 h-6 text-sm absolute text-gray-700 top-9 left-2" />
              <input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1 w-full px-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400" id="email-error" aria-live="polite">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-white/80">
                Password
              </label>
              <Lock className="w-6 h-6 text-sm absolute text-gray-700 top-9 left-2" />
              <input
                id="password"
                type="password"
                {...register('password')}
                className="mt-1 w-full px-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400" id="password-error" aria-live="polite">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80">
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
                autoComplete="new-password"
                />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400" id="confirmPassword-error" aria-live="polite">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Gender Selection */}
            <div className="relative">
              <label htmlFor="gender" className="block text-sm font-medium text-white/80">
                Gender
              </label>
              <select
                id="gender"
                {...register('gender')}
                className="mt-1 w-full px-10 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
              >
                <option value="" disabled>
                  Select gender
                </option>
                <option value="male" className="bg-gray-800">
                  Male
                </option>
                <option value="female" className="bg-gray-800">
                  Female
                </option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-400" aria-live="polite">
                  {errors.gender.message}
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
                  <UserPlus className="w-5 h-5 mr-2" /> Sign Up
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

            {/* Login Link */}
            <div className="text-center mt-4">
              <p className="text-sm text-white/80">
                Have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-white hover:text-purple-300 transition-colors"
                >
                   Login <ArrowRight className="inline w-4 h-4" />
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
