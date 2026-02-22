import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Comment {
    id: bigint;
    content: string;
    createdAt: Time;
    author: Principal;
    postId: bigint;
}
export interface PostView {
    id: bigint;
    media?: ExternalBlob;
    content: string;
    createdAt: Time;
    author: Principal;
    likes: Array<Principal>;
    comments: Array<Comment>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface StoryView {
    id: bigint;
    media?: ExternalBlob;
    expiresAt: Time;
    views: Array<Principal>;
    author: Principal;
}
export interface Notification {
    id: bigint;
    _type: string;
    createdAt: Time;
    read: boolean;
    relatedId: bigint;
    recipientId: Principal;
    senderId: Principal;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    username: string;
    subscription: boolean;
    email: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: bigint, content: string): Promise<Comment>;
    addCommentBackend(postId: bigint, text: string, author: Principal): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createPost(content: string, media: ExternalBlob | null): Promise<PostView>;
    createStory(media: ExternalBlob | null, expirationHours: bigint): Promise<StoryView>;
    getActiveStories(): Promise<Array<StoryView>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComments(postId: bigint): Promise<Array<Comment>>;
    getFeed(): Promise<Array<PostView>>;
    getNotifications(): Promise<Array<Notification>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    likePost(postId: bigint): Promise<void>;
    markNotificationAsRead(notificationId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    subscribeUser(): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    viewStory(storyId: bigint): Promise<StoryView>;
}
