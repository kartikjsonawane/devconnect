<div align="center">

# DevConnect

**A full-stack social platform built for developers.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

Share code, showcase projects, get skill endorsements, and connect with developers who speak your language — in real time.

</div>

---

## Features

| | Feature | Details |
|---|---|---|
| 🔐 | **Auth** | JWT access + refresh token rotation, refresh token theft detection, httpOnly cookies |
| 📰 | **Feed** | Personalized feed of posts from followed devs, infinite scroll, trendScore ranking |
| 💬 | **Real-time chat** | Direct messages with typing indicators via Socket.io |
| 🔔 | **Notifications** | In-app notifications for likes, comments, follows, endorsements, connections |
| 👤 | **Developer profiles** | Bio, headline, skills with endorsement counts, experience, and pinned projects |
| 🔗 | **Connections** | LinkedIn-style connection requests — send, accept, reject |
| 📌 | **Bookmarks** | Save posts for later reading |
| 🔍 | **Search** | Full-text search across users and posts via MongoDB text indexes |
| 📊 | **Analytics** | Profile view counts, endorsement breakdown, top posts |
| 🐙 | **GitHub sync** | Fetch and display pinned repos + contribution stats from GitHub |
| **✨** | **AI post ideas** | Personalized writing prompts based on your skill stack |
| 🖼️ | **Image uploads** | Cloudinary CDN delivery with client-side preview |
| 💻 | **Code snippets** | Share syntax-highlighted code with language labels |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, Socket.io-client |
| Backend | Node.js 18, Express.js, Socket.io |
| Database | MongoDB 7 with Mongoose ODM |
| Auth | JWT (15-min access + 7-day refresh tokens), bcrypt, httpOnly cookies |
| Storage | Cloudinary (avatar + post images) |
| Logging | Winston |

---

## Local Setup

### Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **MongoDB** — local instance on `localhost:27017` or [MongoDB Atlas](https://mongodb.com/atlas) (free tier)
- **Cloudinary account** — [cloudinary.com](https://cloudinary.com) (free tier, for image uploads)

### 1 — Clone

```bash
git clone https://github.com/kartikjsonawane/devconnect.git
cd devconnect
```

### 2 — Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in your values (see below)
npm run dev            # starts on http://localhost:5000
```

### 3 — Frontend

```bash
cd frontend
npm install
npm run dev            # starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) — register an account and you're in.

### Environment variables (`backend/.env`)

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/devconnect

JWT_ACCESS_SECRET=replace_with_a_long_random_string
JWT_REFRESH_SECRET=replace_with_a_different_long_random_string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

> Generate secrets with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.

---

## Project Structure

```
devconnect/
├── backend/
│   ├── config/           # DB and Cloudinary init
│   ├── controllers/      # Route handlers (auth, users, posts, chat, …)
│   ├── middleware/        # Auth guard, error handler, rate limiter, validation
│   ├── models/           # Mongoose schemas — User, Post, Comment, Follow, …
│   ├── routes/           # Express routers versioned at /api/v1/
│   ├── services/         # Notification service, GitHub integration
│   ├── utils/            # ApiError, ApiResponse, asyncHandler, logger, tokens
│   └── server.js         # Entry point — Express + Socket.io
│
└── frontend/
    └── src/
        ├── components/
        │   ├── common/    # Avatar, SkeletonLoader, ProtectedRoute
        │   ├── layout/    # Sidebar, RightPanel, MobileNav
        │   └── post/      # PostCard, CreatePost (with AI ideas ✨)
        ├── pages/         # Feed, Explore, Search, Profile, Post, Chat, …
        ├── services/      # Axios API client + per-resource methods
        └── store/         # Zustand stores — auth, socket, post, notification
```

---

## API Reference

All endpoints are prefixed with `/api/v1/`.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Login, returns tokens |
| POST | `/auth/refresh-token` | — | Rotate refresh token |
| POST | `/auth/logout` | ✓ | Invalidate session |
| GET | `/auth/me` | ✓ | Get current user |
| PATCH | `/auth/change-password` | ✓ | Change password |

### Users

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/:username` | Optional | Public profile |
| PUT | `/users/me` | ✓ | Update profile |
| POST | `/users/me/avatar` | ✓ | Upload avatar |
| GET | `/users/trending` | — | Trending developers |
| GET | `/users/recommended` | ✓ | Skill-matched suggestions |
| GET | `/users/me/analytics` | ✓ | Profile analytics |
| GET | `/users/github/:username` | — | GitHub stats |
| POST | `/users/:id/endorse/:skill` | ✓ | Endorse a skill |
| POST | `/users/:id/follow` | ✓ | Follow |
| DELETE | `/users/:id/follow` | ✓ | Unfollow |

### Posts

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/posts` | ✓ | Create post (multipart) |
| GET | `/posts/feed` | ✓ | Personalized feed |
| GET | `/posts/explore` | — | Trending / explore |
| GET | `/posts/:id` | Optional | Single post |
| PUT | `/posts/:id` | ✓ | Edit post |
| DELETE | `/posts/:id` | ✓ | Delete post |
| POST | `/posts/:id/like` | ✓ | Toggle like |
| POST | `/posts/:id/bookmark` | ✓ | Toggle bookmark |
| GET | `/posts/bookmarks` | ✓ | Saved posts |
| GET | `/posts/:id/comments` | — | Comments |
| POST | `/posts/:id/comments` | ✓ | Add comment |
| DELETE | `/posts/:id/comments/:cid` | ✓ | Delete comment |

### Search & AI

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/search?q=&type=users\|posts\|all` | Optional | Full-text search |
| GET | `/ai/post-ideas` | ✓ | Personalized post ideas |

### Social

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/connections/request` | ✓ | Send connection request |
| PUT | `/connections/request/:id` | ✓ | Accept or reject |
| GET | `/connections/requests/pending` | ✓ | Pending requests |
| GET | `/connections` | ✓ | My connections |
| GET | `/notifications` | ✓ | All notifications |
| PUT | `/notifications/read` | ✓ | Mark as read |
| GET | `/chat/conversations` | ✓ | All conversations |
| POST | `/chat/conversations/:id/messages` | ✓ | Send message |

---

## Real-time Events (Socket.io)

**Client → Server**

| Event | Payload | Description |
|---|---|---|
| `post:join` | `postId` | Subscribe to post updates |
| `feed:join` | — | Subscribe to feed |
| `chat:join` | `conversationId` | Join conversation room |
| `chat:typing` | `{ conversationId }` | Typing indicator |
| `chat:stop_typing` | `{ conversationId }` | Stop typing |

**Server → Client**

| Event | Payload | Description |
|---|---|---|
| `post:liked` | `{ postId, likesCount }` | Real-time like count |
| `notification:new` | Notification object | Push notification |
| `user:online` / `user:offline` | `{ userId }` | Presence updates |
| `message:new` | Message object | Incoming chat message |
| `chat:typing` / `chat:stop_typing` | `{ conversationId, userId }` | Typing state |
| `feed:newPost` | Post object | New post from followed user |

---

## Deployment

### Backend → Render

1. Create a **Web Service** on [render.com](https://render.com) and connect this repo
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all environment variables from `.env.example`
6. Set `NODE_ENV=production`

### Frontend → Vercel

1. Import this repo on [vercel.com](https://vercel.com)
2. Root directory: `frontend`
3. Set environment variable: `VITE_API_URL=https://your-render-service.onrender.com/api/v1`
4. Deploy — Vercel auto-detects Vite

### Database → MongoDB Atlas

1. Create a free **M0 cluster** at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Add `0.0.0.0/0` to the IP allowlist (for Render's dynamic IPs)
3. Copy the connection string into `MONGODB_URI`

---

## Architecture Notes

**JWT with refresh token rotation** — Access tokens expire in 15 minutes, minimizing exposure if intercepted. Refresh tokens live in httpOnly cookies (XSS-immune) and are rotated on each use. Reusing a consumed refresh token immediately invalidates the entire token family (theft detection).

**Zustand over Redux** — Less boilerplate for this feature set. The `persist` middleware handles localStorage sync for auth state without extra configuration, and colocating actions with state keeps stores readable.

**Socket.io over raw WebSockets** — Adds rooms (post channels, conversation channels), automatic reconnection, and fallback transports with minimal overhead — important for a social app where real-time reliability matters more than raw throughput.

**MongoDB for search** — Compound text indexes on `User` (name, username, headline, skills) and `Post` (content, tags) enable full-text search across both collections without a separate search service. `$text` with `$meta: textScore` sorting gives relevance ranking.

---

## License

MIT — see [LICENSE](LICENSE).Made by Kartik Sonawane
