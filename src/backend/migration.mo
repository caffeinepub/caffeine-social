import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Time "mo:core/Time";

module {
  // Type definitions for old state
  type OldPost = {
    content : Text;
    createdAt : Time.Time;
    id : Nat;
    author : Principal;
    media : ?Storage.ExternalBlob;
    likes : Set.Set<Principal>;
    comments : List.List<Comment>;
  };

  type Comment = {
    id : Nat;
    postId : Nat;
    author : Principal;
    content : Text;
    createdAt : Time.Time;
  };

  type OldUserProfile = {
    username : Text;
    email : Text;
    subscription : Bool;
    followers : ?[Principal];
    following : ?[Principal];
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    posts : Map.Map<Nat, OldPost>;
    stories : Map.Map<Nat, Story>;
    notifications : Map.Map<Nat, Notification>;
    nextCommentId : Nat;
    nextPostId : Nat;
    nextStoryId : Nat;
    nextNotificationId : Nat;
    users : Map.Map<Principal, User>;
    stripeConfig : ?StripeConfiguration;
  };

  // Type definitions for new state
  type NewUserProfile = {
    username : Text;
    email : Text;
    subscription : Bool;
    followers : ?[Principal];
    following : ?[Principal];
    bio : ?Text;
    website : ?Text;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    posts : Map.Map<Nat, OldPost>;
    stories : Map.Map<Nat, Story>;
    notifications : Map.Map<Nat, Notification>;
    nextCommentId : Nat;
    nextPostId : Nat;
    nextStoryId : Nat;
    nextNotificationId : Nat;
    users : Map.Map<Principal, User>;
    stripeConfig : ?StripeConfiguration;
    nextMessageId : Nat;
    savedPosts : Map.Map<Principal, Set.Set<Nat>>;
    messages : Map.Map<Nat, Message>;
  };

  type Story = {
    author : Principal;
    expiresAt : Time.Time;
    id : Nat;
    media : ?Storage.ExternalBlob;
    views : Set.Set<Principal>;
  };

  type User = {
    followers : [Principal];
    following : [Principal];
  };

  type Notification = {
    id : Nat;
    recipientId : Principal;
    _type : Text;
    relatedId : Nat;
    senderId : Principal;
    read : Bool;
    createdAt : Time.Time;
  };

  type StripeConfiguration = {
    secretKey : Text;
    allowedCountries : [Text];
  };

  type Message = {
    id : Nat;
    sender : Principal;
    recipient : Principal;
    content : Text;
    createdAt : Time.Time;
    read : Bool;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      nextMessageId = 1;
      userProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
        func(_principal, oldUserProfile) {
          {
            oldUserProfile with
            bio = null;
            website = null;
          };
        }
      );
      savedPosts = Map.empty<Principal, Set.Set<Nat>>();
      messages = Map.empty<Nat, Message>();
    };
  };
};
