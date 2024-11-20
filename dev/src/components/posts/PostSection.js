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

  useEffect(() => {
    if (userId) {
      fetchUserPosts(userId);
      fetchUserProfile(userId);
    }
  }, [userId]);

  const fetchUserPosts = async (userId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, content, image_url, category, created_at")
        .eq("user_id", userId);

      if (error) throw error;
      setPosts(data);
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

  const handleInteraction = (type, postId) => {
    console.log(`${type} interaction triggered for post ID: ${postId}`);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-2xl mx-auto space-y-4 px-4 sm:px-6 lg:px-8">
      {posts.length > 0 ? (
        posts.map((post) => (
          <Card key={post.id} className="border-b last:border-b-0">
            <CardHeader className="flex flex-col sm:flex-row items-center sm:space-x-4 pb-2">
              <Avatar className="mb-4 sm:mb-0">
                <AvatarImage
                  src={profile?.display_picture || "/placeholder-avatar.png"}
                  alt={profile?.userName || "User"}
                />
                <AvatarFallback>
                  {profile?.userName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium">
                  {profile?.userName || "Unknown User"}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground truncate">
                  {post.title}
                </CardDescription>
              </div>
              <p className="text-sm text-muted-foreground mt-2 sm:mt-0">
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
            <CardContent>
              <p className="text-base mb-2">{post.content}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.category && post.category.length > 0 ? (
                  post.category.map((cat, index) => (
                    <Badge key={index} variant="secondary">
                      {cat}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary">Uncategorized</Badge>
                )}
              </div>
              {post.image_url && (
                <div className="mt-4">
                  <img
                    src={post.image_url}
                    alt="Post Image"
                    className="w-full h-auto rounded-md"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap justify-between pt-2 gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => handleInteraction("like", post.id)}
              >
                <Heart className="w-4 h-4 mr-2" />
                5
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => handleInteraction("comment", post.id)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                5
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => handleInteraction("share", post.id)}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </CardFooter>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground">No posts available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
