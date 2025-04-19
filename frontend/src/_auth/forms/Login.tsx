import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schema/formSchema';
import { z } from 'zod';
import { useUserStore } from '../../stores/useUserStore';
import { ArrowRight, UserCircle2, Mail, Lock, Loader, LogIn } from 'lucide-react';


type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { loading, login } = useUserStore();

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="flex justify-center h-fit pt-20">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col items-center mb-8">
            <UserCircle2 className="w-16 h-16 text-white mb-2" />
            <h3 className="text-3xl font-bold text-white">Login</h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-medium text-white/80" htmlFor="email">
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
              <label className="block text-sm font-medium text-white/80" htmlFor="password">
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
                autoComplete="password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400" id="password-error" aria-live="polite">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                to="/forget-password"
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <div>
              {!loading ? (
                <button
                  type="submit"
                  className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                   <LogIn className="w-5 h-5 mr-2" /> Login
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

            {/* Sign Up Link */}
            <div className="text-center mt-4">
              <p className="text-sm text-white/80">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-white hover:text-purple-300 transition-colors"
                >
                   Sign up <ArrowRight className="inline w-4 h-4" />
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
