import React, { useContext, useEffect, useState } from 'react';
import moment from "moment";
import { MessageCircle, ThumbsUp, Send, Trash2, MessageCircleOff } from "lucide-react";
import axios from 'axios';
import { authDataContext } from '../context/AuthContext';
import { userDataContext } from '../context/userContext';
import { socket } from '../context/SocketContext';
import ConnectionButton from './ConnectionButton';
import { Card } from './ui/Card';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { motion, AnimatePresence } from 'framer-motion';

function Post({ id, author, like, comment, description, image, createdAt, commentsDisabled }) {
  let [more, setMore] = useState(false);
  let { serverUrl } = useContext(authDataContext);
  let { userData, getPost, handleGetProfile } = useContext(userDataContext);
  let [likes, setLikes] = useState(like);
  let [commentContent, setCommentContent] = useState("");
  let [comments, setComments] = useState(comment);
  let [showComment, setShowComment] = useState(false);
  let [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  let [isCommentsDisabled, setIsCommentsDisabled] = useState(commentsDisabled || false);

  const handleLike = async () => {
    try {
      let result = await axios.get(serverUrl + `/api/post/like/${id}`, { withCredentials: true });
      setLikes(result.data.like);
    } catch (error) {
      console.log(error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    try {
      let result = await axios.post(serverUrl + `/api/post/comment/${id}`, {
        content: commentContent
      }, { withCredentials: true });
      setComments(result.data.comment);
      setCommentContent("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      let result = await axios.delete(serverUrl + `/api/post/comment/${id}/${commentId}`, { withCredentials: true });
      setComments(result.data.comment);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeletePost = async () => {
    try {
      await axios.delete(serverUrl + `/api/post/delete/${id}`, { withCredentials: true });
      setShowDeleteConfirm(false);
      getPost(); // Refresh the feed
    } catch (error) {
      console.log(error);
    }
  };

  const handleToggleComments = async () => {
    try {
      let result = await axios.put(serverUrl + `/api/post/toggle-comments/${id}`, {}, { withCredentials: true });
      setIsCommentsDisabled(result.data.commentsDisabled);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleLikeUpdated = ({ postId, likes }) => {
      if (postId === id) setLikes(likes);
    };
    const handleCommentAdded = ({ postId, comm }) => {
      if (postId === id) setComments(comm);
    };
    const handleCommentDeleted = ({ postId, comm }) => {
      if (postId === id) setComments(comm);
    };
    const handleCommentsToggled = ({ postId, commentsDisabled: newDisabledStatus }) => {
      if (postId === id) setIsCommentsDisabled(newDisabledStatus);
    };

    socket.on("likeUpdated", handleLikeUpdated);
    socket.on("commentAdded", handleCommentAdded);
    socket.on("commentDeleted", handleCommentDeleted);
    socket.on("commentsToggled", handleCommentsToggled);

    return () => {
      socket.off("likeUpdated", handleLikeUpdated);
      socket.off("commentAdded", handleCommentAdded);
      socket.off("commentDeleted", handleCommentDeleted);
      socket.off("commentsToggled", handleCommentsToggled);
    };
  }, [id]);

  useEffect(() => {
    getPost();
  }, [likes, comments]);

  const hasLiked = likes.includes(userData?._id);

  return (
    <Card className="w-full mb-6 relative overflow-visible">
      <div className="p-4 sm:p-6">
        <div className='flex justify-between items-start mb-4'>
          <div className='flex items-center gap-3 cursor-pointer group' onClick={() => handleGetProfile(author.userName)}>
            <Avatar src={author.profileImage} alt={author.firstName} size="lg" className="group-hover:ring-2 ring-primary transition-all" />
            <div>
              <div className='text-base font-semibold group-hover:text-primary transition-colors'>{`${author.firstName} ${author.lastName}`}</div>
              <div className='text-xs text-muted-foreground'>{author.headline}</div>
              <div className='text-xs text-muted-foreground mt-0.5'>{moment(createdAt).fromNow()}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {userData?._id !== author._id && <ConnectionButton userId={author._id} />}
            {userData?._id === author._id && (
              <div className="flex">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("text-muted-foreground hover:bg-secondary/50", isCommentsDisabled && "text-destructive hover:bg-destructive/10")}
                  onClick={handleToggleComments}
                  title={isCommentsDisabled ? "Enable comments" : "Disable comments"}
                >
                  <MessageCircleOff className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-4 p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex flex-col gap-3"
            >
              <div className="text-sm font-medium text-foreground">Are you sure you want to delete this post?</div>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDeletePost}
                >
                  Yes, Delete
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-sm text-foreground/90 leading-relaxed mb-4">
          <div className={cn("transition-all duration-300", !more ? "line-clamp-3" : "")}>
            {description}
          </div>
          {description?.length > 150 && (
            <button 
              className="text-primary font-medium text-sm mt-1 hover:underline"
              onClick={() => setMore(!more)}
            >
              {more ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        {image && (
          <div className='w-full rounded-lg overflow-hidden mb-4 border bg-secondary/20 flex justify-center items-center'>
            <img src={image} alt="Post content" className='w-full h-auto object-contain max-h-[500px]' />
          </div>
        )}

        <div className='flex items-center justify-between py-2 border-b text-xs text-muted-foreground mb-2'>
          <div className='flex items-center gap-1.5'>
            <div className="bg-primary/10 p-1 rounded-full text-primary">
              <ThumbsUp className='w-3 h-3 fill-primary' />
            </div>
            <span>{likes.length}</span>
          </div>
          <div className='hover:text-foreground cursor-pointer transition-colors' onClick={() => setShowComment(!showComment)}>
            {comments.length} comments
          </div>
        </div>

        <div className='flex items-center gap-2 pt-2'>
          <Button 
            variant="ghost" 
            className={cn("flex-1 gap-2 rounded-lg text-muted-foreground font-semibold hover:text-foreground hover:bg-secondary", hasLiked && "text-primary hover:text-primary hover:bg-primary/10")} 
            onClick={handleLike}
          >
            <motion.div whileTap={{ scale: 1.2 }}>
               <ThumbsUp className={cn("w-5 h-5", hasLiked && "fill-primary")} />
            </motion.div>
            <span>Like</span>
          </Button>

          <Button 
            variant="ghost" 
            className="flex-1 gap-2 rounded-lg text-muted-foreground font-semibold hover:text-foreground hover:bg-secondary"
            onClick={() => setShowComment(!showComment)}
          >
            <MessageCircle className='w-5 h-5' />
            <span>Comment</span>
          </Button>
        </div>

        <AnimatePresence>
          {showComment && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-2 border-t">
                {isCommentsDisabled ? (
                   <div className="bg-secondary/50 rounded-xl p-4 text-center text-muted-foreground text-sm font-medium mb-2">
                      Comments are disabled for this post.
                   </div>
                ) : (
                  <>
                    <form className="flex items-center gap-3 mb-6" onSubmit={handleComment}>
                      <Avatar src={userData?.profileImage} size="sm" />
                      <div className="relative flex-1">
                        <Input 
                          placeholder="Add a comment..." 
                          className="pr-12 rounded-full bg-secondary border-transparent"
                          value={commentContent} 
                          onChange={(e) => setCommentContent(e.target.value)}
                        />
                        <button 
                          type="submit"
                          disabled={!commentContent.trim()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary disabled:opacity-50 hover:bg-primary/10 rounded-full transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </form>

                    <div className='flex flex-col gap-4'>
                      {comments.map((com) => (
                        <div key={com._id} className='flex gap-3 group'>
                          <Avatar src={com.user.profileImage} size="sm" className="mt-1 shrink-0" />
                          <div className="flex-1 flex gap-2 items-center">
                            <div className="bg-secondary rounded-2xl rounded-tl-none p-3 text-sm max-w-[90%]">
                              <div className='font-semibold mb-1'>{`${com.user.firstName} ${com.user.lastName}`}</div>
                              <div className="text-foreground/80 break-words">{com.content}</div>
                            </div>
                            {userData?._id === author._id && (
                                <button
                                   onClick={() => handleDeleteComment(com._id)}
                                   className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all shrink-0"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

// Utility to merge classes safely
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default Post;
