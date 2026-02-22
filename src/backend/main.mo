import Array "mo:core/Array";
import Time "mo:core/Time";
import List "mo:core/List";
import Set "mo:core/Set";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Components
  let accessControlState = AccessControl.initState();
  include MixinStorage();
  include MixinAuthorization(accessControlState);

  // Stripe configuration
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Data Models & Views
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

  var nextPostId = 1;
  var nextCommentId = 1;
  var nextStoryId = 1;
  var nextNotificationId = 1;

  // Data Stores
  let posts = Map.empty<Nat, Post>();
  let stories = Map.empty<Nat, Story>();
  let comments = Map.empty<Nat, Comment>();
  let notifications = Map.empty<Nat, Notification>();

  // Post persistent data
  type Post = {
    content : Text;
    createdAt : Time.Time;
    id : Nat;
    likes : Set.Set<Principal>;
    author : Principal;
    media : ?Storage.ExternalBlob;
  };

  // Story persistent data
  type Story = {
    author : Principal;
    expiresAt : Time.Time;
    id : Nat;
    media : ?Storage.ExternalBlob;
    views : Set.Set<Principal>;
  };

  // Initialize persistent parent stores
  module PersistentStore {
    public func init<K, V>() : (Map.Map<K, V>) {
      Map.empty<K, V>();
    };
  };
  let userProfiles = PersistentStore.init<Principal, UserProfile>();
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

  // User Profile Type (required by frontend)
  public type UserProfile = {
    username : Text;
    email : Text;
    subscription : Bool;
  };

  // User Profile Functions (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

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
      createdAt = Time.now();
    };

    posts.add(nextPostId, post);
    nextPostId += 1;

    // Convert to PostView for return
    {
      post with
      likes = post.likes.toArray();
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
    posts.values().toArray().map(
      func(post) {
        {
          post with
          likes = post.likes.toArray();
        };
      }
    ).sort(PostView.compareByCreatedAt);
  };

  // Subscription Functions
  public shared ({ caller }) func subscribeUser() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can subscribe");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?p) { p };
    };

    let updatedProfile = { profile with subscription = true };
    userProfiles.add(caller, updatedProfile);
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

    comments.add(nextCommentId, comment);
    nextCommentId += 1;

    if (post.author != caller) {
      createNotification(post.author, "comment", postId, caller);
    };

    comment;
  };

  public query ({ caller }) func getComments(postId : Nat) : async [Comment] {
    let filtered = comments.values().toArray().filter(
      func(c) { c.postId == postId }
    );
    filtered.sort(Comment.compareByCreatedAt);
  };

  // Notification Functions
  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };

    let filtered = notifications.values().toArray().filter(
      func(n) { n.recipientId == caller }
    );
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

    // Convert to StoryView for return
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
    stories.values().toArray().filter(func(s) { s.expiresAt > now }).map(
      func(story) {
        {
          story with
          views = story.views.toArray();
        };
      }
    );
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
};
