// components/CommentsList.tsx
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Comment } from '@/types/Comment';
import { motion } from 'framer-motion';
import { useComments } from './hooks/useComments';
import StarRating from './StarRating';

interface CommentItemProps {
    comment: Comment;
    rating?: number | null;
    onEdit: (newContent: string) => Promise<void>; // Should match the mutation return type
    isSaving: boolean;
  }

const CommentsList = ({ productId }: { productId: string }) => {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  const { infiniteQuery, editComment, isEditing } = useComments(productId);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = infiniteQuery;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allComments = data?.pages.flatMap((page) => page?.product?.comments || []) || [];
  const productRatings = data?.pages[0]?.product?.ratings || [];

  return (
    <div className="space-y-4">
        {allComments.map((comment) => {
    const commentRating = productRatings.find(
        (r: any) => r.user._id.toString() === comment.user?._id.toString()
    )?.rating;

    return (
        <CommentItem
        key={comment._id}
        comment={comment}
        rating={commentRating}
        onEdit={async (newContent) => {
            await editComment({
            commentId: comment._id,
            payload: { content: newContent }
            });
        }}
        isSaving={isEditing}
        />
    );
    })}
      {isFetchingNextPage && (
        <div className="space-y-4">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="border p-4 rounded-lg">
              <Skeleton count={3} />
            </div>
          ))}
        </div>
      )}

      <div ref={ref} className="h-2" />

      {!hasNextPage && allComments.length > 0 && (
        <p className="text-center text-gray-500 py-4">
          No more comments to load
        </p>
      )}

      {!isFetchingNextPage && allComments.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          Be the first to comment!
        </p>
      )}
    </div>
  );
};

const CommentItem = ({ comment, rating, onEdit, isSaving }: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const handleSave = async () => {
    try {
      await onEdit(editedContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save comment:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(comment.content);
  };

  return (
    <motion.div
      className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-start gap-3">
        <img
          src={comment.user?.photo || '/default-avatar.png'}
          alt={comment.user?.username}
          className="w-10 h-10 rounded-full object-cover"
        />

        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-gray-800">
                {comment.user?.username || 'Anonymous'}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>

            {rating !== undefined && (
              <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                <StarRating rating={rating ?? 0} />
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                disabled={isSaving}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                  disabled={isSaving || !editedContent.trim()}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="group relative">
              <p className="text-gray-700 whitespace-pre-wrap pr-8">
                {comment.content}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 hover:text-blue-700"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CommentsList;