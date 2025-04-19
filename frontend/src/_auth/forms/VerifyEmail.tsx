import { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore, VerificationResponse } from "../../stores/useUserStore";

function EmailVerification() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail } = useUserStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmailHandler = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Missing verification token");
        return;
      }

      try {
        const result: VerificationResponse = await verifyEmail(token);
        if (result.success) {
          setStatus("success");
          setMessage(result.message || "Email verified successfully!");
          setTimeout(() => {
            navigate('/')
          }, 2000)
        } else {
          setStatus("error");
          setMessage(result.message || "Email verification failed.");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error?.response?.data?.message || "An error occurred during verification."
        );
      }
    };

    verifyEmailHandler();
  }, [token, verifyEmail, navigate]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center p-4"
    >
      {/* Floating Particles */}
      <AnimatePresence>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/10 rounded-full"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
              y: [0, -200, 0],
              x: [0, (Math.random() - 0.5) * 50, 0],
            }}
            transition={{
              duration: Math.random() * 8 + 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Main Card */}
      <motion.div
        className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl p-8 text-center relative overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {/* Dynamic Gradient Background */}
        <motion.div
          className="absolute inset-0 z-0"
          animate={{
            background: [
              "linear-gradient(45deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%)",
              "linear-gradient(135deg, rgba(45, 212, 191, 0.1) 0%, transparent 100%)",
              "linear-gradient(225deg, rgba(236, 72, 153, 0.1) 0%, transparent 100%)",
              "linear-gradient(315deg, rgba(14, 165, 233, 0.1) 0%, transparent 100%)",
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header Animation */}
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl font-bold text-white mb-8"
          >
            Verify Email
          </motion.h1>

          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center space-y-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                >
                  <Loader2 className="h-16 w-16 text-blue-500 mx-auto" />
                </motion.div>
                <h2 className="text-xl font-semibold text-white">Verifying your email...</h2>
                <p className="text-sm text-white/80">Please wait while we verify your email address.</p>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                key="success"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex flex-col items-center space-y-4"
              >
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
                <h2 className="text-xl font-semibold text-green-400">Email Verified!</h2>
                <p className="text-sm text-white/80">{message}</p>
                <motion.div
                  className="w-full bg-white/10 h-1 rounded-full overflow-hidden"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 3, ease: "linear" }}
                >
                  <div className="h-full bg-green-400 origin-left" />
                </motion.div>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                key="error"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center space-y-4"
              >
                <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                <h2 className="text-xl font-semibold text-red-400">Verification Failed</h2>
                <p className="text-sm text-white/80">{message}</p>
                <motion.button
                  onClick={() => navigate("/")}
                  className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Return Home
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default EmailVerification;