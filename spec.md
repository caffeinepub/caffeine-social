# Saminsta

## Current State
Full Instagram-like social media app on Internet Computer with:
- Internet Identity login (IC-native, not Firebase)
- Posts, reels, stories, likes, comments, notifications, messages, explore, profile, settings
- Dark theme with pink/purple gradient branding
- Bottom nav on mobile, side nav on desktop
- Blob storage for media uploads

## Requested Changes (Diff)

### Add
- Emoji reactions on posts (😍 🔥 😂 ❤️ 👏) — tap & hold or long-press the heart to show reaction picker; local state per session
- Typing indicator in Messages ChatWindow ("typing..." bubble shown when user is typing, disappears after 2s inactivity)
- Seen indicator on messages (small "Seen" text under last message sent by current user)
- Infinite scroll on Home feed (show 5 posts initially, load 5 more when user scrolls near bottom)
- More hashtags in Explore: #funny, #gym, #dance, #fashion, #tech, #cricket in addition to existing ones
- Save button (bookmark) in ReelItem on Reels page with visual saved state
- Follow button in ReelItem on Reels page
- Smooth entrance animations: posts fade+slide up when they appear in feed
- Pulse animation on the notification bell when there are unread notifications
- Better upload UI: show upload progress percentage in InstagramUploadModal

### Modify
- PostCard: Add emoji reaction bar below the heart button. When user taps the heart button area, show a small popover with 5 emoji options (❤️ 😍 🔥 😂 👏). Selected emoji shows next to like count.
- Messages ChatWindow: Add typing indicator bubble ("typing...") that appears when current user is typing, auto-hides after 2 seconds stop. Also show "Seen" under sent messages that have been read.
- Home.tsx: Implement simple infinite scroll — show 5 posts initially, load 5 more when scroll reaches 80% of page.
- Reels page (ReelItem): Add Save icon (Bookmark) and Follow button to the right-side controls panel.
- index.css: Add keyframe animations for fade-slide-up (post entrance), heart-pop (already exists), and typing-dots (for typing indicator).

### Remove
- Nothing to remove

## Implementation Plan
1. Update `index.css` — add `@keyframes fadeSlideUp`, `@keyframes typingDot`, `.animate-fade-slide-up` utility class, `.typing-indicator` styles
2. Update `PostCard.tsx` — add emoji reaction popover (5 emojis) shown on long-press/hover of heart button; display selected emoji next to like count; add `.animate-fade-slide-up` to article element
3. Update `Home.tsx` — implement infinite scroll: track `visibleCount` state (start 5), use IntersectionObserver on a sentinel div at bottom of list to increment by 5
4. Update `Reels.tsx` — add Bookmark + Follow buttons to ReelItem right-side controls; track saved/following state per reel
5. Update `Messages.tsx` ChatWindow — add typing indicator: when `inputText` changes, show typing bubble for 2s; show "Seen" badge under last sent message when `msg.read === true`
6. Update `Explore.tsx` — expand TRENDING_HASHTAGS array with more tags (#funny, #gym, #dance, #fashion, #tech, #cricket, #viral)
