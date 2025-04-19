import { useState, useEffect } from 'react';
import { useComments } from './hooks/useComments';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useUserStore } from "../stores/useUserStore";
import toast from 'react-hot-toast';

const AddCommentForm = ({ productId }: { productId: string }) => {
  const MAX_LENGTH = 500;
  const [content, setContent] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { addComment, isAdding, error } = useComments(productId);
  const { user } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!user) {
      toast.error('You must Login To use This Feature');
    }
    try {
      await addComment({ content: content.trim() });
      setContent('');
      setShowSuccess(true);
    } catch (error: any) {
      console.log('Failed to add comment:', error.message);
    }
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_LENGTH) {
      setContent(e.target.value);
    }
  };

  const handleError = (error: any) => {
    let errorMessage = '';
    if (!user) {
      errorMessage = 'You must Login To use This Feature'
    } else {
          errorMessage = 
      error.response?.data?.message?.message || // If nested error message
      error.response?.data?.message || // If normal API error
      error.message || // Axios error message
      "An unexpected error occurred"; // Default fallback
    }
  
    return errorMessage;
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Share Your Thoughts</h2>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3"
          >
            <XCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span>{handleError(error)}</span>
          </motion.div>
        )}

        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-3"
          >
            <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span>Comment posted successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Your Comment
          </label>
          <motion.div
            whileHover={{ scale: 1.005 }}
            className="relative"
            >
            <textarea
                id="content"
                value={content}
                onChange={handleContentChange}
                className="w-full min-h-[100px] p-4 border-2 border-gray-200 rounded-2xl 
                focus:ring-4 focus:ring-blue-100 focus:border-blue-500 
                placeholder-gray-400 text-gray-700 transition-all duration-200 
                resize-none shadow-sm hover:shadow-md
                text-lg leading-relaxed
                md:max-w-3xl mx-auto"  // Added max width and centering
                placeholder="Share your experience with this product..."
                rows={3}
                disabled={isAdding}
                style={{
                lineHeight: '1.6',
                scrollbarWidth: 'thin',
                scrollbarColor: '#3b82f6 transparent'
                }}
            />
            
            
            </motion.div>
        </div>

        <motion.button
          type="submit"
          disabled={isAdding || !content.trim()}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium
            hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed 
            transition-colors duration-200 flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
        >
          {isAdding ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              Posting...
            </>
          ) : (
            'Post Comment'
          )}
        </motion.button>
      </div>
    </motion.form>
  );
};

export default AddCommentForm;
