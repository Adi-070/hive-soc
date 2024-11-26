import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { auth } from '../../../lib/firebaseConfig'
import { Button } from '../ui/button'
import { AnimatePresence,motion } from 'framer-motion'
import { Heart, MessageCircle, Share2,Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";


export const FriendsPostInteractions = ({ posts = [] }) => {
  const [comments, setComments] = useState({})
  const [newComments, setNewComments] = useState({})
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [openComments, setOpenComments] = useState(new Set())
  const [likeCounts, setLikeCounts] = useState({})
  const userId = auth.currentUser?.uid

  useEffect(() => {
    if (userId) {
      fetchUserLikes(userId)
    }
  }, [userId])

  useEffect(() => {
    posts.forEach(post => fetchLikesCount(post.id))
  }, [posts])

  const fetchComments = async (postId) => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          profiles:profiles!user_id(
            userName,
            display_picture
          )
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true })

      if (error) throw error

      setComments(prev => ({
        ...prev,
        [postId]: data
      }))
    } catch (err) {
      console.error("Failed to fetch comments:", err)
    }
  }

  const toggleComments = (postId) => {
    setOpenComments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
        if (!comments[postId]) {
          fetchComments(postId)
        }
      }
      return newSet
    })
  }

  const handleAddComment = async (postId) => {
    if (!newComments[postId]?.trim()) return

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: userId,
          content: newComments[postId]
        })
        .select(`
          id,
          content,
          created_at,
          profiles:profiles!user_id(
            userName,
            display_picture
          )
        `)
        .single()

      if (error) throw error

      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data]
      }))

      setNewComments(prev => ({
        ...prev,
        [postId]: ""
      }))
    } catch (err) {
      console.error("Failed to add comment:", err)
    }
  }

  const fetchUserLikes = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", userId)

      if (error) throw error

      setLikedPosts(new Set(data.map(like => like.post_id)))
    } catch (err) {
      console.error("Failed to fetch user likes:", err)
    }
  }

  const fetchLikesCount = async (postId) => {
    try {
      const { count, error } = await supabase
        .from("likes")
        .select("*", { count: 'exact' })
        .eq("post_id", postId)
  
      console.log(`Likes count for post ${postId}:`, {
        count,
        error
      })
  
      if (error) throw error
  
      setLikeCounts(prev => ({
        ...prev,
        [postId]: count || 0
      }))
    } catch (err) {
      console.error(`Failed to fetch likes for post ${postId}:`, err)
    }
  }

  const handleLike = async (postId) => {
    try {
      const isCurrentlyLiked = likedPosts.has(postId)
    
      if (isCurrentlyLiked) {
        // Unlike - remove like record
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId)
      } else {
        // Like - insert like record
        await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: userId })
      }
    
      // Optimistic UI update
      setLikedPosts(prev => {
        const newSet = new Set(prev)
        if (isCurrentlyLiked) {
          newSet.delete(postId)
        } else {
          newSet.add(postId)
        }
        return newSet
      })
    
      // Immediately refresh likes count for the specific post
      await fetchLikesCount(postId)
      
      // Fetch fresh likes data
      await fetchUserLikes(userId)
    } catch (err) {
      console.error("Failed to like/unlike post:", err)
    }
  }
  

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          {/* Post content */}
            <div className="flex flex-wrap justify-between w-full gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`text-muted-foreground hover:text-primary hover:bg-primary/10 text-xs sm:text-sm px-2 sm:px-4 flex-1 sm:flex-none ${
                  likedPosts.has(post.id) ? "text-blue-500" : ""
                }`}
                onClick={() => handleLike(post.id)}
              >
                <Heart 
                  className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${
                    likedPosts.has(post.id) ? "fill-current" : ""
                  }`} 
                />
                <span>{likeCounts[post.id] || 0}</span>
              </Button>
                
              <Button
                  variant="ghost"
                  size="sm"
                  className={`text-muted-foreground hover:text-primary hover:bg-primary/10 text-xs sm:text-sm px-2 sm:px-4 flex-1 sm:flex-none ${
                    openComments.has(post.id) ? "text-blue-500" : ""
                  }`}
                  onClick={() => toggleComments(post.id)}
                >
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span>{comments[post.id]?.length || 0}</span>
                </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 text-xs sm:text-sm px-2 sm:px-4 flex-1 sm:flex-none"
                onClick={() => handleInteraction("share", post.id)}
              >
                <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span>Share</span>
              </Button>
              </div>

              <AnimatePresence>
                {openComments.has(post.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full overflow-hidden"
                  >
                    <div className="space-y-4 pt-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a comment..."
                          value={newComments[post.id] || ""}
                          onChange={(e) => 
                            setNewComments(prev => ({
                              ...prev,
                              [post.id]: e.target.value
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newComments[post.id]?.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {comments[post.id]?.map((comment) => (
                          <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3 items-start"
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarImage
                                src={comment.profiles.display_picture || "/placeholder-avatar.png"}
                                alt={comment.profiles.userName}
                              />
                              <AvatarFallback>
                                {comment.profiles.userName?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {comment.profiles.userName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
