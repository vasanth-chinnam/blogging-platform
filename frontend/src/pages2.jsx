import { useState, useEffect, useRef } from "react";

let apiFetch, useApp, Avatar, PostCard, SkeletonCards;

export function injectDeps2(deps) {
  apiFetch = deps.apiFetch; useApp = deps.useApp; Avatar = deps.Avatar;
  PostCard = deps.PostCard; SkeletonCards = deps.SkeletonCards;
}

// ── WritePage ───────────────────────────────────────────────────────────────
export function WritePage() {
  const { pageData, navigate, user, showToast } = useApp();
  const isEdit = !!pageData.editPost;
  const [form, setForm] = useState({
    title: "", content: "", excerpt: "", coverImageUrl: "", category: "", tags: "", status: "DRAFT",
  });
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  const [showSlash, setShowSlash] = useState(false);
  const [aiLoading, setAiLoading] = useState("");
  const [suggestedTitles, setSuggestedTitles] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const textareaRef = useRef();
  const autoSaveTimer = useRef();
  const postIdRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const p = pageData.editPost;
      setForm({ title: p.title || "", content: p.content || "", excerpt: p.excerpt || "",
        coverImageUrl: p.coverImageUrl || "", category: p.category || "",
        tags: p.tags ? [...p.tags].join(", ") : "", status: p.status || "DRAFT" });
      postIdRef.current = p.id;
      loadHistory(p.id);
    }
  }, [isEdit]);

  async function loadHistory(id) {
    try {
      const res = await apiFetch(`/posts/${id}/versions`);
      setHistory(res.data || []);
    } catch {}
  }

  // Auto-save
  useEffect(() => {
    if (!postIdRef.current || !form.content) return;
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setAutoSaveStatus("saving");
      try {
        await apiFetch(`/posts/${postIdRef.current}/autosave`, { method: "PUT", body: JSON.stringify({ content: form.content }) });
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus(""), 3000);
      } catch { setAutoSaveStatus(""); }
    }, 30000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [form.content]);

  function insertMarkdown(prefix, suffix = "") {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart; const end = ta.selectionEnd;
    const selected = form.content.slice(start, end) || "text";
    const newContent = form.content.slice(0, start) + prefix + selected + suffix + form.content.slice(end);
    setForm(f => ({ ...f, content: newContent }));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + prefix.length, start + prefix.length + selected.length); }, 0);
  }

  function handleContentKeyDown(e) {
    if (e.key === "/" && (e.target.selectionStart === 0 || form.content[e.target.selectionStart - 1] === "\n")) {
      setShowSlash(true);
    } else {
      setShowSlash(false);
    }
  }

  function insertSlashBlock(type) {
    const blocks = {
      heading: "\n## ", subheading: "\n### ", code: "\n```\n\n```\n", quote: "\n> ",
      image: "\n![alt text](url)\n", divider: "\n---\n", list: "\n- Item 1\n- Item 2\n- Item 3\n",
    };
    const ta = textareaRef.current;
    const pos = ta.selectionStart;
    const block = blocks[type] || "";
    const newContent = form.content.slice(0, pos) + block + form.content.slice(pos);
    setForm(f => ({ ...f, content: newContent }));
    setShowSlash(false);
    setTimeout(() => ta.focus(), 0);
  }

  async function handleAi(action) {
    if (!form.content.trim()) { showToast("Write some content first", "error"); return; }
    setAiLoading(action);
    try {
      if (action === "titles") {
        const res = await apiFetch("/ai/suggest-titles", { method: "POST", body: JSON.stringify({ content: form.content }) });
        setSuggestedTitles(res.data || []);
      } else if (action === "summary") {
        const res = await apiFetch("/ai/suggest-summary", { method: "POST", body: JSON.stringify({ content: form.content }) });
        setForm(f => ({ ...f, excerpt: res.data }));
        showToast("Summary generated!");
      } else if (action === "tags") {
        const res = await apiFetch("/ai/suggest-tags", { method: "POST", body: JSON.stringify({ content: form.content }) });
        setSuggestedTags(res.data || []);
      } else if (action === "improve") {
        const res = await apiFetch("/ai/improve-writing", { method: "POST", body: JSON.stringify({ content: form.content }) });
        setForm(f => ({ ...f, content: res.data }));
        showToast("Content improved!");
      }
    } catch { showToast("AI suggestion failed", "error"); } finally { setAiLoading(""); }
  }

  async function handleSubmit(status) {
    if (!form.title.trim() || !form.content.trim()) { showToast("Title and content are required", "error"); return; }
    setSaving(true);
    const body = { title: form.title, content: form.content, excerpt: form.excerpt || null,
      coverImageUrl: form.coverImageUrl || null, category: form.category || null,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      status: status || form.status };
    try {
      let res;
      if (isEdit) {
        res = await apiFetch(`/posts/${postIdRef.current}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        res = await apiFetch("/posts", { method: "POST", body: JSON.stringify(body) });
        postIdRef.current = res.data.id;
      }
      showToast(status === "PUBLISHED" ? "Published!" : "Draft saved!");
      if (status === "PUBLISHED") navigate("post", { id: res.data.id });
    } catch (e) { showToast(e.message, "error"); } finally { setSaving(false); }
  }

  if (!user) return <div className="page container"><div className="empty-state"><p>Please sign in to write.</p></div></div>;

  return (
    <div className="page container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem" }}>{isEdit ? "Edit Article" : "New Article"}</h1>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {autoSaveStatus && (
            <span className={`autosave-indicator ${autoSaveStatus}`}>
              {autoSaveStatus === "saving" ? "💾 Saving..." : "✅ Saved"}
            </span>
          )}
          <button className="btn btn-secondary" onClick={() => handleSubmit("DRAFT")} disabled={saving}>Save Draft</button>
          <button className="btn btn-primary" onClick={() => handleSubmit("PUBLISHED")} disabled={saving}>
            {saving ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <div>
          {/* Title */}
          <input className="form-input" style={{ fontSize: "1.5rem", fontFamily: "var(--font-serif)", fontWeight: 700, border: "none", borderBottom: "2px solid var(--rule)", borderRadius: 0, padding: "1rem 0", marginBottom: "1.5rem" }}
            placeholder="Article title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />

          {/* AI Title Suggestions */}
          {suggestedTitles.length > 0 && (
            <div style={{ marginBottom: "1rem", padding: "1rem", background: "var(--paper-warm)", borderRadius: "var(--radius)" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--ink-muted)" }}>✨ AI Title Suggestions</div>
              {suggestedTitles.map((t, i) => (
                <button key={i} style={{ display: "block", background: "none", border: "none", cursor: "pointer", padding: "0.4rem 0", fontSize: "0.9rem", color: "var(--ink-soft)", fontFamily: "var(--font-sans)", textAlign: "left" }}
                  onClick={() => { setForm(f => ({ ...f, title: t })); setSuggestedTitles([]); }}>{t}</button>
              ))}
            </div>
          )}

          {/* Toolbar */}
          <div className="editor-toolbar">
            <button className="toolbar-btn" onClick={() => insertMarkdown("**", "**")} title="Bold"><b>B</b></button>
            <button className="toolbar-btn" onClick={() => insertMarkdown("*", "*")} title="Italic"><em>I</em></button>
            <button className="toolbar-btn" onClick={() => insertMarkdown("\n## ")} title="Heading">H2</button>
            <button className="toolbar-btn" onClick={() => insertMarkdown("\n### ")} title="Subheading">H3</button>
            <button className="toolbar-btn" onClick={() => insertMarkdown("`", "`")} title="Code">{"</>"}</button>
            <button className="toolbar-btn" onClick={() => insertMarkdown("\n```\n", "\n```\n")} title="Code Block">{"[/]"}</button>
            <button className="toolbar-btn" onClick={() => insertMarkdown("\n> ")} title="Quote">❝</button>
            <button className="toolbar-btn" onClick={() => insertMarkdown("\n- ")} title="List">☰</button>
            <button className="toolbar-btn" onClick={() => insertMarkdown("[", "](url)")} title="Link">🔗</button>
            <button className="toolbar-btn" onClick={() => insertMarkdown("![alt](", ")")} title="Image">🖼</button>
            <div className="toolbar-sep" />
            <button className="ai-btn" onClick={() => handleAi("titles")} disabled={!!aiLoading}>
              {aiLoading === "titles" ? "..." : "✨ Titles"}
            </button>
            <button className="ai-btn" onClick={() => handleAi("summary")} disabled={!!aiLoading}>
              {aiLoading === "summary" ? "..." : "✨ Summary"}
            </button>
            <button className="ai-btn" onClick={() => handleAi("tags")} disabled={!!aiLoading}>
              {aiLoading === "tags" ? "..." : "✨ Tags"}
            </button>
            <button className="ai-btn" onClick={() => handleAi("improve")} disabled={!!aiLoading}>
              {aiLoading === "improve" ? "..." : "✨ Improve"}
            </button>
            <div className="toolbar-sep" />
            <button className="toolbar-btn" onClick={() => setShowHistory(!showHistory)} title="History">🕒 History</button>
          </div>

          {showHistory && (
            <div style={{ marginBottom: "1rem", padding: "1rem", background: "var(--paper-warm)", borderRadius: "var(--radius)", border: "1px solid var(--rule)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>Version History</div>
                <button className="btn btn-sm" onClick={() => setShowHistory(false)}>Close</button>
              </div>
              {history.length === 0 ? <p className="text-muted" style={{ fontSize: "0.8rem" }}>No history yet.</p> : (
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {history.map(v => (
                    <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid var(--rule)" }}>
                      <span style={{ fontSize: "0.8rem" }}>{new Date(v.createdAt).toLocaleString()}</span>
                      <button className="btn btn-sm btn-secondary" onClick={() => { if(confirm("Restore this version?")) setForm(f => ({ ...f, content: v.content })); }}>Restore</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content editor */}
          <div style={{ position: "relative" }}>
            <textarea ref={textareaRef} className="form-textarea tall" style={{ borderRadius: "0 0 var(--radius) var(--radius)" }}
              value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              onKeyDown={handleContentKeyDown} placeholder="Write your story... (type / for slash commands)" />
            {showSlash && (
              <div className="slash-menu" style={{ top: "4rem", left: "1rem" }}>
                {[
                  { type: "heading", icon: "📌", label: "Heading", desc: "Large section header" },
                  { type: "subheading", icon: "📎", label: "Subheading", desc: "Smaller header" },
                  { type: "code", icon: "💻", label: "Code Block", desc: "Fenced code block" },
                  { type: "quote", icon: "💬", label: "Quote", desc: "Blockquote" },
                  { type: "image", icon: "🖼", label: "Image", desc: "Embed an image" },
                  { type: "list", icon: "📋", label: "List", desc: "Bullet list" },
                  { type: "divider", icon: "➖", label: "Divider", desc: "Horizontal rule" },
                ].map(item => (
                  <button key={item.type} className="slash-item" onClick={() => insertSlashBlock(item.type)}>
                    <span className="icon">{item.icon}</span>
                    <span><span className="label">{item.label}</span><br /><span className="desc">{item.desc}</span></span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="editor-sidebar">
          <div className="form-group"><label className="form-label">Excerpt / Summary</label>
            <textarea className="form-textarea" value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              placeholder="Brief description..." style={{ minHeight: "80px" }} /></div>
          <div className="form-group"><label className="form-label">Cover Image URL</label>
            <input className="form-input" value={form.coverImageUrl} onChange={e => setForm(f => ({ ...f, coverImageUrl: e.target.value }))}
              placeholder="https://..." /></div>
          <div className="form-group"><label className="form-label">Category</label>
            <input className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Technology" /></div>
          <div className="form-group"><label className="form-label">Tags (comma separated)</label>
            <input className="form-input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="React, JavaScript" />
            {suggestedTags.length > 0 && (
              <div className="tags" style={{ marginTop: "0.5rem" }}>
                {suggestedTags.map(t => (
                  <span key={t} className="tag" onClick={() => setForm(f => ({ ...f, tags: f.tags ? f.tags + ", " + t : t }))}>+ {t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DashboardPage ───────────────────────────────────────────────────────────
export function DashboardPage() {
  const { user, showToast } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiFetch("/analytics/dashboard").then(r => setData(r.data)).catch(() => showToast("Failed to load dashboard", "error")).finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="page container"><div className="empty-state"><p>Sign in to see your dashboard.</p></div></div>;
  if (loading) return <div className="loading"><span className="spinner" /> Loading dashboard...</div>;
  if (!data) return null;

  const maxViews = Math.max(1, ...data.postAnalytics.map(p => p.viewCount));

  return (
    <div className="page container">
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", marginBottom: "2rem" }}>Creator Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{data.totalViews.toLocaleString()}</div><div className="stat-label">Total Views</div></div>
        <div className="stat-card"><div className="stat-value">{data.totalReactions}</div><div className="stat-label">Total Reactions</div></div>
        <div className="stat-card"><div className="stat-value">{data.totalComments}</div><div className="stat-label">Total Comments</div></div>
        <div className="stat-card"><div className="stat-value">{data.totalPosts}</div><div className="stat-label">Total Posts</div></div>
        <div className="stat-card"><div className="stat-value">{data.totalFollowers}</div><div className="stat-label">Followers</div></div>
      </div>
      <h2 className="section-title">Post Performance</h2>
      <div style={{ overflowX: "auto" }}>
        <table className="analytics-table">
          <thead><tr><th>Title</th><th>Status</th><th>Views</th><th>Reactions</th><th>Comments</th><th>Read Time</th><th>Performance</th></tr></thead>
          <tbody>
            {data.postAnalytics.map(p => (
              <tr key={p.postId}>
                <td style={{ fontWeight: 600, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</td>
                <td><span className={`status-badge status-${p.status}`}>{p.status}</span></td>
                <td>{p.viewCount.toLocaleString()}</td>
                <td>{p.reactionsCount}</td>
                <td>{p.commentsCount}</td>
                <td>{p.readTime} min</td>
                <td style={{ minWidth: 120 }}><div className="bar-chart"><div className="fill" style={{ width: `${(p.viewCount / maxViews) * 100}%` }} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── BookmarksPage ───────────────────────────────────────────────────────────
export function BookmarksPage() {
  const { user, navigate, showToast } = useApp();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiFetch("/bookmarks?page=0&size=50").then(r => setPosts(r.data?.content || [])).catch(() => showToast("Failed", "error")).finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="page container"><div className="empty-state"><p>Sign in to see your bookmarks.</p></div></div>;
  if (loading) return <div className="page container"><SkeletonCards count={3} /></div>;

  return (
    <div className="page container">
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", marginBottom: "2rem" }}>Your Bookmarks</h1>
      {posts.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📑</div><p>No bookmarks yet. Save articles to read later!</p></div>
      ) : (
        <div className="posts-grid">
          {posts.map(p => <PostCard key={p.id} post={p} onClick={() => navigate("post", { id: p.id })} />)}
        </div>
      )}
    </div>
  );
}

// ── MyPostsPage ─────────────────────────────────────────────────────────────
export function MyPostsPage() {
  const { user, navigate, showToast } = useApp();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiFetch("/posts/my?page=0&size=50").then(r => setPosts(r.data?.content || [])).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  async function handleDelete(id) {
    if (!confirm("Delete this post?")) return;
    try { await apiFetch(`/posts/${id}`, { method: "DELETE" }); setPosts(p => p.filter(x => x.id !== id)); showToast("Post deleted"); } catch { showToast("Failed to delete", "error"); }
  }

  if (!user) return <div className="page container"><div className="empty-state"><p>Sign in to see your posts.</p></div></div>;
  if (loading) return <div className="page container"><SkeletonCards count={3} /></div>;

  return (
    <div className="page container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem" }}>My Posts</h1>
        <button className="btn btn-primary" onClick={() => navigate("write")}>✍️ New Article</button>
      </div>
      {posts.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">✍️</div><p>You haven't written any posts yet.</p>
          <button className="btn btn-primary" onClick={() => navigate("write")}>Write your first article</button></div>
      ) : (
        <div className="posts-grid">
          {posts.map(p => (
            <div key={p.id} style={{ position: "relative" }}>
              <PostCard post={p} onClick={() => navigate("post", { id: p.id })} />
              <div style={{ display: "flex", gap: "0.5rem", padding: "0.75rem 1.5rem", borderTop: "1px solid var(--rule)", background: "var(--surface)" }}>
                <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); navigate("write", { editPost: p }); }}>✏️ Edit</button>
                <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}>🗑 Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
