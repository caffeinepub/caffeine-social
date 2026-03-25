import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import OutCall "http-outcalls/outcall";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

// Specify the data migration function in with-clause
(with migration = Migration.run)
actor {
  include MixinStorage();

  // Components
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data Models & Views
  public type Message = {
    id : Nat;
    sender : Principal;
    recipient : Principal;
    content : Text;
    createdAt : Time.Time;
    read : Bool;
  };

  module Message {
    public func compareByCreatedAt(a : Message, b : Message) : Order.Order {
      if (a.createdAt > b.createdAt) {
        #less;
      } else if (a.createdAt < b.createdAt) {
        #greater;
      } else { #equal };
    };
  };

  public type Comment = {
    id : Nat;
    postId : Nat;
    author : Principal;
    content : Text;
    createdAt : Time.Time;
  };

  module Comment {
    public func compareByCreatedAt(a : Comment, b : Comment) : Order.Order {
      if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) {
        #greater;
      } else { #equal };
    };
  };

  public type Notification = {
    id : Nat;
    recipientId : Principal;
    _type : Text;
    relatedId : Nat;
    senderId : Principal;
    read : Bool;
    createdAt : Time.Time;
  };

  module Notification {
    public func compareByCreatedAt(a : Notification, b : Notification) : Order.Order {
      if (a.createdAt > b.createdAt) {
        #less;
      } else if (a.createdAt < b.createdAt) {
        #greater;
      } else { #equal };
    };
  };

  public type PostView = {
    id : Nat;
    author : Principal;
    content : Text;
    media : ?Storage.ExternalBlob;
    likes : [Principal];
    comments : [Comment];
    createdAt : Time.Time;
  };

  module PostView {
    public func compareByCreatedAt(a : PostView, b : PostView) : Order.Order {
      if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) {
        #greater;
      } else { #equal };
    };
  };

  public type StoryView = {
    id : Nat;
    author : Principal;
    media : ?Storage.ExternalBlob;
    expiresAt : Time.Time;
    views : [Principal];
  };

  // Persistent data stores (persistence logic provided by CanDB)
  let users = Map.empty<Principal, User>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let posts = Map.empty<Nat, Post>();
  let stories = Map.empty<Nat, Story>();
  let notifications = Map.empty<Nat, Notification>();
  let messages = Map.empty<Nat, Message>();
  let savedPosts = Map.empty<Principal, Set.Set<Nat>>();

  // Post persistent data
  type Post = {
    content : Text;
    createdAt : Time.Time;
    id : Nat;
    author : Principal;
    media : ?Storage.ExternalBlob;
    likes : Set.Set<Principal>;
    comments : List.List<Comment>;
  };

  // Story persistent data
  type Story = {
    author : Principal;
    expiresAt : Time.Time;
    id : Nat;
    media : ?Storage.ExternalBlob;
    views : Set.Set<Principal>;
  };

  // User data (followers/following)
  type User = {
    followers : [Principal];
    following : [Principal];
  };

  // Identity and counters
  var nextPostId = 1;
  var nextCommentId = 1;
  var nextStoryId = 1;
  var nextNotificationId = 1;
  var nextMessageId = 1;

  // Stripe configuration (persistent actor field)
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // User Profile Type (required by frontend)
  public type UserProfile = {
    username : Text;
    email : Text;
    subscription : Bool;
    followers : ?[Principal];
    following : ?[Principal];
    bio : ?Text;
    website : ?Text;
  };

  // Helper function to create notifications
  private func createNotification(recipientId : Principal, _type : Text, relatedId : Nat, senderId : Principal) {
    let notification : Notification = {
      id = nextNotificationId;
      recipientId;
      _type;
      relatedId;
      senderId;
      read = false;
      createdAt = Time.now();
    };
    notifications.add(nextNotificationId, notification);
    nextNotificationId += 1;
  };

  // User Profile Functions (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Authorization: User profiles are public information - any user including guests can view
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Post & Feed Functions
  public shared ({ caller }) func createPost(content : Text, media : ?Storage.ExternalBlob) : async PostView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let post : Post = {
      id = nextPostId;
      author = caller;
      content;
      media;
      likes = Set.empty<Principal>();
      comments = List.empty<Comment>();
      createdAt = Time.now();
    };

    posts.add(nextPostId, post);
    nextPostId += 1;

    // Convert to PostView for return
    {
      post with
      likes = post.likes.toArray();
      comments = post.comments.toArray();
    };
  };

  public shared ({ caller }) func likePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };

    if (post.likes.contains(caller)) { Runtime.trap("Already liked post") };

    post.likes.add(caller);
    posts.add(postId, post);

    // Create notification for post author (if not liking own post)
    if (post.author != caller) {
      createNotification(post.author, "like", postId, caller);
    };
  };

  public query ({ caller }) func getFeed() : async [PostView] {
    // Authorization: Feed is public - any user including guests can view
    posts.values().toArray().map(
      func(post) {
        {
          post with
          likes = post.likes.toArray();
          comments = post.comments.toArray();
        };
      }
    ).sort(PostView.compareByCreatedAt);
  };

  // Save/Unsave Post Functions
  public shared ({ caller }) func savePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save posts");
    };

    // Check if the post exists before saving
    if (not posts.containsKey(postId)) { Runtime.trap("Post not found") };

    let userSavedPosts = switch (savedPosts.get(caller)) {
      case (null) { Set.empty<Nat>() };
      case (?existing) { existing };
    };

    // Verify the post is not already saved
    if (userSavedPosts.contains(postId)) { Runtime.trap("Post already saved") };

    userSavedPosts.add(postId);
    savedPosts.add(caller, userSavedPosts);
  };

  public shared ({ caller }) func unsavePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unsave posts");
    };

    let userSavedPosts = switch (savedPosts.get(caller)) {
      case (null) { Runtime.trap("No saved posts found") };
      case (?existing) { existing };
    };

    if (not userSavedPosts.contains(postId)) { Runtime.trap("Post not saved") };

    userSavedPosts.remove(postId);
    savedPosts.add(caller, userSavedPosts);
  };

  public query ({ caller }) func getSavedPosts() : async [PostView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve saved posts");
    };

    switch (savedPosts.get(caller)) {
      case (null) { [] };
      case (?saved) {
        let sortedPostIds = saved.toArray().sort();

        // Keep post type consistent for array pattern matching
        let allPosts = posts.toArray().map(func((id, post)) { post });

        // Use post ID for array access
        sortedPostIds.filter(
          func(postId) {
            switch (posts.get(postId)) {
              case (null) { false };
              case (?post) { true };
            };
          }
        ).map(
          func(postId) {
            switch (posts.get(postId)) {
              case (null) {
                {
                  id = postId;
                  author = caller;
                  content = "Post not found";
                  media = null;
                  likes = [];
                  comments = [];
                  createdAt = 0;
                };
              };
              case (?post) {
                {
                  post with
                  likes = post.likes.toArray();
                  comments = post.comments.toArray();
                };
              };
            };
          }
        );
      };
    };
  };

  // Direct Messaging Functions
  public shared ({ caller }) func sendMessage(recipientId : Principal, content : Text) : async Message {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let isRecipientUser = AccessControl.hasPermission(accessControlState, recipientId, #user);

    if (not isRecipientUser) {
      Runtime.trap("Recipient not found or not a user");
    };

    let message : Message = {
      id = nextMessageId;
      sender = caller;
      recipient = recipientId;
      content;
      createdAt = Time.now();
      read = false;
    };

    messages.add(nextMessageId, message);
    nextMessageId += 1;

    createNotification(recipientId, "message", message.id, caller);
    message;
  };

  public shared ({ caller }) func getMessages(otherUser : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve messages");
    };

    let filteredMessages = messages.values().toArray().filter(
      func(message) {
        (message.sender == caller and message.recipient == otherUser) or (message.sender == otherUser and message.recipient == caller);
      }
    );

    let sortedMessages = filteredMessages.sort(Message.compareByCreatedAt);

    for (message in sortedMessages.values()) {
      if (message.recipient == caller and not message.read) {
        messages.add(message.id, { message with read = true });
      };
    };
    sortedMessages;
  };

  public shared ({ caller }) func getConversations() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve conversations");
    };

    let conversations = Set.empty<Principal>();

    for (message in messages.values()) {
      if (message.sender == caller) {
        conversations.add(message.recipient);
      } else if (message.recipient == caller) {
        conversations.add(message.sender);
      };
    };

    conversations.toArray();
  };

  // Story Functions
  public shared ({ caller }) func createStory(media : ?Storage.ExternalBlob, expirationHours : Nat) : async StoryView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create stories");
    };

    let expiresAt = Time.now() + (expirationHours * 3600 * 1_000_000_000);

    let story : Story = {
      id = nextStoryId;
      author = caller;
      media;
      expiresAt;
      views = Set.empty<Principal>();
    };

    stories.add(nextStoryId, story);
    nextStoryId += 1;

    // Convert to StoryView for return
    {
      story with
      views = story.views.toArray();
    };
  };

  public shared ({ caller }) func viewStory(storyId : Nat) : async StoryView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stories");
    };

    let story = switch (stories.get(storyId)) {
      case (null) { Runtime.trap("Story not found") };
      case (?s) { s };
    };

    if (Time.now() > story.expiresAt) {
      Runtime.trap("Story has expired");
    };

    if (not story.views.contains(caller)) {
      story.views.add(caller);
      stories.add(storyId, story);
    };

    {
      story with
      views = story.views.toArray();
    };
  };

  public query ({ caller }) func getActiveStories() : async [StoryView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stories");
    };

    let now = Time.now();

    stories.values().toArray().filter(
      func(story) { story.expiresAt > now }
    ).map(
      func(story) {
        {
          story with
          views = story.views.toArray();
        };
      }
    );
  };

  // Comment Functions
  public shared ({ caller }) func addComment(postId : Nat, content : Text) : async Comment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };

    let comment : Comment = {
      id = nextCommentId;
      postId;
      author = caller;
      content;
      createdAt = Time.now();
    };

    // Add comment to post's comments list
    post.comments.add(comment);

    // Update post in the canister
    posts.add(postId, post);

    nextCommentId += 1;

    if (post.author != caller) {
      createNotification(post.author, "comment", postId, caller);
    };

    comment;
  };

  public shared ({ caller }) func addCommentBackend(postId : Nat, text : Text, author : Principal) : async Bool {
    // Authorization check: Only users can add comments
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    if (caller != author) {
      Runtime.trap("Unauthorized: Cannot create comments on behalf of other users");
    };

    let comment : Comment = {
      id = nextCommentId;
      postId;
      author;
      content = text;
      createdAt = Time.now();
    };

    switch (posts.get(postId)) {
      case (?post) {
        post.comments.add(comment);
        posts.add(postId, post);
        nextCommentId += 1;

        if (post.author != caller) {
          createNotification(post.author, "comment", postId, caller);
        };

        true;
      };
      case (null) { false };
    };
  };

  public query ({ caller }) func getComments(postId : Nat) : async [Comment] {
    // Authorization: Comments are public - any user including guests can view
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let comments = post.comments.toArray();
        comments.sort(Comment.compareByCreatedAt);
      };
    };
  };

  // Notification Functions
  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };

    let filtered = notifications.values().toArray().filter(func(notification) { notification.recipientId == caller });
    filtered.sort(Notification.compareByCreatedAt);
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };

    let notification = switch (notifications.get(notificationId)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?n) { n };
    };

    if (notification.recipientId != caller) {
      Runtime.trap("Unauthorized: Can only mark your own notifications as read");
    };

    let updatedNotification = { notification with read = true };
    notifications.add(notificationId, updatedNotification);
  };

  // Stripe Integration
  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?config) {
        await Stripe.getSessionStatus(config, sessionId, transform);
      };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?config) {
        await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
      };
    };
  };

  public shared ({ caller }) func subscribeUser() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can subscribe");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?p) { p };
    };

    let updatedProfile = { profile with subscription = true };
    userProfiles.add(caller, updatedProfile);
  };

  // Social Features
  public shared ({ caller }) func createUser() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create user data");
    };

    if (users.containsKey(caller)) {
      Runtime.trap("User already exists");
    };

    let user : User = {
      followers = [];
      following = [];
    };

    users.add(caller, user);
  };

  public shared ({ caller }) func followUser(followee : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };

    if (caller == followee) {
      Runtime.trap("Cannot follow yourself");
    };

    let user = switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?u) { u };
    };

    switch (user.following.values().find(func(f) { f == followee })) {
      case (?_) { Runtime.trap("Already following user") };
      case (null) {};
    };

    let updatedFollowing = user.following.concat([followee]);
    users.add(caller, { user with following = updatedFollowing });

    let followeeUser = switch (users.get(followee)) {
      case (null) { Runtime.trap("Followee not found") };
      case (?u) { u };
    };

    switch (followeeUser.followers.values().find(func(f) { f == caller })) {
      case (?_) { Runtime.trap("Already a follower") };
      case (null) {};
    };

    let updatedFollowers = followeeUser.followers.concat([caller]);
    users.add(followee, { followeeUser with followers = updatedFollowers });
  };

  public shared ({ caller }) func unfollowUser(followee : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };

    let user = switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?u) { u };
    };

    switch (user.following.values().find(func(f) { f == followee })) {
      case (null) { Runtime.trap("Not following user") };
      case (?_) {};
    };

    let filteredFollowing = user.following.filter(func(f) { f != followee });
    users.add(caller, { user with following = filteredFollowing });

    switch (users.get(followee)) {
      case (null) { Runtime.trap("Followee not found") };
      case (?followeeUser) {
        if (followeeUser.followers.values().find(func(f) { f == caller }) != null) {
          let filteredFollowers = followeeUser.followers.filter(func(f) { f != caller });
          users.add(followee, { followeeUser with followers = filteredFollowers });
        };
      };
    };
  };

  public query ({ caller }) func isFollowing(followee : Principal) : async Bool {
    // Authorization: Public query - anyone can check follow relationships
    if (caller == followee) { return false };

    switch (users.get(caller)) {
      case (null) { false };
      case (?user) {
        switch (user.following.values().find(func(f) { f == followee })) {
          case (null) { false };
          case (?_) { true };
        };
      };
    };
  };

  public query ({ caller }) func amIFollowedBy(follower : Principal) : async Bool {
    // Authorization: Public query - anyone can check follow relationships
    switch (users.get(caller)) {
      case (null) { false };
      case (?user) {
        switch (user.followers.values().find(func(f) { f == follower })) {
          case (null) { false };
          case (?_) { true };
        };
      };
    };
  };

  public query ({ caller }) func getFollowers(user : Principal) : async [Principal] {
    // Authorization: Follower lists are public information
    switch (users.get(user)) {
      case (null) { [] };
      case (?u) { u.followers };
    };
  };

  public query ({ caller }) func getFollowing(user : Principal) : async [Principal] {
    // Authorization: Following lists are public information
    switch (users.get(user)) {
      case (null) { [] };
      case (?u) { u.following };
    };
  };

  public query ({ caller }) func getUserStats(user : Principal) : async {
    followers : Nat;
    following : Nat;
  } {
    // Authorization: User stats are public information
    switch (users.get(user)) {
      case (null) { { followers = 0; following = 0 } };
      case (?u) { { followers = u.followers.size(); following = u.following.size() } };
    };
  };

  public query ({ caller }) func getUserPosts(user : Principal) : async [PostView] {
    // Authorization: User posts are public - any user including guests can view
    let filtered = posts.values().toArray().filter(func(p) { p.author == user });
    filtered.map(
      func(post) {
        {
          post with
          likes = post.likes.toArray();
          comments = post.comments.toArray();
        };
      }
    );
  };
};
