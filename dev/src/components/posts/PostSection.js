'use client';

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";
import { ErrorMessage } from "@/components/dashboard/ErrorMessage";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { ProfileHeader } from "../dashboard/ProfileHeader";

export default function PostsSection({ userId }) {
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());

  useEffect(() => {
    if (userId) {
      fetchUserPosts(userId);
      fetchUserProfile(userId);
      fetchUserLikes(userId);
    }
  }, [userId]);

  const fetchUserLikes = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", userId);

      if (error) throw error;

      setLikedPosts(new Set(data.map(like => like.post_id)));
    } catch (err) {
      console.error("Failed to fetch user likes:", err);
    }
  };

  const fetchUserPosts = async (userId) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id, 
          title, 
          content, 
          image_url, 
          category, 
          created_at,
          likes: likes!post_id(count)
        `)
        .eq("user_id", userId);

      if (error) throw error;

      const transformedPosts = data.map(post => ({
        ...post,
        like_count: post.likes?.[0]?.count || 0
      }));

      setPosts(transformedPosts);
    } catch (err) {
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("userName, display_picture, firstName, lastName")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError("Failed to load user profile. Please try again.");
    }
  };

  const handleLike = async (postId) => {
    try {
      const isCurrentlyLiked = likedPosts.has(postId);
      
      // Optimistic UI update
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                like_count: post.like_count + (isCurrentlyLiked ? -1 : 1)
              }
            : post
        )
      );

      if (isCurrentlyLiked) {
        // Unlike
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);
      } else {
        // Like
        await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: userId });
      }

      // Fetch fresh data to ensure consistency
      await fetchUserPosts(userId);
      await fetchUserLikes(userId);
    } catch (err) {
      console.error("Failed to like/unlike post:", err);
      // Revert optimistic updates on error
      await fetchUserPosts(userId);
      await fetchUserLikes(userId);
    }
  };

  const handleInteraction = (type, postId) => {
    console.log(`${type} interaction triggered for post ID: ${postId}`);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {posts.length > 0 ? (
        posts.map((post) => (
          <Card key={post.id} className="border-b last:border-b-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 pb-2">
              <div className="flex items-center space-x-4 sm:space-x-0">
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                  <AvatarImage
                    src={profile?.display_picture || "/placeholder-avatar.png"}
                    alt={profile?.userName || "User"}
                  />
                  <AvatarFallback>
                    {profile?.userName?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 min-w-0 space-y-1 mt-3 sm:mt-0">
                <CardTitle className="text-sm sm:text-base font-medium">
                  {profile?.userName || "Unknown User"}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground truncate">
                  {post.title}
                </CardDescription>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-0">
                {post.created_at
                  ? new Date(post.created_at.replace(" ", "T")).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "Unknown date"}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm sm:text-base text-gray-700">{post.content}</p>
              
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {post.category && post.category.length > 0 ? (
                  post.category.map((cat, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="text-xs sm:text-sm px-2 py-1"
                    >
                      {cat}
                    </Badge>
                  ))
                ) : (
                  <Badge 
                    variant="secondary"
                    className="text-xs sm:text-sm px-2 py-1"
                  >
                    Uncategorized
                  </Badge>
                )}
              </div>

              {post.image_url && (
                <div className="relative w-full">
                  <img
                    src={post.image_url}
                    alt="Post Image"
                    className="w-full h-auto rounded-md object-cover max-h-[400px]"
                    loading="lazy"
                  />
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-wrap justify-between pt-2 gap-1 sm:gap-2 border-t">
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
                <span>{post.like_count || 0}</span>
              </Button>
                
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 text-xs sm:text-sm px-2 sm:px-4 flex-1 sm:flex-none"
                onClick={() => handleInteraction("comment", post.id)}
              >
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span>5</span>
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
            </CardFooter>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="text-center py-8 sm:py-12">
            <p className="text-muted-foreground text-sm sm:text-base">
              No posts available.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}