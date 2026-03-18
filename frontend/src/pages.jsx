import { useState, useEffect, useRef, useCallback } from "react";

// These will be passed from App via props or re-exported
let apiFetch, useApp, Avatar, PostCard, SkeletonCards, ReactionPicker, renderMarkdown, formatDate, timeAgo, formatNum, reactionEmoji, REACTIONS, postEmoji, initials;

export function injectDeps(deps) {
  apiFetch = deps.apiFetch; useApp = deps.useApp; Avatar = deps.Avatar;
  PostCard = deps.PostCard; SkeletonCards = deps.SkeletonCards; ReactionPicker = deps.ReactionPicker;
  renderMarkdown = deps.renderMarkdown; formatDate = deps.formatDate; timeAgo = deps.timeAgo;
  formatNum = deps.formatNum; reactionEmoji = deps.reactionEmoji; REACTIONS = deps.REACTIONS;
  postEmoji = deps.postEmoji; initials = deps.initials;
}

// ── HomePage ────────────────────────────────────────────────────────────────
export function HomePage() {
  const { navigate, user } = useApp();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [feedTab, setFeedTab] = useState("latest");
  const [search, setSearch] = useState("");
  const [searchTag, setSearchTag] = useState("");
  const [searchAuthor, setSearchAuthor] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef();

  async function loadPosts(reset = false) {
    const p = reset ? 0 : page;
    if (reset) { setLoading(true); setPage(0); }
    else setLoadingMore(true);
    try {
      let res;
      if (feedTab === "trending") {
        res = await apiFetch(`/posts/trending?page=${p}&size=9`);
      } else if (feedTab === "foryou" && user) {
        res = await apiFetch(`/users/me/feed?page=${p}&size=9`);
      } else if (activeCategory) {
        res = await apiFetch(`/posts/category/${activeCategory}?page=${p}&size=9`);
      } else if (search || searchTag || searchAuthor) {
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        if (searchTag) params.set("tag", searchTag);
        if (searchAuthor) params.set("author", searchAuthor);
        params.set("page", p); params.set("size", 9);
        res = await apiFetch(`/posts/search?${params}`);
      } else {
        res = await apiFetch(`/posts?page=${p}&size=9`);
      }
      const data = res.data;
      if (reset) setPosts(data.content);
      else setPosts(prev => [...prev, ...data.content]);
      setHasMore(!data.last);
    } catch { } finally { setLoading(false); setLoadingMore(false); }
  }

  useEffect(() => { loadPosts(true); }, [feedTab, activeCategory]);
  useEffect(() => {
    apiFetch("/categories").then(r => setCategories(r.data || [])).catch(() => {});
    apiFetch("/tags").then(r => setTags(r.data || [])).catch(() => {});
  }, []);

  // Infinite scroll
  const lastRef = useCallback(node => {
    if (loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(p => p + 1);
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loadingMore, hasMore]);

  useEffect(() => { if (page > 0) loadPosts(false); }, [page]);

  function handleSearch(e) {
    e.preventDefault();
    loadPosts(true);
  }

  const heroPost = posts[0];

  return (
    <div className="page">
      <div className="container">
        {/* Search */}
        <form className="search-bar" onSubmit={handleSearch}>
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search articles..." value={search}
            onChange={e => setSearch(e.target.value)} />
          <div className="search-filters">
            <select value={searchTag} onChange={e => { setSearchTag(e.target.value); }}>
              <option value="">All Tags</option>
              {tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
            <select value={searchAuthor} onChange={e => { setSearchAuthor(e.target.value); }}>
              <option value="">All Authors</option>
            </select>
            <button type="submit" className="btn btn-sm btn-secondary">Search</button>
          </div>
        </form>

        {/* Feed Tabs */}
        <div className="category-strip" style={{ borderTop: "none", marginBottom: "2rem" }}>
          <button className={`cat-pill ${feedTab === "latest" ? "active" : ""}`} onClick={() => setFeedTab("latest")}>Latest</button>
          <button className={`cat-pill ${feedTab === "trending" ? "active" : ""}`} onClick={() => setFeedTab("trending")}>🔥 Trending</button>
          {user && <button className={`cat-pill ${feedTab === "foryou" ? "active" : ""}`} onClick={() => setFeedTab("foryou")}>✨ For You</button>}
          <div style={{ width: 1, background: "var(--rule)", margin: "0 0.5rem" }} />
          <button className={`cat-pill ${!activeCategory ? "active" : ""}`} onClick={() => setActiveCategory("")}>All</button>
          {categories.map(c => (
            <button key={c.id} className={`cat-pill ${activeCategory === c.slug ? "active" : ""}`}
              onClick={() => { setActiveCategory(c.slug); setFeedTab("latest"); }}>{c.name}</button>
          ))}
        </div>

        {loading ? <SkeletonCards /> : (
          <>
            {/* Hero Post */}
            {heroPost && feedTab === "latest" && !activeCategory && (
              <div className="hero" onClick={() => navigate("post", { id: heroPost.id })}>
                <div className="hero-label">{heroPost.category || "Featured"}</div>
                <h1 className="hero-title">{heroPost.title}</h1>
                <p className="hero-excerpt">{heroPost.excerpt}</p>
                <div className="hero-meta">
                  <Avatar name={heroPost.author?.username} />
                  <strong>{heroPost.author?.username}</strong> <span className="dot">·</span>
                  {formatDate(heroPost.publishedAt)} <span className="dot">·</span>
                  <span className="read-time">📖 {heroPost.readTime} min read</span>
                  <span className="view-badge">👁 {formatNum(heroPost.viewCount || 0)}</span>
                </div>
              </div>
            )}

            {/* Featured Tags sidebar */}
            {tags.length > 0 && (
              <div className="sidebar-tags">
                {tags.map(t => <span key={t.id} className="tag" onClick={() => { setSearchTag(t.name); loadPosts(true); }}>{t.name}</span>)}
              </div>
            )}

            {/* Post Grid */}
            <div className="posts-grid">
              {(feedTab === "latest" && !activeCategory ? posts.slice(1) : posts).map((post, i) => {
                const isLast = i === (feedTab === "latest" && !activeCategory ? posts.length - 2 : posts.length - 1);
                return (
                  <div key={post.id} ref={isLast ? lastRef : null}>
                    <PostCard post={post} onClick={() => navigate("post", { id: post.id })} />
                  </div>
                );
              })}
            </div>
            {loadingMore && <div className="loading"><span className="spinner" /> Loading more...</div>}
            {!hasMore && posts.length > 0 && <div className="load-more-trigger text-muted" style={{ textAlign: "center", padding: "2rem" }}>You've reached the end ✨</div>}
            {posts.length === 0 && <div className="empty-state"><div className="empty-icon">📝</div><p>No posts found.</p></div>}
          </>
        )}
      </div>
    </div>
  );
}

// ── PostPage ────────────────────────────────────────────────────────────────
export function PostPage() {
  const { pageData, navigate, user, showToast } = useApp();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [readProgress, setReadProgress] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const articleRef = useRef();

  useEffect(() => {
    if (!pageData.id) return;
    setLoading(true);
    apiFetch(`/posts/${pageData.id}`).then(r => {
      setPost(r.data);
      // Load recommended
      apiFetch(`/posts/${pageData.id}/recommended?size=3`).then(r2 => setRecommended(r2.data?.content || [])).catch(() => {});
    }).catch(() => showToast("Post not found", "error")).finally(() => setLoading(false));
  }, [pageData.id]);

  // Reading progress
  useEffect(() => {
    function onScroll() {
      if (!articleRef.current) return;
      const rect = articleRef.current.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      setReadProgress(Math.min(100, (scrolled / total) * 100));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [post]);

  async function handleComment() {
    if (!commentText.trim()) return;
    try {
      await apiFetch(`/posts/${post.id}/comments`, { method: "POST", body: JSON.stringify({ content: commentText }) });
      setCommentText("");
      const r = await apiFetch(`/posts/${post.id}`); setPost(r.data);
      showToast("Comment added!");
    } catch { showToast("Failed to add comment", "error"); }
  }

  async function handleReply(parentId) {
    if (!replyText.trim()) return;
    try {
      await apiFetch(`/posts/${post.id}/comments`, { method: "POST", body: JSON.stringify({ content: replyText, parentCommentId: parentId }) });
      setReplyText(""); setReplyTo(null);
      const r = await apiFetch(`/posts/${post.id}`); setPost(r.data);
      showToast("Reply added!");
    } catch { showToast("Failed to reply", "error"); }
  }

  async function handleReact(postId, type) {
    if (!user) { showToast("Sign in to react", "error"); return; }
    try {
      const res = await apiFetch(`/posts/${postId}/react`, { method: "POST", body: JSON.stringify({ type }) });
      setPost(p => ({ ...p, reactionBreakdown: res.data.breakdown, currentUserReaction: res.data.added ? res.data.type : null, reactionsCount: res.data.total }));
    } catch { showToast("Failed to react", "error"); }
  }

  async function handleBookmark() {
    if (!user) { showToast("Sign in to bookmark", "error"); return; }
    try {
      const res = await apiFetch(`/bookmarks/toggle/${post.id}`, { method: "POST" });
      setPost(p => ({ ...p, bookmarkedByCurrentUser: res.data }));
      showToast(res.data ? "Bookmarked!" : "Removed bookmark");
    } catch { showToast("Failed", "error"); }
  }

  async function handleFollow(userId) {
    if (!user) { showToast("Sign in to follow", "error"); return; }
    try {
      const res = await apiFetch(`/users/${userId}/follow`, { method: "POST" });
      setPost(p => ({ ...p, author: { ...p.author, followedByCurrentUser: res.data, followersCount: p.author.followersCount + (res.data ? 1 : -1) } }));
      showToast(res.data ? "Following!" : "Unfollowed");
    } catch { showToast("Failed", "error"); }
  }

  function toggleSpeech() {
    if (speaking) {
      window.speechSynthesis.cancel(); setSpeaking(false);
    } else {
      const plain = post.content.replace(/<[^>]+>/g, "").replace(/[#*`>\[\]()]/g, "");
      const utt = new SpeechSynthesisUtterance(plain);
      utt.rate = 0.9;
      utt.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utt); setSpeaking(true);
    }
  }

  function renderComment(comment, isReply = false) {
    return (
      <div key={comment.id} className={`comment ${isReply ? "reply" : ""}`}>
        <div className="comment-header">
          <Avatar name={comment.author?.username} />
          <span className="comment-author">{comment.author?.username}</span>
          <span className="comment-time">{timeAgo(comment.createdAt)}</span>
        </div>
        <div className="comment-body">{comment.content}</div>
        {user && !isReply && (
          <button className="reply-btn" onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}>↩ Reply</button>
        )}
        {replyTo === comment.id && (
          <div style={{ marginTop: "0.75rem", marginLeft: "2.5rem" }}>
            <textarea className="form-textarea" style={{ minHeight: "60px" }} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..." />
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button className="btn btn-sm btn-primary" onClick={() => handleReply(comment.id)}>Reply</button>
              <button className="btn btn-sm btn-secondary" onClick={() => setReplyTo(null)}>Cancel</button>
            </div>
          </div>
        )}
        {comment.replies && comment.replies.map(r => renderComment(r, true))}
      </div>
    );
  }

  if (loading) return <div className="loading"><span className="spinner" /> Loading...</div>;
  if (!post) return <div className="empty-state"><p>Post not found.</p></div>;

  return (
    <>
      <div className="reading-progress" style={{ width: `${readProgress}%` }} />
      <div className="container" ref={articleRef}>
        <div className="page">
          <button className="back-btn" onClick={() => navigate("home")}>← Back to articles</button>
          <div className="article-header">
            {post.category && <div className="article-cat">{post.category}</div>}
            <h1 className="article-title">{post.title}</h1>
            <div className="article-meta">
              <div className="article-byline">
                <Avatar name={post.author?.username} size="lg" />
                <div>
                  <div style={{ fontWeight: 600 }}>{post.author?.username}
                    {user && user.username !== post.author?.username && (
                      <button className={`follow-btn ${post.author?.followedByCurrentUser ? "following" : ""}`}
                        style={{ marginLeft: "0.75rem" }} onClick={() => handleFollow(post.author?.id)}>
                        {post.author?.followedByCurrentUser ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--ink-muted)" }}>
                    {post.author?.followersCount || 0} followers
                  </div>
                </div>
              </div>
              <span>{formatDate(post.publishedAt)}</span>
              <span className="read-time">📖 {post.readTime} min</span>
              <span className="view-badge">👁 {formatNum(post.viewCount || 0)} views</span>
            </div>

            {/* Action bar */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <ReactionPicker postId={post.id} breakdown={post.reactionBreakdown || {}} currentReaction={post.currentUserReaction} onReact={handleReact} />
              <button className={`bookmark-btn ${post.bookmarkedByCurrentUser ? "active" : ""}`} onClick={handleBookmark} style={{ fontSize: "1.3rem" }}>
                {post.bookmarkedByCurrentUser ? "🔖" : "📑"}
              </button>
              <div className="audio-player">
                <button onClick={toggleSpeech}>{speaking ? "⏸" : "▶"}</button>
                <span>{speaking ? "Listening..." : "Listen to article"}</span>
              </div>
            </div>
          </div>

          <div className="article-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />

          {post.tags && post.tags.length > 0 && (
            <div className="tags" style={{ marginTop: "3rem" }}>
              {[...post.tags].map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          )}

          {/* Recommended */}
          {recommended.length > 0 && (
            <div className="recommended">
              <h2 className="section-title">Recommended for you</h2>
              <div className="posts-grid">
                {recommended.map(p => <PostCard key={p.id} post={p} onClick={() => navigate("post", { id: p.id })} />)}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="comments-section">
            <h2 className="section-title">Comments ({post.comments?.length || 0})</h2>
            {user ? (
              <div style={{ marginBottom: "2rem" }}>
                <textarea className="form-textarea" value={commentText} onChange={e => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..." style={{ minHeight: "80px" }} />
                <button className="btn btn-primary btn-sm" onClick={handleComment} style={{ marginTop: "0.75rem" }}>Post Comment</button>
              </div>
            ) : (
              <div style={{ padding: "1.5rem", background: "var(--paper-warm)", borderRadius: "var(--radius)", marginBottom: "2rem", textAlign: "center" }}>
                <p className="text-muted">Sign in to join the conversation.</p>
              </div>
            )}
            {post.comments && post.comments.map(c => renderComment(c))}
          </div>
        </div>
      </div>
    </>
  );
}
