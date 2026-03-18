# 📖 Inkwell — Full-Stack Blogging Platform

A premium, production-ready blogging platform built with **Spring Boot 3.4** (backend) and **React + Vite** (frontend), featuring AI-powered writing tools and deep social engagement.

---

## 🏗️ Architecture Overview

```
inkwell/
├── backend/          # Spring Boot 3.4 REST API (Java 23)
│   ├── controller/   # REST endpoints (now with AI & Analytics)
│   ├── service/      # Business logic (Gemini AI integration)
│   ├── repository/   # JPA data access (PostgreSQL)
│   ├── model/        # JPA entities (with Versioning support)
│   ├── security/     # JWT + Spring Security 6
│   └── config/       # App config (CORS, Data Seeder, Swagger)
│
└── frontend/         # React + Vite SPA
    └── src/          # Custom editorial design (no Tailwind)
```

---

## 🔧 Backend — Spring Boot 3 & Java 23

### Tech Stack
| Concern | Technology |
|---|---|
| **Runtime** | Java 23 (JDK 23) |
| **Framework** | Spring Boot 3.4.3 |
| **AI Engine** | Google Gemini API (via AiService) |
| **Security** | Spring Security 6 + JWT |
| **Database** | PostgreSQL (Port 5433) |
| **API Docs** | Springdoc OpenAPI (Swagger UI) |
| **Build** | Maven |

### 🚀 Advanced Features
- **🧠 AI Suite**: AI Title suggestions, Summary generation, Tagging, and Writing Improvement ("✨ Improve").
- **🕒 Version History**: Automatic snapshots of post content with an "Undo/Restore" UI in the editor.
- **📊 Creator Dashboard**: Real-time analytics showing views, reactions, and follower engagement.
- **💬 Social Interaction**: Nested comment threads, polymorphic reactions (🔥❤️👏), and author following.
- **💾 Auto-save**: Background saving of drafts every 30 seconds.
- **🔖 Reading XP**: Dark Mode, Adjustable Typography, Reading Progress Bar, and "Listen to Article" (Audio).

### API Endpoints (Highlights)

#### 🧠 AI & Analytics
```
POST /api/ai/suggest-titles     – AI-generated catchy titles
POST /api/ai/suggest-summary    – Automatic excerpt generation
POST /api/ai/improve-writing    – Polish grammar and tone
GET  /api/analytics/dashboard   – Real-time creator metrics
```

#### 🕒 Post History
```
GET  /api/posts/{id}/versions   – List all history snapshots
PUT  /api/posts/{id}/autosave   – Background draft sync
```

#### 📢 Social
```
POST /api/posts/{id}/react      – React with 🔥, ❤️, or 👏
POST /api/users/{id}/follow     – Follow your favorite authors
GET  /api/bookmarks             – Your saved reading list
```

### Running the Backend

1. **Requirements**: PostgreSQL running on `localhost:5433` (DB: `blogdb`).
2. **Environment**: Ensure `GOOGLE_AI_API_KEY` is set in your environment or `application.properties`.
3. **Execution**:
```bash
cd backend
./mvnw clean package -DskipTests
java -jar target/blogging-platform-1.0.0.jar
```

Server starts at **http://localhost:8080** (Redirects automatically to Swagger UI).

---

## ⚛️ Frontend — React + Vite

### Tech Stack
- **React 18** (Functional components + Hooks)
- **Vite 5** (Ultra-fast HMR)
- **Custom CSS** (Premium editorial design, HSL color tokens)
- **Routing**: History API based SPA routing (Pure JS)

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:3000** (Proxied to Backend).

---

*Refined with ❤️ — A State-of-the-Art Blogging Experience*
