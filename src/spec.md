# Specification

## Summary
**Goal:** Implement complete Home.tsx feed page with post display, comments viewing, and add comment functionality with automatic refresh.

**Planned changes:**
- Update Home.tsx to fetch and display posts from backend in centered feed layout with gray background
- Add automatic feed refresh polling every 5 seconds using setInterval
- Display comments section below each post showing author and comment text
- Add comment input form with text field and 'Post' button supporting Enter key submission
- Implement handleAddComment function to submit comments via backend and refresh feed
- Add addComment backend function in main.mo to create and append comments to posts
- Define TypeScript Comment and Post type interfaces in Home.tsx

**User-visible outcome:** Users can view a feed of posts with their comments, add new comments to any post using the input form or Enter key, and see the feed automatically update every 5 seconds to show new content.
