import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { getProfile, saveProfile } from "./cloudStorage.js";


// ─── DATA ────────────────────────────────────────────────────────────────────

const PHASES = [
  { id:"p1",  year:1, num:1,  icon:"⚙️",  title:"C Programming + Linux Foundations",           period:"Mar–May 2026",    color:"#00ff88",
    quests:[
      {id:"p1q1",  title:"Read K.N. King Ch.1–8: C basics, control flow, functions, I/O",                 xp:100, tag:"book"},
      {id:"p1q2",  title:"Read K.N. King Ch.9–17: arrays, pointers, strings, structs",                   xp:150, tag:"book"},
      {id:"p1q3",  title:"Read K.N. King Ch.18–27: dynamic memory, files, advanced C",                   xp:150, tag:"book"},
      {id:"p1q4",  title:"Complete 30 C exercises: pointers, malloc/free, pointer arithmetic",            xp:120, tag:"code"},
      {id:"p1q5",  title:"Master GDB: step, breakpoints, watchpoints, backtrace, core dumps",             xp:80,  tag:"tools"},
      {id:"p1q6",  title:"Linux terminal fluency: vim, grep, awk, sed, pipes, cron, tmux",                xp:90,  tag:"linux"},
      {id:"p1q7",  title:"PROJECT: Mini Unix Shell in C — exec, fork, pipes, signal handling",            xp:200, tag:"project"},
      {id:"p1q8",  title:"PROJECT: Custom Memory Allocator — malloc/free from scratch in C",              xp:180, tag:"project"},
      {id:"p1q9",  title:"LeetCode: 50 problems in C — arrays, linked lists, hashing",                   xp:100, tag:"dsa"},
      {id:"p1q10", title:"Setup Linux dev environment: Ubuntu, dotfiles, tmux config, aliases",           xp:60,  tag:"linux"},
    ]
  },
  { id:"p2",  year:1, num:2,  icon:"🧠",  title:"Data Structures, OS Internals + Networking",  period:"Jun–Aug 2026",    color:"#00d4ff",
    quests:[
      {id:"p2q1",  title:"Read OSTEP: Virtualization — processes, threads, address spaces, scheduling",   xp:130, tag:"book"},
      {id:"p2q2",  title:"Read OSTEP: Concurrency — locks, semaphores, condition variables, monitors",    xp:120, tag:"book"},
      {id:"p2q3",  title:"Read OSTEP: Persistence — file systems, I/O devices, journaling",              xp:100, tag:"book"},
      {id:"p2q4",  title:"Implement in C: linked list, hash table, BST, min-heap, adjacency graph",      xp:150, tag:"code"},
      {id:"p2q5",  title:"TCP/IP deep dive: 3-way handshake, sliding window, congestion control",         xp:90,  tag:"networking"},
      {id:"p2q6",  title:"Socket programming: TCP server/client in C, epoll, non-blocking I/O",          xp:140, tag:"networking"},
      {id:"p2q7",  title:"PROJECT: HTTP/1.1 server in C — parse requests, serve static files",           xp:200, tag:"project"},
      {id:"p2q8",  title:"Wireshark: analyze HTTP, TCP handshake, DNS, TLS packets",                     xp:70,  tag:"tools"},
      {id:"p2q9",  title:"LeetCode: 50 more problems — trees, graphs, two-pointer, DP basics",           xp:100, tag:"dsa"},
      {id:"p2q10", title:"Read CS:APP Ch.1–6: data representation, assembly intro, memory hierarchy",    xp:120, tag:"book"},
    ]
  },
  { id:"p3",  year:1, num:3,  icon:"🚀",  title:"Node.js Backend + Databases + APIs",           period:"Sep–Nov 2026",    color:"#ffb800",
    quests:[
      {id:"p3q1",  title:"Node.js internals: event loop, libuv, streams, worker threads, backpressure",  xp:120, tag:"core"},
      {id:"p3q2",  title:"Fastify: routing, schema validation, hooks, middleware, error handling",        xp:100, tag:"code"},
      {id:"p3q3",  title:"PostgreSQL deep: indexing, EXPLAIN ANALYZE, transactions, MVCC, vacuuming",    xp:130, tag:"database"},
      {id:"p3q4",  title:"Redis: data types, pub/sub, TTL, LRU eviction, RDB/AOF persistence",           xp:100, tag:"database"},
      {id:"p3q5",  title:"PROJECT: HTTP Load Balancer in Node.js — round-robin, health checks, retry",   xp:200, tag:"project"},
      {id:"p3q6",  title:"PROJECT: Multi-tenant SaaS REST API — auth, rate-limit, pagination, deploy",   xp:220, tag:"project"},
      {id:"p3q7",  title:"Grafana + Prometheus: instrument the API, build dashboards, add alerts",       xp:100, tag:"observability"},
      {id:"p3q8",  title:"Docker: containerize all projects, write Dockerfiles + docker-compose",        xp:110, tag:"devops"},
      {id:"p3q9",  title:"Deploy to VPS (Hetzner/DigitalOcean): nginx, SSL, systemd service",           xp:100, tag:"devops"},
      {id:"p3q10", title:"Write first technical blog post about a system you built — publish it",        xp:80,  tag:"writing"},
    ]
  },
  { id:"p4",  year:1, num:4,  icon:"🔐",  title:"Security Intro + Portfolio + Internship Prep", period:"Dec 2026–Feb 2027",color:"#ff4d6d",
    quests:[
      {id:"p4q1",  title:"PortSwigger Web Academy: SQL injection, XSS, CSRF, SSRF — all labs",          xp:150, tag:"security"},
      {id:"p4q2",  title:"PortSwigger: auth vulnerabilities, access control, file upload attacks",       xp:130, tag:"security"},
      {id:"p4q3",  title:"Burp Suite: intercept, repeater, intruder, scanner — complete all labs",       xp:100, tag:"tools"},
      {id:"p4q4",  title:"HackerOne or Bugcrowd: submit 1 real bug bounty report (any severity)",        xp:250, tag:"security"},
      {id:"p4q5",  title:"GitHub portfolio: pin 5 projects with READMEs and architecture diagrams",      xp:120, tag:"portfolio"},
      {id:"p4q6",  title:"Write second technical blog post — security or systems topic",                 xp:80,  tag:"writing"},
      {id:"p4q7",  title:"LeetCode: reach 150+ problems, run 5 mock interview sessions",                 xp:150, tag:"dsa"},
      {id:"p4q8",  title:"Resume: 1-page, quantified impact, ATS-clean, tailored for backend roles",    xp:70,  tag:"career"},
      {id:"p4q9",  title:"Apply to 10 internships: Juspay, Razorpay, BrowserStack, Hasura",             xp:100, tag:"career"},
      {id:"p4q10", title:"PortSwigger: earn the certificate of completion",                              xp:120, tag:"security"},
    ]
  },
  { id:"p5",  year:2, num:5,  icon:"⚡",  title:"Systems Programming + Concurrency",            period:"Mar–May 2027",    color:"#a855f7",
    quests:[
      {id:"p5q1",  title:"Rust: ownership, borrowing, lifetimes — read The Rust Book cover to cover",    xp:150, tag:"rust"},
      {id:"p5q2",  title:"Rust: async/await, tokio runtime, channels, Arc/Mutex patterns",               xp:140, tag:"rust"},
      {id:"p5q3",  title:"Read CS:APP Ch.7–12: linking, I/O, network programming, concurrency",          xp:150, tag:"book"},
      {id:"p5q4",  title:"Implement: thread pool, lock-free ring buffer, work-stealing queue",           xp:200, tag:"code"},
      {id:"p5q5",  title:"Profiling: perf, flamegraphs, cache miss analysis, branch misprediction",      xp:120, tag:"tools"},
      {id:"p5q6",  title:"PROJECT: Redis-like KV store in C — TCP server, custom RESP protocol",         xp:250, tag:"project"},
      {id:"p5q7",  title:"Add replication to KV store: primary-replica model, snapshotting to disk",     xp:200, tag:"project"},
      {id:"p5q8",  title:"Benchmark KV store vs Redis: throughput, p99 latency, memory usage",           xp:130, tag:"project"},
      {id:"p5q9",  title:"POSIX advanced: signals, shared memory, semaphores, message queues",           xp:100, tag:"linux"},
      {id:"p5q10", title:"LeetCode: 50 more problems — hard DP, graph algorithms, segment trees",        xp:100, tag:"dsa"},
    ]
  },
  { id:"p6",  year:2, num:6,  icon:"🕷️", title:"Web Security Deep + Bug Bounty",               period:"Jun–Aug 2027",    color:"#ff6b35",
    quests:[
      {id:"p6q1",  title:"OWASP Top 10 (2021): deep dive every vulnerability class with labs",           xp:120, tag:"security"},
      {id:"p6q2",  title:"Recon mastery: amass, subfinder, nmap full-port, waybackurls, gau",            xp:130, tag:"tools"},
      {id:"p6q3",  title:"Burp Suite Pro: scanner, extensions, Collaborator, BApp store workflows",      xp:120, tag:"tools"},
      {id:"p6q4",  title:"Hunt: IDOR, broken auth, CORS misconfig, JWT attacks, OAuth flaws",            xp:200, tag:"security"},
      {id:"p6q5",  title:"PROJECT: Web Security Scanner — subdomain enum, CORS, header grader",          xp:220, tag:"project"},
      {id:"p6q6",  title:"CTF: complete 5 web challenges on HackTheBox or PicoCTF",                      xp:150, tag:"ctf"},
      {id:"p6q7",  title:"Submit 2 more bug bounty reports — target P3+ severity findings",              xp:300, tag:"security"},
      {id:"p6q8",  title:"GraphQL security: introspection abuse, IDOR, batching attacks, depth limits",  xp:100, tag:"security"},
      {id:"p6q9",  title:"CTF writeup repository: publish 10+ detailed writeups on GitHub",              xp:130, tag:"writing"},
      {id:"p6q10", title:"Read Web Application Hacker's Handbook — key chapters on methodology",         xp:110, tag:"book"},
    ]
  },
  { id:"p7",  year:2, num:7,  icon:"💀",  title:"Binary Exploitation + Reverse Engineering",   period:"Sep–Nov 2027",    color:"#00ff88",
    quests:[
      {id:"p7q1",  title:"x86-64 assembly: registers, calling conventions, stack frames, SIMD",          xp:150, tag:"asm"},
      {id:"p7q2",  title:"GDB + pwndbg: dynamic analysis, heap inspection, ASLR/PIE bypass",             xp:130, tag:"tools"},
      {id:"p7q3",  title:"Ghidra: static analysis, decompiler output, function recovery, xrefs",         xp:140, tag:"tools"},
      {id:"p7q4",  title:"pwn.college: complete intro to cybersecurity + program misuse track",           xp:200, tag:"ctf"},
      {id:"p7q5",  title:"Exploit: stack BOF, ret2win, ret2libc, ASLR bypass, ROP chain construction",   xp:250, tag:"exploit"},
      {id:"p7q6",  title:"Heap exploitation: use-after-free, double free, tcache poisoning, bins",       xp:200, tag:"exploit"},
      {id:"p7q7",  title:"CTF: solve 10 pwn challenges, write detailed exploit scripts with comments",    xp:200, tag:"ctf"},
      {id:"p7q8",  title:"Reverse engineer a real binary — malware sample in an isolated sandbox",        xp:180, tag:"re"},
      {id:"p7q9",  title:"Read Hacking: The Art of Exploitation — buffer overflow chapters",              xp:120, tag:"book"},
      {id:"p7q10", title:"Publish 5 pwn writeups with full exploit code on GitHub",                      xp:130, tag:"writing"},
    ]
  },
  { id:"p8",  year:2, num:8,  icon:"🌐",  title:"Distributed Systems + Performance + OSS",     period:"Dec 2027–Feb 2028",color:"#00d4ff",
    quests:[
      {id:"p8q1",  title:"Read DDIA (Designing Data-Intensive Applications) — full book",                xp:200, tag:"book"},
      {id:"p8q2",  title:"Raft paper: implement leader election + log replication in Go or C",           xp:280, tag:"project"},
      {id:"p8q3",  title:"PROJECT: Distributed KV store — multi-node, Raft-backed, linearizable reads", xp:300, tag:"project"},
      {id:"p8q4",  title:"Kafka: producers, consumers, partitions, consumer groups, offsets, ISR",       xp:120, tag:"systems"},
      {id:"p8q5",  title:"eBPF: write XDP program, trace syscalls, build network monitoring tool",       xp:200, tag:"linux"},
      {id:"p8q6",  title:"Open source: get 1 meaningful PR merged in fastify, undici, or similar",       xp:250, tag:"oss"},
      {id:"p8q7",  title:"Performance engineering: p99 latency profiling, flamegraphs, bpftrace",        xp:150, tag:"perf"},
      {id:"p8q8",  title:"Chaos engineering: inject failures, test system resilience under faults",       xp:130, tag:"systems"},
      {id:"p8q9",  title:"Read Raft, Dynamo, and Spanner papers — write summaries for each",             xp:150, tag:"papers"},
      {id:"p8q10", title:"Write 2 blog posts: one on distributed systems, one on security",              xp:100, tag:"writing"},
    ]
  },
  { id:"p9",  year:3, num:9,  icon:"🔱",  title:"Advanced Distributed Systems + Streaming",    period:"Mar–May 2028",    color:"#ffb800",
    quests:[
      {id:"p9q1",  title:"Implement multi-Raft: shard management, dynamic membership changes",           xp:300, tag:"project"},
      {id:"p9q2",  title:"Kafka deep: exactly-once semantics, transactions, log compaction, MirrorMaker",xp:200, tag:"systems"},
      {id:"p9q3",  title:"PROJECT: stream processing engine — windowing, aggregation, watermarks",        xp:280, tag:"project"},
      {id:"p9q4",  title:"CRDTs: implement G-counter, OR-set, LWW register, delta-state CRDTs",          xp:200, tag:"code"},
      {id:"p9q5",  title:"Read Spanner + MapReduce papers — implement simplified single-node versions",   xp:220, tag:"papers"},
      {id:"p9q6",  title:"Kubernetes: CRDs, operators, admission webhooks, scheduler internals",          xp:150, tag:"systems"},
      {id:"p9q7",  title:"Vector clocks: add causal consistency to your distributed KV store",            xp:220, tag:"code"},
      {id:"p9q8",  title:"Lamport clocks paper: implement logical and vector clocks from scratch",        xp:150, tag:"papers"},
      {id:"p9q9",  title:"Open source contribution to etcd, TiKV, or CockroachDB",                      xp:280, tag:"oss"},
      {id:"p9q10", title:"Write blog post on distributed systems work — target Hacker News front page",  xp:150, tag:"writing"},
    ]
  },
  { id:"p10", year:3, num:10, icon:"🛠️", title:"Compiler Internals + Kernel Programming",      period:"Jun–Aug 2028",    color:"#a855f7",
    quests:[
      {id:"p10q1", title:"Write a compiler: lexer, parser, AST, IR generation for a toy language",       xp:300, tag:"compiler"},
      {id:"p10q2", title:"LLVM: write a compiler pass, understand LLVM IR, run optimization passes",     xp:250, tag:"compiler"},
      {id:"p10q3", title:"Read LLVM paper — understand lifetime program analysis and transformation",     xp:150, tag:"papers"},
      {id:"p10q4", title:"Linux kernel module: write a char device driver with procfs interface",         xp:250, tag:"kernel"},
      {id:"p10q5", title:"eBPF advanced: kprobes, uprobes, CO-RE portability, libbpf",                   xp:230, tag:"linux"},
      {id:"p10q6", title:"Kernel debugging: KASAN, UBSAN, lockdep, analyze a real kernel crash dump",    xp:200, tag:"kernel"},
      {id:"p10q7", title:"Implement: JIT compiler for a simple bytecode VM (Brainfuck → x86-64)",        xp:280, tag:"compiler"},
      {id:"p10q8", title:"Memory management: slab allocator internals, huge pages, NUMA topology",       xp:180, tag:"kernel"},
      {id:"p10q9", title:"Syscall tracing: strace internals, ptrace API, seccomp-bpf sandboxing",        xp:180, tag:"linux"},
      {id:"p10q10",title:"Submit kernel patch or LLVM commit to official mailing list",                  xp:350, tag:"oss"},
    ]
  },
  { id:"p11", year:3, num:11, icon:"🎯",  title:"Advanced Exploit Development + CVE Research", period:"Sep–Nov 2028",    color:"#ff4d6d",
    quests:[
      {id:"p11q1", title:"Kernel exploitation: ret2usr, SMEP bypass, dirty pipe vulnerability class",    xp:350, tag:"exploit"},
      {id:"p11q2", title:"Fuzzing: AFL++, libFuzzer — fuzz a real target, triage and minimize crashes",  xp:300, tag:"tools"},
      {id:"p11q3", title:"Audit a small open-source project for vulnerabilities — document findings",    xp:280, tag:"security"},
      {id:"p11q4", title:"CVE research: find, document, and responsibly disclose 1 real vulnerability",  xp:500, tag:"security"},
      {id:"p11q5", title:"Browser exploitation: study V8 internals, JIT compiler bugs via CVE analysis", xp:250, tag:"exploit"},
      {id:"p11q6", title:"pwn.college: complete all advanced exploit development modules",                xp:250, tag:"ctf"},
      {id:"p11q7", title:"Write full exploit chain report formatted like a professional disclosure",      xp:200, tag:"writing"},
      {id:"p11q8", title:"Participate in a live hacking event or invite-only private bug bounty",         xp:300, tag:"security"},
      {id:"p11q9", title:"Read The Shellcoder's Handbook — advanced sections on kernel exploitation",    xp:150, tag:"book"},
      {id:"p11q10",title:"Contribute to a security tool: syzkaller, pwndbg, or AFL++",                  xp:280, tag:"oss"},
    ]
  },
  { id:"p12", year:3, num:12, icon:"👑",  title:"Open Source Leadership + Global Positioning", period:"Dec 2028–Mar 2029",color:"#00ff88",
    quests:[
      {id:"p12q1", title:"Capstone: build flagship system combining distributed DB + security depth",     xp:400, tag:"project"},
      {id:"p12q2", title:"Open source: 3+ merged PRs in major projects (etcd, TiKV, Kafka, Linux)",      xp:350, tag:"oss"},
      {id:"p12q3", title:"Give a technical talk at a meetup, conference, or major online event",         xp:300, tag:"career"},
      {id:"p12q4", title:"Portfolio: write detailed case studies for top 3 projects with real metrics",  xp:200, tag:"portfolio"},
      {id:"p12q5", title:"Write positioning statement — update LinkedIn, GitHub, resume to match",       xp:150, tag:"career"},
      {id:"p12q6", title:"Apply to global targets: remote infra roles, Juspay/Razorpay senior track",    xp:200, tag:"career"},
      {id:"p12q7", title:"Publish 1 research-quality technical blog post on HN or lobste.rs",            xp:250, tag:"writing"},
      {id:"p12q8", title:"Read all 7 research papers from Year 3 list — write summaries for each",       xp:250, tag:"papers"},
      {id:"p12q9", title:"Mentor a junior engineer or contribute to a learning community",               xp:200, tag:"career"},
      {id:"p12q10",title:"Self-assessment: verify all Final Skill Assessment targets from Year 3 doc",   xp:300, tag:"career"},
    ]
  },
];

const ALL_QUESTS = PHASES.flatMap(p => p.quests.map(q => ({ ...q, phase: p })));

// Default username for single-user tracker
const USERNAME = "default";

const TIPS = [
  "Read source code daily. 30 min of Redis or Node.js source teaches more than any tutorial.",
  "For every 1 hour of tutorial, spend 3 hours building. The ratio is non-negotiable.",
  "Write about what you build. Technical writing is a force multiplier on every skill.",
  "Debug without Stack Overflow for the first 30 minutes. Build the muscle memory.",
  "Commit to GitHub every day — even tiny progress. The streak becomes an identity.",
  "Run everything on Linux. Your production servers do. Develop where you deploy.",
  "Use GDB on every segfault. Don't just rewrite — understand exactly why it crashed.",
  "Learn man pages. They are ground truth. Stack Overflow contains opinions.",
  "Add error handling from day one. Real engineers obsess over failure paths.",
  "Read one research paper per month. Raft, Dynamo, Spanner — these are foundational texts.",
  "C teaches you what every higher-level language hides. This knowledge never expires.",
  "Write benchmark code. You can't optimize what you don't measure.",
  "Make every project deployable and live. A project that only runs locally is a tutorial.",
  "LeetCode is a filter, not an identity. Understand the algorithm — don't pattern-match.",
  "The best engineers know when NOT to optimize. Premature optimization wastes weeks.",
  "Every bug fixed without understanding will return. Always find the root cause.",
  "Open source contributions beat GPA on any backend engineering resume. Start early.",
  "Security thinking is backend thinking. If you build it, you must know how to break it.",
  "Your README matters as much as your code. Document architecture decisions clearly.",
  "A 2-hour deep work block beats an 8-hour distracted day every time.",
  "Setup your dotfiles and aliases. Your terminal should feel like home.",
  "When stuck, explain the problem out loud. Rubber duck debugging genuinely works.",
  "One finished project beats five half-built ones. Ship it, even imperfect.",
  "Study the systems you use daily: how does DNS resolve? How does TCP stay ordered?",
  "Test on failure paths — not just happy paths. Real users are unpredictably chaotic.",
  "Consistency beats intensity. 2 hours every day beats a 14-hour weekend session.",
  "Run out of things to build? Read something you don't understand. That's your next project.",
  "Setup your dotfiles and aliases. Your terminal should feel like home — optimize it.",
  "Networking is not just TCP — talk to engineers, join communities, be publicly visible.",
  "Your GitHub showing you built something matters more than your college grade in it.",
];

const TAG_COLOR = {
  book:"#a855f7", code:"#00ff88", tools:"#00d4ff", linux:"#ffb800",
  project:"#ff4d6d", dsa:"#ff6b35", security:"#ff4d6d", networking:"#00d4ff",
  observability:"#00ff88", devops:"#ffb800", writing:"#a855f7", career:"#00d4ff",
  portfolio:"#ffb800", database:"#00ff88", core:"#00d4ff", rust:"#ff6b35",
  asm:"#ff4d6d", exploit:"#ff4d6d", ctf:"#ffb800", re:"#a855f7",
  oss:"#00ff88", perf:"#00d4ff", systems:"#a855f7", papers:"#ffb800",
  compiler:"#00d4ff", kernel:"#ff4d6d",
};
const YEAR_CLR = { 1:"#00d4ff", 2:"#a855f7", 3:"#ffb800" };
const TOTAL_XP = PHASES.reduce((s,p) => s + p.quests.reduce((a,q) => a + q.xp, 0), 0);

// ─── UTILS ────────────────────────────────────────────────────────────────────

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

const calcStreak = (completed) => {
  const dateSet = new Set();
  Object.values(completed).forEach(ts => {
    const d = new Date(ts);
    dateSet.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
  });
  const today = new Date();
  let streak = 0;
  // allow streak to be alive if no activity yet today (count from yesterday)
  const hasToday = dateSet.has(todayKey());
  const startOffset = hasToday ? 0 : 1;
  for (let i = startOffset; i < 400; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    if (dateSet.has(k)) streak++;
    else break;
  }
  return streak;
};

const todayXP = (completed) => {
  const k = todayKey();
  return Object.entries(completed).reduce((s, [id, ts]) => {
    const d = new Date(ts);
    const dk = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    if (dk !== k) return s;
    const q = ALL_QUESTS.find(q => q.id === id);
    return s + (q ? q.xp : 0);
  }, 0);
};

const todayCompletedIds = (completed) => {
  const k = todayKey();
  return Object.entries(completed)
    .filter(([, ts]) => {
      const d = new Date(ts);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` === k;
    })
    .map(([id]) => id);
};

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:#050810;color:#e2e8f0;font-family:'Rajdhani',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:#0d1117;}
::-webkit-scrollbar-thumb{background:#1e2d40;border-radius:2px;}
.app{max-width:820px;margin:0 auto;padding:16px;padding-bottom:60px;}

/* NAV */
.main-nav{display:flex;gap:0;margin-bottom:16px;background:#0d1117;border:1px solid #1e2d40;border-radius:10px;overflow:hidden;}
.nav-btn{flex:1;padding:11px 8px;background:transparent;border:none;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .2s;color:#334155;display:flex;align-items:center;justify-content:center;gap:7px;}
.nav-btn.active{background:#0f1925;color:var(--nc);box-shadow:inset 0 -2px 0 var(--nc);}
.nav-btn:hover:not(.active){color:#64748b;}

/* HEADER */
.header{display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap;}
.header-title{flex:1;}
.header-title h1{font-size:20px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#00d4ff;text-shadow:0 0 20px #00d4ff44;line-height:1.1;}
.header-title p{font-family:'Share Tech Mono',monospace;font-size:10px;color:#334155;margin-top:2px;letter-spacing:1px;}
.level-badge{display:flex;flex-direction:column;align-items:center;background:#0d1117;border:1px solid #00d4ff22;border-radius:10px;padding:7px 13px;min-width:72px;}
.level-num{font-size:22px;font-weight:700;color:#00d4ff;line-height:1;font-family:'Share Tech Mono',monospace;}
.level-label{font-size:9px;color:#334155;letter-spacing:2px;text-transform:uppercase;margin-top:1px;}

/* XP BAR */
.xp-section{background:#0d1117;border:1px solid #1e2d40;border-radius:10px;padding:12px 16px;margin-bottom:12px;contain:layout style;}
.xp-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
.xp-label{font-family:'Share Tech Mono',monospace;font-size:10px;color:#334155;letter-spacing:1px;}
.xp-val{font-family:'Share Tech Mono',monospace;font-size:12px;color:#00ff88;}
.bar-track{height:5px;background:#0f1925;border-radius:3px;overflow:hidden;}
.bar-fill{height:100%;border-radius:3px;transition:width .7s cubic-bezier(.4,0,.2,1);}

/* TIP */
.tip-card{background:#0d1117;border:1px solid #1e2d40;border-left:3px solid #ffb800;border-radius:8px;padding:10px 14px;margin-bottom:14px;display:flex;gap:10px;align-items:flex-start;}
.tip-icon{font-size:15px;flex-shrink:0;margin-top:2px;}
.tip-lbl{font-size:9px;font-family:'Share Tech Mono',monospace;color:#ffb800;letter-spacing:2px;margin-bottom:3px;}
.tip-text{font-size:13px;color:#64748b;line-height:1.5;font-weight:500;}

/* YEAR TABS */
.year-tabs{display:flex;gap:6px;margin-bottom:10px;}
.yr-btn{flex:1;padding:8px 4px;background:#0d1117;border:1px solid #1e2d40;border-radius:8px;color:#334155;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:13px;cursor:pointer;transition:all .2s;text-align:center;}
.yr-btn.active{border-color:var(--yc);color:var(--yc);box-shadow:0 0 12px color-mix(in srgb, var(--yc) 20%, transparent);}
.yr-btn:hover:not(.active){border-color:#334155;color:#475569;}
.yr-sub{font-size:10px;font-family:'Share Tech Mono',monospace;margin-top:2px;}

/* PHASE GRID */
.phase-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:14px;}
@media(min-width:500px){.phase-grid{grid-template-columns:repeat(4,1fr);}}
.ph-btn{padding:10px 8px;background:#0d1117;border:1px solid #1e2d40;border-radius:8px;cursor:pointer;transition:all .2s;text-align:center;}
.ph-btn.active{border-color:var(--pc);box-shadow:0 0 14px color-mix(in srgb, var(--pc) 15%, transparent);}
.ph-btn:hover:not(.active){border-color:#334155;background:#111827;}
.ph-icon{font-size:17px;display:block;margin-bottom:3px;}
.ph-num{font-family:'Share Tech Mono',monospace;font-size:9px;color:#334155;letter-spacing:1px;}
.ph-pct{font-size:13px;font-weight:700;margin-top:1px;font-family:'Share Tech Mono',monospace;}
.ph-bar{height:3px;background:#0f1925;border-radius:2px;margin-top:5px;overflow:hidden;}

/* PHASE HEADER */
.phase-hdr{background:#0d1117;border:1px solid #1e2d40;border-left:4px solid var(--pc);border-radius:10px;padding:13px 16px;margin-bottom:11px;display:flex;gap:11px;align-items:center;}
.ph-hdr-icon{font-size:26px;flex-shrink:0;}
.ph-hdr-info{flex:1;min-width:0;}
.ph-hdr-title{font-size:16px;font-weight:700;color:var(--pc);line-height:1.2;letter-spacing:.5px;}
.ph-hdr-meta{font-family:'Share Tech Mono',monospace;font-size:10px;color:#334155;margin-top:3px;}
.ph-hdr-right{text-align:right;flex-shrink:0;}
.ph-pct-big{font-family:'Share Tech Mono',monospace;font-size:20px;font-weight:700;color:var(--pc);}
.ph-done-lbl{font-size:9px;color:#334155;letter-spacing:1px;font-family:'Share Tech Mono',monospace;}

/* QUEST LIST */
.quest-list{display:flex;flex-direction:column;gap:6px;}
.qcard{background:#0d1117;border:1px solid #1e2d40;border-left:3px solid var(--pc);border-radius:8px;padding:11px 12px;display:flex;align-items:flex-start;gap:10px;cursor:pointer;transition:background .15s;user-select:none;position:relative;contain:layout style;}
.qcard:hover{background:#111827;border-color:var(--pc);}
.qcard.done{opacity:.4;}
.qcard.pop{animation:qpop .45s ease;will-change:transform;}
@keyframes qpop{0%{transform:scale(1)}40%{transform:scale(1.014);box-shadow:0 0 18px color-mix(in srgb,var(--pc) 30%,transparent)}100%{transform:scale(1);box-shadow:none}}
.qcheck{width:19px;height:19px;min-width:19px;border:2px solid #1e2d40;border-radius:4px;margin-top:2px;display:flex;align-items:center;justify-content:center;transition:all .2s;font-size:11px;font-weight:700;color:#000;background:transparent;}
.qcheck.on{background:var(--pc);border-color:var(--pc);}
.qcheck .tick{display:none;}
.qcheck.on .tick{display:block;}
.qbody{flex:1;min-width:0;}
.qtitle{font-size:13px;font-weight:600;line-height:1.45;color:#e2e8f0;}
.qcard.done .qtitle{text-decoration:line-through;color:#334155;}
.qbadges{display:flex;gap:5px;align-items:center;margin-top:5px;flex-wrap:wrap;}
.tag-b{font-family:'Share Tech Mono',monospace;font-size:9px;padding:2px 6px;border-radius:3px;}
.xp-b{font-family:'Share Tech Mono',monospace;font-size:10px;padding:2px 8px;border-radius:10px;margin-left:auto;flex-shrink:0;}
.pin-btn{position:absolute;top:10px;right:10px;width:22px;height:22px;background:transparent;border:1px solid #1e2d40;border-radius:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:11px;transition:all .2s;opacity:0;}
.qcard:hover .pin-btn{opacity:1;}
.pin-btn.pinned{opacity:1;background:#ffb80022;border-color:#ffb800;}
.pin-btn:hover{background:#ffb80022;border-color:#ffb800;}

/* TODAY VIEW */
.today-view{display:flex;flex-direction:column;gap:12px;}

.streak-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.stat-card{background:#0d1117;border:1px solid #1e2d40;border-radius:10px;padding:12px;text-align:center;}
.stat-val{font-family:'Share Tech Mono',monospace;font-size:22px;font-weight:700;line-height:1;margin-bottom:3px;}
.stat-lbl{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#334155;font-family:'Share Tech Mono',monospace;}

.section-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.section-title{font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:2px;color:#475569;text-transform:uppercase;}
.section-action{font-family:'Share Tech Mono',monospace;font-size:10px;color:#334155;cursor:pointer;padding:3px 8px;border:1px solid #1e2d40;border-radius:4px;background:transparent;transition:all .2s;}
.section-action:hover{border-color:#475569;color:#64748b;}

.focus-empty{background:#0d1117;border:1px dashed #1e2d40;border-radius:8px;padding:20px;text-align:center;}
.focus-empty p{font-size:13px;color:#334155;margin-bottom:8px;}
.focus-empty span{font-size:11px;color:#1e2d40;font-family:'Share Tech Mono',monospace;}

.focus-qcard{background:#0d1117;border:1px solid #1e2d40;border-left:3px solid var(--pc);border-radius:8px;padding:10px 12px;display:flex;align-items:center;gap:10px;user-select:none;}
.focus-qcard.done-today{border-left-color:#00ff88;background:#00ff8808;}
.focus-check{width:18px;height:18px;min-width:18px;border:2px solid #1e2d40;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#000;cursor:pointer;transition:all .2s;flex-shrink:0;}
.focus-check.on{background:#00ff88;border-color:#00ff88;}
.focus-check .tick{display:none;}
.focus-check.on .tick{display:block;}
.focus-body{flex:1;min-width:0;}
.focus-title{font-size:13px;font-weight:600;color:#e2e8f0;line-height:1.35;}
.focus-qcard.done-today .focus-title{text-decoration:line-through;color:#334155;}
.focus-meta{font-size:10px;color:#334155;font-family:'Share Tech Mono',monospace;margin-top:3px;}
.unpin-btn{width:20px;height:20px;background:transparent;border:1px solid #1e2d40;border-radius:4px;cursor:pointer;font-size:10px;color:#334155;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;}
.unpin-btn:hover{border-color:#ff4d6d;color:#ff4d6d;background:#ff4d6d11;}

/* BROWSE PANEL */
.browse-panel{background:#0d1117;border:1px solid #1e2d40;border-radius:10px;padding:14px;}
.browse-search{width:100%;background:#050810;border:1px solid #1e2d40;border-radius:6px;padding:8px 12px;font-family:'Share Tech Mono',monospace;font-size:12px;color:#e2e8f0;outline:none;margin-bottom:10px;}
.browse-search::placeholder{color:#334155;}
.browse-search:focus{border-color:#00d4ff44;}
.browse-phase-group{margin-bottom:12px;}
.browse-phase-name{font-size:11px;font-family:'Share Tech Mono',monospace;color:#475569;letter-spacing:1px;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid #0f1925;}
.browse-qrow{display:flex;align-items:center;gap:8px;padding:5px 0;cursor:pointer;border-radius:5px;padding:5px 6px;transition:background .15s;}
.browse-qrow:hover{background:#111827;}
.browse-qtitle{flex:1;font-size:12px;color:#64748b;line-height:1.3;}
.browse-add{width:22px;height:22px;background:transparent;border:1px solid #1e2d40;border-radius:4px;cursor:pointer;font-size:13px;color:#00d4ff;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;}
.browse-add:hover{background:#00d4ff22;border-color:#00d4ff;}
.browse-add.added{background:#00ff8822;border-color:#00ff88;color:#00ff88;font-size:11px;}

/* TODAY COMPLETIONS LOG */
.log-item{background:#0d1117;border:1px solid #1e2d40;border-radius:7px;padding:9px 12px;display:flex;align-items:center;gap:10px;}
.log-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.log-title{flex:1;font-size:12px;color:#64748b;}
.log-xp{font-family:'Share Tech Mono',monospace;font-size:11px;color:#00ff88;}
.log-time{font-family:'Share Tech Mono',monospace;font-size:10px;color:#1e2d40;}

/* ALL PHASES SUMMARY */
.summary{background:#0d1117;border:1px solid #1e2d40;border-radius:10px;padding:14px 16px;margin-top:20px;}
.summary-hdr{font-family:'Share Tech Mono',monospace;font-size:10px;color:#334155;letter-spacing:2px;margin-bottom:12px;}
.sph-row{margin-bottom:8px;cursor:pointer;}
.sph-row:hover .sph-name{color:#94a3b8;}
.sph-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;}
.sph-name{font-size:12px;font-weight:600;color:#475569;transition:color .15s;}
.sph-cnt{font-family:'Share Tech Mono',monospace;font-size:10px;}

/* TOAST */
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0d1117;border:1px solid #00ff8844;border-radius:8px;padding:9px 16px;font-family:'Share Tech Mono',monospace;font-size:12px;color:#00ff88;pointer-events:none;z-index:1000;animation:tIn .25s ease,tOut .3s ease 1.5s forwards;display:flex;gap:8px;align-items:center;box-shadow:0 0 24px #00ff8833;white-space:nowrap;}
@keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes tOut{from{opacity:1}to{opacity:0}}

.no-sel{user-select:none;}
@media(prefers-reduced-motion:reduce){
  .bar-fill{transition:none;}
  .qcard.pop{animation:none;}
  .toast{animation:none;opacity:1;}
  *{transition-duration:.01ms!important;animation-duration:.01ms!important;}
}
`;

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function QuestTracker() {
  const [completed,    setCompleted]    = useState({});
  const [dailyFocus,   setDailyFocus]   = useState({ date:"", ids:[] });
  const [mainView,     setMainView]     = useState("today");   // "today" | "quests"
  const [activeYear,   setActiveYear]   = useState(1);
  const [activePhaseId,setActivePhaseId]= useState("p1");
  const [browsing,     setBrowsing]     = useState(false);
  const [browseSearch, setBrowseSearch] = useState("");
  const [toast,        setToast]        = useState(null);
  const [justDone,     setJustDone]     = useState(null);
  const [loaded,       setLoaded]       = useState(false);

  // ── Load ──
  useEffect(() => {
    (async () => {
      try {
        console.log("Loading profile for user:", USERNAME);
        const profile = await getProfile(USERNAME);
        console.log("Loaded profile:", profile);

        if (profile) {
          setCompleted(profile.completed || {});
          // Reset daily focus if stale date
          if (profile.dailyFocus && profile.dailyFocus.date === todayKey()) {
            setDailyFocus(profile.dailyFocus);
          } else {
            setDailyFocus({ date: todayKey(), ids: [] });
          }
        } else {
          console.log("No profile found, using defaults");
          setCompleted({});
          setDailyFocus({ date: todayKey(), ids: [] });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setCompleted({});
        setDailyFocus({ date: todayKey(), ids: [] });
      }
      setLoaded(true);
    })();
  }, []);

  const saveTimers = useRef({});

  // Save entire profile (both completed and dailyFocus)
  const saveProfile_ = useCallback((completed_, dailyFocus_) => {
    clearTimeout(saveTimers.current.profile);
    saveTimers.current.profile = setTimeout(() => {
      console.log("Saving profile...");
      saveProfile(USERNAME, {
        completed: completed_,
        dailyFocus: dailyFocus_,
      });
    }, 300);
  }, []);

  // ── Quest toggle ──
  const toggleQuest = useCallback((quest) => {
    setCompleted(prev => {
      const next = { ...prev };
      if (next[quest.id]) {
        delete next[quest.id];
      } else {
        next[quest.id] = Date.now();
        setJustDone(quest.id);
        showToast(`+${quest.xp} XP  ${quest.title.slice(0,34)}…`);
        setTimeout(() => setJustDone(null), 600);
      }
      // Save profile with updated completed and current dailyFocus
      setDailyFocus(currentFocus => {
        saveProfile_(next, currentFocus);
        return currentFocus;
      });
      return next;
    });
  }, [saveProfile_]);

  // ── Focus pin ──
  const pinQuest = useCallback((id) => {
    setDailyFocus(prev => {
      const next = prev.ids.includes(id)
        ? { ...prev, ids: prev.ids.filter(x => x !== id) }
        : { ...prev, ids: [...prev.ids, id] };
      // Save profile with updated dailyFocus and current completed
      setCompleted(currentCompleted => {
        saveProfile_(currentCompleted, next);
        return currentCompleted;
      });
      if (!prev.ids.includes(id)) showToast("📌 Added to Today's Focus");
      return next;
    });
  }, [saveProfile_]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  // ── Derived (memoized) ──
  const earnedXP   = useMemo(() => PHASES.reduce((s,p) => s + p.quests.reduce((a,q) => a + (completed[q.id] ? q.xp : 0), 0), 0), [completed]);
  const level      = useMemo(() => Math.floor(earnedXP / 1000) + 1, [earnedXP]);
  const levelFloor = useMemo(() => (level-1)*1000, [level]);
  const levelPct   = useMemo(() => ((earnedXP-levelFloor)/(level*1000-levelFloor))*100, [earnedXP, levelFloor, level]);
  const streak     = useMemo(() => calcStreak(completed), [completed]);
  const txp        = useMemo(() => todayXP(completed), [completed]);
  const todayIds   = useMemo(() => todayCompletedIds(completed), [completed]);
  const todayCount = todayIds.length;
  const totalDone  = useMemo(() => PHASES.reduce((s,p) => s + p.quests.filter(q=>completed[q.id]).length, 0), [completed]);
  const tip        = useMemo(() => TIPS[new Date().getDate() % TIPS.length], []);

  const phaseOf    = useCallback((id) => PHASES.find(p=>p.id===id), []);
  const phProg     = useCallback((p) => { const d=p.quests.filter(q=>completed[q.id]).length; return {done:d, pct:Math.round((d/p.quests.length)*100)}; }, [completed]);
  const yrProg     = useCallback((yr) => { const ps=PHASES.filter(p=>p.year===yr), d=ps.reduce((s,p)=>s+p.quests.filter(q=>completed[q.id]).length,0), t=ps.reduce((s,p)=>s+p.quests.length,0); return Math.round((d/t)*100); }, [completed]);

  const activePhase = PHASES.find(p=>p.id===activePhaseId)||PHASES[0];
  const { done:phaseDone, pct:phasePct } = phProg(activePhase);
  const pc = activePhase.color;

  // Browse filter
  const browseResults = browseSearch.length >= 2
    ? ALL_QUESTS.filter(q => q.title.toLowerCase().includes(browseSearch.toLowerCase()))
    : null;

  // Group browse results by phase
  const groupedBrowse = browseResults
    ? browseResults.reduce((acc, q) => { (acc[q.phase.id] = acc[q.phase.id]||[]).push(q); return acc; }, {})
    : PHASES.reduce((acc,p) => { acc[p.id] = p.quests.map(q=>({...q,phase:p})); return acc; }, {});

  if (!loaded) return (
    <>
      <style>{CSS}</style>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",
        fontFamily:"'Share Tech Mono',monospace",color:"#00d4ff",fontSize:13}}>
        LOADING QUEST LOG...
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* ── Header ── */}
        <div className="header">
          <div className="header-title">
            <h1>KNKing Quest Log</h1>
            <p>BACKEND + SECURITY ELITE ROADMAP · 2026–2029</p>
          </div>
          <div className="level-badge">
            <div className="level-num">{level}</div>
            <div className="level-label">LEVEL</div>
          </div>
        </div>

        {/* ── XP Bar ── */}
        <div className="xp-section">
          <div className="xp-row">
            <span className="xp-label">TOTAL XP</span>
            <span className="xp-val">{earnedXP.toLocaleString()} / {TOTAL_XP.toLocaleString()}</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{transform:`scaleX(${earnedXP/TOTAL_XP})`,transformOrigin:"left center",background:"linear-gradient(90deg,#00d4ff,#00ff88)"}}/>
          </div>
          <div className="xp-row" style={{marginTop:8,marginBottom:0}}>
            <span className="xp-label" style={{color:"#1e2d40"}}>LVL {level} → {Math.round(levelPct)}% to next</span>
            <span className="xp-label" style={{color:"#1e2d40"}}>{totalDone}/{PHASES.reduce((s,p)=>s+p.quests.length,0)} QUESTS</span>
          </div>
          <div className="bar-track" style={{marginTop:5}}>
            <div className="bar-fill" style={{transform:`scaleX(${levelPct/100})`,transformOrigin:"left center",background:"#00d4ff"}}/>
          </div>
        </div>

        {/* ── Main Nav ── */}
        <div className="main-nav no-sel">
          <button className={`nav-btn ${mainView==="today"?"active":""}`}
            style={{"--nc":"#ffb800"}} onClick={()=>setMainView("today")}>
            ⚡ TODAY
          </button>
          <button className={`nav-btn ${mainView==="quests"?"active":""}`}
            style={{"--nc":"#00d4ff"}} onClick={()=>setMainView("quests")}>
            📋 QUESTS
          </button>
        </div>

        {/* ══════════════ TODAY VIEW ══════════════ */}
        {mainView === "today" && (
          <div className="today-view">

            {/* Stats row */}
            <div className="streak-row no-sel">
              <div className="stat-card">
                <div className="stat-val" style={{color:"#ff6b35"}}>
                  {streak > 0 ? `🔥 ${streak}` : "—"}
                </div>
                <div className="stat-lbl">DAY STREAK</div>
              </div>
              <div className="stat-card">
                <div className="stat-val" style={{color:"#00ff88"}}>+{txp}</div>
                <div className="stat-lbl">TODAY XP</div>
              </div>
              <div className="stat-card">
                <div className="stat-val" style={{color:"#00d4ff"}}>{todayCount}</div>
                <div className="stat-lbl">DONE TODAY</div>
              </div>
            </div>

            {/* Tip */}
            <div className="tip-card">
              <div className="tip-icon">💡</div>
              <div>
                <div className="tip-lbl">DAILY TIP</div>
                <div className="tip-text">{tip}</div>
              </div>
            </div>

            {/* Daily Focus */}
            <div>
              <div className="section-hdr">
                <span className="section-title">📌 Daily Focus ({dailyFocus.ids.length})</span>
                <button className="section-action" onClick={()=>{setBrowsing(v=>!v);setBrowseSearch("");}}>
                  {browsing ? "CLOSE" : "+ ADD GOALS"}
                </button>
              </div>

              {dailyFocus.ids.length === 0 && !browsing && (
                <div className="focus-empty">
                  <p>No focus goals set for today.</p>
                  <span>Pin quests from any phase using the Quest Log,<br/>or click + ADD GOALS to browse.</span>
                </div>
              )}

              <div className="quest-list">
                {dailyFocus.ids.map(fid => {
                  const qdata = ALL_QUESTS.find(q=>q.id===fid);
                  if (!qdata) return null;
                  const isDone = !!completed[fid];
                  const isDoneToday = todayIds.includes(fid);
                  const pc2 = qdata.phase.color;
                  return (
                    <div key={fid} className={`focus-qcard ${isDoneToday?"done-today":""}`}
                      style={{"--pc":pc2}}>
                      <div className={`focus-check ${isDone?"on":""}`}
                        onClick={()=>toggleQuest(qdata)}>
                        <span className="tick">✓</span>
                      </div>
                      <div className="focus-body">
                        <div className="focus-title">{qdata.title}</div>
                        <div className="focus-meta">
                          {qdata.phase.icon} P{qdata.phase.num} · {qdata.phase.title.split("+")[0].trim()} · +{qdata.xp}XP
                        </div>
                      </div>
                      <button className="unpin-btn" onClick={()=>pinQuest(fid)} title="Remove from focus">×</button>
                    </div>
                  );
                })}
              </div>

              {/* Browse panel */}
              {browsing && (
                <div className="browse-panel" style={{marginTop:10}}>
                  <div className="tip-lbl" style={{marginBottom:8}}>BROWSE &amp; PIN QUESTS</div>
                  <input className="browse-search" placeholder="Search quests…" value={browseSearch}
                    onChange={e=>setBrowseSearch(e.target.value)} />
                  <div style={{maxHeight:320,overflowY:"auto"}}>
                    {Object.entries(groupedBrowse).slice(0, browseSearch.length>=2 ? 20 : 12).map(([phId, qs]) => {
                      const ph = phaseOf(phId);
                      if (!ph || qs.length===0) return null;
                      return (
                        <div key={phId} className="browse-phase-group">
                          <div className="browse-phase-name" style={{color:ph.color}}>
                            {ph.icon} PHASE {ph.num}: {ph.title}
                          </div>
                          {qs.map(q => {
                            const isPinned = dailyFocus.ids.includes(q.id);
                            return (
                              <div key={q.id} className="browse-qrow" onClick={()=>pinQuest(q.id)}>
                                <div className="browse-qtitle"
                                  style={{color: completed[q.id] ? "#1e2d40" : "#64748b",
                                    textDecoration: completed[q.id] ? "line-through":"none"}}>
                                  {q.title}
                                </div>
                                <button className={`browse-add ${isPinned?"added":""}`}>
                                  {isPinned ? "✓" : "+"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Today's Completions */}
            {todayIds.length > 0 && (
              <div>
                <div className="section-hdr">
                  <span className="section-title">✅ Completed Today</span>
                  <span className="xp-label" style={{color:"#00ff88",fontFamily:"'Share Tech Mono',monospace",fontSize:11}}>
                    +{txp} XP
                  </span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {todayIds.map(id => {
                    const q = ALL_QUESTS.find(x=>x.id===id);
                    if (!q) return null;
                    const ts = new Date(completed[id]);
                    return (
                      <div key={id} className="log-item">
                        <div className="log-dot" style={{background:q.phase.color}}/>
                        <div className="log-title">{q.title.slice(0,55)}{q.title.length>55?"…":""}</div>
                        <div className="log-xp">+{q.xp}</div>
                        <div className="log-time">
                          {String(ts.getHours()).padStart(2,"0")}:{String(ts.getMinutes()).padStart(2,"0")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All phases summary */}
            <div className="summary">
              <div className="summary-hdr">ALL PHASES — OVERVIEW</div>
              {PHASES.map(p => {
                const {done,pct} = phProg(p);
                return (
                  <div key={p.id} className="sph-row" onClick={()=>{setMainView("quests");setActiveYear(p.year);setActivePhaseId(p.id);}}>
                    <div className="sph-top">
                      <span className="sph-name">{p.icon} P{p.num} {p.title.split("+")[0].trim()}</span>
                      <span className="sph-cnt" style={{color:pct>0?p.color:"#334155"}}>{done}/{p.quests.length}</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{transform:`scaleX(${pct/100})`,transformOrigin:"left center",background:p.color}}/>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ══════════════ QUESTS VIEW ══════════════ */}
        {mainView === "quests" && (
          <>
            {/* Year Tabs */}
            <div className="year-tabs no-sel">
              {[1,2,3].map(yr => (
                <button key={yr} className={`yr-btn ${activeYear===yr?"active":""}`}
                  style={{"--yc":YEAR_CLR[yr]}}
                  onClick={()=>{setActiveYear(yr);setActivePhaseId(PHASES.find(p=>p.year===yr).id);}}>
                  YEAR {yr}
                  <div className="yr-sub" style={{color:activeYear===yr?YEAR_CLR[yr]:"#1e2d40"}}>
                    {yrProg(yr)}%
                  </div>
                </button>
              ))}
            </div>

            {/* Phase Grid */}
            <div className="phase-grid no-sel">
              {PHASES.filter(p=>p.year===activeYear).map(p => {
                const {pct} = phProg(p);
                const isA = p.id===activePhaseId;
                return (
                  <div key={p.id} className={`ph-btn ${isA?"active":""}`}
                    style={{"--pc":p.color}} onClick={()=>setActivePhaseId(p.id)}>
                    <span className="ph-icon">{p.icon}</span>
                    <div className="ph-num">PHASE {p.num}</div>
                    <div className="ph-pct" style={{color:isA?p.color:"#334155"}}>{pct}%</div>
                    <div className="ph-bar">
                      <div style={{height:"100%",width:"100%",transform:`scaleX(${pct/100})`,transformOrigin:"left center",background:p.color,borderRadius:2,transition:"width .5s"}}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Phase Header */}
            <div className="phase-hdr" style={{"--pc":pc}}>
              <div className="ph-hdr-icon">{activePhase.icon}</div>
              <div className="ph-hdr-info">
                <div className="ph-hdr-title">Phase {activePhase.num}: {activePhase.title}</div>
                <div className="ph-hdr-meta">{activePhase.period} · {phaseDone}/{activePhase.quests.length} done</div>
                <div className="bar-track" style={{marginTop:7}}>
                  <div className="bar-fill" style={{transform:`scaleX(${phasePct/100})`,transformOrigin:"left center",background:pc}}/>
                </div>
              </div>
              <div className="ph-hdr-right">
                <div className="ph-pct-big">{phasePct}%</div>
                <div className="ph-done-lbl">DONE</div>
              </div>
            </div>

            {/* Quest List */}
            <div className="quest-list">
              {activePhase.quests.map((quest,i) => {
                const isDone = !!completed[quest.id];
                const isPinned = dailyFocus.ids.includes(quest.id);
                const tc = TAG_COLOR[quest.tag]||"#64748b";
                return (
                  <div key={quest.id}
                    className={`qcard ${isDone?"done":""} ${justDone===quest.id?"pop":""}`}
                    style={{"--pc":pc}}
                    onClick={(e)=>{ if(e.target.closest(".pin-btn")) return; toggleQuest(quest); }}>

                    <div className={`qcheck ${isDone?"on":""}`}>
                      <span className="tick">✓</span>
                    </div>
                    <div className="qbody">
                      <div className="qtitle">
                        <span style={{color:pc,fontFamily:"'Share Tech Mono',monospace",fontSize:10,marginRight:6,opacity:.6}}>
                          {String(i+1).padStart(2,"0")}
                        </span>
                        {quest.title}
                      </div>
                      <div className="qbadges">
                        <span className="tag-b" style={{background:tc+"18",color:tc,border:`1px solid ${tc}28`}}>
                          {quest.tag}
                        </span>
                        <span className="xp-b" style={{background:pc+"18",color:pc,border:`1px solid ${pc}28`}}>
                          {isDone?"✓ ":"+"}{quest.xp} XP
                        </span>
                      </div>
                    </div>
                    <button className={`pin-btn ${isPinned?"pinned":""}`}
                      onClick={()=>pinQuest(quest.id)} title={isPinned?"Remove from today":"Add to today's focus"}>
                      {isPinned ? "📌" : "📎"}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>

      {toast && <div className="toast">⚡ {toast}</div>}
    </>
  );
}
