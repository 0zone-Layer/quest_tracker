import { useState, useEffect, useMemo, useCallback, useRef, memo } from "react";
import { getProfile, saveProfile } from "./cloudStorage.js";


// ─── CONFIG ───────────────────────────────────────────────────────────────────
// 1. Place hero image at public/hero.jpg
// 2. Paste your Gemini API key below (get one free at aistudio.google.com)

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY || "";


// ─── DATA ─────────────────────────────────────────────────────────────────────

const PHASES = [
  { id:"p1",  year:1, num:1,  icon:"⚙️",  title:"C Programming + Linux Foundations",           period:"Mar–May 2026",    color:"#00ff88", quests:10 },
  { id:"p2",  year:1, num:2,  icon:"🧠",  title:"Data Structures, OS Internals + Networking",  period:"Jun–Aug 2026",    color:"#00d4ff", quests:10 },
  { id:"p3",  year:1, num:3,  icon:"🚀",  title:"Node.js Backend + Databases + APIs",           period:"Sep–Nov 2026",    color:"#ffb800", quests:10 },
  { id:"p4",  year:1, num:4,  icon:"🔐",  title:"Security Intro + Portfolio + Internship Prep", period:"Dec 2026–Feb 2027",color:"#ff4d6d", quests:10 },
  { id:"p5",  year:2, num:5,  icon:"⚡",  title:"Systems Programming + Concurrency",            period:"Mar–May 2027",    color:"#a855f7", quests:10 },
  { id:"p6",  year:2, num:6,  icon:"🕷️", title:"Web Security Deep + Bug Bounty",               period:"Jun–Aug 2027",    color:"#ff6b35", quests:10 },
  { id:"p7",  year:2, num:7,  icon:"💀",  title:"Binary Exploitation + Reverse Engineering",   period:"Sep–Nov 2027",    color:"#00ff88", quests:10 },
  { id:"p8",  year:2, num:8,  icon:"🌐",  title:"Distributed Systems + Performance + OSS",     period:"Dec 2027–Feb 2028",color:"#00d4ff", quests:10 },
  { id:"p9",  year:3, num:9,  icon:"🔱",  title:"Advanced Distributed Systems + Streaming",    period:"Mar–May 2028",    color:"#ffb800", quests:10 },
  { id:"p10", year:3, num:10, icon:"🛠️", title:"Compiler Internals + Kernel Programming",      period:"Jun–Aug 2028",    color:"#a855f7", quests:10 },
  { id:"p11", year:3, num:11, icon:"🎯",  title:"Advanced Exploit Development + CVE Research", period:"Sep–Nov 2028",    color:"#ff4d6d", quests:10 },
  { id:"p12", year:3, num:12, icon:"👑",  title:"Open Source Leadership + Global Positioning", period:"Dec 2028–Mar 2029",color:"#00ff88", quests:10 },
];

const QUEST_MAP = {
  p1q1:{title:"K.N. King Ch.1–8: C basics",xp:100,phase:"p1"},p1q2:{title:"K.N. King Ch.9–17: pointers, structs",xp:150,phase:"p1"},
  p1q3:{title:"K.N. King Ch.18–27: advanced C",xp:150,phase:"p1"},p1q4:{title:"30 C exercises: pointers, malloc/free",xp:120,phase:"p1"},
  p1q5:{title:"GDB mastery: breakpoints, backtrace",xp:80,phase:"p1"},p1q6:{title:"Linux terminal fluency",xp:90,phase:"p1"},
  p1q7:{title:"PROJECT: Mini Unix Shell in C",xp:200,phase:"p1"},p1q8:{title:"PROJECT: Custom Memory Allocator in C",xp:180,phase:"p1"},
  p1q9:{title:"LeetCode: 50 problems in C",xp:100,phase:"p1"},p1q10:{title:"Linux dev environment setup",xp:60,phase:"p1"},
  p2q1:{title:"OSTEP: Virtualization",xp:130,phase:"p2"},p2q2:{title:"OSTEP: Concurrency",xp:120,phase:"p2"},
  p2q3:{title:"OSTEP: Persistence",xp:100,phase:"p2"},p2q4:{title:"DSA in C: hash table, BST, heap",xp:150,phase:"p2"},
  p2q5:{title:"TCP/IP deep dive",xp:90,phase:"p2"},p2q6:{title:"Socket programming in C + epoll",xp:140,phase:"p2"},
  p2q7:{title:"PROJECT: HTTP/1.1 server in C",xp:200,phase:"p2"},p2q8:{title:"Wireshark: HTTP, TCP, TLS analysis",xp:70,phase:"p2"},
  p2q9:{title:"LeetCode: 50 problems — trees, graphs",xp:100,phase:"p2"},p2q10:{title:"CS:APP Ch.1–6: memory hierarchy",xp:120,phase:"p2"},
  p3q1:{title:"Node.js internals: event loop, libuv",xp:120,phase:"p3"},p3q2:{title:"Fastify: routing, validation, hooks",xp:100,phase:"p3"},
  p3q3:{title:"PostgreSQL: indexing, EXPLAIN, MVCC",xp:130,phase:"p3"},p3q4:{title:"Redis: data types, TTL, persistence",xp:100,phase:"p3"},
  p3q5:{title:"PROJECT: HTTP Load Balancer",xp:200,phase:"p3"},p3q6:{title:"PROJECT: Multi-tenant SaaS API",xp:220,phase:"p3"},
  p3q7:{title:"Grafana + Prometheus: dashboards",xp:100,phase:"p3"},p3q8:{title:"Docker: Dockerfiles + compose",xp:110,phase:"p3"},
  p3q9:{title:"Deploy to VPS: nginx, SSL, systemd",xp:100,phase:"p3"},p3q10:{title:"First technical blog post",xp:80,phase:"p3"},
  p4q1:{title:"PortSwigger: SQLi, XSS, CSRF, SSRF",xp:150,phase:"p4"},p4q2:{title:"PortSwigger: auth, access control",xp:130,phase:"p4"},
  p4q3:{title:"Burp Suite: all labs complete",xp:100,phase:"p4"},p4q4:{title:"Bug Bounty: first real report submitted",xp:250,phase:"p4"},
  p4q5:{title:"GitHub portfolio: 5 pinned projects",xp:120,phase:"p4"},p4q6:{title:"Second technical blog post",xp:80,phase:"p4"},
  p4q7:{title:"LeetCode 150+ + 5 mock interviews",xp:150,phase:"p4"},p4q8:{title:"Resume: ATS-clean, backend focused",xp:70,phase:"p4"},
  p4q9:{title:"Applied to Juspay/Razorpay/BrowserStack",xp:100,phase:"p4"},p4q10:{title:"PortSwigger certificate earned",xp:120,phase:"p4"},
  p5q1:{title:"Rust Book: ownership, borrowing, lifetimes",xp:150,phase:"p5"},p5q2:{title:"Rust async/await + tokio",xp:140,phase:"p5"},
  p5q3:{title:"CS:APP Ch.7–12: concurrency, networking",xp:150,phase:"p5"},p5q4:{title:"Thread pool + lock-free ring buffer",xp:200,phase:"p5"},
  p5q5:{title:"Profiling: perf, flamegraphs, cache",xp:120,phase:"p5"},p5q6:{title:"PROJECT: Redis-like KV store in C",xp:250,phase:"p5"},
  p5q7:{title:"KV store: replication + snapshotting",xp:200,phase:"p5"},p5q8:{title:"KV store benchmark vs Redis",xp:130,phase:"p5"},
  p5q9:{title:"POSIX: signals, shared memory, semaphores",xp:100,phase:"p5"},p5q10:{title:"LeetCode 50: hard DP, segment trees",xp:100,phase:"p5"},
  p6q1:{title:"OWASP Top 10 deep dive + labs",xp:120,phase:"p6"},p6q2:{title:"Recon: amass, subfinder, nmap",xp:130,phase:"p6"},
  p6q3:{title:"Burp Suite Pro: scanner, Collaborator",xp:120,phase:"p6"},p6q4:{title:"Hunt: IDOR, CORS, JWT, OAuth",xp:200,phase:"p6"},
  p6q5:{title:"PROJECT: Web Security Scanner",xp:220,phase:"p6"},p6q6:{title:"CTF: 5 web challenges HackTheBox",xp:150,phase:"p6"},
  p6q7:{title:"Bug Bounty: 2 more P3+ reports",xp:300,phase:"p6"},p6q8:{title:"GraphQL security: introspection abuse",xp:100,phase:"p6"},
  p6q9:{title:"CTF writeup repo: 10+ writeups",xp:130,phase:"p6"},p6q10:{title:"Web App Hacker's Handbook",xp:110,phase:"p6"},
  p7q1:{title:"x86-64 assembly: registers, stack frames",xp:150,phase:"p7"},p7q2:{title:"GDB + pwndbg: heap, ASLR bypass",xp:130,phase:"p7"},
  p7q3:{title:"Ghidra: static analysis, decompiler",xp:140,phase:"p7"},p7q4:{title:"pwn.college: intro + program misuse",xp:200,phase:"p7"},
  p7q5:{title:"Exploit: stack BOF, ret2libc, ROP chains",xp:250,phase:"p7"},p7q6:{title:"Heap: UAF, double free, tcache",xp:200,phase:"p7"},
  p7q7:{title:"CTF: 10 pwn challenges solved",xp:200,phase:"p7"},p7q8:{title:"RE: real binary in sandbox",xp:180,phase:"p7"},
  p7q9:{title:"Hacking: Art of Exploitation",xp:120,phase:"p7"},p7q10:{title:"5 pwn writeups with exploit code",xp:130,phase:"p7"},
  p8q1:{title:"DDIA full book",xp:200,phase:"p8"},p8q2:{title:"Raft: leader election + log replication",xp:280,phase:"p8"},
  p8q3:{title:"PROJECT: Distributed KV store (Raft)",xp:300,phase:"p8"},p8q4:{title:"Kafka: producers, consumers, ISR",xp:120,phase:"p8"},
  p8q5:{title:"eBPF: XDP program + syscall tracing",xp:200,phase:"p8"},p8q6:{title:"OSS: merged PR in fastify/undici",xp:250,phase:"p8"},
  p8q7:{title:"Performance: p99 profiling, bpftrace",xp:150,phase:"p8"},p8q8:{title:"Chaos engineering: fault injection",xp:130,phase:"p8"},
  p8q9:{title:"Raft + Dynamo + Spanner summaries",xp:150,phase:"p8"},p8q10:{title:"2 blog posts: dist systems + security",xp:100,phase:"p8"},
  p9q1:{title:"Multi-Raft: shard management",xp:300,phase:"p9"},p9q2:{title:"Kafka: exactly-once semantics",xp:200,phase:"p9"},
  p9q3:{title:"PROJECT: Stream processing engine",xp:280,phase:"p9"},p9q4:{title:"CRDTs: G-counter, OR-set, delta-state",xp:200,phase:"p9"},
  p9q5:{title:"Spanner + MapReduce implementations",xp:220,phase:"p9"},p9q6:{title:"Kubernetes: CRDs, operators, webhooks",xp:150,phase:"p9"},
  p9q7:{title:"Vector clocks: causal consistency",xp:220,phase:"p9"},p9q8:{title:"Lamport clocks from scratch",xp:150,phase:"p9"},
  p9q9:{title:"OSS: contribution to etcd/TiKV",xp:280,phase:"p9"},p9q10:{title:"Blog targeting HN front page",xp:150,phase:"p9"},
  p10q1:{title:"Compiler: lexer, parser, AST, IR gen",xp:300,phase:"p10"},p10q2:{title:"LLVM pass + IR optimization",xp:250,phase:"p10"},
  p10q3:{title:"LLVM paper summary",xp:150,phase:"p10"},p10q4:{title:"Linux kernel module: char driver",xp:250,phase:"p10"},
  p10q5:{title:"eBPF advanced: kprobes, CO-RE, libbpf",xp:230,phase:"p10"},p10q6:{title:"Kernel debugging: KASAN, UBSAN",xp:200,phase:"p10"},
  p10q7:{title:"JIT compiler: Brainfuck to x86-64",xp:280,phase:"p10"},p10q8:{title:"Memory management: slab, huge pages",xp:180,phase:"p10"},
  p10q9:{title:"Syscall tracing: ptrace, seccomp-bpf",xp:180,phase:"p10"},p10q10:{title:"Kernel patch to mailing list",xp:350,phase:"p10"},
  p11q1:{title:"Kernel exploit: ret2usr, SMEP bypass",xp:350,phase:"p11"},p11q2:{title:"Fuzzing: AFL++, libFuzzer",xp:300,phase:"p11"},
  p11q3:{title:"OSS audit + vuln documentation",xp:280,phase:"p11"},p11q4:{title:"CVE: found + disclosed 1 real vuln",xp:500,phase:"p11"},
  p11q5:{title:"Browser exploitation: V8 JIT bugs",xp:250,phase:"p11"},p11q6:{title:"pwn.college: advanced exploit modules",xp:250,phase:"p11"},
  p11q7:{title:"Full exploit chain report",xp:200,phase:"p11"},p11q8:{title:"Live hacking event participation",xp:300,phase:"p11"},
  p11q9:{title:"Shellcoder's Handbook: kernel chapters",xp:150,phase:"p11"},p11q10:{title:"Contribution to syzkaller/AFL++",xp:280,phase:"p11"},
  p12q1:{title:"Capstone: distributed DB + security",xp:400,phase:"p12"},p12q2:{title:"OSS: 3+ PRs in etcd/TiKV/Linux",xp:350,phase:"p12"},
  p12q3:{title:"Technical talk at conference/meetup",xp:300,phase:"p12"},p12q4:{title:"Portfolio case studies with metrics",xp:200,phase:"p12"},
  p12q5:{title:"Positioning statement + updated profiles",xp:150,phase:"p12"},p12q6:{title:"Applied to global infra roles",xp:200,phase:"p12"},
  p12q7:{title:"Research blog post on HN",xp:250,phase:"p12"},p12q8:{title:"All 7 research papers summarized",xp:250,phase:"p12"},
  p12q9:{title:"Mentoring a junior engineer",xp:200,phase:"p12"},p12q10:{title:"Final Skill Assessment: all targets met",xp:300,phase:"p12"},
};

const TOTAL_XP     = Object.values(QUEST_MAP).reduce((s,q)=>s+q.xp,0);
const TOTAL_QUESTS = Object.keys(QUEST_MAP).length;
const YEAR_CLR     = { 1:"#00d4ff", 2:"#a855f7", 3:"#ffb800" };

const FALLBACK_QUOTES = [
  "The gap between you and elite is measured in hours of discomfort they chose not to endure.",
  "You do not become a systems engineer. You become one by refusing to stay on the surface.",
  "Every abstraction you do not understand is a ceiling. Build the ladder or stay down.",
  "The kernel does not care about your feelings. Neither does the deadline. Ship it.",
  "Average engineers use tools. Elite engineers understand what the tools are hiding.",
  "Build it until it breaks. Break it until you understand it. Fear nothing after that.",
  "There is no shortcut to low-level mastery. Only the ones who went deep are still standing.",
];

// ─── RANK SYSTEM ─────────────────────────────────────────────────────────────
// Tiered like competitive games — each rank has a division (III→II→I) and an SVG emblem

const RANK_TIERS = [
  {
    tier:"PLASTIC", divs:3, minXp:0,     color:"#78716c", glow:"rgba(120,113,108,.4)",
    gradient:["#44403c","#78716c"],
    emblem: (c) => `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <polygon points="30,6 54,18 54,42 30,54 6,42 6,18" fill="none" stroke="${c}" stroke-width="2.5" opacity=".5"/>
      <polygon points="30,14 46,22 46,38 30,46 14,38 14,22" fill="${c}" opacity=".15"/>
      <circle cx="30" cy="30" r="8" fill="${c}" opacity=".6"/>
    </svg>`
  },
  {
    tier:"IRON", divs:3, minXp:500,    color:"#94a3b8", glow:"rgba(148,163,184,.4)",
    gradient:["#64748b","#94a3b8"],
    emblem: (c) => `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <polygon points="30,4 56,20 56,40 30,56 4,40 4,20" fill="none" stroke="${c}" stroke-width="2.5"/>
      <polygon points="30,12 48,22 48,38 30,48 12,38 12,22" fill="${c}" opacity=".15"/>
      <polygon points="30,20 40,26 40,34 30,40 20,34 20,26" fill="${c}" opacity=".5"/>
    </svg>`
  },
  {
    tier:"BRONZE", divs:3, minXp:2000,  color:"#cd7f32", glow:"rgba(205,127,50,.5)",
    gradient:["#92400e","#cd7f32"],
    emblem: (c) => `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <polygon points="30,4 56,18 56,42 30,56 4,42 4,18" fill="${c}" opacity=".12"/>
      <polygon points="30,4 56,18 56,42 30,56 4,42 4,18" fill="none" stroke="${c}" stroke-width="2.5"/>
      <path d="M30 14 L40 24 L38 38 L30 44 L22 38 L20 24Z" fill="${c}" opacity=".6"/>
      <circle cx="30" cy="30" r="5" fill="${c}"/>
    </svg>`
  },
  {
    tier:"SILVER", divs:3, minXp:4500,  color:"#e2e8f0", glow:"rgba(226,232,240,.5)",
    gradient:["#94a3b8","#e2e8f0"],
    emblem: (c) => `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <polygon points="30,3 57,18 57,42 30,57 3,42 3,18" fill="${c}" opacity=".08"/>
      <polygon points="30,3 57,18 57,42 30,57 3,42 3,18" fill="none" stroke="${c}" stroke-width="2"/>
      <polygon points="30,12 48,22 48,38 30,48 12,38 12,22" fill="none" stroke="${c}" stroke-width="1.5" opacity=".5"/>
      <polygon points="30,20 42,27 42,33 30,40 18,33 18,27" fill="${c}" opacity=".7"/>
      <circle cx="30" cy="30" r="4" fill="${c}"/>
    </svg>`
  },
  {
    tier:"GOLD", divs:3, minXp:7000,  color:"#fbbf24", glow:"rgba(251,191,36,.55)",
    gradient:["#b45309","#fbbf24"],
    emblem: (c) => `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <polygon points="30,2 57,16 57,44 30,58 3,44 3,16" fill="${c}" opacity=".1"/>
      <polygon points="30,2 57,16 57,44 30,58 3,44 3,16" fill="none" stroke="${c}" stroke-width="2.5"/>
      <polygon points="30,10 50,20 50,40 30,50 10,40 10,20" fill="none" stroke="${c}" stroke-width="1.5" opacity=".5"/>
      <path d="M30 18 L36 26 L44 26 L38 32 L40 40 L30 35 L20 40 L22 32 L16 26 L24 26Z" fill="${c}" opacity=".85"/>
    </svg>`
  },
  {
    tier:"PLATINUM", divs:3, minXp:10000, color:"#67e8f9", glow:"rgba(103,232,249,.55)",
    gradient:["#0e7490","#67e8f9"],
    emblem: (c) => `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <polygon points="30,2 58,16 58,44 30,58 2,44 2,16" fill="${c}" opacity=".08"/>
      <polygon points="30,2 58,16 58,44 30,58 2,44 2,16" fill="none" stroke="${c}" stroke-width="2.5"/>
      <polygon points="30,10 52,20 52,40 30,50 8,40 8,20" fill="none" stroke="${c}" stroke-width="1.2" opacity=".4"/>
      <path d="M30 16 L37 25 L46 24 L41 32 L44 41 L30 36 L16 41 L19 32 L14 24 L23 25Z" fill="${c}" opacity=".8"/>
      <circle cx="30" cy="30" r="5" fill="${c}"/>
    </svg>`
  },
  {
    tier:"DIAMOND", divs:3, minXp:13000, color:"#a78bfa", glow:"rgba(167,139,250,.6)",
    gradient:["#5b21b6","#a78bfa"],
    emblem: (c) => `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <polygon points="30,4 56,22 56,38 30,56 4,38 4,22" fill="${c}" opacity=".1"/>
      <polygon points="30,4 56,22 56,38 30,56 4,38 4,22" fill="none" stroke="${c}" stroke-width="2.5"/>
      <polygon points="30,13 48,24 48,36 30,47 12,36 12,24" fill="none" stroke="${c}" stroke-width="1.5" opacity=".45"/>
      <polygon points="30,22 40,28 40,32 30,38 20,32 20,28" fill="${c}" opacity=".9"/>
      <line x1="30" y1="4" x2="30" y2="56" stroke="${c}" stroke-width=".6" opacity=".3"/>
      <line x1="4" y1="22" x2="56" y2="38" stroke="${c}" stroke-width=".6" opacity=".3"/>
      <line x1="4" y1="38" x2="56" y2="22" stroke="${c}" stroke-width=".6" opacity=".3"/>
    </svg>`
  },
  {
    tier:"MASTER", divs:1, minXp:15500, color:"#f472b6", glow:"rgba(244,114,182,.6)",
    gradient:["#9d174d","#f472b6"],
    emblem: (c) => `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <polygon points="30,2 58,14 58,46 30,58 2,46 2,14" fill="${c}" opacity=".1"/>
      <polygon points="30,2 58,14 58,46 30,58 2,46 2,14" fill="none" stroke="${c}" stroke-width="3"/>
      <path d="M30 10 L38 22 L50 18 L44 30 L52 40 L40 38 L34 50 L30 38 L26 50 L20 38 L8 40 L16 30 L10 18 L22 22Z" fill="${c}" opacity=".75"/>
    </svg>`
  },
  {
    tier:"GRANDMASTER", divs:1, minXp:16500, color:"#f87171", glow:"rgba(248,113,113,.7)",
    gradient:["#991b1b","#f87171"],
    emblem: (c) => `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <polygon points="30,1 59,13 59,47 30,59 1,47 1,13" fill="${c}" opacity=".12"/>
      <polygon points="30,1 59,13 59,47 30,59 1,47 1,13" fill="none" stroke="${c}" stroke-width="3"/>
      <polygon points="30,10 52,20 52,40 30,50 8,40 8,20" fill="none" stroke="${c}" stroke-width="1.5" opacity=".5"/>
      <path d="M30 8 L36 20 L48 16 L42 26 L50 36 L38 34 L34 46 L30 34 L26 46 L22 34 L10 36 L18 26 L12 16 L24 20Z" fill="${c}" opacity=".85"/>
      <circle cx="30" cy="30" r="6" fill="${c}"/>
    </svg>`
  },
  {
    tier:"CHALLENGER", divs:1, minXp:17000, color:"#ffd700", glow:"rgba(255,215,0,.8)",
    gradient:["#78350f","#ffd700"],
    emblem: (c) => `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <polygon points="30,1 59,12 59,48 30,59 1,48 1,12" fill="${c}" opacity=".15"/>
      <polygon points="30,1 59,12 59,48 30,59 1,48 1,12" fill="none" stroke="${c}" stroke-width="3.5"/>
      <polygon points="30,8 54,18 54,42 30,52 6,42 6,18" fill="none" stroke="${c}" stroke-width="1.5" opacity=".5"/>
      <path d="M30 6 L37 18 L50 14 L44 25 L54 34 L41 33 L36 46 L30 33 L24 46 L19 33 L6 34 L16 25 L10 14 L23 18Z" fill="${c}" opacity=".9"/>
      <circle cx="30" cy="30" r="7" fill="${c}"/>
      <circle cx="30" cy="30" r="3" fill="#000" opacity=".5"/>
    </svg>`
  },
];

// How many XP "divisions" span each tier
const getFullRankInfo = (xp) => {
  let tierIdx = 0;
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (xp >= RANK_TIERS[i].minXp) tierIdx = i; else break;
  }
  const tier = RANK_TIERS[tierIdx];
  const nextTier = RANK_TIERS[tierIdx + 1] || null;
  const tierXpSpan = nextTier ? nextTier.minXp - tier.minXp : 1000;
  const divSpan    = tierXpSpan / tier.divs;
  const xpInTier   = xp - tier.minXp;
  const divIdx     = Math.min(Math.floor(xpInTier / divSpan), tier.divs - 1);
  const divLabel   = tier.divs > 1 ? ["III","II","I"][divIdx] : null;
  const divFloor   = tier.minXp + divIdx * divSpan;
  const divPct     = Math.min(((xp - divFloor) / divSpan) * 100, 100);
  const xpToNextDiv = nextTier
    ? (divIdx === tier.divs - 1 ? nextTier.minXp - xp : divFloor + divSpan - xp)
    : 0;
  return { tier, nextTier, divLabel, divPct, xpToNextDiv, divIdx };
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const todayKey = () => new Date().toISOString().split("T")[0];
const fmt2 = (n) => String(n).padStart(2,"0");

const calcStreak = (completed) => {
  const dateSet = new Set();
  Object.values(completed).forEach(ts => {
    const d = new Date(ts);
    dateSet.add(`${d.getFullYear()}-${fmt2(d.getMonth()+1)}-${fmt2(d.getDate())}`);
  });
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${fmt2(today.getMonth()+1)}-${fmt2(today.getDate())}`;
  let streak = 0;
  const start = dateSet.has(todayStr) ? 0 : 1;
  for (let i = start; i < 400; i++) {
    const d = new Date(today); d.setDate(d.getDate()-i);
    const k = `${d.getFullYear()}-${fmt2(d.getMonth()+1)}-${fmt2(d.getDate())}`;
    if (dateSet.has(k)) streak++; else break;
  }
  return streak;
};

const timeAgo = (ts) => {
  const s = Math.floor((Date.now()-ts)/1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&family=Bebas+Neue&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:#000;color:#e2e8f0;font-family:'Rajdhani',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased;overflow-x:hidden;}
::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-track{background:#000;}::-webkit-scrollbar-thumb{background:#0d1a26;border-radius:2px;}

.page{max-width:680px;margin:0 auto;padding-bottom:60px;}

/* ── HERO ── */
.hero{position:relative;width:100%;height:90vw;max-height:580px;overflow:hidden;}
.hero-img{width:100%;height:100%;object-fit:cover;object-position:center 8%;display:block;filter:contrast(1.06) saturate(1.1);}
.hero-scanlines{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.07) 2px,rgba(0,0,0,.07) 4px);pointer-events:none;z-index:1;}
.hero-tint{position:absolute;inset:0;background:radial-gradient(ellipse 60% 40% at 50% 30%,rgba(180,10,10,.07) 0%,transparent 70%);pointer-events:none;z-index:2;}
.hero-gradient{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.5) 0%,rgba(0,0,0,.04) 22%,rgba(0,0,0,0) 44%,rgba(0,0,0,.55) 65%,rgba(0,0,0,.93) 82%,#000 100%);pointer-events:none;z-index:2;}

/* spidey sticker */
.spidey-sticker{position:absolute;bottom:22px;right:16px;z-index:10;transform:rotate(12deg);filter:drop-shadow(0 4px 12px rgba(0,0,0,0.7)) drop-shadow(0 0 8px rgba(200,0,0,0.3));transition:transform .3s ease;}
.spidey-sticker:hover{transform:rotate(6deg) scale(1.08);}

/* top badges */
.hero-top{position:absolute;top:14px;left:14px;right:14px;display:flex;align-items:center;justify-content:space-between;z-index:10;}
.live-pill{display:inline-flex;align-items:center;gap:6px;background:rgba(0,0,0,.6);border:1px solid rgba(0,255,136,.28);border-radius:20px;padding:5px 12px;font-family:'Share Tech Mono',monospace;font-size:10px;color:#00ff88;letter-spacing:2px;}
.live-dot-a{width:6px;height:6px;border-radius:50%;background:#00ff88;animation:ldot 1.8s ease infinite;}
@keyframes ldot{0%,100%{box-shadow:0 0 0 0 rgba(0,255,136,.45)}60%{box-shadow:0 0 0 5px transparent}}
.handle-pill{background:rgba(0,0,0,.6);border:1px solid rgba(0,212,255,.22);border-radius:6px;padding:5px 12px;font-family:'Share Tech Mono',monospace;font-size:11px;color:#00d4ff;letter-spacing:2px;display:flex;align-items:center;gap:5px;}
.blink{animation:bl 1.1s step-end infinite;}
@keyframes bl{0%,100%{opacity:1}50%{opacity:0}}

/* live clock */
.hero-clock{position:absolute;bottom:26px;left:0;right:0;z-index:10;display:flex;flex-direction:column;align-items:center;}
.ck-time{font-family:'Share Tech Mono',monospace;font-size:clamp(36px,9.5vw,62px);font-weight:700;color:rgba(255,255,255,.96);letter-spacing:5px;line-height:1;text-shadow:0 0 28px rgba(0,212,255,.5),0 0 55px rgba(0,212,255,.18),0 2px 8px rgba(0,0,0,.8);}
.ck-colon{transition:opacity .08s;}
.ck-date{font-family:'Share Tech Mono',monospace;font-size:clamp(10px,2.4vw,13px);color:rgba(0,212,255,.78);letter-spacing:4px;text-transform:uppercase;margin-top:5px;text-shadow:0 0 10px rgba(0,212,255,.35);}
.ck-tz{font-family:'Share Tech Mono',monospace;font-size:9px;color:rgba(255,255,255,.2);letter-spacing:3px;margin-top:2px;}

/* ── CONTENT ── */
.cnt{padding:0 14px;}

@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&display=swap');

/* telegram profile */
.tg-profile{display:flex;align-items:center;gap:12px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,.04);}
.tg-avatar-wrap{position:relative;flex-shrink:0;}
.tg-avatar{width:52px;height:52px;border-radius:50%;object-fit:cover;display:block;border:2px solid rgba(255,255,255,.08);}
.tg-avatar-ring{position:absolute;inset:-3px;border-radius:50%;border:2px solid var(--rc);opacity:.5;animation:tg-ring 2.5s ease infinite;}
@keyframes tg-ring{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.06);opacity:.9}}
.tg-avatar-fallback{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#0d1a26,#1a2d40);border:2px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--rc);letter-spacing:2px;}
.tg-info{flex:1;min-width:0;}
.tg-name{font-family:'Cinzel Decorative',serif;font-size:18px;font-weight:900;letter-spacing:1.5px;background:linear-gradient(135deg,#fff 40%,var(--rc));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1.1;margin-bottom:3px;filter:drop-shadow(0 0 6px var(--rg));}
.tg-handle{font-family:'Share Tech Mono',monospace;font-size:10px;color:#334155;letter-spacing:1px;margin-bottom:3px;}
.tg-bio{font-size:11px;color:#475569;line-height:1.4;font-family:'Rajdhani',sans-serif;font-weight:500;}
.tg-loading{font-family:'Share Tech Mono',monospace;font-size:9px;color:#1a2d40;letter-spacing:2px;animation:qfa 1.4s ease infinite;}

/* rank card */
.rank-card{background:#050810;border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:18px 16px 14px;margin-bottom:12px;position:relative;overflow:hidden;contain:layout style;}
.rank-card::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 90% 55% at 50% -5%,var(--rg) 0%,transparent 65%);pointer-events:none;}
.rank-card::after{content:"";position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--rc),transparent);}

/* name row */
.rank-name-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.rank-name{font-family:'Cinzel Decorative',serif;font-size:22px;font-weight:900;letter-spacing:2px;background:linear-gradient(135deg,#fff 40%,var(--rc));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;filter:drop-shadow(0 0 8px var(--rg));}
.rank-level-tag{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:6px;padding:4px 10px;text-align:center;}
.rank-lvl-num{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:3px;color:var(--rc);line-height:1;display:block;}
.rank-lvl-lbl{font-family:'Share Tech Mono',monospace;font-size:8px;color:#1a2d40;letter-spacing:2px;}

/* emblem + info row */
.rank-body{display:flex;align-items:center;gap:14px;margin-bottom:14px;}
.rank-emblem{width:64px;height:64px;flex-shrink:0;filter:drop-shadow(0 0 10px var(--rg));animation:emblem-float 3.5s ease-in-out infinite;will-change:transform;}
@keyframes emblem-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.rank-info{flex:1;min-width:0;}
.rank-tier-row{display:flex;align-items:baseline;gap:8px;margin-bottom:4px;}
.rank-tier{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:4px;color:var(--rc);line-height:1;text-shadow:0 0 20px var(--rg);}
.rank-div{font-family:'Bebas Neue',sans-serif;font-size:20px;color:rgba(255,255,255,.3);letter-spacing:2px;line-height:1;}
.rank-desc{font-family:'Share Tech Mono',monospace;font-size:9px;color:#334155;letter-spacing:1px;margin-top:2px;}

/* progress */
.rank-prog-lbl{display:flex;justify-content:space-between;margin-bottom:5px;}
.rank-prog-l{font-family:'Share Tech Mono',monospace;font-size:9px;color:#1a2d40;letter-spacing:1px;}
.rank-prog-r{font-family:'Share Tech Mono',monospace;font-size:9px;}
.rank-bar{height:5px;background:#030609;border-radius:3px;overflow:hidden;margin-bottom:7px;position:relative;}
.rank-bar-fill{height:100%;border-radius:3px;transition:width 1.3s .5s cubic-bezier(.4,0,.2,1);}
.rank-bar-glow{position:absolute;top:0;right:0;width:20px;height:100%;background:linear-gradient(90deg,transparent,var(--rc));opacity:.6;border-radius:3px;pointer-events:none;}
.rank-next-lbl{font-family:'Share Tech Mono',monospace;font-size:9px;color:#1a2d40;letter-spacing:.5px;}
.rank-next-lbl span{color:#334155;}

/* sub header */
.id-sub-row{display:flex;justify-content:space-between;align-items:center;padding:0 0 12px;border-bottom:1px solid #0d1a26;margin-bottom:12px;}
.id-sub{font-family:'Share Tech Mono',monospace;font-size:9px;color:#1a2d40;letter-spacing:2px;}
.id-handle{font-family:'Share Tech Mono',monospace;font-size:10px;color:#334155;letter-spacing:1px;}

/* xp strip */
.xp-row{display:flex;justify-content:space-between;margin-bottom:5px;}
.xp-l{font-family:'Share Tech Mono',monospace;font-size:10px;color:#1e2d40;letter-spacing:1px;}
.xp-v{font-family:'Share Tech Mono',monospace;font-size:11px;color:#00ff88;}
.bar{height:4px;background:#080d14;border-radius:2px;overflow:hidden;margin-bottom:14px;}
.bfill{height:100%;width:100%;border-radius:2px;transform-origin:left center;transform:scaleX(0);transition:transform 1.2s cubic-bezier(.4,0,.2,1);will-change:transform;}

/* stats */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:12px;}
@media(max-width:380px){.stats-grid{grid-template-columns:repeat(2,1fr);}}
.sbox{background:#080d14;border:1px solid #0d1a26;border-radius:8px;padding:11px 8px;text-align:center;}
.sv{font-family:'Share Tech Mono',monospace;font-size:17px;font-weight:700;line-height:1;margin-bottom:3px;}
.sl{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#0d1a26;font-family:'Share Tech Mono',monospace;}

/* cards */
.card{background:#080d14;border:1px solid #0d1a26;border-radius:10px;padding:14px;margin-bottom:10px;contain:layout style;}
.clbl{font-family:'Share Tech Mono',monospace;font-size:9px;color:#1a2d40;letter-spacing:3px;text-transform:uppercase;margin-bottom:12px;}

/* current phase */
.cur-ph{position:relative;overflow:hidden;padding-left:16px;}
.cur-ph::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--pc);box-shadow:0 0 10px var(--pc);}
.cp-hd{display:flex;align-items:center;gap:8px;margin-bottom:3px;}
.cp-ic{font-size:19px;}
.cp-ti{font-size:15px;font-weight:700;color:#e2e8f0;letter-spacing:.3px;line-height:1.25;}
.cp-mt{font-family:'Share Tech Mono',monospace;font-size:9px;color:#1a2d40;letter-spacing:1px;margin-bottom:10px;}
.cp-br{display:flex;align-items:center;gap:8px;}
.cp-bk{flex:1;height:4px;background:#030609;border-radius:2px;overflow:hidden;}
.cp-bf{height:100%;width:100%;border-radius:2px;transform-origin:left center;transform:scaleX(0);transition:transform 1.2s .3s;will-change:transform;}
.cp-pc{font-family:'Share Tech Mono',monospace;font-size:12px;font-weight:700;min-width:34px;text-align:right;}

/* quote card */
.qcard{background:#080d14;border:1px solid #1a0a0a;border-left:3px solid #dc2626;border-radius:10px;padding:16px 16px 14px 20px;margin-bottom:10px;position:relative;overflow:hidden;}
.qcard::after{content:"";position:absolute;top:0;right:0;width:130px;height:100%;background:radial-gradient(ellipse at right,rgba(220,38,38,.04),transparent);pointer-events:none;}
.qlbl{font-family:'Share Tech Mono',monospace;font-size:9px;color:#7f1d1d;letter-spacing:3px;margin-bottom:10px;display:flex;align-items:center;gap:8px;}
.qpulse{width:5px;height:5px;border-radius:50%;background:#dc2626;animation:qp 2s ease infinite;}
@keyframes qp{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.4)}60%{box-shadow:0 0 0 5px transparent}}
.qtext{font-size:clamp(14px,4vw,17px);font-weight:600;color:#f1f5f9;line-height:1.6;letter-spacing:.3px;font-style:italic;}
.qload{font-family:'Share Tech Mono',monospace;font-size:11px;color:#334155;letter-spacing:2px;animation:qfa 1.4s ease infinite;}
@keyframes qfa{0%,100%{opacity:.35}50%{opacity:1}}

/* year bars */
.yr-row{display:flex;align-items:center;gap:10px;margin-bottom:9px;}
.yr-tag{font-family:'Share Tech Mono',monospace;font-size:10px;padding:3px 8px;border-radius:4px;border:1px solid;font-weight:600;min-width:46px;text-align:center;}
.yr-bar{flex:1;height:5px;background:#030609;border-radius:3px;overflow:hidden;}
.yr-fill{height:100%;width:100%;border-radius:3px;transform-origin:left center;transform:scaleX(0);transition:transform 1s .4s;will-change:transform;}
.yr-pct{font-family:'Share Tech Mono',monospace;font-size:11px;font-weight:700;min-width:32px;text-align:right;}

/* phases grid */
.ph-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;}
@media(max-width:320px){.ph-grid{grid-template-columns:repeat(3,1fr);}}
.phc{background:#030609;border:1px solid #0d1a26;border-radius:7px;padding:8px 6px;text-align:center;cursor:pointer;transition:all .2s;}
.phc:hover{background:#080d14;border-color:var(--pc);}
.phc.sel{border-color:var(--pc);background:#080d14;box-shadow:0 0 10px color-mix(in srgb,var(--pc) 15%,transparent);}
.phc.dim{opacity:.25;}
.ph-e{font-size:15px;display:block;margin-bottom:2px;}
.ph-n{font-family:'Share Tech Mono',monospace;font-size:8px;color:#1a2d40;}
.ph-p{font-family:'Share Tech Mono',monospace;font-size:11px;font-weight:700;margin-top:1px;}
.ph-b{height:2px;background:#0d1a26;border-radius:1px;margin-top:4px;overflow:hidden;}

/* activity */
.act-list{display:flex;flex-direction:column;gap:5px;}
.arow{display:flex;align-items:center;gap:8px;padding:7px 10px;background:#030609;border:1px solid #0d1a26;border-radius:7px;}
.adot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.atit{flex:1;font-size:12px;color:#334155;line-height:1.3;}
.axp{font-family:'Share Tech Mono',monospace;font-size:10px;font-weight:600;}
.atm{font-family:'Share Tech Mono',monospace;font-size:9px;color:#0d1a26;}

/* timeline */
.tl{display:flex;flex-direction:column;}
.tlrow{display:flex;gap:12px;}
.tll{display:flex;flex-direction:column;align-items:center;width:12px;flex-shrink:0;}
.tldot{width:10px;height:10px;border-radius:50%;border:2px solid #0d1a26;margin-top:3px;flex-shrink:0;transition:all .4s;}
.tlline{width:1px;background:#0d1a26;flex:1;min-height:24px;margin:3px 0;}
.tlr{padding-bottom:16px;flex:1;}
.tlwhen{font-family:'Share Tech Mono',monospace;font-size:9px;color:#1a2d40;letter-spacing:1px;margin-bottom:2px;}
.tlwhat{font-size:13px;font-weight:600;color:#334155;line-height:1.3;}
.tlrow.hit .tldot{border-color:var(--dc);background:var(--dc);}
.tlrow.hit .tlwhat{color:#94a3b8;}
.tlrow.now .tldot{border-color:var(--dc);background:transparent;box-shadow:0 0 8px var(--dc);}
.tlrow.now .tlwhat{color:#f1f5f9;}

/* footer */
.foot{text-align:center;padding:20px 14px 0;border-top:1px solid #0d1a26;margin-top:6px;}
.foot-l{font-family:'Share Tech Mono',monospace;font-size:9px;color:#0d1a26;letter-spacing:3px;margin-bottom:10px;}
.foot-t{display:inline-block;padding:8px 18px;border:1px solid rgba(0,212,255,.15);border-radius:6px;font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(0,212,255,.35);letter-spacing:2px;}

.loading-pg{display:flex;align-items:center;justify-content:center;height:100vh;font-family:'Share Tech Mono',monospace;font-size:11px;color:#0d1a26;letter-spacing:3px;}
@media(prefers-reduced-motion:reduce){
  .bfill,.rank-bar-fill,.yr-fill,.cp-bf{transition:none;}
  .rank-emblem,.live-dot-a,.tg-avatar-ring,.qpulse{animation:none;}
  *{transition-duration:.01ms!important;animation-duration:.01ms!important;}
}
`;

// ─── COMPONENT ────────────────────────────────────────────────────────────────


// ─── CLOCK COMPONENT (isolated — never causes profile to re-render) ──────────
const LiveClock = memo(function LiveClock() {
  const [time, setTime]   = useState(new Date());
  const [colon, setColon] = useState(true);
  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date());
      setColon(v => !v);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const MONS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const DAYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  const h = String(time.getHours()).padStart(2,"0");
  const m = String(time.getMinutes()).padStart(2,"0");
  const s = String(time.getSeconds()).padStart(2,"0");
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dateStr = `${DAYS[time.getDay()]} · ${String(time.getDate()).padStart(2,"0")} ${MONS[time.getMonth()]} ${time.getFullYear()}`;
  return (
    <div className="hero-clock">
      <div className="ck-time">
        {h}<span className="ck-colon" style={{opacity:colon?1:.3}}>:</span>
        {m}<span className="ck-colon" style={{opacity:colon?1:.3}}>:</span>{s}
      </div>
      <div className="ck-date">{dateStr}</div>
      <div className="ck-tz">{tz}</div>
    </div>
  );
});

export default function PublicProfile() {
  const [completed,     setCompleted]     = useState({});
  const [quote,         setQuote]         = useState(null);
  const [quoteLoading,  setQuoteLoading]  = useState(true);
  const [selPhase,      setSelPhase]      = useState(null);
  const [animated,      setAnimated]      = useState(false);
  const [loaded,        setLoaded]        = useState(false);
  const [tgProfile,     setTgProfile]     = useState(null);

  // ── MUSIC PLAYER ──
  const [isPlaying,     setIsPlaying]     = useState(true);
  const [musicVolume,   setMusicVolume]   = useState(0.35); // 30-40% range
  const [musicList,     setMusicList]     = useState([
    { name: "Lofi Chill", url: "/music/lofi.mp3" },
    { name: "Chill Mode", url: "/music/Chill.mp3" },
    { name: "Ambient", url: "/music/ambient.mp3" },
  ]);
  const [selectedTrack, setSelectedTrack] = useState(1);
  const audioRef = useRef(null);

  // ── FAST: Load profile + show immediately ──
  useEffect(() => {
    (async () => {
      try {
        console.log("PublicProfile: Loading profile for default user");
        const profile = await getProfile("default");
        if (profile && profile.completed) {
          console.log("PublicProfile: Loaded completed quests:", profile.completed);
          setCompleted(profile.completed);
        }
      } catch (error) {
        console.error("PublicProfile: Error loading profile:", error);
      }

      // Show fallback quote immediately (non-blocking)
      const today = todayKey();
      try {
        const cached = localStorage.getItem("daily-quote");
        if (cached) {
          const d = JSON.parse(cached);
          if (d.date === today) {
            console.log("PublicProfile: Using cached quote");
            setQuote(d.quote);
            setQuoteLoading(false);
          } else {
            // Use fallback if stale
            setQuote(FALLBACK_QUOTES[new Date().getDate() % FALLBACK_QUOTES.length]);
            setQuoteLoading(false);
          }
        } else {
          setQuote(FALLBACK_QUOTES[new Date().getDate() % FALLBACK_QUOTES.length]);
          setQuoteLoading(false);
        }
      } catch {
        setQuote(FALLBACK_QUOTES[new Date().getDate() % FALLBACK_QUOTES.length]);
        setQuoteLoading(false);
      }

      setLoaded(true);
      setTimeout(() => setAnimated(true), 80);
    })();
  }, []);

  // ── BACKGROUND: Fetch fresh quote from Gemini (non-blocking) ──
  useEffect(() => {
    if (!GEMINI_KEY) return;
    
    const today = todayKey();
    (async () => {
      try {
        // Check if fresh quote already cached
        const cached = localStorage.getItem("daily-quote");
        const d = cached ? JSON.parse(cached) : null;
        if (d?.date === today) return; // Already have today's quote

        console.log("PublicProfile: Fetching fresh quote from Gemini (background)");
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
          {
            method: "POST",
            signal: controller.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: "Write exactly one brutally honest, original motivational sentence (12–20 words) for a self-taught systems and security engineer pushing for elite status from a tier-3 college in India. No clichés, no speaker attribution, no quotes marks. Raw and intense. Output only the sentence."
                }]
              }],
              generationConfig: { temperature: 1.1, maxOutputTokens: 64 }
            })
          }
        );

        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const q = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().replace(/^["']|["']$/g, "");
          if (q && q.length > 10) {
            console.log("PublicProfile: Got fresh quote from Gemini");
            setQuote(q);
            localStorage.setItem("daily-quote", JSON.stringify({ date: today, quote: q }));
          }
        }
      } catch (error) {
        console.warn("PublicProfile: Background Gemini fetch failed (using cached):", error.message);
      }
    })();
  }, []);

  // ── BACKGROUND: Fetch Telegram profile (non-blocking) ──
  useEffect(() => {
    (async () => {
      try {
        const tgRes = await fetch("/api/telegram");
        if (tgRes.ok) {
          const tgData = await tgRes.json();
          if (!tgData.error) setTgProfile(tgData);
        }
      } catch {}
    })();
  }, []);

  // ── MUSIC PLAYER: Lazy load on first play ──
  const toggleMusic = async () => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.src = musicList[selectedTrack].url;
      audio.loop = true;
      audio.volume = musicVolume;
      audioRef.current = audio;

      audio.onerror = () => {
        console.warn("Music load failed");
        setIsPlaying(false);
      };
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.volume = Math.min(musicVolume, 0.4); // Cap at 40%
        audioRef.current.src = musicList[selectedTrack].url;
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.warn("Audio control failed:", error);
    }
  };

  const changeTrack = (index) => {
    setSelectedTrack(index);
    if (audioRef.current) {
      audioRef.current.src = musicList[index].url;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleVolumeChange = (e) => {
    const vol = Math.min(parseFloat(e.target.value), 0.4); // Cap at 40%
    setMusicVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  // Clock is handled by isolated LiveClock component

  // ── Derived stats (memoized) ──
  const earnedXP  = useMemo(() => Object.entries(completed).reduce((s,[id]) => s+(QUEST_MAP[id]?.xp||0), 0), [completed]);
  const totalDone = useMemo(() => Object.keys(completed).length, [completed]);
  const streak    = useMemo(() => calcStreak(completed), [completed]);
  const level     = useMemo(() => Math.floor(earnedXP/1000)+1, [earnedXP]);
  const lvlFloor  = useMemo(() => (level-1)*1000, [level]);
  const lvlPct    = useMemo(() => Math.min(((earnedXP-lvlFloor)/1000)*100, 100), [earnedXP, lvlFloor]);
  const ovPct     = useMemo(() => Math.round((totalDone/TOTAL_QUESTS)*100), [totalDone]);

  const phDone = useCallback((ph) => Object.keys(QUEST_MAP).filter(id=>QUEST_MAP[id].phase===ph.id&&completed[id]).length, [completed]);
  const phPct  = useCallback((ph) => Math.round((phDone(ph)/ph.quests)*100), [phDone]);
  const yrDone = useCallback((yr) => PHASES.filter(p=>p.year===yr).reduce((s,p)=>s+phDone(p),0), [phDone]);
  const yrTot  = useCallback((yr) => PHASES.filter(p=>p.year===yr).reduce((s,p)=>s+p.quests,0), []);
  const yrPct  = useCallback((yr) => Math.round((yrDone(yr)/yrTot(yr))*100), [yrDone, yrTot]);

  const curPhase   = useMemo(() => PHASES.find(p=>phPct(p)<100)||PHASES[PHASES.length-1], [phPct]);
  const showPhase  = useMemo(() => PHASES.find(p=>p.id===selPhase)||curPhase, [selPhase, curPhase]);

  const recent = useMemo(() => Object.entries(completed)
    .sort(([,a],[,b])=>b-a).slice(0,5)
    .map(([id,ts])=>({ id,ts,quest:QUEST_MAP[id] }))
    .filter(x=>x.quest), [completed]);

  // Timeline — memoized
  const timelineEntries = useMemo(() => PHASES
    .map(p => ({ phase: p, done: phDone(p), pct: phPct(p) }))
    .filter(e => e.done > 0 || e.phase.id === curPhase.id),
    [phDone, phPct, curPhase]);

  if (!loaded) return <><style>{CSS}</style><div className="loading-pg">INITIALIZING...</div></>;

  return (
    <>
      <style>{CSS}</style>
      <div className="page">

        {/* ── MUSIC PLAYER (Fixed bottom right) ── */}
        <div style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#0d1117",
          border: "1px solid #1e2d40",
          borderRadius: "12px",
          padding: "12px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          zIndex: 999,
          fontFamily: "'Share Tech Mono', monospace",
          boxShadow: "0 0 20px rgba(0,0,0,0.6)",
        }}>
          {/* Play/Pause Button */}
          <button
            onClick={toggleMusic}
            style={{
              background: isPlaying ? "#00ff8822" : "#1e2d40",
              border: `1px solid ${isPlaying ? "#00ff88" : "#1e2d40"}`,
              borderRadius: "6px",
              padding: "6px 10px",
              color: isPlaying ? "#00ff88" : "#64748b",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s",
              fontFamily: "inherit",
              fontWeight: "600",
            }}
            title="Play/Pause"
          >
            {isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
          </button>

          {/* Track Selector */}
          <select
            value={selectedTrack}
            onChange={(e) => changeTrack(parseInt(e.target.value))}
            style={{
              background: "#0f1925",
              border: "1px solid #1e2d40",
              color: "#64748b",
              borderRadius: "4px",
              padding: "4px 6px",
              cursor: "pointer",
              fontSize: "11px",
              fontFamily: "inherit",
            }}
          >
            {musicList.map((track, idx) => (
              <option key={idx} value={idx}>{track.name}</option>
            ))}
          </select>

          {/* Volume Control */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input
              type="range"
              min="0"
              max="0.4"
              step="0.05"
              value={musicVolume}
              onChange={handleVolumeChange}
              style={{
                width: "70px",
                height: "4px",
                cursor: "pointer",
                accentColor: "#00ff88",
              }}
              title="Volume (capped at 40%)"
            />
            <span style={{ fontSize: "10px", color: "#475569", minWidth: "28px" }}>
              {Math.round(musicVolume * 100)}%
            </span>
          </div>
        </div>

        {/* ── HERO ── */}
        <div className="hero">
          <img src="/bg.jpg" alt="" className="hero-img"/>
          <div className="hero-scanlines"/>
          <div className="hero-tint"/>
          <div className="hero-gradient"/>

          {/* badges */}
          <div className="hero-top">
            <div className="live-pill">
              <span className="live-dot-a"/>LIVE
            </div>
          </div>

          {/* Cat sticker */}
          <div className="spidey-sticker">
            <img src="/cat.jpg" alt="gamer cat" style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",border:"3px solid rgba(255,255,255,0.15)",boxShadow:"0 4px 20px rgba(0,0,0,0.7)"}}/>
          </div>

          {/* isolated clock — re-renders only itself */}
          <LiveClock />
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="cnt">

          {/* rank card */}
          {(() => {
            const { tier, nextTier, divLabel, divPct, xpToNextDiv } = getFullRankInfo(earnedXP);
            const svgStr = tier.emblem(tier.color);
            const glowVar = tier.glow;
            const nextLabel = nextTier
              ? (nextTier.divs > 1 ? `${nextTier.tier} III` : nextTier.tier)
              : null;
            return (
              <div className="rank-card" style={{"--rc": tier.color, "--rg": glowVar}}>
                {/* Telegram profile row */}
                <div className="tg-profile">
                  <div className="tg-avatar-wrap">
                    {tgProfile?.photoUrl
                      ? <img src={tgProfile.photoUrl} alt="profile" className="tg-avatar"/>
                      : <div className="tg-avatar-fallback">
                          {tgProfile ? (tgProfile.name||"K").charAt(0).toUpperCase() : "…"}
                        </div>
                    }
                    <div className="tg-avatar-ring"/>
                  </div>
                  <div className="tg-info">
                    {tgProfile
                      ? <>
                          <div className="tg-name">{tgProfile.name}</div>
                          {tgProfile.username && <div className="tg-handle">@{tgProfile.username}</div>}
                          {tgProfile.bio      && <div className="tg-bio">{tgProfile.bio}</div>}
                        </>
                      : <div className="tg-loading">LOADING PROFILE...</div>
                    }
                  </div>
                  <div className="rank-level-tag" style={{flexShrink:0}}>
                    <span className="rank-lvl-num">{String(level).padStart(2,"0")}</span>
                    <div className="rank-lvl-lbl">LEVEL</div>
                  </div>
                </div>

                {/* emblem + tier info */}
                <div className="rank-body">
                  <div className="rank-emblem"
                    dangerouslySetInnerHTML={{__html: svgStr}}/>
                  <div className="rank-info">
                    <div className="rank-tier-row">
                      <span className="rank-tier">{tier.tier}</span>
                      {divLabel && <span className="rank-div">{divLabel}</span>}
                    </div>
                    <div className="rank-desc">{tier.tier === "PLASTIC" ? "Yet to write a line of C" : tier.tier === "IRON" ? "The grind has started" : tier.tier === "BRONZE" ? "Linux flows through the fingers" : tier.tier === "SILVER" ? "Understands what the OS hides" : tier.tier === "GOLD" ? "Servers obey, APIs deployed" : tier.tier === "PLATINUM" ? "Finding cracks in things built" : tier.tier === "DIAMOND" ? "Breaks what others defend" : tier.tier === "MASTER" ? "Consensus, replication, chaos" : tier.tier === "GRANDMASTER" ? "Lives between ring 0 and ring 3" : "Top 1% — the target reached"}</div>
                  </div>
                </div>

                {/* progress */}
                <div className="rank-prog-lbl">
                  <span className="rank-prog-l">{divLabel ? `${tier.tier} ${divLabel}` : tier.tier} PROGRESS</span>
                  <span className="rank-prog-r" style={{color:tier.color}}>{Math.round(animated ? divPct : 0)}%</span>
                </div>
                <div className="rank-bar">
                  <div className="rank-bar-fill"
                    style={{transform:`scaleX(${animated?divPct/100:0})`,transformOrigin:"left center",background:`linear-gradient(90deg,${tier.gradient[0]},${tier.color})`}}/>
                  {divPct > 5 && <div className="rank-bar-glow"/>}
                </div>
                {nextLabel
                  ? <div className="rank-next-lbl">{xpToNextDiv.toLocaleString()} XP → <span>{nextLabel}</span></div>
                  : <div className="rank-next-lbl" style={{color:"#ffd700"}}>⚡ CHALLENGER — MAX RANK</div>
                }
              </div>
            );
          })()}

          {/* sub identity row */}
          <div className="id-sub-row">
            <div className="id-sub">BACKEND INFRA · SYSTEMS SECURITY · 2026→2029</div>
          </div>

          {/* xp bar */}
          <div className="xp-row">
            <span className="xp-l">JOURNEY XP</span>
            <span className="xp-v">{earnedXP.toLocaleString()} / {TOTAL_XP.toLocaleString()}</span>
          </div>
          <div className="bar">
            <div className="bfill" style={{transform:`scaleX(${animated?earnedXP/TOTAL_XP:0})`,transformOrigin:"left center",background:"linear-gradient(90deg,#00d4ff,#00ff88)"}}/>
          </div>

          {/* stats */}
          <div className="stats-grid">
            <div className="sbox"><div className="sv" style={{color:"#00d4ff"}}>{ovPct}%</div><div className="sl">COMPLETE</div></div>
            <div className="sbox"><div className="sv" style={{color:"#00ff88"}}>{totalDone}</div><div className="sl">QUESTS</div></div>
            <div className="sbox"><div className="sv" style={{color:streak>0?"#ff6b35":"#1a2d40"}}>{streak>0?`🔥${streak}`:"—"}</div><div className="sl">STREAK</div></div>
            <div className="sbox"><div className="sv" style={{color:"#a855f7"}}>{Math.round(lvlPct)}%</div><div className="sl">LVL {level}</div></div>
          </div>

          {/* current phase */}
          <div className="card cur-ph" style={{"--pc":showPhase.color}}>
            <div className="clbl">📍 CURRENTLY WORKING ON</div>
            <div className="cp-hd">
              <span className="cp-ic">{showPhase.icon}</span>
              <span className="cp-ti">Phase {showPhase.num}: {showPhase.title}</span>
            </div>
            <div className="cp-mt">YEAR {showPhase.year} · {showPhase.period}</div>
            <div className="cp-br">
              <div className="cp-bk">
                <div className="cp-bf" style={{transform:`scaleX(${animated?phPct(showPhase)/100:0})`,transformOrigin:"left center",background:showPhase.color}}/>
              </div>
              <span className="cp-pc" style={{color:showPhase.color}}>{phPct(showPhase)}%</span>
            </div>
          </div>

          {/* Daily Gemini quote */}
          <div className="qcard">
            <div className="qlbl">
              <span className="qpulse"/>
              TRANSMISSION · {new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}).toUpperCase()}
            </div>
            {quoteLoading
              ? <div className="qload">GENERATING...</div>
              : <div className="qtext">"{quote}"</div>
            }
          </div>

          {/* year bars */}
          <div className="card">
            <div className="clbl">Year Progress</div>
            {[1,2,3].map(yr => {
              const p=yrPct(yr), c=YEAR_CLR[yr];
              return (
                <div key={yr} className="yr-row">
                  <div className="yr-tag" style={{borderColor:c+"3a",color:c}}>YR{yr}</div>
                  <div className="yr-bar">
                    <div className="yr-fill" style={{transform:`scaleX(${animated?p/100:0})`,transformOrigin:"left center",background:`linear-gradient(90deg,${c},${c}66)`}}/>
                  </div>
                  <div className="yr-pct" style={{color:p>0?c:"#0d1a26"}}>{p}%</div>
                </div>
              );
            })}
          </div>

          {/* 12-phase grid */}
          <div className="card">
            <div className="clbl">All 12 Phases · tap to inspect</div>
            <div className="ph-grid">
              {PHASES.map(p => {
                const pct=phPct(p), isCur=p.id===curPhase.id, isSel=p.id===selPhase;
                return (
                  <div key={p.id}
                    className={`phc ${isCur||isSel?"sel":""} ${pct===0&&!isCur?"dim":""}`}
                    style={{"--pc":p.color}}
                    onClick={()=>setSelPhase(v=>v===p.id?null:p.id)}>
                    <span className="ph-e">{p.icon}</span>
                    <div className="ph-n">P{p.num}</div>
                    <div className="ph-p" style={{color:pct>0?p.color:isCur?p.color:"#0d1a26"}}>{pct}%</div>
                    <div className="ph-b">
                      <div style={{height:"100%",width:"100%",transform:`scaleX(${animated?pct/100:0})`,transformOrigin:"left center",background:p.color,borderRadius:1,transition:"transform 1s .5s"}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* recent activity */}
          {recent.length>0 && (
            <div className="card">
              <div className="clbl">Recent Activity</div>
              <div className="act-list">
                {recent.map(({id,ts,quest})=>{
                  const ph=PHASES.find(p=>p.id===quest.phase);
                  return (
                    <div key={id} className="arow">
                      <div className="adot" style={{background:ph?.color||"#334155"}}/>
                      <div className="atit">{quest.title}</div>
                      <div className="axp" style={{color:ph?.color||"#64748b"}}>+{quest.xp}</div>
                      <div className="atm">{timeAgo(ts)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* journey timeline — only shows real progress */}
          {timelineEntries.length > 0 && (
            <div className="card">
              <div className="clbl">Journey So Far</div>
              <div className="tl">
                {timelineEntries.map((entry, i) => {
                  const { phase, done, pct } = entry;
                  const isComplete = pct === 100;
                  const isActive   = phase.id === curPhase.id && !isComplete;
                  const isLast     = i === timelineEntries.length - 1;
                  const c          = phase.color;
                  return (
                    <div key={phase.id} className={`tlrow ${isComplete?"hit":isActive?"now":""}`} style={{"--dc":c}}>
                      <div className="tll">
                        <div className="tldot" style={{
                          borderColor: isComplete||isActive ? c : "#0d1a26",
                          background:  isComplete ? c : "transparent",
                        }}/>
                        {!isLast && <div className="tlline"/>}
                      </div>
                      <div className="tlr">
                        <div className="tlwhen">
                          {phase.icon} PHASE {phase.num} · {phase.period}
                        </div>
                        <div className="tlwhat" style={{color: isComplete?"#94a3b8":isActive?"#f1f5f9":"#334155"}}>
                          {phase.title}
                        </div>
                        <div style={{
                          fontFamily:"'Share Tech Mono',monospace",
                          fontSize:9,
                          color: isComplete ? c : isActive ? c : "#1a2d40",
                          marginTop:3,
                          letterSpacing:1,
                        }}>
                          {isComplete ? `✓ ${phase.quests}/${phase.quests} complete` : `${done}/${phase.quests} complete`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* footer */}
          <div className="foot">
            <div className="foot-l">QUEST LOG · SYNCED IN REAL TIME</div>
            <div className="foot-t">BACKEND + SECURITY · 2026–2029</div>
          </div>

        </div>
      </div>
    </>
  );
}
