'use client';

import { useState, useEffect, useCallback } from 'react';

const ADMIN_SECRET = 'smartadmin_secret_2026';
/* API base URL — set NEXT_PUBLIC_API_URL in Vercel env vars */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API = `${API_BASE}/api/admin`;

const adminHeaders = {
  'Content-Type': 'application/json',
  'x-admin-secret': ADMIN_SECRET,
};

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  :root {
    --bg:            #060913;
    --surface:       rgba(255,255,255,0.04);
    --surface-2:     rgba(255,255,255,0.07);
    --surface-3:     rgba(255,255,255,0.10);
    --border:        rgba(255,255,255,0.08);
    --border-2:      rgba(255,255,255,0.14);
    --text:          #eef0f8;
    --text-muted:    rgba(238,240,248,0.45);
    --text-soft:     rgba(238,240,248,0.70);
    --teal:          #00ddb5;
    --purple:        #b06ef3;
    --blue:          #4f8ef7;
    --pink:          #f472b6;
    --amber:         #fbbf24;
    --red:           #f87171;
    --green:         #34d399;
    --sidebar-w:     240px;
    --header-h:      66px;
    --radius:        14px;
    --radius-sm:     9px;
    --shadow-card:   0 4px 28px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.3);
    --shadow-glow:   0 0 30px rgba(0,221,181,0.12);
    --trans:         all 0.25s cubic-bezier(.4,0,.2,1);
  }

  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { height:100%; }

  .adm-root {
    font-family:'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex;
  }

  /* ── BG Mesh ── */
  .adm-bg {
    position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden;
  }
  .adm-orb {
    position:absolute; border-radius:50%; filter:blur(110px); opacity:.18;
  }
  .adm-orb-1 { width:700px;height:700px;background:radial-gradient(circle,#00ddb544,transparent 70%);top:-200px;left:-200px; }
  .adm-orb-2 { width:500px;height:500px;background:radial-gradient(circle,#b06ef333,transparent 70%);bottom:-100px;right:-50px; }
  .adm-orb-3 { width:350px;height:350px;background:radial-gradient(circle,#4f8ef722,transparent 70%);top:40%;left:40%; }
  .adm-grid {
    position:fixed; inset:0; z-index:0; pointer-events:none;
    background-image:
      linear-gradient(rgba(255,255,255,.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.015) 1px, transparent 1px);
    background-size: 54px 54px;
  }

  /* ── Sidebar ── */
  .adm-sidebar {
    position:fixed; top:0; left:0; bottom:0;
    width:var(--sidebar-w); z-index:100;
    background: rgba(6,9,19,0.92);
    backdrop-filter: blur(24px);
    border-right: 1px solid var(--border);
    display:flex; flex-direction:column;
    padding: 0 0 20px;
    transition: var(--trans);
  }
  .adm-logo {
    padding: 20px 20px 18px;
    border-bottom: 1px solid var(--border);
    display:flex; align-items:center; gap:10px;
  }
  .adm-logo-icon {
    width:38px; height:38px; border-radius:11px;
    background:linear-gradient(135deg,var(--teal),var(--purple));
    display:flex; align-items:center; justify-content:center;
    font-size:18px; flex-shrink:0;
    box-shadow: 0 0 18px rgba(0,221,181,.35);
  }
  .adm-logo-text {
    font-family:'Syne',sans-serif; font-weight:800; font-size:15px;
    background:linear-gradient(135deg,var(--teal),var(--purple));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    line-height:1.2;
  }
  .adm-logo-sub { font-size:9.5px; color:var(--text-muted); letter-spacing:.06em; text-transform:uppercase; margin-top:2px; }

  .adm-nav { flex:1; padding: 14px 12px; overflow-y:auto; }
  .adm-nav-label {
    font-size:9.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
    color:var(--text-muted); padding: 8px 8px 6px; margin-top:6px;
  }
  .adm-nav-item {
    display:flex; align-items:center; gap:10px;
    padding: 9px 12px; border-radius:10px; cursor:pointer;
    font-size:13px; font-weight:500; color:var(--text-soft);
    transition: var(--trans); margin-bottom:2px; border:1px solid transparent;
    background:none;
    width:100%; text-align:left;
  }
  .adm-nav-item:hover {
    background:var(--surface-2); color:var(--text); border-color:var(--border);
  }
  .adm-nav-item.active {
    background:linear-gradient(135deg,rgba(0,221,181,.12),rgba(79,142,247,.09));
    border-color:rgba(0,221,181,.22); color:var(--teal);
    box-shadow: 0 0 18px rgba(0,221,181,.08);
  }
  .adm-nav-icon { font-size:16px; flex-shrink:0; }
  .adm-nav-badge {
    margin-left:auto; background:var(--purple); color:#fff;
    font-size:10px; font-weight:700; padding:1px 7px; border-radius:20px;
  }

  .adm-sidebar-footer {
    padding: 12px 16px 0;
    border-top: 1px solid var(--border);
  }
  .adm-admin-pill {
    display:flex; align-items:center; gap:9px;
    background:var(--surface-2); border:1px solid var(--border-2);
    border-radius:12px; padding: 9px 12px;
  }
  .adm-avatar {
    width:32px; height:32px; border-radius:50%;
    background:linear-gradient(135deg,var(--purple),var(--blue));
    display:flex; align-items:center; justify-content:center;
    font-size:14px; flex-shrink:0;
  }
  .adm-admin-name { font-size:12px; font-weight:600; color:var(--text); }
  .adm-admin-role { font-size:10px; color:var(--purple); font-weight:600; }
  .adm-logout-btn {
    margin-left:auto; background:none; border:none; cursor:pointer;
    color:var(--text-muted); font-size:16px; padding:4px;
    transition: var(--trans); border-radius:6px;
  }
  .adm-logout-btn:hover { color:var(--red); background:rgba(248,113,113,.1); }

  /* ── Main ── */
  .adm-main {
    margin-left: var(--sidebar-w);
    flex:1; display:flex; flex-direction:column;
    min-height:100vh; position:relative; z-index:10;
  }

  /* ── Header ── */
  .adm-header {
    height:var(--header-h);
    display:flex; align-items:center; justify-content:space-between;
    padding: 0 28px;
    background:rgba(6,9,19,0.7);
    backdrop-filter:blur(18px);
    border-bottom:1px solid var(--border);
    position:sticky; top:0; z-index:50;
  }
  .adm-header-title {
    font-family:'Syne',sans-serif; font-size:18px; font-weight:700;
    display:flex; align-items:center; gap:10px;
  }
  .adm-header-sub { font-size:12px; color:var(--text-muted); font-family:'DM Sans',sans-serif; font-weight:400; }
  .adm-header-right { display:flex; align-items:center; gap:10px; }
  .adm-refresh-btn {
    display:flex; align-items:center; gap:6px;
    padding:8px 14px; border-radius:10px;
    background:var(--surface-2); border:1px solid var(--border);
    color:var(--text-soft); font-size:12.5px; font-weight:500;
    cursor:pointer; transition:var(--trans); font-family:'DM Sans',sans-serif;
  }
  .adm-refresh-btn:hover { border-color:var(--teal); color:var(--teal); }
  .adm-time-chip {
    padding:7px 12px; border-radius:9px;
    background:var(--surface); border:1px solid var(--border);
    font-size:11.5px; color:var(--text-muted);
  }

  /* ── Content ── */
  .adm-content { padding:26px 28px; flex:1; }

  /* ── Stat Cards ── */
  .adm-stats-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
    gap:16px; margin-bottom:28px;
  }
  .adm-stat-card {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius); padding:20px;
    transition:var(--trans); position:relative; overflow:hidden;
    box-shadow: var(--shadow-card);
  }
  .adm-stat-card:hover { border-color:var(--border-2); transform:translateY(-2px); box-shadow:var(--shadow-card),var(--shadow-glow); }
  .adm-stat-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:var(--accent-line);
  }
  .adm-stat-icon {
    width:42px; height:42px; border-radius:12px;
    display:flex; align-items:center; justify-content:center;
    font-size:20px; margin-bottom:14px;
    background:var(--icon-bg); border:1px solid var(--icon-border);
  }
  .adm-stat-val {
    font-family:'Syne',sans-serif; font-size:26px; font-weight:800;
    margin-bottom:4px; line-height:1;
  }
  .adm-stat-label { font-size:11.5px; color:var(--text-muted); font-weight:500; letter-spacing:.02em; }
  .adm-stat-badge {
    display:inline-flex; align-items:center; gap:4px;
    font-size:10.5px; font-weight:600; padding:2px 8px;
    border-radius:20px; margin-top:8px;
  }

  /* ── Section ── */
  .adm-section { margin-bottom:28px; }
  .adm-section-header {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:16px;
  }
  .adm-section-title {
    font-family:'Syne',sans-serif; font-size:15px; font-weight:700;
    display:flex; align-items:center; gap:8px;
  }
  .adm-section-count {
    font-size:11px; background:var(--surface-2); border:1px solid var(--border);
    padding:2px 8px; border-radius:20px; color:var(--text-muted);
    font-family:'DM Sans',sans-serif; font-weight:500;
  }

  /* ── Search ── */
  .adm-search-wrap { position:relative; }
  .adm-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:14px; color:var(--text-muted); pointer-events:none; }
  .adm-search {
    padding:9px 12px 9px 36px;
    background:var(--surface); border:1px solid var(--border);
    border-radius:10px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; outline:none; transition:var(--trans); width:260px;
  }
  .adm-search::placeholder { color:var(--text-muted); }
  .adm-search:focus { border-color:var(--teal); box-shadow:0 0 0 3px rgba(0,221,181,.1); }

  /* ── Table ── */
  .adm-table-wrap {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius); overflow:hidden; box-shadow:var(--shadow-card);
  }
  .adm-table { width:100%; border-collapse:collapse; }
  .adm-table thead tr {
    background:var(--surface-2); border-bottom:1px solid var(--border);
  }
  .adm-table th {
    padding:11px 16px; text-align:left;
    font-size:10.5px; font-weight:700; text-transform:uppercase;
    letter-spacing:.08em; color:var(--text-muted); white-space:nowrap;
  }
  .adm-table td {
    padding:13px 16px; font-size:13px; color:var(--text-soft);
    border-bottom:1px solid var(--border); vertical-align:middle;
  }
  .adm-table tbody tr:last-child td { border-bottom:none; }
  .adm-table tbody tr { transition:var(--trans); cursor:pointer; }
  .adm-table tbody tr:hover { background:var(--surface-2); }
  .adm-table tbody tr:hover td { color:var(--text); }

  .adm-user-cell { display:flex; align-items:center; gap:10px; }
  .adm-user-ava {
    width:34px; height:34px; border-radius:50%; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-size:14px; font-weight:700; color:#fff;
  }
  .adm-user-name { font-weight:600; color:var(--text); font-size:13px; }
  .adm-user-email { font-size:11px; color:var(--text-muted); margin-top:1px; }

  .adm-chip {
    display:inline-flex; align-items:center; gap:4px;
    padding:3px 9px; border-radius:20px; font-size:11px; font-weight:600;
    white-space:nowrap;
  }
  .adm-chip-teal { background:rgba(0,221,181,.1); color:var(--teal); border:1px solid rgba(0,221,181,.2); }
  .adm-chip-purple { background:rgba(176,110,243,.1); color:var(--purple); border:1px solid rgba(176,110,243,.2); }
  .adm-chip-amber { background:rgba(251,191,36,.1); color:var(--amber); border:1px solid rgba(251,191,36,.2); }
  .adm-chip-red { background:rgba(248,113,113,.1); color:var(--red); border:1px solid rgba(248,113,113,.2); }
  .adm-chip-blue { background:rgba(79,142,247,.1); color:var(--blue); border:1px solid rgba(79,142,247,.2); }

  .adm-action-row { display:flex; align-items:center; gap:6px; }
  .adm-act-btn {
    padding:5px 11px; border-radius:8px; font-size:11.5px; font-weight:600;
    cursor:pointer; transition:var(--trans); border:1px solid var(--border);
    background:var(--surface-2); color:var(--text-soft); font-family:'DM Sans',sans-serif;
    display:inline-flex; align-items:center; gap:4px;
  }
  .adm-act-btn:hover { border-color:var(--teal); color:var(--teal); background:rgba(0,221,181,.06); }
  .adm-act-btn.danger:hover { border-color:var(--red); color:var(--red); background:rgba(248,113,113,.07); }

  /* ── Empty / Loading ── */
  .adm-empty {
    text-align:center; padding:48px 20px;
    color:var(--text-muted); font-size:13px;
  }
  .adm-empty-icon { font-size:36px; margin-bottom:10px; opacity:.5; }
  .adm-loading {
    display:flex; align-items:center; justify-content:center;
    padding:60px; gap:12px; color:var(--text-muted); font-size:13px;
  }
  .adm-spinner {
    width:22px; height:22px; border-radius:50%;
    border:2.5px solid var(--border); border-top-color:var(--teal);
    animation:adm-spin .7s linear infinite;
  }
  @keyframes adm-spin { to { transform:rotate(360deg); } }

  /* ── Budget bar ── */
  .adm-budget-bar-wrap { width:90px; }
  .adm-budget-bar-track {
    height:5px; border-radius:5px; background:var(--surface-3); overflow:hidden; margin-top:4px;
  }
  .adm-budget-bar-fill {
    height:100%; border-radius:5px;
    background:linear-gradient(90deg,var(--teal),var(--blue));
    transition:width .6s ease;
  }
  .adm-budget-bar-fill.over { background:linear-gradient(90deg,var(--amber),var(--red)); }
  .adm-budget-pct { font-size:10px; color:var(--text-muted); margin-bottom:2px; }

  /* ── Modal ── */
  .adm-overlay {
    position:fixed; inset:0; z-index:200;
    background:rgba(0,0,0,0.72);
    backdrop-filter:blur(8px);
    display:flex; align-items:center; justify-content:center;
    padding:24px;
    animation:adm-fade-in .2s ease;
  }
  @keyframes adm-fade-in { from{opacity:0;} to{opacity:1;} }
  .adm-modal {
    background:rgba(10,14,26,0.98);
    border:1px solid var(--border-2);
    border-radius:20px; width:100%; max-width:820px;
    max-height:90vh; overflow-y:auto;
    box-shadow:0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(0,221,181,.08);
    animation:adm-slide-up .25s cubic-bezier(.34,1.56,.64,1) both;
  }
  @keyframes adm-slide-up { from{transform:translateY(28px) scale(.97);opacity:0;} to{transform:translateY(0) scale(1);opacity:1;} }
  .adm-modal-header {
    padding:22px 24px 16px;
    border-bottom:1px solid var(--border);
    display:flex; align-items:center; gap:14px;
  }
  .adm-modal-ava {
    width:52px; height:52px; border-radius:50%; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-size:22px; font-weight:700;
    box-shadow:0 0 20px rgba(0,221,181,.25);
  }
  .adm-modal-user-name { font-family:'Syne',sans-serif; font-size:18px; font-weight:800; }
  .adm-modal-user-email { font-size:12px; color:var(--text-muted); margin-top:2px; }
  .adm-modal-close {
    margin-left:auto; background:var(--surface-2); border:1px solid var(--border);
    width:34px; height:34px; border-radius:10px; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    font-size:16px; color:var(--text-muted); transition:var(--trans); flex-shrink:0;
  }
  .adm-modal-close:hover { border-color:var(--red); color:var(--red); background:rgba(248,113,113,.1); }
  .adm-modal-body { padding:22px 24px; }

  .adm-modal-summary {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr));
    gap:12px; margin-bottom:22px;
  }
  .adm-mini-stat {
    background:var(--surface-2); border:1px solid var(--border);
    border-radius:var(--radius-sm); padding:14px;
  }
  .adm-mini-stat-label { font-size:10px; color:var(--text-muted); text-transform:uppercase; letter-spacing:.07em; margin-bottom:6px; }
  .adm-mini-stat-val { font-family:'Syne',sans-serif; font-size:19px; font-weight:700; }

  .adm-modal-tabs {
    display:flex; gap:4px; margin-bottom:16px;
    background:var(--surface); border:1px solid var(--border);
    border-radius:10px; padding:4px;
  }
  .adm-modal-tab {
    flex:1; padding:7px 10px; border:none; border-radius:8px; cursor:pointer;
    font-family:'DM Sans',sans-serif; font-size:12.5px; font-weight:600;
    color:var(--text-muted); background:transparent; transition:var(--trans);
  }
  .adm-modal-tab.active {
    background:linear-gradient(135deg,var(--teal),var(--blue));
    color:#fff; box-shadow:0 3px 14px rgba(0,221,181,.25);
  }

  .adm-sub-table { width:100%; border-collapse:collapse; }
  .adm-sub-table th {
    padding:8px 12px; text-align:left; font-size:10px; font-weight:700;
    text-transform:uppercase; letter-spacing:.07em;
    color:var(--text-muted); border-bottom:1px solid var(--border);
    background:var(--surface-2);
  }
  .adm-sub-table td {
    padding:10px 12px; font-size:12.5px; color:var(--text-soft);
    border-bottom:1px solid var(--border);
  }
  .adm-sub-table tbody tr:last-child td { border-bottom:none; }
  .adm-sub-table tbody tr:hover { background:var(--surface); }
  .adm-sub-table-wrap {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius-sm); overflow:hidden; max-height:320px; overflow-y:auto;
  }

  /* ── Edit modal ── */
  .adm-edit-modal { max-width:440px; }
  .adm-form-group { margin-bottom:16px; }
  .adm-label {
    display:block; font-size:11px; font-weight:700; letter-spacing:.07em;
    text-transform:uppercase; color:var(--text-muted); margin-bottom:7px;
  }
  .adm-input {
    width:100%; padding:11px 13px;
    background:rgba(255,255,255,.05); border:1.5px solid var(--border);
    border-radius:10px; color:var(--text); font-family:'DM Sans',sans-serif;
    font-size:13px; outline:none; transition:var(--trans);
  }
  .adm-input:focus { border-color:var(--teal); box-shadow:0 0 0 3px rgba(0,221,181,.1); }

  .adm-modal-footer {
    display:flex; gap:10px; justify-content:flex-end;
    padding:16px 24px 20px;
    border-top:1px solid var(--border);
  }
  .adm-btn {
    padding:9px 20px; border-radius:10px; font-size:13px; font-weight:600;
    cursor:pointer; transition:var(--trans); font-family:'DM Sans',sans-serif;
    border:1px solid var(--border);
    display:inline-flex; align-items:center; gap:6px;
  }
  .adm-btn-ghost { background:var(--surface-2); color:var(--text-soft); }
  .adm-btn-ghost:hover { border-color:var(--border-2); color:var(--text); }
  .adm-btn-primary {
    background:linear-gradient(135deg,var(--teal),var(--blue));
    color:#fff; border-color:transparent;
    box-shadow:0 4px 18px rgba(0,221,181,.28);
  }
  .adm-btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 24px rgba(0,221,181,.38); }
  .adm-btn-danger {
    background:linear-gradient(135deg,#f87171,#fb7185);
    color:#fff; border-color:transparent;
    box-shadow:0 4px 18px rgba(248,113,113,.25);
  }
  .adm-btn-danger:hover { transform:translateY(-1px); box-shadow:0 6px 24px rgba(248,113,113,.38); }
  .adm-btn:disabled { opacity:.6; pointer-events:none; }

  /* ── Confirm modal ── */
  .adm-confirm-modal { max-width:420px; text-align:center; }
  .adm-confirm-icon { font-size:44px; margin-bottom:12px; }
  .adm-confirm-title { font-family:'Syne',sans-serif; font-size:18px; font-weight:800; margin-bottom:8px; }
  .adm-confirm-text { font-size:13px; color:var(--text-muted); line-height:1.6; margin-bottom:4px; }
  .adm-confirm-warn {
    margin:14px 0; padding:10px 14px; border-radius:9px;
    background:rgba(248,113,113,.08); border:1px solid rgba(248,113,113,.22);
    color:var(--red); font-size:12px; line-height:1.5;
  }

  /* ── Category bar ── */
  .adm-cat-list { display:flex; flex-direction:column; gap:8px; }
  .adm-cat-row { display:flex; align-items:center; gap:10px; }
  .adm-cat-label { font-size:12px; font-weight:500; width:90px; flex-shrink:0; text-transform:capitalize; }
  .adm-cat-bar-track { flex:1; height:7px; border-radius:7px; background:var(--surface-3); overflow:hidden; }
  .adm-cat-bar-fill { height:100%; border-radius:7px; transition:width .7s ease; }
  .adm-cat-amt { font-size:11.5px; color:var(--text-muted); width:80px; text-align:right; flex-shrink:0; }

  /* ── Toast ── */
  .adm-toast-wrap {
    position:fixed; bottom:24px; right:24px; z-index:500;
    display:flex; flex-direction:column; gap:8px;
  }
  .adm-toast {
    padding:12px 18px; border-radius:12px;
    background:rgba(15,20,36,.97); border:1px solid var(--border-2);
    backdrop-filter:blur(18px);
    font-size:13px; font-weight:500;
    box-shadow:0 8px 32px rgba(0,0,0,.5);
    display:flex; align-items:center; gap:9px;
    animation:adm-toast-in .3s cubic-bezier(.34,1.56,.64,1) both;
    min-width:240px;
  }
  @keyframes adm-toast-in { from{transform:translateX(60px);opacity:0;} to{transform:translateX(0);opacity:1;} }
  .adm-toast.success { border-color:rgba(52,211,153,.28); color:var(--green); }
  .adm-toast.error   { border-color:rgba(248,113,113,.28); color:var(--red); }

  /* ── Cat colors ── */
  .cat-food        { background:linear-gradient(90deg,#f472b6,#e879f9); }
  .cat-transport   { background:linear-gradient(90deg,#4f8ef7,#818cf8); }
  .cat-education   { background:linear-gradient(90deg,#00ddb5,#6ee7b7); }
  .cat-shopping    { background:linear-gradient(90deg,#fbbf24,#fb923c); }
  .cat-entertainment { background:linear-gradient(90deg,#b06ef3,#8b5cf6); }
  .cat-others      { background:linear-gradient(90deg,#64748b,#94a3b8); }

  /* ── Responsive ── */
  @media(max-width:768px) {
    .adm-sidebar { width:60px; }
    .adm-logo-text, .adm-logo-sub, .adm-nav-label, .adm-nav-item span, .adm-nav-badge,
    .adm-admin-name, .adm-admin-role { display:none; }
    .adm-nav-item { justify-content:center; padding:10px; }
    .adm-main { margin-left:60px; }
    .adm-content { padding:18px 14px; }
    .adm-stats-grid { grid-template-columns:1fr 1fr; }
  }
`;

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (n) => '৳' + Number(n || 0).toLocaleString('en-BD', { maximumFractionDigits: 0 });
const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const avatarColor = (name = '') => {
  const colors = [
    'linear-gradient(135deg,#00ddb5,#4f8ef7)',
    'linear-gradient(135deg,#b06ef3,#4f8ef7)',
    'linear-gradient(135deg,#f472b6,#fb7185)',
    'linear-gradient(135deg,#fbbf24,#f97316)',
    'linear-gradient(135deg,#34d399,#10b981)',
    'linear-gradient(135deg,#818cf8,#6366f1)',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};
const initials = (name = '') =>
  name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function AdminPage() {
  const [view,       setView]       = useState('dashboard');   // 'dashboard' | 'users'
  const [stats,      setStats]      = useState(null);
  const [users,      setUsers]      = useState([]);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Modals
  const [detailUser, setDetailUser] = useState(null);   // full user detail object
  const [detailLoading, setDetailLoading] = useState(false);
  const [editUser,   setEditUser]   = useState(null);   // user being edited
  const [editVals,   setEditVals]   = useState({ name: '', monthlyBudget: '' });
  const [editLoading,setEditLoading]= useState(false);
  const [deleteUser, setDeleteUser] = useState(null);   // user to confirm delete
  const [deleteLoading,setDeleteLoading] = useState(false);
  const [detailTab,  setDetailTab]  = useState('expenses'); // 'expenses' | 'habits'

  // Toast
  const [toasts,     setToasts]     = useState([]);

  // Logout confirm modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const doLogout = () => { localStorage.removeItem('se_session'); window.location.href = '/login'; };

  // Time
  const [now, setNow] = useState(new Date());

  /* ── Auth guard ── */
  useEffect(() => {
    const sess = JSON.parse(localStorage.getItem('se_session') || 'null');
    if (!sess || sess.role !== 'admin') {
      window.location.href = '/login';
    }
  }, []);

  /* ── Clock ── */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  /* ── Toast helper ── */
  const addToast = useCallback((type, text) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, type, text }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  /* ── Fetch Stats ── */
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const r = await fetch(`${API}/stats`, { headers: adminHeaders });
      const d = await r.json();
      if (d.success) setStats(d.stats);
    } catch { /* ignore */ }
    finally { setStatsLoading(false); }
  }, []);

  /* ── Fetch Users ── */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/users`, { headers: adminHeaders });
      const d = await r.json();
      if (d.success) setUsers(d.users);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [fetchStats, fetchUsers]);

  /* ── Fetch User Detail ── */
  const openDetail = async (userId) => {
    setDetailLoading(true);
    setDetailUser({ loading: true });
    setDetailTab('expenses');
    try {
      const r = await fetch(`${API}/users/${userId}`, { headers: adminHeaders });
      const d = await r.json();
      if (d.success) setDetailUser(d);
      else setDetailUser(null);
    } catch { setDetailUser(null); }
    finally { setDetailLoading(false); }
  };

  /* ── Edit User ── */
  const openEdit = (user) => {
    setEditUser(user);
    setEditVals({ name: user.name, monthlyBudget: user.monthlyBudget });
  };

  const saveEdit = async () => {
    setEditLoading(true);
    try {
      const r = await fetch(`${API}/users/${editUser._id}`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({
          name: editVals.name,
          monthlyBudget: Number(editVals.monthlyBudget),
        }),
      });
      const d = await r.json();
      if (d.success) {
        addToast('success', `✅ ${d.user.name} updated successfully.`);
        setEditUser(null);
        fetchUsers();
        fetchStats();
      } else {
        addToast('error', d.message || 'Update failed.');
      }
    } catch { addToast('error', 'Connection error.'); }
    finally { setEditLoading(false); }
  };

  /* ── Delete User ── */
  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const r = await fetch(`${API}/users/${deleteUser._id}`, {
        method: 'DELETE',
        headers: adminHeaders,
      });
      const d = await r.json();
      if (d.success) {
        addToast('success', `🗑️ ${deleteUser.name} deleted.`);
        setDeleteUser(null);
        if (detailUser?.user?._id === deleteUser._id) setDetailUser(null);
        fetchUsers();
        fetchStats();
      } else {
        addToast('error', d.message || 'Delete failed.');
      }
    } catch { addToast('error', 'Connection error.'); }
    finally { setDeleteLoading(false); }
  };

  /* ── Filtered Users ── */
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  /* ── Stat cards config ── */
  const statCards = [
    {
      label: 'Total Users',
      val: stats?.totalUsers ?? '—',
      icon: '👥',
      accent: '#00ddb5',
      iconBg: 'rgba(0,221,181,.1)',
      iconBorder: 'rgba(0,221,181,.2)',
      badge: `+${stats?.newUsersThisMonth ?? 0} this month`,
      badgeColor: '#00ddb5',
    },
    {
      label: 'Total Expenses',
      val: stats?.totalExpenses ?? '—',
      icon: '📋',
      accent: '#4f8ef7',
      iconBg: 'rgba(79,142,247,.1)',
      iconBorder: 'rgba(79,142,247,.2)',
      badge: 'all-time records',
      badgeColor: '#4f8ef7',
    },
    {
      label: 'Total Habits',
      val: stats?.totalHabits ?? '—',
      icon: '🧠',
      accent: '#b06ef3',
      iconBg: 'rgba(176,110,243,.1)',
      iconBorder: 'rgba(176,110,243,.2)',
      badge: 'logged entries',
      badgeColor: '#b06ef3',
    },
    {
      label: 'Platform Spending',
      val: stats ? fmt(stats.totalSpending) : '—',
      icon: '💰',
      accent: '#fbbf24',
      iconBg: 'rgba(251,191,36,.1)',
      iconBorder: 'rgba(251,191,36,.2)',
      badge: 'total across all users',
      badgeColor: '#fbbf24',
    },
  ];

  const catColors = {
    food:'#f472b6', transport:'#4f8ef7', education:'#00ddb5',
    shopping:'#fbbf24', entertainment:'#b06ef3', others:'#64748b',
  };

  /* ──────────────────────────────────────────────────────────────────────────
     RENDER
  ────────────────────────────────────────────────────────────────────────── */
  return (
    <div className="adm-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* BG */}
      <div className="adm-bg">
        <div className="adm-orb adm-orb-1" />
        <div className="adm-orb adm-orb-2" />
        <div className="adm-orb adm-orb-3" />
      </div>
      <div className="adm-grid" />

      {/* ── Sidebar ── */}
      <aside className="adm-sidebar">
        <div className="adm-logo">
          <div className="adm-logo-icon">🛡️</div>
          <div>
            <div className="adm-logo-text">SmartExpense</div>
            <div className="adm-logo-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="adm-nav">
          <div className="adm-nav-label">Overview</div>
          <button
            className={`adm-nav-item${view === 'dashboard' ? ' active' : ''}`}
            onClick={() => setView('dashboard')}
          >
            <span className="adm-nav-icon">📊</span>
            <span>Dashboard</span>
          </button>

          <div className="adm-nav-label">Management</div>
          <button
            className={`adm-nav-item${view === 'users' ? ' active' : ''}`}
            onClick={() => setView('users')}
          >
            <span className="adm-nav-icon">👥</span>
            <span>All Users</span>
            {users.length > 0 && (
              <span className="adm-nav-badge">{users.length}</span>
            )}
          </button>

          <div className="adm-nav-label">System</div>
          <button className="adm-nav-item" onClick={() => { fetchStats(); fetchUsers(); addToast('success','🔄 Data refreshed!'); }}>
            <span className="adm-nav-icon">🔄</span>
            <span>Refresh Data</span>
          </button>
          <button
            className={`adm-nav-item`}
            onClick={() => setShowLogoutModal(true)}
          >
            <span className="adm-nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </nav>

        <div className="adm-sidebar-footer">
          <div className="adm-admin-pill">
            <div className="adm-avatar">🛡️</div>
            <div>
              <div className="adm-admin-name">Administrator</div>
              <div className="adm-admin-role">Super Admin</div>
            </div>
            <button className="adm-logout-btn" title="Logout"
              onClick={() => setShowLogoutModal(true)}>
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="adm-main">

        {/* ── Header ── */}
        <header className="adm-header">
          <div>
            <div className="adm-header-title">
              {view === 'dashboard' ? '📊' : '👥'}
              &nbsp;{view === 'dashboard' ? 'Dashboard Overview' : 'User Management'}
            </div>
            <div className="adm-header-sub">
              {view === 'dashboard'
                ? 'Platform-wide analytics & statistics'
                : 'View, edit and manage all registered users'}
            </div>
          </div>
          <div className="adm-header-right">
            <button className="adm-refresh-btn" onClick={() => { fetchStats(); fetchUsers(); addToast('success','🔄 Refreshed!'); }}>
              🔄 Refresh
            </button>
            <div className="adm-time-chip">
              {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <div className="adm-content">

          {/* ═══════════ DASHBOARD VIEW ═══════════ */}
          {view === 'dashboard' && (
            <>
              {/* Stats */}
              <div className="adm-stats-grid">
                {statCards.map((s, i) => (
                  <div className="adm-stat-card" key={i}
                    style={{ '--accent-line': s.accent, '--icon-bg': s.iconBg, '--icon-border': s.iconBorder }}>
                    <div className="adm-stat-icon">{s.icon}</div>
                    <div className="adm-stat-val">{statsLoading ? '…' : s.val}</div>
                    <div className="adm-stat-label">{s.label}</div>
                    <span className="adm-stat-badge"
                      style={{ background: `${s.badgeColor}15`, color: s.badgeColor, border: `1px solid ${s.badgeColor}30` }}>
                      {s.badge}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>

                {/* Spending by Category */}
                <div className="adm-section">
                  <div className="adm-section-header">
                    <div className="adm-section-title">💸 Spending by Category</div>
                  </div>
                  <div className="adm-table-wrap" style={{ padding:'18px' }}>
                    {statsLoading ? (
                      <div className="adm-loading"><div className="adm-spinner" /></div>
                    ) : !stats?.categoryBreakdown?.length ? (
                      <div className="adm-empty"><div className="adm-empty-icon">📂</div>No expense data yet</div>
                    ) : (
                      <div className="adm-cat-list">
                        {stats.categoryBreakdown.map((c) => {
                          const max = stats.categoryBreakdown[0].total;
                          const pct = max > 0 ? Math.round((c.total / max) * 100) : 0;
                          return (
                            <div className="adm-cat-row" key={c._id}>
                              <div className="adm-cat-label">{c._id}</div>
                              <div className="adm-cat-bar-track">
                                <div
                                  className={`adm-cat-bar-fill cat-${c._id}`}
                                  style={{ width: `${pct}%`, background: catColors[c._id] }}
                                />
                              </div>
                              <div className="adm-cat-amt">{fmt(c.total)}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Monthly Trend */}
                <div className="adm-section">
                  <div className="adm-section-header">
                    <div className="adm-section-title">📈 Monthly Spending Trend</div>
                    <span className="adm-section-count">Last 6 months</span>
                  </div>
                  <div className="adm-table-wrap" style={{ padding:'18px' }}>
                    {statsLoading ? (
                      <div className="adm-loading"><div className="adm-spinner" /></div>
                    ) : !stats?.monthlyTrend?.length ? (
                      <div className="adm-empty"><div className="adm-empty-icon">📅</div>No trend data yet</div>
                    ) : (
                      <div className="adm-cat-list">
                        {stats.monthlyTrend.map((m) => {
                          const maxM = Math.max(...stats.monthlyTrend.map(x=>x.total));
                          const pct  = maxM > 0 ? Math.round((m.total / maxM) * 100) : 0;
                          const [yr, mo] = m._id.split('-');
                          const label = new Date(yr, mo - 1).toLocaleString('en', { month: 'short', year: '2-digit' });
                          return (
                            <div className="adm-cat-row" key={m._id}>
                              <div className="adm-cat-label">{label}</div>
                              <div className="adm-cat-bar-track">
                                <div className="adm-cat-bar-fill"
                                  style={{ width:`${pct}%`, background:'linear-gradient(90deg,#00ddb5,#4f8ef7)' }} />
                              </div>
                              <div className="adm-cat-amt">{fmt(m.total)}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Users snippet */}
              <div className="adm-section">
                <div className="adm-section-header">
                  <div className="adm-section-title">🆕 Recently Joined Users</div>
                  <button className="adm-act-btn" onClick={() => setView('users')}>View All →</button>
                </div>
                <div className="adm-table-wrap">
                  {loading ? (
                    <div className="adm-loading"><div className="adm-spinner" />&nbsp;Loading users…</div>
                  ) : (
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Expenses</th>
                          <th>Habits</th>
                          <th>Total Spending</th>
                          <th>Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.slice(0, 5).map((u) => (
                          <tr key={u._id} onClick={() => openDetail(u._id)}>
                            <td>
                              <div className="adm-user-cell">
                                <div className="adm-user-ava" style={{ background: avatarColor(u.name) }}>
                                  {initials(u.name)}
                                </div>
                                <div>
                                  <div className="adm-user-name">{u.name}</div>
                                  <div className="adm-user-email">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td><span className="adm-chip adm-chip-blue">{u.expenseCount}</span></td>
                            <td><span className="adm-chip adm-chip-purple">{u.habitCount}</span></td>
                            <td style={{ color:'var(--teal)', fontWeight:600 }}>{fmt(u.totalSpending)}</td>
                            <td style={{ color:'var(--text-muted)' }}>{fmtDate(u.createdAt)}</td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr><td colSpan={5}><div className="adm-empty"><div className="adm-empty-icon">👥</div>No users yet</div></td></tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ═══════════ USERS VIEW ═══════════ */}
          {view === 'users' && (
            <div className="adm-section">
              <div className="adm-section-header">
                <div className="adm-section-title">
                  👥 All Users
                  <span className="adm-section-count">{filteredUsers.length} of {users.length}</span>
                </div>
                <div className="adm-search-wrap">
                  <span className="adm-search-icon">🔍</span>
                  <input
                    className="adm-search"
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="adm-table-wrap">
                {loading ? (
                  <div className="adm-loading"><div className="adm-spinner" />&nbsp;Loading users…</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="adm-empty">
                    <div className="adm-empty-icon">🔍</div>
                    No users found{search ? ` for "${search}"` : ''}
                  </div>
                ) : (
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Expenses</th>
                        <th>Habits</th>
                        <th>Total Spending</th>
                        <th>Budget Usage</th>
                        <th>Monthly Budget</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => {
                        const pct = u.monthlyBudget > 0
                          ? Math.min(Math.round((u.totalSpending / u.monthlyBudget) * 100), 200)
                          : 0;
                        const isOver = pct >= 100;
                        return (
                          <tr key={u._id}>
                            <td onClick={() => openDetail(u._id)}>
                              <div className="adm-user-cell">
                                <div className="adm-user-ava" style={{ background: avatarColor(u.name) }}>
                                  {initials(u.name)}
                                </div>
                                <div>
                                  <div className="adm-user-name">{u.name}</div>
                                  <div className="adm-user-email">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td><span className="adm-chip adm-chip-blue">📋 {u.expenseCount}</span></td>
                            <td><span className="adm-chip adm-chip-purple">🧠 {u.habitCount}</span></td>
                            <td style={{ fontWeight:600, color:'var(--teal)' }}>{fmt(u.totalSpending)}</td>
                            <td>
                              <div className="adm-budget-bar-wrap">
                                <div className="adm-budget-pct">{pct}%</div>
                                <div className="adm-budget-bar-track">
                                  <div
                                    className={`adm-budget-bar-fill${isOver ? ' over' : ''}`}
                                    style={{ width:`${Math.min(pct,100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td>{fmt(u.monthlyBudget)}</td>
                            <td style={{ color:'var(--text-muted)', fontSize:'12px' }}>{fmtDate(u.createdAt)}</td>
                            <td>
                              <div className="adm-action-row">
                                <button className="adm-act-btn" onClick={() => openDetail(u._id)}>👁 View</button>
                                <button className="adm-act-btn" onClick={(e) => { e.stopPropagation(); openEdit(u); }}>✏️ Edit</button>
                                <button className="adm-act-btn danger" onClick={(e) => { e.stopPropagation(); setDeleteUser(u); }}>🗑 Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </div>{/* /content */}
      </main>

      {/* ═══════════ USER DETAIL MODAL ═══════════ */}
      {detailUser && (
        <div className="adm-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDetailUser(null); }}>
          <div className="adm-modal">
            {detailLoading || detailUser.loading ? (
              <div className="adm-loading" style={{ padding:'60px' }}>
                <div className="adm-spinner" />&nbsp;Loading user data…
              </div>
            ) : (
              <>
                <div className="adm-modal-header">
                  <div className="adm-modal-ava" style={{ background: avatarColor(detailUser.user?.name) }}>
                    {initials(detailUser.user?.name)}
                  </div>
                  <div>
                    <div className="adm-modal-user-name">{detailUser.user?.name}</div>
                    <div className="adm-modal-user-email">{detailUser.user?.email}</div>
                    <div style={{ marginTop:'6px', display:'flex', gap:'6px', flexWrap:'wrap' }}>
                      <span className="adm-chip adm-chip-teal">Budget: {fmt(detailUser.user?.monthlyBudget)}</span>
                      <span className="adm-chip adm-chip-blue">Joined: {fmtDate(detailUser.user?.createdAt)}</span>
                    </div>
                  </div>
                  <button className="adm-modal-close" onClick={() => setDetailUser(null)}>✕</button>
                </div>

                <div className="adm-modal-body">
                  {/* Summary mini-stats */}
                  <div className="adm-modal-summary">
                    <div className="adm-mini-stat">
                      <div className="adm-mini-stat-label">Total Spending</div>
                      <div className="adm-mini-stat-val" style={{ color:'var(--teal)' }}>
                        {fmt(detailUser.summary?.totalSpending)}
                      </div>
                    </div>
                    <div className="adm-mini-stat">
                      <div className="adm-mini-stat-label">Expenses</div>
                      <div className="adm-mini-stat-val" style={{ color:'var(--blue)' }}>
                        {detailUser.summary?.expenseCount}
                      </div>
                    </div>
                    <div className="adm-mini-stat">
                      <div className="adm-mini-stat-label">Habit Logs</div>
                      <div className="adm-mini-stat-val" style={{ color:'var(--purple)' }}>
                        {detailUser.summary?.habitCount}
                      </div>
                    </div>
                    <div className="adm-mini-stat">
                      <div className="adm-mini-stat-label">Budget Used</div>
                      <div className="adm-mini-stat-val"
                        style={{ color: detailUser.summary?.budgetUsed >= 100 ? 'var(--red)' : 'var(--green)' }}>
                        {detailUser.summary?.budgetUsed}%
                      </div>
                    </div>
                  </div>

                  {/* Category breakdown if any */}
                  {detailUser.summary?.categoryBreakdown?.length > 0 && (
                    <div style={{ marginBottom:'18px' }}>
                      <div style={{ fontSize:'11.5px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--text-muted)', marginBottom:'10px' }}>
                        Spending by Category
                      </div>
                      <div className="adm-cat-list">
                        {detailUser.summary.categoryBreakdown.map((c) => {
                          const max = detailUser.summary.categoryBreakdown[0].amount;
                          const pct = max > 0 ? Math.round((c.amount / max) * 100) : 0;
                          return (
                            <div className="adm-cat-row" key={c.category}>
                              <div className="adm-cat-label">{c.category}</div>
                              <div className="adm-cat-bar-track">
                                <div className="adm-cat-bar-fill"
                                  style={{ width:`${pct}%`, background: catColors[c.category] || '#64748b' }} />
                              </div>
                              <div className="adm-cat-amt">{fmt(c.amount)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tabs */}
                  <div className="adm-modal-tabs">
                    <button
                      className={`adm-modal-tab${detailTab === 'expenses' ? ' active' : ''}`}
                      onClick={() => setDetailTab('expenses')}>
                      💸 Expenses ({detailUser.expenses?.length || 0})
                    </button>
                    <button
                      className={`adm-modal-tab${detailTab === 'habits' ? ' active' : ''}`}
                      onClick={() => setDetailTab('habits')}>
                      🧠 Habit Logs ({detailUser.habits?.length || 0})
                    </button>
                  </div>

                  {/* Expenses tab */}
                  {detailTab === 'expenses' && (
                    <div className="adm-sub-table-wrap">
                      {!detailUser.expenses?.length ? (
                        <div className="adm-empty"><div className="adm-empty-icon">💸</div>No expenses recorded</div>
                      ) : (
                        <table className="adm-sub-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Category</th>
                              <th>Description</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detailUser.expenses.map((e) => (
                              <tr key={e._id}>
                                <td style={{ color:'var(--text-muted)', fontSize:'12px' }}>{e.date}</td>
                                <td>
                                  <span className="adm-chip"
                                    style={{ background:`${catColors[e.category]}15`, color:catColors[e.category], border:`1px solid ${catColors[e.category]}30` }}>
                                    {e.category}
                                  </span>
                                </td>
                                <td style={{ color:'var(--text-soft)' }}>{e.description || '—'}</td>
                                <td style={{ fontWeight:600, color:'var(--teal)' }}>{fmt(e.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {/* Habits tab */}
                  {detailTab === 'habits' && (
                    <div className="adm-sub-table-wrap">
                      {!detailUser.habits?.length ? (
                        <div className="adm-empty"><div className="adm-empty-icon">🧠</div>No habit logs yet</div>
                      ) : (
                        <table className="adm-sub-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Study (hrs)</th>
                              <th>Sleep (hrs)</th>
                              <th>Exercise (min)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detailUser.habits.map((h) => (
                              <tr key={h._id}>
                                <td style={{ color:'var(--text-muted)', fontSize:'12px' }}>{h.date}</td>
                                <td><span className="adm-chip adm-chip-teal">📚 {h.study}h</span></td>
                                <td><span className="adm-chip adm-chip-blue">😴 {h.sleep}h</span></td>
                                <td><span className="adm-chip adm-chip-purple">🏃 {h.exercise}m</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>

                <div className="adm-modal-footer">
                  <button className="adm-btn adm-btn-ghost" onClick={() => setDetailUser(null)}>Close</button>
                  <button className="adm-btn adm-btn-ghost" onClick={() => { openEdit(detailUser.user); }}>✏️ Edit User</button>
                  <button className="adm-btn adm-btn-danger" onClick={() => { setDeleteUser(detailUser.user); setDetailUser(null); }}>
                    🗑 Delete User
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ EDIT MODAL ═══════════ */}
      {editUser && (
        <div className="adm-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditUser(null); }}>
          <div className="adm-modal adm-edit-modal">
            <div className="adm-modal-header">
              <div className="adm-modal-ava" style={{ background: avatarColor(editUser.name) }}>
                {initials(editUser.name)}
              </div>
              <div>
                <div className="adm-modal-user-name">Edit User</div>
                <div className="adm-modal-user-email">{editUser.email}</div>
              </div>
              <button className="adm-modal-close" onClick={() => setEditUser(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-form-group">
                <label className="adm-label">Full Name</label>
                <input className="adm-input" value={editVals.name}
                  onChange={(e) => setEditVals((p) => ({ ...p, name: e.target.value }))}
                  placeholder="User's full name" />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Monthly Budget (৳)</label>
                <input className="adm-input" type="number" min="0"
                  value={editVals.monthlyBudget}
                  onChange={(e) => setEditVals((p) => ({ ...p, monthlyBudget: e.target.value }))}
                  placeholder="e.g. 35000" />
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-ghost" onClick={() => setEditUser(null)}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={saveEdit} disabled={editLoading}>
                {editLoading ? '⏳ Saving…' : '✅ Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ DELETE CONFIRM MODAL ═══════════ */}
      {deleteUser && (
        <div className="adm-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDeleteUser(null); }}>
          <div className="adm-modal adm-confirm-modal">
            <div className="adm-modal-body" style={{ padding:'32px 28px 0', textAlign:'center' }}>
              <div className="adm-confirm-icon">🗑️</div>
              <div className="adm-confirm-title">Delete User?</div>
              <div className="adm-confirm-text">
                You are about to permanently delete <strong style={{ color:'var(--text)' }}>{deleteUser.name}</strong>.
              </div>
              <div className="adm-confirm-warn">
                ⚠️ This will also delete ALL their expenses and habit logs. This action cannot be undone.
              </div>
            </div>
            <div className="adm-modal-footer" style={{ justifyContent:'center', gap:'12px' }}>
              <button className="adm-btn adm-btn-ghost" onClick={() => setDeleteUser(null)}>Cancel</button>
              <button className="adm-btn adm-btn-danger" onClick={confirmDelete} disabled={deleteLoading}>
                {deleteLoading ? '⏳ Deleting…' : '🗑 Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ LOGOUT CONFIRM MODAL ═══════════ */}
      {showLogoutModal && (
        <div className="adm-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowLogoutModal(false); }}>
          <div className="adm-modal" style={{ maxWidth: 420, textAlign: 'center' }}>
            <div className="adm-modal-body" style={{ padding: '32px 28px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>🚪</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
                Sign Out?
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 8 }}>
                Are you sure you want to exit the Admin Panel?
              </p>
              <div style={{
                margin: '14px 0 8px',
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(248,113,113,0.07)',
                border: '1px solid rgba(248,113,113,0.2)',
                fontSize: 12,
                color: 'var(--red)',
                lineHeight: 1.5,
              }}>
                ⚠️ You will be redirected to the login page.
              </div>
            </div>
            <div className="adm-modal-footer" style={{ justifyContent: 'center', gap: 12, paddingTop: 20 }}>
              <button className="adm-btn adm-btn-ghost" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="adm-btn adm-btn-danger" onClick={doLogout}>Yes, Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ TOASTS ═══════════ */}
      <div className="adm-toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`adm-toast ${t.type}`}>{t.text}</div>
        ))}
      </div>

    </div>
  );
}
