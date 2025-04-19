import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

export const EmptyWishlist = () => {
  const navigate = useNavigate();

  const handleConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#d946ef', '#a855f7'],
      startVelocity: 30,
      gravity: 0.8,
      scalar: 1.2,
    });

    setTimeout(() => {
      navigate('/products');
    }, 1000);
  };

  return (
  <div className="flex flex-col items-center justify-center w-full text-center mx-auto px-4 pt-20">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 120 }}
        className="mb-8"
      >
        <svg className="w-32 h-32 text-rose-500" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
      </motion.div>
  
      {/* Text Content */}
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100">
          Your Wishlist is Empty
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
          Start adding items to your wishlist and save your favorite products for later!
        </p>
      </div>
  
      {/* Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleConfetti}
        className="mt-8 px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-lg shadow-lg transition-all"
      >
        Explore Trending Products
      </motion.button>
    </div>
  );
  
};