# 📖 Inkwell — Full-Stack Blogging Platform

A production-ready blogging platform built with **Spring Boot 3** (backend) and **React + Vite** (frontend), inspired by Medium.

---

## 🏗️ Architecture Overview

```
inkwell/
├── backend/          # Spring Boot 3 REST API
│   ├── controller/   # REST endpoints
│   ├── service/      # Business logic
│   ├── repository/   # JPA data access
│   ├── model/        # JPA entities
│   ├── dto/          # Request/response DTOs
│   ├── security/     # JWT + Spring Security
│   ├── config/       # App configuration
│   └── exception/    # Global error handling
│
└── frontend/         # React + Vite SPA
    └── src/
        └── App.jsx   # Single-file React app
```

---

## 🔧 Backend — Spring Boot 3

### Tech Stack
| Concern | Technology |
|---|---|
| Framework | Spring Boot 3.2 |
| Security | Spring Security 6 + JWT (JJWT 0.11) |
| Persistence | Spring Data JPA + Hibernate |
| Database (dev) | H2 In-Memory |
| Database (prod) | MySQL / PostgreSQL |
| API Docs | Springdoc OpenAPI (Swagger UI) |
| Validation | Jakarta Bean Validation |
| Build | Maven |

### Key Features
- ✅ JWT authentication & authorization
- ✅ Role-based access control (USER / ADMIN)
- ✅ Full CRUD for posts, comments
- ✅ Like/unlike posts
- ✅ Tagging and categorization
- ✅ Slugs for SEO-friendly URLs
- ✅ Pagination & sorting
- ✅ Search by title/content
- ✅ Auto-calculated read time
- ✅ Draft / Published / Archived post states
- ✅ Swagger UI at `/swagger-ui.html`
- ✅ H2 console at `/h2-console`
- ✅ Demo data seeded on startup

### API Endpoints

#### Auth
```
POST /api/auth/register   – Register new user
POST /api/auth/login      – Login (returns JWT)
```

#### Posts
```
GET    /api/posts                     – List published posts (paginated)
GET    /api/posts/{id}                – Get post by ID
GET    /api/posts/slug/{slug}         – Get post by slug
GET    /api/posts/search?q=...        – Search posts
GET    /api/posts/tag/{tagSlug}       – Posts by tag
GET    /api/posts/category/{slug}     – Posts by category
GET    /api/posts/my                  – Current user's posts (auth)
POST   /api/posts                     – Create post (auth)
PUT    /api/posts/{id}                – Update post (auth, owner/admin)
DELETE /api/posts/{id}                – Delete post (auth, owner/admin)
POST   /api/posts/{id}/like           – Toggle like (auth)
```

#### Comments
```
GET    /api/posts/{id}/comments       – Get comments for post
POST   /api/posts/{id}/comments       – Add comment (auth)
PUT    /api/comments/{id}             – Update comment (auth, owner)
DELETE /api/comments/{id}             – Delete comment (auth, owner/admin)
```

#### Categories & Tags
```
GET /api/categories   – List all categories
GET /api/tags         – List all tags
```

### Running the Backend

```bash
cd backend
./mvnw spring-boot:run
```

Server starts at **http://localhost:8080**

**Demo Credentials:**
| User | Password | Role |
|---|---|---|
| alice | alice123 | USER |
| bob | bob123 | USER |
| admin | admin123 | ADMIN |

**Development URLs:**
- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:blogdb`
  - Username: `sa` / Password: `password`

---

## ⚛️ Frontend — React + Vite

### Tech Stack
- React 18 (hooks-based, no class components)
- Vite 5 (dev server, bundler)
- Custom CSS (no Tailwind — hand-crafted editorial design)
- Google Fonts: Playfair Display + DM Sans

### Features
- 🏠 Home page with featured post hero + card grid
- 🔍 Live search
- 📂 Category filtering
- 📄 Full article view with Markdown rendering
- 💬 Comments (add/view)
- ❤️ Like/unlike posts
- ✍️ Rich post editor with Markdown support + preview
- 👤 My Stories dashboard
- 🔐 Auth modal (login + register)
- 📱 Responsive design

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**  
API calls proxy to **http://localhost:8080**

---

## 🚀 Production Setup

### Switch to MySQL

1. In `pom.xml`, swap H2 for MySQL connector
2. Update `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/inkwell
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
```

### Build for Production

```bash
# Backend JAR
cd backend && ./mvnw clean package

# Frontend bundle
cd frontend && npm run build
# Serve /dist with nginx or embed in Spring Boot
```

---

## 📐 Layered Architecture

```
HTTP Request
    ↓
Controller Layer     — Handles HTTP, validates input, delegates to service
    ↓
Service Layer        — Business logic, orchestration, transaction management
    ↓
Repository Layer     — JPA queries, database abstraction
    ↓
Database (H2/MySQL)
```

---

## 🔒 Security Architecture

```
Request → JwtAuthenticationFilter
             ↓ (if Bearer token present)
         JwtTokenProvider.validateToken()
             ↓
         CustomUserDetailsService.loadUserByUsername()
             ↓
         SecurityContextHolder.setAuthentication()
             ↓
         Controller (with @PreAuthorize if needed)
```

---

## 🧩 Entity Relationships

```
User ──< Post ──< Comment
           │
           ├──< Tag (many-to-many)
           │
           └──> Category (many-to-one)
```

---

*Built with ❤️ — Spring Boot + React*
