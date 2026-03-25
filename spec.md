# Saminsta

## Current State
Saminsta is a full-stack Instagram-inspired social media app on IC. The backend (Motoko) has: posts, stories, notifications, users, userProfiles, follow/unfollow, likes, comments, Stripe subscriptions, blob-storage for media. The frontend has pages for Home, Profile, Reels, Stories, Explore, Messages, Notifications, Subscribe. Core features exist but several are missing or incomplete.

## Requested Changes (Diff)

### Add
- `bio` and `website` fields to UserProfile (backend + profile edit UI)
- `savePost` / `unsavePost` / `getSavedPosts` backend functions
- `sendMessage` / `getMessages` / `getConversations` backend functions (basic DM system)
- Settings page (/settings) with profile editing, account info, notification preferences
- Reels upload button in Reels page (video file upload using ExternalBlob)
- Saved posts tab in Profile page wired to real getSavedPosts
- Save/bookmark button on PostCard
- Improved Messages page with conversation list + chat UI
- Post detail modal/view with full comment thread

### Modify
- UserProfile type: add optional `bio` and `website` fields
- Profile page edit form: include bio and website fields
- Reels page: add floating Create Reel button that opens upload dialog (video support)
- Explore page: improve to show trending hashtags section at top
- SideNav: add Settings link
- BottomNav: add Settings link

### Remove
- Nothing removed

## Implementation Plan
1. Update Motoko backend: add bio/website to UserProfile, add savePost/unsavePost/getSavedPosts, add sendMessage/getMessages/getConversations
2. Generate new frontend bindings (backend.d.ts auto-updates)
3. Update Profile page: bio/website fields in edit form, wire saved posts tab
4. Add Reels upload dialog to Reels page with video upload
5. Add Settings page (/settings) with full profile management
6. Update Messages page with real conversation system
7. Add save button to PostCard
8. Add Settings link to SideNav and BottomNav
9. Wire all new hooks for saved posts, messages, settings
