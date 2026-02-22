# Specification

## Summary
**Goal:** Build a social media platform with posts, stories, reels, subscriptions, and engagement features (likes, comments, notifications).

**Planned changes:**
- Implement Motoko backend with User, Post, Story, Comment, and Notification data models
- Create backend functions for creating posts, liking posts, adding comments, managing subscriptions, and fetching feeds
- Build frontend components: PostCard, StoryViewer, ReelPlayer, and Navbar
- Create Home page displaying post feed with infinite scroll
- Create Profile page showing user information and their posts
- Create Subscribe page with Stripe checkout integration
- Implement comment system with backend storage and retrieval
- Add notification tracking for likes, comments, and follows
- Apply cohesive visual theme with warm colors (oranges, yellows, corals), rounded typography, and card-based layouts with shadows and smooth transitions
- Use Internet Identity for authentication
- Store all data in IC canisters without external databases

**User-visible outcome:** Users can create posts with media, view a chronological feed, like and comment on posts, view stories in a carousel, watch reels with video player controls, subscribe to premium features via Stripe, view their profile with posts, and receive notifications for engagement activities.
