import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotSchema } from "../schema/formSchema";
import { useUserStore } from "../../stores/useUserStore";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Loader, Mail } from "lucide-react";

const ForgotPassword = () => {
  type ForgotFormData = z.infer<typeof forgotSchema>;

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const { loading, forgotPassword, attempts } = useUserStore();
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAttempts, setShowAttempts] = useState(false);

  useEffect(() => {
    if (attempts > 0) {
      setShowAttempts(false); // Reset visibility before starting delay
      const timer = setTimeout(() => {
        setShowAttempts(true);
      }, 1000); // Delay for 1 second
  
      return () => clearTimeout(timer); // Cleanup timeout if attempts change
    }
  }, [attempts]);

  const onSubmit = async (data: ForgotFormData) => {
    setSubmitted(true);
    setErrorMessage(null);
    try {
      await forgotPassword(data.email);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.errors?.[0]?.msg || "An error occurred";
      setErrorMessage(errorMsg);
    }
  };

  return (

      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col items-center mb-8">
            <h3 className="text-3xl font-bold text-white">Forgot Password?</h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
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

            {/* Messages Section */}
            {(errorMessage || submitted) && (
                <div className="overflow-hidden">
                  {errorMessage ? (
                    <div className="text-sm text-red-400">{errorMessage}</div>
                  ) : (
                    showAttempts && ( 
                      <div className="text-sm text-red-500">
                        {attempts > 3
                          ? "You have exceeded the maximum attempts. Please try again in 24 hours."
                          : `Attempts left: ${3 - attempts}`}
                      </div>
                    )
                  )}
                </div>
              )}

            {/* Login Link */}
            <div className="text-center mt-4">
              <p className="text-sm text-white/80">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-white hover:text-purple-300 transition-colors"
                >
                  Login 
                </Link>
              </p>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

  );
};

export default ForgotPassword;
