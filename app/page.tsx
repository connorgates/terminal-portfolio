"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";

/* ════════════════════════════════════════════════════════════
   EDIT ME
   ════════════════════════════════════════════════════════════ */
const PROFILE = {
  email: "connorgatesit@outlook.com", // <- change
  github: "https://github.com/connorgates",
  linkedin: "https://www.linkedin.com/in/connorgates-/", // <- change
  resume: "/resume.pdf", // put resume.pdf in /public
};

const TAGLINE = "// keeping the packets moving.";

/* ════════════════════════════════════════════════════════════
   THEMES (colors live in globals.css)
   ════════════════════════════════════════════════════════════ */
const THEMES = ["tokyo", "gruvbox", "nord", "latte"] as const;
type Theme = (typeof THEMES)[number];

function readTheme(): Theme {
  if (typeof document === "undefined") return "tokyo";
  const t = document.documentElement.dataset.theme ?? "";
  return (THEMES as readonly string[]).includes(t) ? (t as Theme) : "tokyo";
}

/* ════════════════════════════════════════════════════════════
   LANDING: the wall of code (documentation IPs / ASNs only)
   ════════════════════════════════════════════════════════════ */
const WALL_BLOCK = `
!
! edge-rtr-1
!
hostname edge-rtr-1
logging buffered 1048576
ntp server 192.0.2.123
!
interface Bundle-Ether10
 description core uplink
 mtu 9216
 ipv4 address 192.0.2.1 255.255.255.252
 ipv6 address 2001:db8:0:1::1/127
!
interface Bundle-Ether10.200
 description science-dmz
 encapsulation dot1q 200
 ipv4 address 198.51.100.2 255.255.255.0
!
router hsrp
 interface Bundle-Ether10.200
  address-family ipv4
   hsrp 200 version 2
    address 198.51.100.1
    priority 110
    preempt
   !
  !
 !
!
prefix-set CAMPUS-V4
  203.0.113.0/24
end-set
!
route-policy ISP-A-IN
  if destination in (0.0.0.0/0) then
    set local-preference 200
  endif
  pass
end-policy
!
route-policy ISP-A-OUT
  if destination in CAMPUS-V4 then
    pass
  else
    drop
  endif
end-policy
!
router bgp 64496
 bgp router-id 192.0.2.1
 address-family ipv4 unicast
  maximum-paths ebgp 4
  network 203.0.113.0/24
 !
 neighbor 192.0.2.2
  remote-as 64496
  description edge-rtr-2 ibgp
  update-source Loopback0
 !
 neighbor 198.51.100.254
  remote-as 64511
  description upstream-a
  address-family ipv4 unicast
   route-policy ISP-A-IN in
   route-policy ISP-A-OUT out
   maximum-prefix 950000 90
  !
 !
!
router ospf 1
 router-id 192.0.2.1
 area 0
  interface Loopback0
   passive enable
  !
  interface Bundle-Ether10
   network point-to-point
  !
 !
!
`.trim();

const WALL_TEXT = [WALL_BLOCK, WALL_BLOCK, WALL_BLOCK].join("\n");

/* ════════════════════════════════════════════════════════════
   FILES
   Syntax rules for the highlighter:
   "! text"        comment        "# / ## / ###"  headings
   "key: value"    key colored    "- text"        bullet
   ════════════════════════════════════════════════════════════ */
type FileDef = { name: string; kind: string; lines: string[] };
const L = (s: string) => s.trim().split("\n");

const FILES: FileDef[] = [
  {
    name: "about.md",
    kind: "markdown",
    lines: L(`
# connor gates
network engineer · binghamton university · vestal, ny

3+ years designing, securing, and modernizing enterprise campus
networks. Cisco routing and switching, firewall security (FMC and
Firepower), and BGP / OSPF architecture for a multi-ISP research
university.

CCNA certified. Background in cybersecurity research and ethical
hacking, top 1% on TryHackMe.

! navigate
:e experience     work history
:e projects       what I have built
:e stack          tools and protocols
:help             every command
:theme            change colors
`),
  },
  {
    name: "experience.md",
    kind: "markdown",
    lines: L(`
# experience

## Network Engineer, Binghamton University
Nov 2023 – present · Binghamton, NY

- Replaced legacy Cisco ASR 9000 edge routers. Rebuilt configs from
  scratch and ran live cutovers with tested rollback plans.
- Built a third redundant ISP connection on a Cisco NCS-55A1, linking
  three edge routers over DWDM with iBGP. Coordinated handoffs with
  NYSERNET and Cogent.
- Run multi-homed iBGP / eBGP routing across the campus edge.
- Added edge DDoS protection with blackholing and filtering, tied into
  FirstLight scrubbing.
- Built a Globus / Science DMZ across three edge routers with HSRP
  redundancy and BGP steering over NYSERNET.
- Replaced Cisco ASAs and Firepower 4140s with Firepower 3130 and 4225
  HA pairs, migrated policies, and manage everything in FMC.
- Wrote FMC rules for 300+ servers in support of SUNY 6900 compliance.
- Built a Python toolkit on the FMC REST API for bulk rule creation,
  unused-object audits, and device health reports.
- Replaced data center spines and leafs, re-architecting Layer 2/3 and
  refreshing legacy fiber.
- Replaced three Cisco 3850 distribution switches with 9500s on
  physically redundant fiber.
- Deployed Gigamon TAPs, 6 of 6 on schedule, for ISP and east-west
  firewall visibility.
- Built a 16-subnet Siemens network with VLAN and VRF segmentation.
- Partner with project managers and system owners on change requests,
  maintenance windows, topologies, rack diagrams, and config archives.

## Bug Bounty Hunter, HackerOne
Feb 2025 – present · self-employed

- Independent vulnerability research.

## Network Administrator, Willow Run Foods
May 2023 – Nov 2023 · Kirkwood, NY

- Maintained network, server, and workstation infrastructure.
- Monitored endpoint threats with CrowdStrike and email threats with
  Darktrace.
- Installed hardware and software, and supported end users.

## Cybersecurity and Privacy Research Intern, University at Albany
Sep 2022 – Dec 2022

- Researched IoT security vulnerabilities and current attack trends.
- Ran threat and risk assessments and penetration tests.
`),
  },
  {
    name: "projects.md",
    kind: "markdown",
    lines: L(`
# projects

## edge router replacement
2026
- Decommissioned legacy Cisco ASR 9000s. Designed clean configs, then
  staged, racked, and integrated the new routers and edge switches.
- Wrote cutover and rollback plans for live maintenance windows.
- Built DDoS protection on the edge with blackholing and filtering to
  a FirstLight scrubbing service.

## fmc api toolkit
Aug 2026 – Sep 2026 · Python
- Scripts for bulk rule creation from CSV, unused-object audits, and
  exporting FTD health, versions, and object groups.
- Credentials stay in a local .env file and never touch the repo.

## gigamon tap visibility
May 2026 – Sep 2026
- Designed TAP placement to capture all ingress and egress ISP traffic
  plus east-west traffic crossing the data center firewalls.
- Picked hardware, sourced quotes, and coordinated new fiber paths.
  All 6 of 6 TAPs installed on schedule.

## science dmz for globus
Mar 2026 – Apr 2026
- Three-router DMZ (2x ASR 9000, 1x NCS-5500) with HSRP gateways.
- BGP steering prefers NYSERNET R&E for research traffic.
- dot1Q subinterfaces on Bundle-Ether LAGs, plus build docs, IP plan,
  and verification checklists.

## data center spine and leaf replacement
Jul 2025 – Jul 2026
- New topology and Layer 2/3 design on Dell switches.
- Replaced legacy MM and SM fiber, and coordinated downtime windows
  with server owners.

## firewall refresh and suny 6900
Jan 2025 – Jan 2026
- Cisco ASA to Firepower 3130, Firepower 4140 to 4225, routed HA pairs
  across sites for location redundancy.
- FMC rules for 300+ servers, reviewed by system owners before each
  server moved behind the firewall.

## third internet connection
Apr 2024 – Aug 2024
- NCS-55A1 plus DWDM links between three edge routers for an iBGP path.
- Redundant and secured, with ISP handoff coordinated through NYSERNET
  and Cogent.

! also
- Edge switch refresh (4 switches), 3850 to 9500 distribution upgrade,
  16-subnet Siemens network, research data center move, VergeOS leafs
  with VLT.
`),
  },
  {
    name: "stack.conf",
    kind: "conf",
    lines: L(`
# stack

routing:      BGP, iBGP, eBGP, OSPF, HSRP, VRF, DWDM
switching:    VLAN, VLT, LAG, Layer 2/3, Cisco Catalyst 9500, Dell
platforms:    Cisco IOS, IOS-XR, ASR 9000, NCS-55A1, NCS-5500
security:     Cisco FMC, Firepower HA, ISE, Palo Alto, DDoS blackholing
automation:   Python, REST APIs
visibility:   Gigamon TAPs, single mode fiber
process:      change management, rollback planning, documentation
`),
  },
  {
    name: "credentials.md",
    kind: "markdown",
    lines: L(`
# credentials

## CCNA
Cisco · issued Jun 2026 · expires Jun 2029

## B.S. Cyber / Computer Forensics and Counterterrorism
University at Albany, SUNY · 2020 – 2022

## TryHackMe
Top 1%
`),
  },
  {
    name: "contact.md",
    kind: "markdown",
    lines: L(`
# contact

email:      ${PROFILE.email}
github:     ${PROFILE.github}
linkedin:   ${PROFILE.linkedin}
resume:     ${PROFILE.resume}
`),
  },
  {
    name: "help.txt",
    kind: "text",
    lines: L(`
# help

! movement
j k           down, up
gg  G         top, bottom
ctrl-d  u     half page down, up
H  L          previous, next tab
:             open the command line
esc           cancel

! commands
:e <file>     open a file, for example :e projects
:ls           list files
:theme        cycle colors, or pick one: :theme nord
:resume       open the PDF resume
:github       open GitHub
:linkedin     open LinkedIn
:mail         write an email
:ping         check latency
:q            back to the start
`),
  },
];

/* ════════════════════════════════════════════════════════════
   SYNTAX HIGHLIGHTING
   ════════════════════════════════════════════════════════════ */
const KEYWORDS = new Set([
  "BGP", "iBGP", "eBGP", "OSPF", "HSRP", "VRF", "VLAN", "VLT", "LAG", "DWDM", "DDoS",
  "FMC", "FTD", "REST", "API", "APIs", "Python", "Cisco", "IOS", "IOS-XR", "ASR",
  "NCS-55A1", "NCS-5500", "Firepower", "Gigamon", "TAP", "TAPs", "CCNA", "Dell",
  "Globus", "NYSERNET", "Cogent", "FirstLight", "SUNY", "ISE", "HA", "DMZ", "ISP",
  "Siemens", "CrowdStrike", "Darktrace", "Palo", "Alto",
]);

const TOKEN =
  /https?:\/\/[^\s]+|\/[\w.-]+\.pdf|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|"[^"]*"|:[a-z]+|[A-Za-z][A-Za-z0-9-]*|\d[\d,./%+]*|\s+|[\s\S]/g;

function renderLine(text: string): ReactNode {
  if (text.trimStart().startsWith("!")) return <span className="t-comment">{text}</span>;
  const h = /^(#{1,3}) /.exec(text);
  if (h) return <span className={`t-h${h[1].length}`}>{text}</span>;

  const toks = text.match(TOKEN) ?? [];
  const onlyBefore = (i: number, re: RegExp) => toks.slice(0, i).every((t) => re.test(t));

  return toks.map((tok, i) => {
    if (/^https?:\/\//.test(tok) || /^\/[\w.-]+\.pdf$/.test(tok)) {
      const href = tok.startsWith("/") ? PROFILE.resume : tok;
      return (
        <a key={i} className="t-link" href={href} target="_blank" rel="noreferrer">
          {tok}
        </a>
      );
    }
    if (tok.includes("@") && /^[\w.+-]+@/.test(tok)) {
      return (
        <a key={i} className="t-link" href={`mailto:${tok}`}>
          {tok}
        </a>
      );
    }
    let cls = "";
    if (tok.startsWith('"')) cls = "t-str";
    else if (tok.length > 1 && tok.startsWith(":")) cls = "t-cmd";
    else if (tok === "-" && onlyBefore(i, /^\s+$/)) cls = "t-bullet";
    else if (/^[A-Za-z]/.test(tok)) {
      if (KEYWORDS.has(tok)) cls = "t-kw";
      else if (toks[i + 1] === ":" && onlyBefore(i, /^(\s+|-)$/)) cls = "t-key";
    } else if (/^\d/.test(tok)) cls = "t-num";
    return (
      <span key={i} className={cls || undefined}>
        {tok}
      </span>
    );
  });
}

/* ════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════ */
export default function Page() {
  const [view, setView] = useState<"landing" | "site">("landing");
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [active, setActive] = useState("about.md");
  const [open, setOpen] = useState<string[]>(["about.md"]);
  const [cursor, setCursor] = useState(0);
  const [mode, setMode] = useState<"normal" | "command">("normal");
  const [cmd, setCmd] = useState("");
  const [msg, setMsg] = useState("");
  const [tree, setTree] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth > 760,
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const bufRef = useRef<HTMLDivElement>(null);
  const lastKey = useRef("");

  const file = FILES.find((f) => f.name === active) ?? FILES[0];
  const total = file.lines.length;

  /* theme */
  const changeTheme = useCallback((t: Theme) => {
    setTheme(t);
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("theme", t);
    } catch {
      /* storage blocked: ignore */
    }
  }, []);
  const cycleTheme = useCallback(() => {
    changeTheme(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]);
  }, [theme, changeTheme]);

  /* files */
  const openFile = useCallback((name: string) => {
    setActive(name);
    setOpen((o) => (o.includes(name) ? o : [...o, name]));
    setCursor(0);
    setMsg("");
    if (window.matchMedia("(max-width: 760px)").matches) setTree(false);
  }, []);

  const stepTab = useCallback(
    (dir: 1 | -1) => {
      const i = open.indexOf(active);
      const next = open[(i + dir + open.length) % open.length];
      setActive(next);
      setCursor(0);
    },
    [open, active],
  );

  /* command line */
  const startCmd = useCallback(() => {
    setMsg("");
    setCmd("");
    setMode("command");
  }, []);

  const run = useCallback(
    (raw: string) => {
      const parts = raw.trim().replace(/^:+/, "").split(/\s+/).filter(Boolean);
      const name = (parts[0] ?? "").toLowerCase();
      const arg = parts.slice(1).join(" ").toLowerCase();
      if (!name) return;

      switch (name) {
        case "e":
        case "edit":
        case "open": {
          if (!arg) return setMsg("usage: :e <file>   (try :ls)");
          const f =
            FILES.find((x) => x.name === arg) ??
            FILES.find((x) => x.name.replace(/\..+$/, "").startsWith(arg));
          return f ? openFile(f.name) : setMsg(`E484: can't open file ${arg}`);
        }
        case "ls":
        case "files":
          return setMsg(FILES.map((f) => f.name).join("   "));
        case "theme":
        case "colorscheme":
        case "colo": {
          if (!arg) {
            const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
            changeTheme(next);
            return setMsg(`theme: ${next}`);
          }
          const t = THEMES.find((x) => x === arg);
          if (!t) return setMsg(`unknown theme. options: ${THEMES.join(", ")}`);
          changeTheme(t);
          return setMsg(`theme: ${t}`);
        }
        case "help":
        case "h":
          return openFile("help.txt");
        case "resume":
          window.open(PROFILE.resume, "_blank", "noopener");
          return setMsg("opening resume.pdf");
        case "github":
          window.open(PROFILE.github, "_blank", "noopener,noreferrer");
          return setMsg("opening github");
        case "linkedin":
          window.open(PROFILE.linkedin, "_blank", "noopener,noreferrer");
          return setMsg("opening linkedin");
        case "mail":
          window.location.href = `mailto:${PROFILE.email}`;
          return;
        case "ping":
          return setMsg(`64 bytes from ${arg || "connor"}: icmp_seq=1 ttl=64 time=0.4 ms`);
        case "q":
        case "quit":
          return setView("landing");
        default:
          return setMsg(`E492: not an editor command: ${name}`);
      }
    },
    [theme, changeTheme, openFile],
  );

  const onCmdKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const c = cmd;
      setMode("normal");
      setCmd("");
      run(c);
    } else if (e.key === "Escape" || (e.key === "Backspace" && cmd === "")) {
      e.preventDefault();
      setMode("normal");
      setCmd("");
    }
  };

  /* keyboard */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;

      if (view === "landing") {
        if (e.key === "Enter" && !(t && (t.tagName === "BUTTON" || t.tagName === "A"))) {
          setView("site");
        }
        return;
      }
      if (e.metaKey || e.altKey) return;

      const move = (d: number) => setCursor((c) => Math.min(total - 1, Math.max(0, c + d)));
      const half = Math.max(5, Math.floor((bufRef.current?.clientHeight ?? 400) / 22 / 2));

      if (e.ctrlKey) {
        if (e.key === "d") {
          e.preventDefault();
          move(half);
        } else if (e.key === "u") {
          e.preventDefault();
          move(-half);
        }
        return;
      }

      const prev = lastKey.current;
      lastKey.current = e.key;

      switch (e.key) {
        case ":":
          e.preventDefault();
          startCmd();
          break;
        case "j":
        case "ArrowDown":
          e.preventDefault();
          move(1);
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          move(-1);
          break;
        case "g":
          if (prev === "g") {
            setCursor(0);
            lastKey.current = "";
          }
          break;
        case "G":
          setCursor(total - 1);
          break;
        case "H":
          stepTab(-1);
          break;
        case "L":
          stepTab(1);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, total, startCmd, stepTab]);

  /* focus the command input, keep the cursor line in view */
  useEffect(() => {
    if (mode === "command") inputRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    if (view !== "site") return;
    document.getElementById(`ln-${cursor}`)?.scrollIntoView({ block: "nearest" });
  }, [cursor, active, view]);

  /* ───────── landing ───────── */
  if (view === "landing") {
    return (
      <div className="landing">
        <pre className="wall" aria-hidden="true">
          {WALL_TEXT}
        </pre>

        <header className="landing-top">
          <span>~/connor-gates</span>
          <a href={PROFILE.github} target="_blank" rel="noreferrer">
            github
          </a>
        </header>

        <div className="landing-center">
          <h1 className="tagline">
            <span className="typed" style={{ "--n": TAGLINE.length } as CSSProperties}>
              {TAGLINE}
            </span>
            <span className="caret" aria-hidden="true" />
          </h1>
          <p className="whoami">Connor Gates · Network Engineer · Binghamton University</p>
        </div>

        <div className="status">
          <span className="mode" data-mode="normal">
            NORMAL
          </span>
          <span className="sp" />
          <button onClick={() => setView("site")}>enter ↩</button>
          <button onClick={cycleTheme}>:theme</button>
        </div>
      </div>
    );
  }

  /* ───────── site ───────── */
  const pct =
    total <= 1 ? "All" : cursor === 0 ? "Top" : cursor === total - 1 ? "Bot" : `${Math.round((cursor / (total - 1)) * 100)}%`;

  return (
    <div className="site">
      <div className="tabline" role="tablist" aria-label="Open files">
        <button
          className="tab-toggle"
          onClick={() => setTree((t) => !t)}
          aria-label="Toggle file tree"
          aria-expanded={tree}
        >
          ☰
        </button>
        {open.map((n) => (
          <button
            key={n}
            role="tab"
            className="tab"
            aria-selected={n === active}
            onClick={() => {
              setActive(n);
              setCursor(0);
            }}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="workspace">
        <nav className="tree" data-open={tree} aria-label="Files">
          <div className="tree-root">connor-gates/</div>
          {FILES.map((f) => (
            <button
              key={f.name}
              className="tree-item"
              data-active={f.name === active}
              onClick={() => openFile(f.name)}
            >
              {f.name}
            </button>
          ))}
        </nav>

        <main className="buffer" ref={bufRef}>
          {file.lines.map((text, i) => (
            <div
              key={`${file.name}-${i}`}
              id={`ln-${i}`}
              className="line"
              data-cur={i === cursor}
              onClick={() => setCursor(i)}
            >
              <span className="num" aria-hidden="true">
                {i + 1}
              </span>
              <span className="code">{renderLine(text)}</span>
            </div>
          ))}
          {[0, 1, 2].map((n) => (
            <div key={n} className="tilde" aria-hidden="true">
              ~
            </div>
          ))}
        </main>
      </div>

      <div className="status">
        <span className="mode" data-mode={mode}>
          {mode === "command" ? "COMMAND" : "NORMAL"}
        </span>
        <span>{active}</span>
        <span className="sp" />
        <span className="dim hide-sm">{file.kind}</span>
        <span>{pct}</span>
        <span>{cursor + 1}:1</span>
        <button onClick={startCmd} aria-label="Open command line">
          :
        </button>
      </div>

      <div className="cmdline" aria-live="polite">
        {mode === "command" ? (
          <>
            <span className="prompt">:</span>
            <input
              ref={inputRef}
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              onKeyDown={onCmdKey}
              onBlur={() => {
                setMode("normal");
                setCmd("");
              }}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              aria-label="Command"
            />
          </>
        ) : (
          <span className={msg ? "msg" : "hint"}>{msg || "j/k move · : command · :help"}</span>
        )}
      </div>
    </div>
  );
}
