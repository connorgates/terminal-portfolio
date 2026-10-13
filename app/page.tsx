"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Line = { kind: "input" | "output" | "error" | "system"; text: string };

const FILES: Record<string, string[]> = {
  "about.txt": [
    "Connor Gates — Network Engineer",
    "Binghamton University · Vestal, New York",
    "",
    "I design, secure, and modernize enterprise campus infrastructure.",
    "My work spans multi-ISP routing, Cisco firewall security, data center",
    "fabric refreshes, network visibility, and Python-based automation.",
    "",
    "CCNA · Cisco routing/switching · BGP/OSPF · Firepower/FMC · Python",
  ],
  "skills.txt": [
    "ROUTING       Cisco IOS / IOS-XR, BGP, OSPF, iBGP/eBGP, HSRP",
    "SWITCHING     VLANs, VRFs, Layer 2/3, campus distribution, spine/leaf",
    "SECURITY      Cisco FMC/Firepower, policy design, DDoS mitigation",
    "VISIBILITY    Gigamon TAPs, traffic analysis, network troubleshooting",
    "AUTOMATION    Python, REST APIs, CSV tooling, configuration workflows",
    "OPERATIONS    Change control, maintenance windows, rollback planning",
  ],
  "certifications.txt": [
    "CCNA — Cisco",
    "Issued June 2026 · Expires June 2029",
    "Credential: https://www.credly.com/badges/8e8c26bc-d31f-4055-8923-3d17a1bd56dc/linked_in_profile",
  ],
  "experience.txt": [
    "2023–PRESENT  NETWORK ENGINEER · BINGHAMTON UNIVERSITY",
    "  • Modernized edge routing and executed live Cisco ASR migrations.",
    "  • Built a third ISP connection with a Cisco NCS-5500 and iBGP.",
    "  • Implemented edge DDoS mitigation with blackholing and scrubbing.",
    "  • Deployed Globus / Science DMZ with BGP traffic steering.",
    "  • Replaced and manage Cisco Firepower HA pairs through FMC.",
    "  • Created firewall policy for 300+ servers supporting SUNY 6900.",
    "  • Built Python tooling for FMC rule creation, audits, and reporting.",
    "  • Refreshed data center spine/leaf and campus distribution switching.",
    "  • Deployed six Gigamon TAPs for ISP and east-west traffic visibility.",
    "",
    "2023  NETWORK ADMINISTRATOR · WILLOW RUN FOODS",
    "  • Supported network, server, workstation, and endpoint security operations.",
    "",
    "2022  CYBERSECURITY & PRIVACY RESEARCH · UNIVERSITY AT ALBANY",
    "  • Researched IoT vulnerabilities, threat trends, and penetration testing.",
  ],
};

const PROJECTS: Record<string, string[]> = {
  "edge-migration": [
    "PROJECT: ENTERPRISE EDGE MODERNIZATION",
    "Focus: Cisco ASR 9000 migration, IOS-XR, ISP routing",
    "",
    "Reworked edge configurations, staged replacement hardware, and",
    "planned live cutovers with documented validation and rollback steps.",
    "Also implemented edge DDoS protections using blackholing and filtering",
    "toward a FirstLight scrubbing service.",
  ],
  "science-dmz": [
    "PROJECT: GLOBUS / SCIENCE DMZ",
    "Focus: multi-router architecture, HSRP, BGP traffic steering",
    "",
    "Designed a research data-transfer network spanning three edge routers,",
    "with redundant gateway services and NYSERNet preferred routing for",
    "research and inter-institutional destinations.",
  ],
  "fmc-toolkit": [
    "PROJECT: CISCO FMC REST API TOOLKIT",
    "Focus: Python, REST APIs, security policy automation",
    "",
    "Built scripts for bulk firewall rule creation, unused-object auditing,",
    "device inventory, health reporting, and structured CSV exports.",
    "Credentials are supplied locally through environment variables.",
  ],
  "visibility": [
    "PROJECT: NETWORK VISIBILITY / GIGAMON TAPS",
    "Focus: ISP north-south traffic and data-center east-west visibility",
    "",
    "Designed and deployed six planned TAP installations, coordinated fiber",
    "paths, and documented traffic capture points for troubleshooting and",
    "security analysis without adding inline processing to production paths.",
  ],
  "datacenter": [
    "PROJECT: DATA CENTER SPINE / LEAF REFRESH",
    "Focus: Layer 2/3 redesign, fiber modernization, Dell switching",
    "",
    "Worked on topology redesign and hardware replacement, including fiber",
    "planning, stakeholder coordination, deployment, and service validation.",
  ],
};

const HELP = [
  ["help", "show available commands"],
  ["whoami", "quick profile"],
  ["neofetch", "system-style profile summary"],
  ["ls", "list portfolio directories"],
  ["cat about.txt", "read the introduction"],
  ["cat experience.txt", "read work experience"],
  ["cat skills.txt", "list technical skills"],
  ["cat certifications.txt", "show credentials"],
  ["ls projects/", "list selected projects"],
  ["cat projects/<name>", "read a project case study"],
  ["network-map", "show a simplified network architecture"],
  ["contact", "show contact links"],
  ["clear", "clear the terminal"],
];

const PROJECT_NAMES = Object.keys(PROJECTS);

export default function Home() {
  const [history, setHistory] = useState<Line[]>([
    { kind: "system", text: "CONNOR.OS // portfolio environment ready" },
    { kind: "system", text: "Type 'help' to see available commands. This is a simulated shell." },
  ]);
  const [value, setValue] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commands, setCommands] = useState<string[]>([]);
  const [clock, setClock] = useState("");
  const [eye, setEye] = useState({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateClock = () => setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    updateClock();
    const id = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      setEye({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [history]);

  const prompt = useMemo(() => "connor@network:~$", []);

  function runCommand(raw: string) {
    const command = raw.trim();
    if (!command) return;
    setCommands((old) => [...old, command]);
    setHistoryIndex(-1);
    if (command.toLowerCase() === "clear") {
      setHistory([]);
      return;
    }

    const lines: Line[] = [{ kind: "input", text: `${prompt} ${command}` }];
    const normalized = command.toLowerCase().replace(/\s+/g, " ");

    const output = (texts: string[], kind: Line["kind"] = "output") =>
      texts.forEach((text) => lines.push({ kind, text }));

    if (normalized === "help" || normalized === "man" || normalized === "help --all") {
      output(["", "AVAILABLE COMMANDS", ...HELP.map(([cmd, desc]) => `  ${cmd.padEnd(28)} ${desc}`), "", "Tip: use ↑ / ↓ for command history."]);
    } else if (normalized === "whoami") {
      output(["Connor Gates", "Network Engineer @ Binghamton University", "CCNA · Network Infrastructure · Security · Automation"]);
    } else if (normalized === "pwd") {
      output(["/home/connor/portfolio"]);
    } else if (normalized === "date") {
      output([new Date().toString()]);
    } else if (normalized === "uname -a") {
      output(["CONNOR.OS 6.1.0-network #1 SMP x86_64 GNU/Linux (simulated)"]);
    } else if (normalized === "neofetch" || normalized === "fastfetch") {
      output([
        "       .---.          connor@network",
        "      /     \\         ----------------",
        "      |  o o |        OS: CONNOR.OS / Linux-inspired",
        "      |  ___ |        Role: Network Engineer",
        "       \\____/         Location: Vestal, NY",
        "       /|  |\\         Cert: Cisco CCNA",
        "      /_|__|_\\        Focus: Routing, Security, Automation",
        "                       Uptime: always learning",
      ]);
    } else if (normalized === "ls" || normalized === "ls -la" || normalized === "ll") {
      output([
        "about.txt                 experience.txt",
        "skills.txt                certifications.txt",
        "projects/                 network-map",
        "contact                   resume.pdf (add your PDF here)",
      ]);
    } else if (normalized === "ls projects" || normalized === "ls projects/" || normalized === "tree projects") {
      output(["projects/", ...PROJECT_NAMES.map((name) => `  ${name}`)]);
    } else if (normalized.startsWith("cat ")) {
      const file = normalized.slice(4).replace(/^\.\/+/, "");
      const project = file.replace(/^projects\//, "").replace(/\.txt$/, "");
      if (FILES[file]) output(FILES[file]);
      else if (PROJECTS[project]) output(PROJECTS[project]);
      else if (file === "projects" || file === "projects/") output(["Directory: projects/", ...PROJECT_NAMES.map((name) => `  ${name}`)]);
      else output([`cat: ${file}: file not found. Try 'ls' or 'ls projects/'.`], "error");
    } else if (normalized === "network-map" || normalized === "./network-map") {
      output([
        "SIMULATED / SANITIZED NETWORK OVERVIEW",
        "",
        "      [ NYSERNet ]       [ Cogent ]       [ FirstLight ]",
        "           |                 |                 |",
        "      [ Edge R1 ] <---- iBGP mesh ----> [ Edge R2 / R3 ]",
        "           |                                   |",
        "      [ Campus Core ] ---- [ Data Center Fabric ]",
        "           |                                   |",
        "     [ Science DMZ ]                  [ Firewalls / FMC ]",
        "                                               |",
        "                                     [ DDoS Scrubbing Path ]",
        "",
        "Illustrative only. Not a live topology or production configuration.",
      ]);
    } else if (normalized === "contact") {
      output([
        "CONTACT",
        "  LinkedIn : https://www.linkedin.com/in/connorgates-/",
        "  GitHub   : https://github.com/",
        "  Email    : Add your preferred email address to app/page.tsx",
        "",
        "Use the links in the top-right navigation to open LinkedIn / GitHub.",
      ]);
    } else if (normalized === "sudo rm -rf /" || normalized.startsWith("sudo ")) {
      output(["Permission denied: this portfolio is a simulated shell.", "No commands are executed on a server."], "error");
    } else if (normalized === "exit" || normalized === "quit") {
      output(["Session kept open. You're welcome to keep exploring."]);
    } else if (normalized === "history") {
      output(commands.map((item, index) => `${String(index + 1).padStart(4)}  ${item}`));
    } else if (normalized === "clear --help") {
      output(["Usage: clear — clear terminal output."]);
    } else {
      output([`bash: ${command.split(" ")[0]}: command not found`, "Type 'help' to list supported portfolio commands."], "error");
    }

    setHistory((old) => [...old, ...lines]);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runCommand(value);
    setValue("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!commands.length) return;
      const next = historyIndex < 0 ? commands.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setValue(commands[next] ?? "");
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex < 0) return;
      const next = historyIndex + 1;
      if (next >= commands.length) {
        setHistoryIndex(-1);
        setValue("");
      } else {
        setHistoryIndex(next);
        setValue(commands[next] ?? "");
      }
    } else if (event.key === "Tab") {
      event.preventDefault();
      const options = HELP.map(([cmd]) => cmd).concat(PROJECT_NAMES.map((name) => `cat projects/${name}`));
      const match = options.find((item) => item.startsWith(value.trim()));
      if (match) setValue(match);
    }
  }

  return (
    <main className="desktop" onClick={() => inputRef.current?.focus()}>
      <div className="ambient-grid" aria-hidden="true" />
      <header className="topbar">
        <div className="brand"><span className="brand-mark">⌘</span><span>connor<span className="muted">.sh</span></span><span className="status-dot" /></div>
        <div className="topbar-right">
          <span className="system-label"><span className="status-dot" /> SYSTEM ONLINE</span>
          <a href="https://www.linkedin.com/in/connorgates-/" target="_blank" rel="noreferrer">linkedin ↗</a>
          <a href="https://github.com/" target="_blank" rel="noreferrer">github ↗</a>
        </div>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <div className="side-heading"><span>SESSION</span><span className="side-light">●</span></div>
          <div className="profile-block">
            <div className="eye-shell" aria-label="Cursor tracking eye">
              <div className="eye-ring"><div className="eye-iris" style={{ transform: `translate(${eye.x * 7}px, ${eye.y * 5}px)` }}><div className="eye-pupil" /><div className="eye-glint" /></div></div>
            </div>
            <div className="profile-name">Connor Gates</div>
            <div className="profile-role">Network Engineer</div>
            <div className="profile-location">⌖ Vestal, New York</div>
          </div>
          <div className="side-heading"><span>DIRECTORY</span></div>
          <nav className="file-tree" aria-label="Portfolio shortcuts">
            <button onClick={() => runCommand("cat about.txt")}><span className="file-icon green">▤</span> about.txt</button>
            <button onClick={() => runCommand("cat experience.txt")}><span className="file-icon blue">▤</span> experience.txt</button>
            <button onClick={() => runCommand("cat skills.txt")}><span className="file-icon blue">▤</span> skills.txt</button>
            <button onClick={() => runCommand("cat certifications.txt")}><span className="file-icon yellow">▤</span> certifications.txt</button>
            <button onClick={() => runCommand("ls projects/")}><span className="file-icon purple">▰</span> projects/</button>
            <button onClick={() => runCommand("network-map")}><span className="file-icon red">⌘</span> network-map</button>
          </nav>
          <div className="sidebar-bottom">
            <div className="side-heading"><span>ENVIRONMENT</span></div>
            <div className="env-row"><span>shell</span><span>bash (simulated)</span></div>
            <div className="env-row"><span>theme</span><span>void-green</span></div>
            <div className="env-row"><span>access</span><span className="green-text">read-only</span></div>
          </div>
        </aside>

        <section className="terminal-window" aria-label="Interactive portfolio terminal">
          <div className="terminal-titlebar">
            <div className="window-controls"><i /><i /><i /></div>
            <div className="window-title"><span className="terminal-symbol">⌁</span> connor@network: ~/portfolio</div>
            <div className="window-mode">bash</div>
          </div>
          <div className="terminal-content" ref={outputRef}>
            <div className="welcome-block">
              <pre className="ascii-logo">{`   ____                             
  / ___|___  _ __  _ __   ___  _ __ 
 | |   / _ \\| '_ \\| '_ \\ / _ \\| '__|
 | |__| (_) | | | | | | | (_) | |   
  \\____\\___/|_| |_|_| |_|\\___/|_|   `}</pre>
              <div className="welcome-meta">
                <div className="welcome-title">Connor Gates <span className="prompt-caret">_</span></div>
                <div className="welcome-subtitle">NETWORK ENGINEER <span>///</span> INFRASTRUCTURE & SECURITY</div>
                <div className="welcome-description">Designing resilient networks. Securing infrastructure.<br />Automating the work that matters.</div>
              </div>
            </div>
            <div className="system-summary">
              <div><span className="summary-key">USER</span><span>connor</span></div>
              <div><span className="summary-key">ROLE</span><span>Network Engineer</span></div>
              <div><span className="summary-key">CERT</span><span className="green-text">Cisco CCNA</span></div>
              <div><span className="summary-key">FOCUS</span><span>BGP · Security · Automation</span></div>
            </div>
            <div className="rule" />
            <div className="terminal-output">
              {history.map((line, index) => (
                <div className={`terminal-line ${line.kind}`} key={`${index}-${line.text}`}>
                  <span>{line.text || "\u00a0"}</span>
                </div>
              ))}
            </div>
            <form className="command-form" onSubmit={submit} onClick={(event) => event.stopPropagation()}>
              <label htmlFor="terminal-input" className="prompt"><span>connor@network</span>:<span className="path">~</span>$</label>
              <input id="terminal-input" ref={inputRef} value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={handleKeyDown} autoComplete="off" spellCheck={false} aria-label="Enter terminal command" />
              <span className="input-cursor" />
            </form>
            <div className="terminal-hint">type <button onClick={() => runCommand("help")}>help</button> to get started <span>·</span> ↑↓ history <span>·</span> tab autocomplete</div>
          </div>
          <div className="terminal-statusbar"><span><i className="status-dot" /> CONNECTED</span><span>UTF-8</span><span>READ-ONLY SHELL</span><span className="status-clock">{clock}</span></div>
        </section>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Connor Gates</span>
        <span>BUILT WITH <span className="green-text">NEXT.JS</span> / TYPESCRIPT</span>
        <button onClick={() => { setHistory([]); setValue(""); inputRef.current?.focus(); }}>clear session ↗</button>
      </footer>
    </main>
  );
}
