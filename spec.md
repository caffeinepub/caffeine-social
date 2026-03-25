# Saminsta - Full Feature Fix

## Current State
Saminsta is an Instagram-inspired social app with backend fully working (posts, stories, comments, likes, follow/unfollow, notifications, subscriptions). Frontend pages exist but several interactions are broken or missing.

## Requested Changes (Diff)

### Add
- SideNav rendered inside Layout.tsx (currently missing — desktop sidebar never shows)
- Create Post modal/dialog triggered from the Home FAB button (currently goes to /explore)
- Profile edit form that shows when Edit Profile is clicked (currently editMode state does nothing)
- Create Reel page/route accessible from nav

### Modify
- Layout.tsx: Add `<SideNav />` component
- Home.tsx: FAB button opens create post dialog (not navigate to explore)
- Profile.tsx: Show edit form (username, email inputs) when editMode is true, with save button calling useSaveCallerUserProfile
- Stories.tsx: Fix CreateStoryForm usage — render form inline (not as Dialog trigger) inside the modal
- SideNav.tsx: Add Messages and Notifications links
- BottomNav.tsx: Add Messages icon link

### Remove
- Nothing removed

## Implementation Plan
1. Fix Layout.tsx to include SideNav
2. Fix Home.tsx FAB to open inline create post dialog
3. Fix Profile.tsx to render edit form in editMode
4. Fix Stories.tsx CreateStoryForm to work as inline form
5. Update SideNav/BottomNav to include all nav links
