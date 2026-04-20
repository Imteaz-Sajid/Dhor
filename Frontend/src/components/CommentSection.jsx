import React, { useState, useEffect } from 'react';
import { commentAPI } from '../services/api';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const CommentSection = ({ report, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isLocal =
    currentUser?.district === report.district &&
    currentUser?.thana === report.thana;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await commentAPI.getComments(report._id);
        setComments(data.comments || []);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [report._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const data = await commentAPI.addComment(report._id, newComment.trim());
      setComments((prev) => [data.comment, ...prev]);
      setNewComment('');
    } catch {
      // silently ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t border-gray-100 px-4 py-4 space-y-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        Community Updates
      </p>

      {/* Input or locked message */}
      {isLocal ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Share what you know about this incident..."
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{newComment.length}/500</span>
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="px-4 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-xl hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Posting…' : 'Post Update'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-start gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <span className="text-base leading-none mt-0.5">🔒</span>
          <p className="text-xs text-gray-500 leading-relaxed">
            Commenting is restricted to verified residents of{' '}
            <span className="font-semibold text-gray-700">{report.thana}</span>{' '}
            to prevent misinformation.
          </p>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-center text-gray-400 py-2">
          No community updates yet.
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c._id} className="flex gap-2.5">
              {c.userId?.profilePicture ? (
                <img
                  src={c.userId.profilePicture}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-orange-300 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5 select-none">
                  {(c.userId?.name?.[0] || '?').toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-gray-800">
                    {c.userId?.name || 'Anonymous'}
                  </span>
                  {c.userId?.trustScore > 0 && (
                    <span className="text-xs text-yellow-500 font-medium">
                      ★ {(c.userId.trustScore / 20).toFixed(1)}
                    </span>
                  )}
                  {c.userId?.badges?.length > 0 && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium leading-none">
                      {c.userId.badges[0]}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 leading-snug mt-0.5 break-words">
                  {c.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
