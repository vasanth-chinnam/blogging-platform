import { useState, useEffect, useContext, createContext, useCallback } from "react";

// ── Styles ─────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #0A0A0A;
    --ink-soft: #3D3D3D;
    --ink-muted: #737373;
    --paper: #FAF8F5;
    --paper-warm: #F3EFE8;
    --rule: #E8E2D9;
    --accent: #C8453A;
    --accent-light: #FDF0EF;
    --accent-gold: #D4A847;
    --surface: #FFFFFF;
    --shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06);
    --shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
    --radius: 4px;
    --font-serif: 'Playfair Display', Georgia, serif;
    --font-sans: 'DM Sans', system-ui, sans-serif;
    --max-w: 1200px;
    --transition: 0.2s ease;
  }

  html { scroll-behavior: smooth; }
  body {
    font-family: var(--font-sans);
    background: var(--paper);
    color: var(--ink);
    line-height: 1.6;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* Masthead */
  .masthead {
    border-bottom: 3px double var(--ink);
    background: var(--surface);
    position: sticky; top: 0; z-index: 100;
  }
  .masthead-top {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem; height: 64px; max-width: var(--max-w); margin: 0 auto;
  }
  .logo {
    font-family: var(--font-serif);
    font-size: 1.75rem; font-weight: 900;
    letter-spacing: -0.03em; color: var(--ink);
    text-decoration: none; cursor: pointer;
  }
  .logo span { color: var(--accent); }
  .masthead-nav {
    display: flex; align-items: center; gap: 0.25rem;
  }
  .nav-btn {
    background: none; border: none; cursor: pointer;
    font-family: var(--font-sans); font-size: 0.85rem;
    font-weight: 500; color: var(--ink-soft);
    padding: 0.4rem 0.85rem; border-radius: var(--radius);
    transition: all var(--transition); letter-spacing: 0.02em;
  }
  .nav-btn:hover { background: var(--paper-warm); color: var(--ink); }
  .nav-btn.primary {
    background: var(--ink); color: var(--paper);
    font-weight: 600;
  }
  .nav-btn.primary:hover { background: var(--accent); }
  .nav-btn.ghost {
    border: 1.5px solid var(--rule); background: transparent;
  }
  .nav-btn.ghost:hover { border-color: var(--ink); color: var(--ink); }

  /* Category strip */
  .category-strip {
    border-top: 1px solid var(--rule);
    padding: 0 2rem; max-width: var(--max-w); margin: 0 auto;
    display: flex; gap: 0; overflow-x: auto;
    scrollbar-width: none;
  }
  .cat-pill {
    padding: 0.5rem 1rem; font-size: 0.78rem;
    font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.08em; color: var(--ink-muted);
    cursor: pointer; border: none; background: none;
    border-bottom: 2px solid transparent;
    transition: all var(--transition); white-space: nowrap;
    font-family: var(--font-sans);
  }
  .cat-pill:hover, .cat-pill.active {
    color: var(--ink); border-bottom-color: var(--accent);
  }

  /* Layout */
  .container { max-width: var(--max-w); margin: 0 auto; padding: 0 2rem; }
  .page { min-height: calc(100vh - 120px); padding: 3rem 0; }

  /* Hero */
  .hero {
    border-bottom: 1px solid var(--rule);
    padding: 3rem 0 2.5rem;
    margin-bottom: 3rem;
  }
  .hero-label {
    font-size: 0.7rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.15em;
    color: var(--accent); margin-bottom: 0.75rem;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .hero-label::before {
    content: ''; width: 24px; height: 2px; background: var(--accent);
  }
  .hero-title {
    font-family: var(--font-serif);
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 900; line-height: 1.1;
    letter-spacing: -0.02em; color: var(--ink);
    max-width: 700px; margin-bottom: 1rem;
    cursor: pointer;
  }
  .hero-title:hover { color: var(--accent); }
  .hero-excerpt {
    font-size: 1.1rem; color: var(--ink-soft);
    max-width: 560px; line-height: 1.7;
    margin-bottom: 1.5rem;
    font-weight: 300;
  }
  .hero-meta {
    display: flex; align-items: center; gap: 1rem;
    font-size: 0.82rem; color: var(--ink-muted);
  }
  .hero-meta strong { color: var(--ink); }
  .hero-meta .dot { color: var(--rule); }

  /* Grid */
  .posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2.5rem;
  }
  .post-card {
    background: var(--surface);
    border: 1px solid var(--rule);
    border-radius: var(--radius);
    overflow: hidden;
    transition: all var(--transition);
    cursor: pointer;
    display: flex; flex-direction: column;
  }
  .post-card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
    border-color: transparent;
  }
  .post-card-img {
    height: 200px;
    background: linear-gradient(135deg, var(--paper-warm) 0%, var(--rule) 100%);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; flex-shrink: 0;
    font-family: var(--font-serif); font-size: 4rem;
    color: var(--ink-muted);
  }
  .post-card-img img { width: 100%; height: 100%; object-fit: cover; }
  .post-card-body { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
  .post-card-cat {
    font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.12em; color: var(--accent);
    margin-bottom: 0.6rem;
  }
  .post-card-title {
    font-family: var(--font-serif);
    font-size: 1.25rem; font-weight: 700; line-height: 1.3;
    color: var(--ink); margin-bottom: 0.75rem;
    letter-spacing: -0.01em;
  }
  .post-card-excerpt {
    font-size: 0.875rem; color: var(--ink-muted);
    line-height: 1.65; flex: 1; margin-bottom: 1.25rem;
  }
  .post-card-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 1rem; border-top: 1px solid var(--rule);
    font-size: 0.78rem; color: var(--ink-muted);
  }
  .post-card-author { display: flex; align-items: center; gap: 0.5rem; }
  .avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--ink); color: var(--paper);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
    text-transform: uppercase;
  }
  .avatar.lg { width: 48px; height: 48px; font-size: 1rem; }
  .post-stats { display: flex; gap: 1rem; align-items: center; }
  .stat-btn {
    display: flex; align-items: center; gap: 0.3rem;
    background: none; border: none; cursor: pointer;
    font-size: 0.78rem; color: var(--ink-muted);
    font-family: var(--font-sans); padding: 0;
    transition: color var(--transition);
  }
  .stat-btn:hover, .stat-btn.liked { color: var(--accent); }

  /* Tags */
  .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.75rem 0; }
  .tag {
    font-size: 0.72rem; font-weight: 600;
    letter-spacing: 0.04em; text-transform: uppercase;
    padding: 0.2rem 0.6rem; border-radius: 2px;
    background: var(--paper-warm); color: var(--ink-soft);
    border: 1px solid var(--rule); cursor: pointer;
    transition: all var(--transition); font-family: var(--font-sans);
  }
  .tag:hover { background: var(--ink); color: var(--paper); border-color: var(--ink); }

  /* Article detail */
  .article-header { padding: 3rem 0 2rem; border-bottom: 1px solid var(--rule); margin-bottom: 3rem; }
  .article-cat {
    font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.15em; color: var(--accent);
    display: flex; align-items: center; gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .article-cat::before { content: ''; width: 20px; height: 2px; background: var(--accent); }
  .article-title {
    font-family: var(--font-serif);
    font-size: clamp(2rem, 4vw, 3.25rem);
    font-weight: 900; line-height: 1.15; letter-spacing: -0.02em;
    margin-bottom: 1.25rem; max-width: 800px;
  }
  .article-meta {
    display: flex; align-items: center; gap: 1.5rem;
    font-size: 0.82rem; color: var(--ink-muted);
    margin-bottom: 1.5rem;
  }
  .article-byline { display: flex; align-items: center; gap: 0.75rem; }
  .article-body {
    max-width: 720px; margin: 0 auto;
    font-size: 1.0625rem; line-height: 1.85;
    color: var(--ink-soft); font-weight: 300;
  }
  .article-body h1, .article-body h2, .article-body h3 {
    font-family: var(--font-serif); color: var(--ink);
    margin: 2.5rem 0 1rem; font-weight: 700;
    letter-spacing: -0.01em;
  }
  .article-body h2 { font-size: 1.75rem; }
  .article-body h3 { font-size: 1.35rem; }
  .article-body p { margin-bottom: 1.5rem; }
  .article-body pre {
    background: var(--ink); color: #e4e4e4;
    padding: 1.5rem; border-radius: var(--radius);
    overflow-x: auto; font-size: 0.875rem;
    margin: 2rem 0; line-height: 1.6;
  }
  .article-body code {
    background: var(--paper-warm); padding: 0.15em 0.4em;
    border-radius: 2px; font-size: 0.9em;
  }
  .article-body pre code { background: none; padding: 0; }
  .article-body blockquote {
    border-left: 3px solid var(--accent);
    padding-left: 1.5rem; margin: 2rem 0;
    color: var(--ink-soft); font-style: italic;
    font-family: var(--font-serif); font-size: 1.15rem;
  }

  /* Comments */
  .comments-section { margin-top: 4rem; padding-top: 2rem; border-top: 2px solid var(--rule); }
  .section-title {
    font-family: var(--font-serif); font-size: 1.5rem;
    font-weight: 700; margin-bottom: 2rem;
  }
  .comment {
    padding: 1.25rem 0; border-bottom: 1px solid var(--rule);
  }
  .comment-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
  .comment-author { font-weight: 600; font-size: 0.9rem; }
  .comment-time { font-size: 0.78rem; color: var(--ink-muted); }
  .comment-body { font-size: 0.95rem; line-height: 1.7; color: var(--ink-soft); }

  /* Forms */
  .form-group { margin-bottom: 1.5rem; }
  .form-label {
    display: block; font-size: 0.8rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.06em;
    color: var(--ink-soft); margin-bottom: 0.5rem;
  }
  .form-input, .form-textarea, .form-select {
    width: 100%; padding: 0.75rem 1rem;
    border: 1.5px solid var(--rule); border-radius: var(--radius);
    font-family: var(--font-sans); font-size: 0.95rem;
    color: var(--ink); background: var(--surface);
    transition: border-color var(--transition);
    outline: none;
  }
  .form-input:focus, .form-textarea:focus, .form-select:focus {
    border-color: var(--ink);
  }
  .form-textarea { resize: vertical; min-height: 120px; line-height: 1.6; }
  .form-textarea.tall { min-height: 380px; font-family: 'DM Mono', monospace; font-size: 0.875rem; }

  .btn {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.7rem 1.5rem; border-radius: var(--radius);
    font-family: var(--font-sans); font-size: 0.875rem;
    font-weight: 600; cursor: pointer; border: none;
    transition: all var(--transition); text-decoration: none;
    letter-spacing: 0.02em;
  }
  .btn-primary { background: var(--ink); color: var(--paper); }
  .btn-primary:hover { background: var(--accent); }
  .btn-secondary { background: var(--paper-warm); color: var(--ink); border: 1.5px solid var(--rule); }
  .btn-secondary:hover { border-color: var(--ink); }
  .btn-danger { background: #FDF0EF; color: var(--accent); border: 1.5px solid #FBCAC8; }
  .btn-danger:hover { background: var(--accent); color: white; }
  .btn-sm { padding: 0.45rem 1rem; font-size: 0.8rem; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Auth Modal */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.5); display: flex;
    align-items: center; justify-content: center;
    padding: 1rem;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } }
  .modal {
    background: var(--surface); border-radius: 6px;
    padding: 2.5rem; width: 100%; max-width: 420px;
    box-shadow: var(--shadow-lg);
    animation: slideUp 0.2s ease;
  }
  @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } }
  .modal-title {
    font-family: var(--font-serif); font-size: 1.75rem;
    font-weight: 700; margin-bottom: 0.5rem;
  }
  .modal-sub { color: var(--ink-muted); font-size: 0.9rem; margin-bottom: 2rem; }
  .modal-switch {
    text-align: center; margin-top: 1.5rem;
    font-size: 0.875rem; color: var(--ink-muted);
  }
  .modal-switch button {
    background: none; border: none; color: var(--accent);
    font-weight: 600; cursor: pointer; font-size: inherit;
    font-family: inherit;
  }

  /* Editor */
  .editor-layout {
    display: grid; grid-template-columns: 1fr 320px; gap: 2rem;
    align-items: start;
  }
  @media (max-width: 900px) {
    .editor-layout { grid-template-columns: 1fr; }
  }
  .editor-sidebar {
    background: var(--surface); border: 1px solid var(--rule);
    border-radius: var(--radius); padding: 1.5rem;
    position: sticky; top: 80px;
  }

  /* Search */
  .search-bar {
    position: relative; max-width: 480px; margin: 0 auto 2.5rem;
  }
  .search-icon {
    position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
    color: var(--ink-muted); font-size: 1rem;
  }
  .search-input {
    width: 100%; padding: 0.85rem 1rem 0.85rem 2.75rem;
    border: 1.5px solid var(--rule); border-radius: 100px;
    font-size: 0.95rem; font-family: var(--font-sans);
    background: var(--surface); color: var(--ink);
    outline: none; transition: border-color var(--transition);
  }
  .search-input:focus { border-color: var(--ink); }

  /* Toast */
  .toast {
    position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 2000;
    background: var(--ink); color: var(--paper);
    padding: 0.85rem 1.25rem; border-radius: var(--radius);
    font-size: 0.875rem; font-weight: 500;
    box-shadow: var(--shadow-lg);
    animation: toastIn 0.2s ease;
  }
  @keyframes toastIn { from { transform: translateY(8px); opacity: 0; } }
  .toast.error { background: var(--accent); }

  /* Utils */
  .divider { border: none; border-top: 1px solid var(--rule); margin: 2rem 0; }
  .text-muted { color: var(--ink-muted); font-size: 0.875rem; }
  .loading {
    display: flex; justify-content: center; align-items: center;
    padding: 4rem; color: var(--ink-muted);
    gap: 0.75rem; font-size: 0.9rem;
  }
  .spinner {
    width: 20px; height: 20px; border: 2px solid var(--rule);
    border-top-color: var(--ink); border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .empty-state {
    text-align: center; padding: 5rem 2rem;
    color: var(--ink-muted);
  }
  .empty-state .empty-icon {
    font-size: 3rem; margin-bottom: 1rem; opacity: 0.4;
  }
  .empty-state p { font-size: 1rem; margin-bottom: 1.5rem; }
  .back-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    font-size: 0.82rem; font-weight: 600; color: var(--ink-muted);
    cursor: pointer; background: none; border: none;
    font-family: var(--font-sans);
    text-transform: uppercase; letter-spacing: 0.06em;
    margin-bottom: 2rem; transition: color var(--transition);
  }
  .back-btn:hover { color: var(--ink); }
  .profile-section {
    background: var(--surface); border: 1px solid var(--rule);
    border-radius: var(--radius); padding: 2rem;
    margin-bottom: 2rem; display: flex; align-items: center; gap: 1.5rem;
  }
  .read-time {
    display: inline-flex; align-items: center; gap: 0.3rem;
    font-size: 0.78rem;
    padding: 0.2rem 0.6rem; border-radius: 2px;
    background: var(--paper-warm); color: var(--ink-soft);
  }
  .status-badge {
    font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; padding: 0.2rem 0.6rem;
    border-radius: 2px;
  }
  .status-PUBLISHED { background: #ECFDF5; color: #065F46; }
  .status-DRAFT { background: var(--paper-warm); color: var(--ink-soft); }
  .status-ARCHIVED { background: #F3F4F6; color: #6B7280; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 600px) {
    .container { padding: 0 1rem; }
    .masthead-top { padding: 0 1rem; }
    .hero-title { font-size: 2rem; }
    .posts-grid { grid-template-columns: 1fr; }
    .two-col { grid-template-columns: 1fr; }
    .editor-layout { grid-template-columns: 1fr; }
  }
`;

// ── API ─────────────────────────────────────────────────────────────────────
const API_BASE = "/api";

function getToken() { return localStorage.getItem("blog_token"); }

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ── Context ─────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("blog_user")); } catch { return null; }
  });
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState("home");
  const [pageData, setPageData] = useState({});

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const login = useCallback((userData, token) => {
    localStorage.setItem("blog_token", token);
    localStorage.setItem("blog_user", JSON.stringify(userData));
    setUser(userData);
    showToast(`Welcome back, ${userData.username}!`);
  }, [showToast]);

  const logout = useCallback(() => {
    localStorage.removeItem("blog_token");
    localStorage.removeItem("blog_user");
    setUser(null);
    setPage("home");
    showToast("Signed out successfully.");
  }, [showToast]);

  const navigate = useCallback((pg, data = {}) => {
    setPage(pg);
    setPageData(data);
    window.scrollTo(0, 0);
  }, []);

  return (
    <AppContext.Provider value={{ user, login, logout, toast, showToast, page, navigate, pageData }}>
      {children}
      {toast && <div className={`toast ${toast.type === "error" ? "error" : ""}`}>{toast.msg}</div>}
    </AppContext.Provider>
  );
}

function useApp() { return useContext(AppContext); }

// ── Helpers ─────────────────────────────────────────────────────────────────
const EMOJI_MAP = ["📖","✍️","🌍","💡","🔬","🎨","🚀","🧠","🌿","⚡"];
function postEmoji(id) { return EMOJI_MAP[id % EMOJI_MAP.length]; }
function initials(name = "") { return name.slice(0, 2).toUpperCase(); }
function timeAgo(d) {
  if (!d) return "";
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
function renderMarkdown(text) {
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|p|b|u|o|c|p])/gm, '')
    .split('\n').map(line =>
      line.match(/^<(h[123]|pre|blockquote)/) ? line : `<p>${line}</p>`
    ).join('');
}

// ── Components ───────────────────────────────────────────────────────────────

function Avatar({ name, size = "" }) {
  return <div className={`avatar ${size}`}>{initials(name)}</div>;
}

function PostCard({ post, onClick }) {
  const { user, showToast } = useApp();
  const [likes, setLikes] = useState(post.likesCount || 0);
  const [liked, setLiked] = useState(post.likedByCurrentUser || false);

  async function handleLike(e) {
    e.stopPropagation();
    if (!user) { showToast("Please sign in to like posts", "error"); return; }
    try {
      const res = await apiFetch(`/posts/${post.id}/like`, { method: "POST" });
      setLiked(res.data);
      setLikes(l => res.data ? l + 1 : l - 1);
    } catch { showToast("Failed to update like", "error"); }
  }

  return (
    <article className="post-card" onClick={onClick}>
      <div className="post-card-img">
        {post.coverImageUrl
          ? <img src={post.coverImageUrl} alt={post.title} onError={e => { e.target.style.display = "none"; }} />
          : postEmoji(post.id || 0)}
      </div>
      <div className="post-card-body">
        {post.category && <div className="post-card-cat">{post.category}</div>}
        <h2 className="post-card-title">{post.title}</h2>
        {post.excerpt && <p className="post-card-excerpt">{post.excerpt}</p>}
        {post.tags && post.tags.length > 0 && (
          <div className="tags">
            {[...post.tags].slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
        <div className="post-card-footer">
          <div className="post-card-author">
            <Avatar name={post.author?.username} />
            <span><strong>{post.author?.username}</strong> · {timeAgo(post.publishedAt || post.createdAt)}</span>
          </div>
          <div className="post-stats">
            <button className={`stat-btn ${liked ? "liked" : ""}`} onClick={handleLike}>
              {liked ? "♥" : "♡"} {likes}
            </button>
            <span className="text-muted">💬 {post.commentsCount || 0}</span>
            {post.readTime && <span className="read-time">⏱ {post.readTime}m</span>}
          </div>
        </div>
      </div>
      {post.status && post.status !== "PUBLISHED" && (
        <div style={{ padding: "0.5rem 1.5rem", borderTop: "1px solid var(--rule)" }}>
          <span className={`status-badge status-${post.status}`}>{post.status}</span>
        </div>
      )}
    </article>
  );
}

// ── Auth Modal ────────────────────────────────────────────────────────────────
function AuthModal({ onClose }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ usernameOrEmail: "", email: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useApp();

  async function handleSubmit() {
    setError(""); setLoading(true);
    try {
      let res;
      if (mode === "login") {
        res = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ usernameOrEmail: form.usernameOrEmail, password: form.password }) });
      } else {
        res = await apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ username: form.username, email: form.email, password: form.password }) });
      }
      login({ id: res.data.userId, username: res.data.username, email: res.data.email, roles: res.data.roles }, res.data.accessToken);
      onClose();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{mode === "login" ? "Welcome back" : "Join Inkwell"}</div>
        <div className="modal-sub">{mode === "login" ? "Sign in to your account" : "Create your account to start writing"}</div>
        {error && <div style={{ background: "var(--accent-light)", color: "var(--accent)", padding: "0.75rem 1rem", borderRadius: "var(--radius)", marginBottom: "1rem", fontSize: "0.875rem" }}>{error}</div>}
        {mode === "register" && (
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value}))} placeholder="yourname" />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">{mode === "login" ? "Username or Email" : "Email"}</label>
          <input className="form-input" type={mode === "register" ? "email" : "text"} value={mode === "login" ? form.usernameOrEmail : form.email}
            onChange={e => setForm(f => mode === "login" ? {...f, usernameOrEmail: e.target.value} : {...f, email: e.target.value})}
            placeholder={mode === "login" ? "alice or alice@blog.com" : "alice@example.com"} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
            placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleSubmit} disabled={loading}>
          {loading ? <><span className="spinner" />&nbsp;Working...</> : mode === "login" ? "Sign In" : "Create Account"}
        </button>
        {mode === "login" && (
          <div style={{ marginTop: "1rem", background: "var(--paper-warm)", padding: "0.75rem", borderRadius: "var(--radius)", fontSize: "0.8rem", color: "var(--ink-muted)" }}>
            <strong>Demo accounts:</strong> alice/alice123 · bob/bob123 · admin/admin123
          </div>
        )}
        <div className="modal-switch">
          {mode === "login" ? <>Don't have an account? <button onClick={() => setMode("register")}>Sign up</button></> : <>Already have an account? <button onClick={() => setMode("login")}>Sign in</button></>}
        </div>
      </div>
    </div>
  );
}

// ── Pages ────────────────────────────────────────────────────────────────────
function HomePage() {
  const { navigate, user } = useApp();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const categories = ["all", "Technology", "Design", "Career", "Science", "Culture"];

  useEffect(() => { loadPosts(); }, []);

  async function loadPosts() {
    try {
      const res = await apiFetch("/posts?size=20");
      setPosts(res.data?.content || []);
    } catch { }
    finally { setLoading(false); }
  }

  async function handleSearch(q) {
    if (!q.trim()) { loadPosts(); return; }
    setSearching(true);
    try {
      const res = await apiFetch(`/posts/search?q=${encodeURIComponent(q)}&size=20`);
      setPosts(res.data?.content || []);
    } catch { }
    finally { setSearching(false); }
  }

  const featured = posts[0];
  const rest = posts.slice(1);

  const filtered = activeCategory === "all" ? rest : rest.filter(p => p.category === activeCategory);

  return (
    <div className="page">
      <div className="container">
        {/* Search */}
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search stories..."
            value={search}
            onChange={e => { setSearch(e.target.value); if (!e.target.value) loadPosts(); }}
            onKeyDown={e => e.key === "Enter" && handleSearch(search)} />
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading stories...</div>
        ) : (
          <>
            {/* Featured post */}
            {featured && !search && (
              <div className="hero">
                <div className="hero-label">Featured Story</div>
                <h1 className="hero-title" onClick={() => navigate("post", { id: featured.id })}>{featured.title}</h1>
                {featured.excerpt && <p className="hero-excerpt">{featured.excerpt}</p>}
                <div className="hero-meta">
                  <Avatar name={featured.author?.username} />
                  <span>By <strong>{featured.author?.username}</strong></span>
                  <span className="dot">·</span>
                  <span>{timeAgo(featured.publishedAt || featured.createdAt)}</span>
                  {featured.readTime && <><span className="dot">·</span><span className="read-time">⏱ {featured.readTime} min read</span></>}
                  {featured.tags && [...featured.tags].slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
            )}

            {/* Category filter */}
            {!search && (
              <div style={{ display: "flex", gap: "0.25rem", marginBottom: "2rem", overflowX: "auto", scrollbarWidth: "none" }}>
                {categories.map(cat => (
                  <button key={cat} className={`cat-pill ${activeCategory === cat ? "active" : ""}`}
                    onClick={() => setActiveCategory(cat)}>
                    {cat === "all" ? "All Stories" : cat}
                  </button>
                ))}
              </div>
            )}

            {searching && <div className="loading"><div className="spinner" /> Searching...</div>}

            {/* Grid */}
            {filtered.length === 0 && !searching ? (
              <div className="empty-state">
                <div className="empty-icon">✍️</div>
                <p>No stories found{search ? ` for "${search}"` : ""}.</p>
                {user && <button className="btn btn-primary" onClick={() => navigate("write")}>Write the first one</button>}
              </div>
            ) : (
              <div className="posts-grid">
                {filtered.map(p => (
                  <PostCard key={p.id} post={p} onClick={() => navigate("post", { id: p.id })} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PostPage() {
  const { pageData, navigate, user, showToast } = useApp();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch(`/posts/${pageData.id}`);
        setPost(res.data);
        setLiked(res.data.likedByCurrentUser || false);
        setLikes(res.data.likesCount || 0);
      } catch { showToast("Post not found", "error"); navigate("home"); }
      finally { setLoading(false); }
    }
    load();
  }, [pageData.id]);

  async function handleLike() {
    if (!user) { showToast("Sign in to like posts", "error"); return; }
    try {
      const res = await apiFetch(`/posts/${post.id}/like`, { method: "POST" });
      setLiked(res.data);
      setLikes(l => res.data ? l + 1 : l - 1);
    } catch { showToast("Failed to update like", "error"); }
  }

  async function handleComment() {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await apiFetch(`/posts/${post.id}/comments`, { method: "POST", body: JSON.stringify({ content: comment }) });
      setPost(p => ({ ...p, comments: [...(p.comments || []), res.data] }));
      setComment("");
      showToast("Comment added!");
    } catch (e) { showToast(e.message, "error"); }
    finally { setSubmitting(false); }
  }

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;
    try {
      await apiFetch(`/posts/${post.id}`, { method: "DELETE" });
      showToast("Post deleted");
      navigate("home");
    } catch (e) { showToast(e.message, "error"); }
  }

  if (loading) return <div className="loading"><div className="spinner" /> Loading story...</div>;
  if (!post) return null;

  const isOwner = user && (user.username === post.author?.username || user.roles?.includes("ADMIN"));

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: "800px" }}>
        <button className="back-btn" onClick={() => navigate("home")}>← Back to stories</button>

        <header className="article-header">
          {post.category && <div className="article-cat">{post.category}</div>}
          <h1 className="article-title">{post.title}</h1>
          <div className="article-meta">
            <div className="article-byline">
              <Avatar name={post.author?.username} size="lg" />
              <div>
                <div style={{ fontWeight: 600 }}>{post.author?.username}</div>
                <div className="text-muted">{formatDate(post.publishedAt || post.createdAt)}</div>
              </div>
            </div>
            {post.readTime && <span className="read-time">⏱ {post.readTime} min read</span>}
            <span className={`status-badge status-${post.status}`}>{post.status}</span>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="tags">{[...post.tags].map(t => <span key={t} className="tag">{t}</span>)}</div>
          )}
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", alignItems: "center" }}>
            <button className={`btn ${liked ? "btn-danger" : "btn-secondary"} btn-sm`} onClick={handleLike}>
              {liked ? "♥" : "♡"} {likes} {liked ? "Liked" : "Like"}
            </button>
            {isOwner && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate("write", { post })}>✏️ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑 Delete</button>
              </>
            )}
          </div>
        </header>

        {/* Article body */}
        <article className="article-body"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />

        <hr className="divider" />

        {/* Comments */}
        <section className="comments-section">
          <h2 className="section-title">Discussion ({post.comments?.length || 0})</h2>

          {user && (
            <div style={{ marginBottom: "2rem" }}>
              <textarea className="form-textarea" placeholder="Share your thoughts..."
                value={comment} onChange={e => setComment(e.target.value)} rows={3} />
              <button className="btn btn-primary btn-sm" style={{ marginTop: "0.75rem" }}
                onClick={handleComment} disabled={submitting || !comment.trim()}>
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          )}

          {!user && (
            <div style={{ background: "var(--paper-warm)", padding: "1rem 1.25rem", borderRadius: "var(--radius)", marginBottom: "2rem", fontSize: "0.875rem", color: "var(--ink-muted)" }}>
              Sign in to join the discussion.
            </div>
          )}

          {(post.comments || []).map(c => (
            <div key={c.id} className="comment">
              <div className="comment-header">
                <Avatar name={c.author?.username} />
                <span className="comment-author">{c.author?.username}</span>
                <span className="comment-time">{timeAgo(c.createdAt)}</span>
              </div>
              <div className="comment-body">{c.content}</div>
            </div>
          ))}

          {(post.comments || []).length === 0 && (
            <p className="text-muted" style={{ padding: "2rem 0" }}>No comments yet. Be the first!</p>
          )}
        </section>
      </div>
    </div>
  );
}

function WritePage() {
  const { navigate, user, showToast, pageData } = useApp();
  const editing = pageData?.post;
  const [form, setForm] = useState({
    title: editing?.title || "",
    content: editing?.content || "",
    excerpt: editing?.excerpt || "",
    coverImageUrl: editing?.coverImageUrl || "",
    category: editing?.category || "",
    tags: editing?.tags ? [...editing.tags].join(", ") : "",
    status: editing?.status || "DRAFT",
  });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  async function handleSave(status = form.status) {
    if (!form.title.trim() || !form.content.trim()) { showToast("Title and content required", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        content: form.content,
        excerpt: form.excerpt || undefined,
        coverImageUrl: form.coverImageUrl || undefined,
        category: form.category || undefined,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        status,
      };
      let res;
      if (editing) {
        res = await apiFetch(`/posts/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
        showToast("Post updated!");
      } else {
        res = await apiFetch("/posts", { method: "POST", body: JSON.stringify(payload) });
        showToast(status === "PUBLISHED" ? "Post published!" : "Draft saved!");
      }
      navigate("post", { id: res.data.id });
    } catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  }

  if (!user) return (
    <div className="page">
      <div className="container">
        <div className="empty-state">
          <div className="empty-icon">✍️</div>
          <p>Sign in to start writing.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div>
            <button className="back-btn" onClick={() => navigate("home")}>← Back</button>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", fontWeight: 700 }}>
              {editing ? "Edit Story" : "New Story"}
            </h1>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setPreview(!preview)}>
              {preview ? "✏️ Edit" : "👁 Preview"}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleSave("DRAFT")} disabled={saving}>
              {saving ? "Saving..." : "Save Draft"}
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => handleSave("PUBLISHED")} disabled={saving}>
              {saving ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>

        {preview ? (
          <div style={{ background: "var(--surface)", border: "1px solid var(--rule)", borderRadius: "var(--radius)", padding: "3rem" }}>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", fontWeight: 900, marginBottom: "1.5rem" }}>{form.title || "Untitled"}</h1>
            <div className="article-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) }} />
          </div>
        ) : (
          <div className="editor-layout">
            <div>
              <div className="form-group">
                <input className="form-input" style={{ fontSize: "1.25rem", fontFamily: "var(--font-serif)", fontWeight: 700, padding: "1rem" }}
                  placeholder="Your story title..." value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Content (Markdown supported)</label>
                <textarea className="form-textarea tall" placeholder="Write your story here... Markdown is supported.&#10;&#10;## Heading&#10;&#10;**bold**, *italic*, `code`&#10;&#10;```js&#10;// code block&#10;```"
                  value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} rows={20} />
              </div>
            </div>
            <div className="editor-sidebar">
              <div className="form-group">
                <label className="form-label">Excerpt</label>
                <textarea className="form-textarea" placeholder="Brief description..." value={form.excerpt}
                  onChange={e => setForm(f => ({...f, excerpt: e.target.value}))} rows={3} />
              </div>
              <div className="form-group">
                <label className="form-label">Cover Image URL</label>
                <input className="form-input" placeholder="https://..." value={form.coverImageUrl}
                  onChange={e => setForm(f => ({...f, coverImageUrl: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                  <option value="">No category</option>
                  <option>Technology</option>
                  <option>Design</option>
                  <option>Career</option>
                  <option>Science</option>
                  <option>Culture</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input className="form-input" placeholder="React, API, Tutorial" value={form.tags}
                  onChange={e => setForm(f => ({...f, tags: e.target.value}))} />
              </div>
              <div style={{ background: "var(--paper-warm)", padding: "1rem", borderRadius: "var(--radius)", fontSize: "0.8rem", color: "var(--ink-muted)", marginTop: "1rem" }}>
                <strong style={{ color: "var(--ink)" }}>Markdown Tips</strong>
                <div style={{ marginTop: "0.5rem", lineHeight: 1.8 }}>
                  # Heading 1<br />## Heading 2<br />**bold** · *italic*<br />`inline code`<br />
                  ```<br />code block<br />```<br />&gt; blockquote
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MyPostsPage() {
  const { user, navigate } = useApp();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch("/posts/my?size=50");
        setPosts(res.data?.content || []);
      } catch { }
      finally { setLoading(false); }
    }
    if (user) load();
  }, [user]);

  if (!user) return (
    <div className="page"><div className="container">
      <div className="empty-state"><div className="empty-icon">📖</div><p>Sign in to view your posts.</p></div>
    </div></div>
  );

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontWeight: 900 }}>My Stories</h1>
          <button className="btn btn-primary" onClick={() => navigate("write")}>✍️ Write New</button>
        </div>
        {loading ? <div className="loading"><div className="spinner" /></div> : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✍️</div>
            <p>You haven't written anything yet.</p>
            <button className="btn btn-primary" onClick={() => navigate("write")}>Start writing</button>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map(p => <PostCard key={p.id} post={p} onClick={() => navigate("post", { id: p.id })} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── App Shell ──────────────────────────────────────────────────────────────
function App() {
  const { user, logout, navigate, page, showToast } = useApp();
  const [showAuth, setShowAuth] = useState(false);

  const PAGES = { home: HomePage, post: PostPage, write: WritePage, mine: MyPostsPage };
  const PageComponent = PAGES[page] || HomePage;

  return (
    <>
      <style>{STYLES}</style>
      <nav className="masthead">
        <div className="masthead-top">
          <span className="logo" onClick={() => navigate("home")}>Ink<span>well</span></span>
          <div className="masthead-nav">
            {user ? (
              <>
                <button className="nav-btn" onClick={() => navigate("mine")}>My Stories</button>
                <button className="nav-btn primary" onClick={() => navigate("write")}>✍️ Write</button>
                <button className="nav-btn ghost" onClick={logout}>{user.username} · Sign out</button>
              </>
            ) : (
              <>
                <button className="nav-btn" onClick={() => setShowAuth(true)}>Sign In</button>
                <button className="nav-btn primary" onClick={() => setShowAuth(true)}>Get Started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        <PageComponent />
      </main>

      <footer style={{ borderTop: "1px solid var(--rule)", padding: "2rem", textAlign: "center", color: "var(--ink-muted)", fontSize: "0.82rem" }}>
        <strong style={{ fontFamily: "var(--font-serif)" }}>Inkwell</strong> · A modern blogging platform · Built with Spring Boot + React
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}

export default function Root() {
  return <AppProvider><App /></AppProvider>;
}
