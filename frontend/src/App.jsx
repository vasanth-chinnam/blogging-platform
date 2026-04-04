import { useState, useEffect, useContext, createContext, useCallback, useRef } from "react";

// ── Styles ─────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #0A0A0A; --ink-soft: #3D3D3D; --ink-muted: #737373;
    --paper: #FAF8F5; --paper-warm: #F3EFE8; --rule: #E8E2D9;
    --accent: #C8453A; --accent-light: #FDF0EF; --accent-gold: #D4A847;
    --surface: #FFFFFF;
    --shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06);
    --shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
    --radius: 8px; --font-serif: 'Playfair Display', Georgia, serif;
    --font-sans: 'DM Sans', system-ui, sans-serif;
    --max-w: 1200px; --transition: 0.25s ease;
    --glass: rgba(255,255,255,0.7); --glass-border: rgba(255,255,255,0.3);
  }
  [data-theme="dark"] {
    --ink: #E8E6E3; --ink-soft: #B8B5B0; --ink-muted: #8A8785;
    --paper: #121212; --paper-warm: #1E1E1E; --rule: #2A2A2A;
    --accent: #EF6461; --accent-light: #2D1B1B; --accent-gold: #E8C468;
    --surface: #181818;
    --shadow: 0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2);
    --shadow-lg: 0 8px 32px rgba(0,0,0,0.4);
    --glass: rgba(30,30,30,0.8); --glass-border: rgba(255,255,255,0.08);
  }
  html { scroll-behavior: smooth; }
  body { font-family: var(--font-sans); background: var(--paper); color: var(--ink); line-height: 1.6; min-height: 100vh; -webkit-font-smoothing: antialiased; transition: background var(--transition), color var(--transition); }
  body[data-font-size="small"] { font-size: 14px; }
  body[data-font-size="medium"] { font-size: 16px; }
  body[data-font-size="large"] { font-size: 18px; }

  /* Reading Progress Bar */
  .reading-progress { position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(90deg, var(--accent), var(--accent-gold)); z-index: 9999; transition: width 0.1s linear; border-radius: 0 2px 2px 0; }

  /* Masthead */
  .masthead { border-bottom: 1px solid var(--rule); background: var(--glass); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 100; transition: all var(--transition); }
  .masthead-top { display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; height: 64px; max-width: var(--max-w); margin: 0 auto; }
  .logo { font-family: var(--font-serif); font-size: 1.75rem; font-weight: 900; letter-spacing: -0.03em; color: var(--ink); text-decoration: none; cursor: pointer; }
  .logo span { color: var(--accent); }
  .masthead-nav { display: flex; align-items: center; gap: 0.25rem; }
  .nav-btn { background: none; border: none; cursor: pointer; font-family: var(--font-sans); font-size: 0.85rem; font-weight: 500; color: var(--ink-soft); padding: 0.4rem 0.85rem; border-radius: var(--radius); transition: all var(--transition); letter-spacing: 0.02em; }
  .nav-btn:hover { background: var(--paper-warm); color: var(--ink); transform: translateY(-1px); }
  .nav-btn.primary { background: var(--ink); color: var(--paper); font-weight: 600; }
  .nav-btn.primary:hover { background: var(--accent); transform: translateY(-1px); }
  .nav-btn.ghost { border: 1.5px solid var(--rule); background: transparent; }
  .nav-btn.ghost:hover { border-color: var(--ink); color: var(--ink); }

  /* Theme toggle */
  .theme-toggle { background: var(--paper-warm); border: 1px solid var(--rule); border-radius: 20px; padding: 0.3rem 0.6rem; cursor: pointer; font-size: 1rem; transition: all var(--transition); display: flex; align-items: center; }
  .theme-toggle:hover { border-color: var(--ink-muted); transform: scale(1.1); }

  /* Font size control */
  .font-ctrl { display: flex; align-items: center; gap: 0.3rem; background: var(--paper-warm); border: 1px solid var(--rule); border-radius: 20px; padding: 0.2rem 0.5rem; }
  .font-ctrl button { background: none; border: none; cursor: pointer; padding: 0.1rem 0.3rem; font-size: 0.75rem; color: var(--ink-muted); border-radius: 4px; font-weight: 700; }
  .font-ctrl button:hover, .font-ctrl button.active { color: var(--accent); background: var(--accent-light); }

  /* Category strip */
  .category-strip { border-top: 1px solid var(--rule); padding: 0 2rem; max-width: var(--max-w); margin: 0 auto; display: flex; gap: 0; overflow-x: auto; scrollbar-width: none; }
  .cat-pill { padding: 0.5rem 1rem; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-muted); cursor: pointer; border: none; background: none; border-bottom: 2px solid transparent; transition: all var(--transition); white-space: nowrap; font-family: var(--font-sans); }
  .cat-pill:hover, .cat-pill.active { color: var(--ink); border-bottom-color: var(--accent); }

  /* Layout */
  .container { max-width: var(--max-w); margin: 0 auto; padding: 0 2rem; }
  .page { min-height: calc(100vh - 120px); padding: 3rem 0; }

  /* Hero */
  .hero { border-bottom: 1px solid var(--rule); padding: 3rem 0 2.5rem; margin-bottom: 3rem; }
  .hero-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: var(--accent); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
  .hero-label::before { content: ''; width: 24px; height: 2px; background: var(--accent); }
  .hero-title { font-family: var(--font-serif); font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 900; line-height: 1.1; letter-spacing: -0.02em; color: var(--ink); max-width: 700px; margin-bottom: 1rem; cursor: pointer; transition: color var(--transition); }
  .hero-title:hover { color: var(--accent); }
  .hero-excerpt { font-size: 1.1rem; color: var(--ink-soft); max-width: 560px; line-height: 1.7; margin-bottom: 1.5rem; font-weight: 300; }
  .hero-meta { display: flex; align-items: center; gap: 1rem; font-size: 0.82rem; color: var(--ink-muted); flex-wrap: wrap; }
  .hero-meta strong { color: var(--ink); }
  .hero-meta .dot { color: var(--rule); }

  /* Grid */
  .posts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; }
  .post-card { background: var(--surface); border: 1px solid var(--rule); border-radius: var(--radius); overflow: hidden; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); cursor: pointer; display: flex; flex-direction: column; }
  .post-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-4px); border-color: transparent; }
  .post-card-img { height: 200px; background: linear-gradient(135deg, var(--paper-warm) 0%, var(--rule) 100%); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; font-family: var(--font-serif); font-size: 4rem; color: var(--ink-muted); position: relative; }
  .post-card-img img { width: 100%; height: 100%; object-fit: cover; }
  .post-card-body { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
  .post-card-cat { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent); margin-bottom: 0.6rem; }
  .post-card-title { font-family: var(--font-serif); font-size: 1.25rem; font-weight: 700; line-height: 1.3; color: var(--ink); margin-bottom: 0.75rem; letter-spacing: -0.01em; }
  .post-card-excerpt { font-size: 0.875rem; color: var(--ink-muted); line-height: 1.65; flex: 1; margin-bottom: 1.25rem; }
  .post-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--rule); font-size: 0.78rem; color: var(--ink-muted); }
  .post-card-author { display: flex; align-items: center; gap: 0.5rem; }
  .avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent-gold)); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0; text-transform: uppercase; }
  .avatar.lg { width: 48px; height: 48px; font-size: 1rem; }
  .post-stats { display: flex; gap: 0.75rem; align-items: center; }
  .stat-btn { display: flex; align-items: center; gap: 0.3rem; background: none; border: none; cursor: pointer; font-size: 0.78rem; color: var(--ink-muted); font-family: var(--font-sans); padding: 0.2rem 0.4rem; border-radius: 4px; transition: all var(--transition); }
  .stat-btn:hover { background: var(--paper-warm); color: var(--ink); }
  .stat-btn.active { color: var(--accent); }

  /* Reaction picker */
  .reaction-bar { display: flex; gap: 0.25rem; align-items: center; }
  .reaction-btn { background: var(--paper-warm); border: 1px solid var(--rule); border-radius: 20px; padding: 0.3rem 0.6rem; cursor: pointer; font-size: 0.8rem; transition: all var(--transition); display: flex; align-items: center; gap: 0.25rem; }
  .reaction-btn:hover { transform: scale(1.15); border-color: var(--accent); }
  .reaction-btn.active { background: var(--accent-light); border-color: var(--accent); }
  .reaction-btn .count { font-size: 0.7rem; font-weight: 600; color: var(--ink-muted); }
  .reaction-picker { display: flex; gap: 0.15rem; background: var(--surface); border: 1px solid var(--rule); border-radius: 24px; padding: 0.3rem 0.5rem; box-shadow: var(--shadow-lg); position: absolute; bottom: 110%; left: 0; z-index: 10; }
  .reaction-picker button { background: none; border: none; cursor: pointer; font-size: 1.2rem; padding: 0.2rem 0.35rem; border-radius: 50%; transition: all 0.15s; }
  .reaction-picker button:hover { transform: scale(1.4); background: var(--paper-warm); }

  /* Tags */
  .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.75rem 0; }
  .tag { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 4px; background: var(--paper-warm); color: var(--ink-soft); border: 1px solid var(--rule); cursor: pointer; transition: all var(--transition); font-family: var(--font-sans); }
  .tag:hover { background: var(--ink); color: var(--paper); border-color: var(--ink); }

  /* Article detail */
  .article-header { padding: 3rem 0 2rem; border-bottom: 1px solid var(--rule); margin-bottom: 3rem; }
  .article-cat { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: var(--accent); display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
  .article-cat::before { content: ''; width: 20px; height: 2px; background: var(--accent); }
  .article-title { font-family: var(--font-serif); font-size: clamp(2rem, 4vw, 3.25rem); font-weight: 900; line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 1.25rem; max-width: 800px; }
  .article-meta { display: flex; align-items: center; gap: 1.5rem; font-size: 0.82rem; color: var(--ink-muted); margin-bottom: 1.5rem; flex-wrap: wrap; }
  .article-byline { display: flex; align-items: center; gap: 0.75rem; }
  .article-body { max-width: 720px; margin: 0 auto; font-size: 1.0625rem; line-height: 1.85; color: var(--ink-soft); font-weight: 300; }
  .article-body h1, .article-body h2, .article-body h3 { font-family: var(--font-serif); color: var(--ink); margin: 2.5rem 0 1rem; font-weight: 700; letter-spacing: -0.01em; }
  .article-body h2 { font-size: 1.75rem; } .article-body h3 { font-size: 1.35rem; }
  .article-body p { margin-bottom: 1.5rem; }
  .article-body pre { background: var(--ink); color: #e4e4e4; padding: 1.5rem; border-radius: var(--radius); overflow-x: auto; font-size: 0.875rem; margin: 2rem 0; line-height: 1.6; }
  .article-body code { background: var(--paper-warm); padding: 0.15em 0.4em; border-radius: 2px; font-size: 0.9em; }
  .article-body pre code { background: none; padding: 0; }
  .article-body blockquote { border-left: 3px solid var(--accent); padding-left: 1.5rem; margin: 2rem 0; color: var(--ink-soft); font-style: italic; font-family: var(--font-serif); font-size: 1.15rem; }

  /* Audio player */
  .audio-player { display: flex; align-items:center; gap: 0.75rem; background: var(--paper-warm); border: 1px solid var(--rule); border-radius: 24px; padding: 0.5rem 1rem; }
  .audio-player button { background: var(--accent); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.9rem; transition: all var(--transition); }
  .audio-player button:hover { transform: scale(1.1); }
  .audio-player span { font-size: 0.8rem; color: var(--ink-muted); font-weight: 500; }

  /* Comments */
  .comments-section { margin-top: 4rem; padding-top: 2rem; border-top: 2px solid var(--rule); }
  .section-title { font-family: var(--font-serif); font-size: 1.5rem; font-weight: 700; margin-bottom: 2rem; }
  .comment { padding: 1.25rem 0; border-bottom: 1px solid var(--rule); }
  .comment.reply { margin-left: 2.5rem; padding-left: 1rem; border-left: 2px solid var(--rule); border-bottom: none; }
  .comment-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
  .comment-author { font-weight: 600; font-size: 0.9rem; }
  .comment-time { font-size: 0.78rem; color: var(--ink-muted); }
  .comment-body { font-size: 0.95rem; line-height: 1.7; color: var(--ink-soft); }
  .reply-btn { background: none; border: none; cursor: pointer; font-size: 0.78rem; color: var(--ink-muted); margin-top: 0.5rem; font-family: var(--font-sans); font-weight: 600; }
  .reply-btn:hover { color: var(--accent); }

  /* Forms */
  .form-group { margin-bottom: 1.5rem; }
  .form-label { display: block; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-soft); margin-bottom: 0.5rem; }
  .form-input, .form-textarea, .form-select { width: 100%; padding: 0.75rem 1rem; border: 1.5px solid var(--rule); border-radius: var(--radius); font-family: var(--font-sans); font-size: 0.95rem; color: var(--ink); background: var(--surface); transition: border-color var(--transition); outline: none; }
  .form-input:focus, .form-textarea:focus, .form-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
  .form-textarea { resize: vertical; min-height: 120px; line-height: 1.6; }
  .form-textarea.tall { min-height: 380px; font-family: 'DM Mono', monospace; font-size: 0.875rem; }

  /* Editor toolbar */
  .editor-toolbar { display: flex; gap: 0.25rem; padding: 0.5rem; background: var(--paper-warm); border: 1px solid var(--rule); border-bottom: none; border-radius: var(--radius) var(--radius) 0 0; flex-wrap: wrap; }
  .toolbar-btn { background: none; border: 1px solid transparent; cursor: pointer; padding: 0.35rem 0.5rem; border-radius: 4px; font-size: 0.85rem; color: var(--ink-soft); transition: all var(--transition); font-family: var(--font-sans); }
  .toolbar-btn:hover { background: var(--surface); border-color: var(--rule); color: var(--ink); }
  .toolbar-sep { width: 1px; background: var(--rule); margin: 0 0.25rem; }
  .ai-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 0.35rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.78rem; font-weight: 600; font-family: var(--font-sans); transition: all var(--transition); display: flex; align-items: center; gap: 0.3rem; }
  .ai-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }

  /* Slash command menu */
  .slash-menu { position: absolute; background: var(--surface); border: 1px solid var(--rule); border-radius: var(--radius); box-shadow: var(--shadow-lg); padding: 0.5rem; z-index: 50; min-width: 220px; }
  .slash-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem; color: var(--ink-soft); transition: background var(--transition); border: none; background: none; width: 100%; text-align: left; font-family: var(--font-sans); }
  .slash-item:hover { background: var(--paper-warm); color: var(--ink); }
  .slash-item .icon { font-size: 1.1rem; }
  .slash-item .label { font-weight: 600; }
  .slash-item .desc { font-size: 0.75rem; color: var(--ink-muted); }

  .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.7rem 1.5rem; border-radius: var(--radius); font-family: var(--font-sans); font-size: 0.875rem; font-weight: 600; cursor: pointer; border: none; transition: all var(--transition); text-decoration: none; letter-spacing: 0.02em; }
  .btn:hover { transform: translateY(-1px); }
  .btn-primary { background: var(--ink); color: var(--paper); }
  .btn-primary:hover { background: var(--accent); box-shadow: 0 4px 12px rgba(200,69,58,0.3); }
  .btn-secondary { background: var(--paper-warm); color: var(--ink); border: 1.5px solid var(--rule); }
  .btn-secondary:hover { border-color: var(--ink); }
  .btn-danger { background: #FDF0EF; color: var(--accent); border: 1.5px solid #FBCAC8; }
  .btn-danger:hover { background: var(--accent); color: white; }
  .btn-sm { padding: 0.45rem 1rem; font-size: 0.8rem; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* Auth Modal */
  .modal-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(8px); animation: fadeIn 0.15s ease; }
  @keyframes fadeIn { from { opacity: 0; } }
  .modal { background: var(--surface); border: 1px solid var(--glass-border); border-radius: 12px; padding: 2.5rem; width: 100%; max-width: 420px; box-shadow: var(--shadow-lg); animation: slideUp 0.2s ease; }
  @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } }
  .modal-title { font-family: var(--font-serif); font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
  .modal-sub { color: var(--ink-muted); font-size: 0.9rem; margin-bottom: 2rem; }
  .modal-switch { text-align: center; margin-top: 1.5rem; font-size: 0.875rem; color: var(--ink-muted); }
  .modal-switch button { background: none; border: none; color: var(--accent); font-weight: 600; cursor: pointer; font-size: inherit; font-family: inherit; }

  /* Editor */
  .editor-layout { display: grid; grid-template-columns: 1fr 320px; gap: 2rem; align-items: start; }
  @media (max-width: 900px) { .editor-layout { grid-template-columns: 1fr; } }
  .editor-sidebar { background: var(--surface); border: 1px solid var(--rule); border-radius: var(--radius); padding: 1.5rem; position: sticky; top: 80px; }
  .autosave-indicator { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: var(--ink-muted); padding: 0.3rem 0.6rem; border-radius: 4px; background: var(--paper-warm); }
  .autosave-indicator.saving { color: var(--accent-gold); }
  .autosave-indicator.saved { color: #10B981; }

  /* Search */
  .search-bar { position: relative; max-width: 480px; margin: 0 auto 2.5rem; }
  .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--ink-muted); font-size: 1rem; }
  .search-input { width: 100%; padding: 0.85rem 1rem 0.85rem 2.75rem; border: 1.5px solid var(--rule); border-radius: 100px; font-size: 0.95rem; font-family: var(--font-sans); background: var(--surface); color: var(--ink); outline: none; transition: all var(--transition); }
  .search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
  .search-filters { display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap; justify-content: center; }
  .search-filters select { padding: 0.4rem 0.75rem; border: 1px solid var(--rule); border-radius: 20px; font-size: 0.78rem; background: var(--surface); color: var(--ink); font-family: var(--font-sans); cursor: pointer; }

  /* Dashboard */
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem; }
  .stat-card { background: var(--surface); border: 1px solid var(--rule); border-radius: var(--radius); padding: 1.5rem; transition: all var(--transition); }
  .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
  .stat-card .stat-value { font-size: 2rem; font-weight: 900; font-family: var(--font-serif); color: var(--ink); line-height: 1; }
  .stat-card .stat-label { font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-muted); margin-top: 0.5rem; }
  .analytics-table { width: 100%; border-collapse: collapse; }
  .analytics-table th, .analytics-table td { padding: 0.85rem 1rem; text-align: left; border-bottom: 1px solid var(--rule); font-size: 0.85rem; }
  .analytics-table th { font-weight: 600; text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.08em; color: var(--ink-muted); }
  .analytics-table tr:hover td { background: var(--paper-warm); }
  .bar-chart { height: 8px; background: var(--rule); border-radius: 4px; overflow: hidden; }
  .bar-chart .fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-gold)); border-radius: 4px; transition: width 0.5s ease; }

  /* Follow button */
  .follow-btn { background: var(--ink); color: var(--paper); border: none; border-radius: 20px; padding: 0.35rem 1rem; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: var(--font-sans); transition: all var(--transition); }
  .follow-btn:hover { background: var(--accent); }
  .follow-btn.following { background: var(--paper-warm); color: var(--ink-soft); border: 1px solid var(--rule); }
  .follow-btn.following:hover { border-color: var(--accent); color: var(--accent); }

  /* Bookmark button */
  .bookmark-btn { background: none; border: none; cursor: pointer; font-size: 1.1rem; transition: all var(--transition); padding: 0.2rem; }
  .bookmark-btn:hover { transform: scale(1.2); }
  .bookmark-btn.active { color: var(--accent-gold); }

  /* Recommended section */
  .recommended { margin-top: 3rem; padding-top: 2rem; border-top: 2px solid var(--rule); }

  /* Toast */
  .toast { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 2000; background: var(--ink); color: var(--paper); padding: 0.85rem 1.25rem; border-radius: var(--radius); font-size: 0.875rem; font-weight: 500; box-shadow: var(--shadow-lg); animation: toastIn 0.2s ease; }
  @keyframes toastIn { from { transform: translateY(8px); opacity: 0; } }
  .toast.error { background: var(--accent); }

  /* Skeleton loading */
  .skeleton { background: linear-gradient(90deg, var(--paper-warm) 25%, var(--rule) 50%, var(--paper-warm) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: var(--radius); }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .skeleton-card { height: 380px; border-radius: var(--radius); }
  .skeleton-line { height: 16px; margin-bottom: 0.75rem; border-radius: 4px; }
  .skeleton-line.short { width: 60%; }

  /* Utils */
  .divider { border: none; border-top: 1px solid var(--rule); margin: 2rem 0; }
  .text-muted { color: var(--ink-muted); font-size: 0.875rem; }
  .loading { display: flex; justify-content: center; align-items: center; padding: 4rem; color: var(--ink-muted); gap: 0.75rem; font-size: 0.9rem; }
  .spinner { width: 20px; height: 20px; border: 2px solid var(--rule); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .empty-state { text-align: center; padding: 5rem 2rem; color: var(--ink-muted); }
  .empty-state .empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.4; }
  .empty-state p { font-size: 1rem; margin-bottom: 1.5rem; }
  .back-btn { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; font-weight: 600; color: var(--ink-muted); cursor: pointer; background: none; border: none; font-family: var(--font-sans); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2rem; transition: color var(--transition); }
  .back-btn:hover { color: var(--ink); }
  .profile-section { background: var(--surface); border: 1px solid var(--rule); border-radius: var(--radius); padding: 2rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 1.5rem; }
  .read-time { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.78rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: var(--paper-warm); color: var(--ink-soft); }
  .status-badge { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 0.2rem 0.6rem; border-radius: 4px; }
  .status-PUBLISHED { background: #ECFDF5; color: #065F46; }
  .status-DRAFT { background: var(--paper-warm); color: var(--ink-soft); }
  .status-ARCHIVED { background: #F3F4F6; color: #6B7280; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

  /* Featured tags sidebar */
  .sidebar-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 2rem; }

  /* Infinite scroll trigger */
  .load-more-trigger { padding: 2rem; text-align: center; }

  /* View count badge */
  .view-badge { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; color: var(--ink-muted); }

  @media (max-width: 600px) {
    .container { padding: 0 1rem; } .masthead-top { padding: 0 1rem; } .hero-title { font-size: 2rem; }
    .posts-grid { grid-template-columns: 1fr; } .two-col { grid-template-columns: 1fr; }
    .editor-layout { grid-template-columns: 1fr; } .stats-grid { grid-template-columns: 1fr 1fr; }
  }
`;

// ── API ─────────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "/api";
function getToken() { return localStorage.getItem("blog_token"); }

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  
  // Handle expired tokens automatically
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("blog_token");
    window.location.href = "/";
    throw new Error("Session expired. Please log in again.");
  }
  
  // Safely parse JSON to prevent crashes on empty responses
  let data;
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    if (!res.ok) throw new Error(`Error ${res.status}: Failed to reach server.`);
    return null;
  }
  
  if (!res.ok) throw new Error(data.message || `Request failed with status ${res.status}`);
  return data;
}

// ── Context ─────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("blog_user")); } catch { return null; }
  });
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(() => {
    const p = window.location.pathname.slice(1);
    const validPages = ["home", "write", "myposts", "dashboard", "bookmarks", "post"];
    if (p === "") return "home";
    if (validPages.includes(p)) return p;
    return "home";
  });
  const [pageData, setPageData] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    return id ? { id: parseInt(id) } : {};
  });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("blog_theme") === "dark");
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("blog_fontsize") || "medium");

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.slice(1) || "home";
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      setPage(p);
      setPageData(id ? { id: parseInt(id) } : {});
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("blog_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    document.body.setAttribute("data-font-size", fontSize);
    localStorage.setItem("blog_fontsize", fontSize);
  }, [fontSize]);

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  }, []);

  const login = useCallback((userData, token) => {
    localStorage.setItem("blog_token", token);
    localStorage.setItem("blog_user", JSON.stringify(userData));
    setUser(userData); showToast(`Welcome back, ${userData.username}!`);
  }, [showToast]);

  const logout = useCallback(() => {
    localStorage.removeItem("blog_token"); localStorage.removeItem("blog_user");
    setUser(null); setPage("home"); showToast("Signed out successfully.");
  }, [showToast]);

  const navigate = useCallback((pg, data = {}) => {
    setPage(pg);
    setPageData(data);
    window.scrollTo(0, 0);
    const url = pg === "home" ? "/" : `/${pg}${data.id ? "?id=" + data.id : ""}`;
    window.history.pushState(null, "", url);
  }, []);

  return (
    <AppContext.Provider value={{ user, login, logout, toast, showToast, page, navigate, pageData, darkMode, setDarkMode, fontSize, setFontSize }}>
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
  if (diff < 60) return "just now"; if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`; return `${Math.floor(diff / 86400)}d ago`;
}
function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
function renderMarkdown(text) {
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>').replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>').replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>').replace(/^(?!<[h|p|b|u|o|c|p])/gm, '')
    .split('\n').map(line => line.match(/^<(h[123]|pre|blockquote)/) ? line : `<p>${line}</p>`).join('');
}
const REACTIONS = [
  { type: "FIRE", emoji: "🔥" }, { type: "HEART", emoji: "❤️" },
  { type: "CLAP", emoji: "👏" }, { type: "CELEBRATE", emoji: "🎉" }, { type: "INSIGHTFUL", emoji: "💡" }
];
function reactionEmoji(type) { return REACTIONS.find(r => r.type === type)?.emoji || "👍"; }
function formatNum(n) { if (n >= 1000) return (n/1000).toFixed(1) + "k"; return n; }

// ── Small Components ────────────────────────────────────────────────────────
function Avatar({ name, size = "" }) {
  return <div className={`avatar ${size}`}>{initials(name)}</div>;
}

function SkeletonCards({ count = 6 }) {
  return <div className="posts-grid">{Array.from({length: count}).map((_,i) => <div key={i} className="skeleton skeleton-card" />)}</div>;
}

function ReactionPicker({ postId, breakdown = {}, currentReaction, onReact }) {
  const [open, setOpen] = useState(false);
  const total = Object.values(breakdown).reduce((a,b) => a+b, 0);

  return (
    <div style={{ position: "relative" }}>
      <button className="stat-btn" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
        {currentReaction ? reactionEmoji(currentReaction) : "😀"} {total > 0 ? formatNum(total) : ""}
      </button>
      {open && (
        <div className="reaction-picker" onClick={e => e.stopPropagation()}>
          {REACTIONS.map(r => (
            <button key={r.type} onClick={() => { onReact(postId, r.type); setOpen(false); }}
              style={{ opacity: currentReaction === r.type ? 1 : 0.7 }} title={r.type.toLowerCase()}>
              {r.emoji}{breakdown[r.type] ? <span style={{fontSize:"0.6rem",marginLeft:2}}>{breakdown[r.type]}</span> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({ post, onClick }) {
  const { user, showToast } = useApp();
  const [bm, setBm] = useState(post.bookmarkedByCurrentUser || false);
  const [breakdown, setBreakdown] = useState(post.reactionBreakdown || {});
  const [curReaction, setCurReaction] = useState(post.currentUserReaction || null);

  async function handleReact(postId, type) {
    if (!user) { showToast("Sign in to react", "error"); return; }
    try {
      const res = await apiFetch(`/posts/${postId}/react`, { method: "POST", body: JSON.stringify({ type }) });
      setBreakdown(res.data.breakdown || {});
      setCurReaction(res.data.added ? res.data.type : null);
    } catch { showToast("Failed to react", "error"); }
  }

  async function handleBookmark(e) {
    e.stopPropagation();
    if (!user) { showToast("Sign in to bookmark", "error"); return; }
    try {
      const res = await apiFetch(`/bookmarks/toggle/${post.id}`, { method: "POST" });
      setBm(res.data);
      showToast(res.data ? "Bookmarked!" : "Removed bookmark");
    } catch { showToast("Failed to bookmark", "error"); }
  }

  return (
    <article className="post-card" onClick={onClick}>
      <div className="post-card-img">
        {post.coverImageUrl ? <img src={post.coverImageUrl} alt={post.title} onError={e => { e.target.style.display = "none"; }} /> : postEmoji(post.id || 0)}
      </div>
      <div className="post-card-body">
        {post.category && <div className="post-card-cat">{post.category}</div>}
        <h2 className="post-card-title">{post.title}</h2>
        {post.excerpt && <p className="post-card-excerpt">{post.excerpt}</p>}
        {post.tags && post.tags.length > 0 && (
          <div className="tags">{[...post.tags].slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}</div>
        )}
        <div className="post-card-footer">
          <div className="post-card-author">
            <Avatar name={post.author?.username} />
            <span><strong>{post.author?.username}</strong> · {timeAgo(post.publishedAt || post.createdAt)}</span>
          </div>
          <div className="post-stats">
            <ReactionPicker postId={post.id} breakdown={breakdown} currentReaction={curReaction} onReact={handleReact} />
            <span className="text-muted">💬 {post.commentsCount || 0}</span>
            <span className="view-badge">👁 {formatNum(post.viewCount || 0)}</span>
            <button className={`bookmark-btn ${bm ? "active" : ""}`} onClick={handleBookmark} title="Bookmark">{bm ? "🔖" : "📑"}</button>
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
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{mode === "login" ? "Welcome back" : "Join Inkwell"}</div>
        <div className="modal-sub">{mode === "login" ? "Sign in to your account" : "Create your account to start writing"}</div>
        {error && <div style={{ background: "var(--accent-light)", color: "var(--accent)", padding: "0.75rem 1rem", borderRadius: "var(--radius)", marginBottom: "1rem", fontSize: "0.875rem" }}>{error}</div>}
        {mode === "register" && (
          <div className="form-group"><label className="form-label">Username</label>
            <input className="form-input" value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value}))} placeholder="yourname" /></div>
        )}
        <div className="form-group"><label className="form-label">{mode === "login" ? "Username or Email" : "Email"}</label>
          <input className="form-input" type={mode === "register" ? "email" : "text"} value={mode === "login" ? form.usernameOrEmail : form.email}
            onChange={e => setForm(f => mode === "login" ? {...f, usernameOrEmail: e.target.value} : {...f, email: e.target.value})}
            placeholder={mode === "login" ? "alice or alice@blog.com" : "alice@example.com"} /></div>
        <div className="form-group"><label className="form-label">Password</label>
          <input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
            placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} /></div>
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleSubmit} disabled={loading}>
          {loading ? <><span className="spinner" />&nbsp;Working...</> : mode === "login" ? "Sign In" : "Create Account"}
        </button>
        {mode === "login" && (
          <div style={{ marginTop: "1rem", background: "var(--paper-warm)", padding: "0.75rem", borderRadius: "var(--radius)", fontSize: "0.8rem", color: "var(--ink-muted)" }}>
            <strong>Demo accounts:</strong> alice/alice123 · bob/bob123 · admin/admin123</div>
        )}
        <div className="modal-switch">
          {mode === "login" ? <>Don't have an account? <button onClick={() => setMode("register")}>Sign up</button></> : <>Already have an account? <button onClick={() => setMode("login")}>Sign in</button></>}
        </div>
      </div>
    </div>
  );
}

// ── Import Pages & Inject Dependencies ──────────────────────────────────────
import { HomePage, PostPage, injectDeps } from "./pages.jsx";
import { WritePage, DashboardPage, BookmarksPage, MyPostsPage, injectDeps2 } from "./pages2.jsx";

const deps = { apiFetch, useApp, Avatar, PostCard, SkeletonCards, ReactionPicker, renderMarkdown, formatDate, timeAgo, formatNum, reactionEmoji, REACTIONS, postEmoji, initials };
injectDeps(deps);
injectDeps2(deps);

// ── Header ──────────────────────────────────────────────────────────────────
function Header({ onAuthClick }) {
  const { user, logout, navigate, page, darkMode, setDarkMode, fontSize, setFontSize } = useApp();

  return (
    <header className="masthead">
      <div className="masthead-top">
        <a className="logo" onClick={() => navigate("home")}>Ink<span>well</span></a>
        <div className="masthead-nav">
          <div className="font-ctrl">
            {["small","medium","large"].map(s => (
              <button key={s} className={fontSize === s ? "active" : ""} onClick={() => setFontSize(s)}>
                {s === "small" ? "A" : s === "medium" ? "A" : "A"}
              </button>
            ))}
          </div>
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} title="Toggle dark mode">
            {darkMode ? "☀️" : "🌙"}
          </button>
          <button className={`nav-btn ${page === "home" ? "active" : ""}`} onClick={() => navigate("home")}>Home</button>
          {user ? (
            <>
              <button className={`nav-btn ${page === "bookmarks" ? "active" : ""}`} onClick={() => navigate("bookmarks")}>📑</button>
              <button className={`nav-btn ${page === "dashboard" ? "active" : ""}`} onClick={() => navigate("dashboard")}>📊</button>
              <button className={`nav-btn ${page === "myposts" ? "active" : ""}`} onClick={() => navigate("myposts")}>My Posts</button>
              <button className="nav-btn primary" onClick={() => navigate("write")}>✍️ Write</button>
              <button className="nav-btn ghost" onClick={logout}>Sign Out</button>
            </>
          ) : (
            <button className="nav-btn primary" onClick={onAuthClick}>Sign In</button>
          )}
        </div>
      </div>
    </header>
  );
}

function App() {
  const [showAuth, setShowAuth] = useState(false);
  return (
    <AppProvider>
      <style>{STYLES}</style>
      <AppInner showAuth={showAuth} setShowAuth={setShowAuth} />
    </AppProvider>
  );
}

function AppInner({ showAuth, setShowAuth }) {
  const { page } = useApp();
  return (
    <>
      <Header onAuthClick={() => setShowAuth(true)} />
      {page === "home" && <HomePage />}
      {page === "post" && <PostPage />}
      {page === "write" && <WritePage />}
      {page === "myposts" && <MyPostsPage />}
      {page === "dashboard" && <DashboardPage />}
      {page === "bookmarks" && <BookmarksPage />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <footer style={{ borderTop: "1px solid var(--rule)", padding: "2rem", textAlign: "center", color: "var(--ink-muted)", fontSize: "0.82rem" }}>
        <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700 }}>Inkwell</span> — Where ideas take shape. © 2025
      </footer>
    </>
  );
}

export default App;
