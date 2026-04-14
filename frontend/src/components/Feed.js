import React, { useState, useEffect } from 'react';
import { getPosts, createPost, likePost, addComment } from '../api';
import { FiHeart, FiMessageCircle, FiSend } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await getPosts();
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setLoading(true);
    try {
      await createPost({ content: newPost, image_url: '' });
      setNewPost('');
      await loadPosts();
    } catch (error) {
      alert('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await likePost(postId);
      await loadPosts();
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async (postId) => {
    const comment = commentText[postId];
    if (!comment?.trim()) return;

    try {
      await addComment(postId, comment);
      setCommentText({ ...commentText, [postId]: '' });
      await loadPosts();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="feed-module">
      <h2 className="text-3xl font-bold text-gray-900">Feed</h2>

      {/* Create Post */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleCreatePost}>
          <textarea
            data-testid="create-post-input"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="3"
          />
          <div className="mt-3 flex justify-end">
            <button
              data-testid="create-post-button"
              type="submit"
              disabled={loading || !newPost.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm p-6" data-testid="post-item">
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {post.user_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{post.user_name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

              {/* Post Actions */}
              <div className="flex items-center gap-6 pt-4 border-t">
                <button
                  data-testid={`like-button-${post.id}`}
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 transition-colors ${
                    post.likes?.includes(user?.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <FiHeart className={post.likes?.includes(user?.id) ? 'fill-current' : ''} />
                  <span>{post.likes?.length || 0}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-500">
                  <FiMessageCircle />
                  <span>{post.comments?.length || 0}</span>
                </div>
              </div>

              {/* Comments Section */}
              {post.comments && post.comments.length > 0 && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  {post.comments.map((comment, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
                        {comment.user_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-semibold text-gray-900">{comment.user_name}</p>
                        <p className="text-sm text-gray-700">{comment.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="mt-4 flex gap-2">
                <input
                  data-testid={`comment-input-${post.id}`}
                  type="text"
                  value={commentText[post.id] || ''}
                  onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                />
                <button
                  data-testid={`comment-button-${post.id}`}
                  onClick={() => handleComment(post.id)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiSend />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;
