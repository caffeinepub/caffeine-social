import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { useGetFeed } from '../hooks/useGetFeed';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import PostCard from '../components/PostCard';
import { Loader2, Crown } from 'lucide-react';

export default function Profile() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: allPosts = [], isLoading: postsLoading } = useGetFeed();

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const userPosts = allPosts.filter((post) => post.author.toString() === currentUserPrincipal);

  if (profileLoading || postsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center py-16">
        <p className="text-xl font-semibold mb-2">Profile not found</p>
        <p className="text-muted-foreground">Please complete your profile setup</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white text-3xl">
                {getInitials(userProfile.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-3xl">{userProfile.username}</CardTitle>
                {userProfile.subscription && (
                  <Badge className="gap-1 bg-gradient-to-r from-orange-500 to-amber-500">
                    <Crown className="w-3 h-3" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{userProfile.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{userPosts.length}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {userPosts.reduce((sum, post) => sum + post.likes.length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Likes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {userProfile.subscription ? 'Active' : 'Free'}
              </p>
              <p className="text-sm text-muted-foreground">Plan</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Your Posts</h2>
        {userPosts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">You haven't posted anything yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {userPosts.map((post) => (
              <PostCard key={post.id.toString()} post={post} authorUsername={userProfile.username} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
