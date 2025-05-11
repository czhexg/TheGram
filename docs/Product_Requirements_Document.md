### **Product Requirements Document (PRD)**

**Project Name**: Social Media Backend (Microservices)  
**Version**: 1.0  
**Author**: Chan Zhe Xiang  
**Last Updated**: 10/05/2025

---

## **1. Core Features**

### **1.1 Authentication & User Management**

**Description**: Secure user registration, login, and profile management.  
**Features**:

-   **User Registration**
    -   Email/password signup with validation (e.g., password strength).
    -   OAuth2 integration (Google, GitHub).
-   **User Login**
    -   JWT-based authentication with refresh tokens.
    -   Rate limiting (5 login attempts/min).
-   **Profile Management**
    -   CRUD operations for user profiles (bio, profile picture, username).
    -   Follow/unfollow other users.
-   **Password Management**
    -   Password reset via email link.
    -   Change password from profile settings.
-   **User Moderation**
    -   Block other users from interacting or seeing your content.

---

### **1.2 Post Management**

**Description**: Create, read, update, and delete posts.  
**Features**:

-   **Create Posts**
    -   Text posts (max 500 chars).
    -   Image uploads (via Media Service).
    -   Hashtag parsing (e.g., `#backend` → stored as metadata).
-   **Interactions**
    -   Comments (threaded replies).
    -   Likes (count visible, list of likers).
-   **Moderation**
    -   Post deletion by author/admins.
    -   Report posts (triggers admin review).

---

### **1.3 Real-Time Notifications**

**Description**: Push updates to users for interactions.  
**Features**:

-   **In-App Notifications**
    -   WebSocket events for new likes/comments.
    -   Mark as read/unread.
-   **Email Alerts**
    -   Daily digest (top posts).
    -   Critical alerts (account login from new device).

---

### **1.4 Feed Generation**

**Description**: Personalized timeline of posts.  
**Features**:

-   **Algorithmic Feed**
    -   Prioritize posts from followed users.
    -   Rank by engagement (likes/comments).
-   **Explore Page**
    -   Trending hashtags.
    -   Popular posts (global).

---

### **1.5 Media Handling**

**Uploads**:

-   Max file sizes:
    -   Images: 10MB (`JPEG/PNG`).
-   **UI must validate** before upload.
-   **CDN Delivery**
    -   Optimized thumbnails (300x300).
    -   Signed URLs for secure access.

---

### **1.6 Admin & Moderation**

**Description**: Tools for platform governance.

**Features**:

-   **User Moderation**
    -   Ban/unban users (temporary or permanent).
    -   View reported users/posts.
-   **Content Moderation**
    -   Delete any post/comment.
    -   Audit logs for all admin actions.

---

### **1.7 Monitoring & Observability**

**Description**: Ensure system health and performance through health checks and centralized logging.  
**Features**:

-   **Health Checks**
    -   Readiness and liveness probes for all services.
-   **Logging**
    -   Centralized logging using Winston and similar libraries.
-   **Alerting**
    -   Configure basic alert mechanisms for service failures or critical issues (e.g., failed logins, service downtime).

---

### **1.8 Search**

**Description**: Enable users to find content and other users.  
**Features**:

-   **Hashtag Search**
    -   Search posts by hashtag.
-   **User Search**
    -   Search users by username/display name.

**Implementation**:

-   Initial version uses **PostgreSQL full-text search** (for simplicity).
-   Future scalability: Can migrate to Elasticsearch/Meilisearch.

---

## **2. Out-of-Scope Features**

_(Explicitly excluded to prevent scope creep)_

-   **Direct Messaging** (could be considered in v2).
-   **Stories** (24-hour ephemeral posts).
-   **Videos**.
-   **Live Streaming**.

---

## **3. Technical Constraints**

-   **API Response Time**: < 500ms for 95% of requests.
-   **Uptime SLA**: 99.9% for core services (auth, posts).
-   **Data Retention**: Posts archived after 2 years.
-   **Cross-Service Transactions**:
    -   Distributed transactions (e.g., post creation → feed update) will use **Saga patterns** for eventual consistency.
    -   Compensating actions ensure rollback on failures (e.g., delete post if feed update fails).

---

## **4. User Stories**

_Structured as: “As a [role], I want to [action], so that I can [benefit].”_

### **4.1 Authentication & User Management**

| ID   | Role           | Action                      | Benefit                                          |
| ---- | -------------- | --------------------------- | ------------------------------------------------ |
| US-1 | Guest User     | Register via email/password | Create an account to access the platform.        |
| US-2 | Guest User     | Log in via email/password   | Gain access to the platform.                     |
| US-3 | Guest User     | Log in via Google OAuth     | Avoid manual password creation.                  |
| US-4 | Logged-in User | Update my profile picture   | Personalize my account.                          |
| US-5 | Logged-in User | Follow other users          | See their posts in my feed.                      |
| US-6 | Logged-in User | Reset my password via email | Regain access if I forget it.                    |
| US-7 | Logged-in User | Change my password          | Improve my account security.                     |
| US-8 | Logged-in User | Change my email             | Keep my account information up to date.          |
| US-9 | Logged-in User | Block another user          | Prevent them from seeing or interacting with me. |
| US-10 | Logged-in User | Unblock a user              | Reconnect with someone previously blocked.       |
| US-11 | Logged-in User | Report another user         | Help moderators identify bad behavior.           |

**Technical Notes**:

-   US-1: Password strength enforced (min 8 chars, special chars).
-   US-3: OAuth scopes limited to `email` and `profile`.

---

### **4.2 Post Management**

| ID    | Role           | Action                                      | Benefit                            |
| ----- | -------------- | ------------------------------------------- | ---------------------------------- |
| US-12 | Logged-in User | Create a text post with hashtags (#backend) | Share my thoughts with followers.  |
| US-13 | Logged-in User | Upload an image to a post                   | Make my content visually engaging. |
| US-14 | Logged-in User | Delete my own post                          | Remove outdated/incorrect content. |
| US-15 | Logged-in User | Like a post                                 | Show appreciation for content.     |
| US-16 | Logged-in User | Remove a like on a post                     | Remove appreciation for content.   |
| US-17 | Logged-in User | Comment on a post                           | Engage in discussions.             |
| US-18 | Logged-in User | Report a post                               | Help keep the platform safe.       |

**Technical Notes**:

-   US-12: Hashtags stored as metadata (searchable).
-   US-18: Reports trigger moderation queue.

---

### **4.3 Real-Time Notifications**

| ID    | Role           | Action                                                     | Benefit                             |
| ----- | -------------- | ---------------------------------------------------------- | ----------------------------------- |
| US-19 | Logged-in User | Receive a WebSocket alert when someone likes my post       | Engage with interactions instantly. |
| US-20 | Logged-in User | Receive a WebSocket alert when someone comments on my post | Engage with interactions instantly. |
| US-21 | Logged-in User | Get an email digest of top posts                           | Stay updated without logging in.    |

**Technical Notes**:

-   US-19/US-20: Notification payload includes `post_id` and `liker_username`.

---

### **4.4 Feed Generation**

| ID    | Role           | Action                                            | Benefit                     |
| ----- | -------------- | ------------------------------------------------- | --------------------------- |
| US-22 | Logged-in User | View a personalized feed of followed users’ posts | See relevant content first. |
| US-23 | Guest User     | Browse trending hashtags on the explore page      | Discover new topics.        |

**Technical Notes**:

-   US-22: Feed ranked by recency.

---

### **4.5 Media Handling**

| ID    | Role           | Action                                          | Benefit                   |
| ----- | -------------- | ----------------------------------------------- | ------------------------- |
| US-24 | Logged-in User | Upload a profile picture in JPEG/PNG format     | Customize my profile.     |
| US-25 | Logged-in User | Attach an image to a post | Share multimedia content. |

---

### **4.6 Admin & Moderation**

| ID    | Role       | Action                 | Benefit                                |
| ----- | ---------- | ---------------------- | -------------------------------------- |
| US-26 | Admin User | View reported users    | Investigate abusive behavior.          |
| US-27 | Admin User | Ban a user for 7 days  | Temporarily restrict violators.        |
| US-28 | Admin User | Permanently ban a user | Remove persistent violators.           |
| US-29 | Admin User | Unban a user           | Restore access for users after review. |
| US-30 | Admin User | Delete any user’s post | Enforce community guidelines.          |

**Technical Notes**:

-   US-27/US-28: Banned users receive an email with reason.

---

### **4.7 Search**

| ID    | Role     | Action                      | Benefit                          |
| ----- | -------- | --------------------------- | -------------------------------- |
| US-31 | Any User | Search for posts by hashtag | Discover related content.        |
| US-32 | Any User | Search for other users      | Connect with people of interest. |

---

## **4.8. Non-Functional Requirements**

_(System-level requirements)_

| ID   | Requirement                                                         |
| ---- | ------------------------------------------------------------------- |
| NF-1 | The system must handle 10,000 concurrent users.                     |
| NF-2 | API responses must be < 500ms for 95% of requests.                  |
| NF-3 | User data must be encrypted in transit (TLS) and at rest (AES-256). |

---

## 5. Acceptance Criteria

### Authentication & User Management

-   **US-1 (Registration)**

    -   ✅ 201 Created + JWT returned
    -   ❌ 400 if email exists or password weak

-   **US-2 (Google Login)**

    -   ✅ 200 OK + JWT returned
    -   ❌ 401 for invalid OAuth token

-   **US-3 (Profile Picture)**

    -   ✅ 200 OK + image URL
    -   ❌ 415 for invalid image format

-   **US-4 (Follow User)**

    -   ✅ 200 OK + updated follower count
    -   ❌ 404 if user doesn't exist

-   **US-5 (Password Reset)**

    -   ✅ Email sent with reset token
    -   ❌ 404 if email not registered

-   **US-6 (Change Password)**

    -   ✅ 200 OK on success
    -   ❌ 401 for wrong current password

-   **US-7 (Block User)**

    -   ✅ 200 OK + user blocked
    -   ❌ 404 if user doesn't exist

-   **US-8 (Unblock User)**

    -   ✅ 200 OK + user unblocked
    -   ❌ 404 if user not previously blocked

-   **US-9 (Report User)**
    -   ✅ 201 Created + report ID
    -   ❌ 400 if report reason missing

### Post Management

-   **US-10 (Create Post)**

    -   ✅ 201 Created + post ID
    -   ❌ 400 for empty content

-   **US-11 (Image Upload)**

    -   ✅ 201 Created + CDN URL
    -   ❌ 413 for file >10MB

-   **US-12 (Delete Own Post)**

    -   ✅ 204 No Content
    -   ❌ 403 if not post owner

-   **US-13 (Like Post)**

    -   ✅ 200 OK + updated like count
    -   ❌ 404 if post not found

-   **US-14 (Unlike Post)**

    -   ✅ 200 OK + updated like count
    -   ❌ 404 if like not found

-   **US-15 (Comment on Post)**

    -   ✅ 201 Created + comment ID
    -   ❌ 400 for empty comment

-   **US-16 (Report Post)**
    -   ✅ 201 Created + report ID
    -   ❌ 400 if reason missing

### Real-Time Notifications

-   **US-17 (Like Notification)**

    -   ✅ WebSocket event sent
    -   ❌ No failure case (async)

-   **US-18 (Email Digest)**
    -   ✅ Email sent at 8AM
    -   ❌ No email if no activity

### Feed Generation

-   **US-19 (Personal Feed)**

    -   ✅ Returns 20 sorted posts
    -   ❌ 401 if not logged in

-   **US-20 (Trending Hashtags)**
    -   ✅ Returns top 10 hashtags
    -   ❌ None (public endpoint)

### Media Handling

-   **US-21 (Upload Profile Picture)**

    -   ✅ Generates thumbnail
    -   ❌ 413 for file >10MB

-   **US-22 (Upload Image/Video)**
    -   ✅ Generates thumbnail for videos
    -   ✅ Transcodes videos to H.264
    -   ❌ 413 for file >50MB

### Admin & Moderation

-   **US-23 (View Reported Users)**

    -   ✅ 200 OK + list of reports
    -   ❌ 401 if not admin

-   **US-24 (Temporary Ban User)**

    -   ✅ Revokes all JWTs + sets expiry
    -   ❌ 401 if not admin

-   **US-25 (Permanent Ban User)**

    -   ✅ Revokes all JWTs + marks user as banned
    -   ❌ 401 if not admin

-   **US-26 (Unban User)**

    -   ✅ User restored + email sent
    -   ❌ 401 if not admin

-   **US-27 (Delete Any Post)**
    -   ✅ 204 No Content
    -   ❌ 401 if not admin

### Search

-   **US-28 (Search Hashtags)**

    -   ✅ Returns list of posts
    -   ❌ 400 for empty query

-   **US-29 (Search Users)**
    -   ✅ Returns matching user profiles
    -   ❌ 400 for invalid input

### Non-Functional

-   **NF-1 (Concurrent Users)**

    -   ✅ Handles 10k users
    -   ❌ None (load test metric)

-   **NF-2 (API Response)**

    -   ✅ <500ms for 95% requests
    -   ❌ None (performance metric)

-   **NF-3 (Data Encryption)**
    -   ✅ TLS + AES-256 enforced
    -   ❌ None (security requirement)
