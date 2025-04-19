import { motion } from 'framer-motion';
import { FiShoppingCart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <div className="w-[80%] mx-auto bg-gradient-to-br from-slate-50 to-blue-50 container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className=" w-full text-center"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
            {/* Cart Icon */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="mb-6 flex justify-center"
            >
              <FiShoppingCart className="w-20 h-20 text-slate-400" />
            </motion.div>

            {/* Text Content */}
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-slate-500 mb-8">
              Looks like you haven't added any items to your cart yet. Let's find something special!
            </p>

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/products')} // Update your route as needed
              className="w-full py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              Start Shopping
            </motion.button>

            {/* Optional Continue Exploring */}
            <button
              onClick={() => navigate('/')}
              className="mt-4 text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              Continue Exploring →
            </button>
          </div>
        </motion.div>
    </div>
  );
};

export default EmptyCart;