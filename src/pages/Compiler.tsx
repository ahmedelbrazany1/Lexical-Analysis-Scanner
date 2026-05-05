import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Eraser,
  Pause,
  Play,
  RotateCcw,
  StepForward,
  Terminal as TerminalIcon,
  Gauge,
} from "lucide-react";
import {
  CPP_SOURCE,
  ScanStep,
  Token,
  TokenType,
  scanWithSteps,
} from "@/lib/scanner";
import ecuLogo from "@/assets/ecu-logo.png";

const DEFAULT_CODE = `int x = 10;\nstring name = "hello";\nif (x > -5) {\n  cout << name << endl;\n}`;

const BASE_DELAY_MS = 220; // at 1x

const TOKEN_COLOR: Record<TokenType, string> = {
  IDENTIFIER:
    "text-[hsl(var(--token-identifier))] border-[hsl(var(--token-identifier)/0.4)] bg-[hsl(var(--token-identifier)/0.08)]",
  KEYWORD:
    "text-[hsl(var(--token-operator))] border-[hsl(var(--token-operator)/0.4)] bg-[hsl(var(--token-operator)/0.08)]",
  NUMBER:
    "text-[hsl(var(--token-number))] border-[hsl(var(--token-number)/0.4)] bg-[hsl(var(--token-number)/0.08)]",
  SYMBOL:
    "text-[hsl(var(--token-symbol))] border-[hsl(var(--token-symbol)/0.4)] bg-[hsl(var(--token-symbol)/0.08)]",
  MESSAGE:
    "text-[hsl(var(--token-number))] border-[hsl(var(--token-number)/0.4)] bg-[hsl(var(--token-number)/0.05)]",
  UNKNOWN:
    "text-[hsl(var(--token-invalid))] border-[hsl(var(--token-invalid)/0.5)] bg-[hsl(var(--token-invalid)/0.12)]",
};

const TOKEN_DOT: Record<TokenType, string> = {
  IDENTIFIER: "bg-[hsl(var(--token-identifier))]",
  KEYWORD: "bg-[hsl(var(--token-operator))]",
  NUMBER: "bg-[hsl(var(--token-number))]",
  SYMBOL: "bg-[hsl(var(--token-symbol))]",
  MESSAGE: "bg-[hsl(var(--token-number))]",
  UNKNOWN: "bg-[hsl(var(--token-invalid))]",
};

const CPP_LINES = CPP_SOURCE.split("\n");

const Compiler = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [steps, setSteps] = useState<ScanStep[]>([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [speed, setSpeed] = useState(1); // 0.5x - 3x
  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const timerRef = useRef<number | null>(null);

  const tokens: Token[] = useMemo(() => {
    const out: Token[] = [];
    for (let i = 0; i <= stepIdx && i < steps.length; i++) {
      const t = steps[i].token;
      if (t) out.push(t);
    }
    return out;
  }, [steps, stepIdx]);

  const logs: string[] = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i <= stepIdx && i < steps.length; i++) out.push(steps[i].log);
    return out;
  }, [steps, stepIdx]);

  const current = stepIdx >= 0 ? steps[stepIdx] : undefined;
  const cursorIndex = current?.index ?? -1;
  const activeCppLine = current?.cppLine;

  // Auto-run loop — re-reads speedRef each tick so changes apply live
  useEffect(() => {
    if (!running) return;
    if (stepIdx >= steps.length - 1) {
      setRunning(false);
      return;
    }
    const delay = Math.max(20, BASE_DELAY_MS / speedRef.current);
    timerRef.current = window.setTimeout(() => {
      setStepIdx((s) => s + 1);
    }, delay);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [running, stepIdx, steps.length]);

  // Glitch on UNKNOWN reveal
  useEffect(() => {
    if (current?.token?.type === "UNKNOWN") {
      setGlitch(true);
      const id = window.setTimeout(() => setGlitch(false), 320);
      return () => window.clearTimeout(id);
    }
  }, [current]);

  // Auto-scroll console
  const consoleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs.length]);

  const buildSteps = () => {
    const s = scanWithSteps(code);
    setSteps(s);
    setStepIdx(-1);
    return s;
  };

  const handleRun = () => {
    if (steps.length === 0 || stepIdx >= steps.length - 1) buildSteps();
    setRunning(true);
  };
  const handleStep = () => {
    setRunning(false);
    let s = steps;
    if (s.length === 0) s = buildSteps();
    setStepIdx((idx) => Math.min(idx + 1, s.length - 1));
  };
  const handlePause = () => setRunning(false);
  const handleReset = () => {
    setRunning(false);
    setSteps([]);
    setStepIdx(-1);
    if (timerRef.current) window.clearTimeout(timerRef.current);
  };
  const handleClear = () => {
    handleReset();
    setCode("");
  };

  // Highlighted code rendering with moving glow cursor
  const renderCode = () => {
    if (cursorIndex < 0) {
      return (
        <span className="whitespace-pre-wrap text-muted-foreground/60">
          {code || "Type C++ code in the editor..."}
        </span>
      );
    }
    const before = code.slice(0, cursorIndex);
    const ch = code[cursorIndex] ?? "";
    const after = code.slice(cursorIndex + 1);
    const tokenType = current?.token?.type;
    const charClass =
      tokenType === "UNKNOWN"
        ? "bg-[hsl(var(--token-invalid)/0.4)] text-[hsl(var(--token-invalid))] shadow-[0_0_12px_hsl(var(--token-invalid)/0.7)]"
        : tokenType
        ? "bg-primary/40 text-foreground shadow-[0_0_14px_hsl(var(--primary)/0.8)]"
        : "bg-primary/25 text-foreground shadow-[0_0_10px_hsl(var(--primary)/0.5)]";
    return (
      <span className="whitespace-pre-wrap">
        <span className="text-foreground/90">{before}</span>
        {ch && <span className={`rounded px-0.5 transition-all ${charClass}`}>{ch}</span>}
        <span className="scanline-cursor h-[1.1em]" />
        <span className="text-muted-foreground/70">{after}</span>
      </span>
    );
  };

  const progress = steps.length > 1 ? Math.max(0, stepIdx + 1) / steps.length : 0;

  return (
    <main className="relative min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30 glass border-b border-border/60">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-3">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground hover:border-primary/40"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </Link>
            <div className="flex items-center gap-2">
              <img src={ecuLogo} alt="ECU" className="h-7 w-auto" />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold tracking-tight">Lexical Scanner</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Compiler Design · ECU
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {tokens.length} tokens · step {Math.max(0, stepIdx + 1)}/{steps.length || 0}
          </div>
        </div>
        <div className="h-[2px] w-full bg-border/40">
          <div
            className="h-full bg-gradient-to-r from-primary to-red-400 transition-all duration-200"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </header>

      {/* Workspace */}
      <div className="mx-auto grid max-w-[1600px] gap-4 p-4 lg:grid-cols-[1.4fr_1fr] lg:p-5">
        {/* LEFT column */}
        <div className="flex flex-col gap-4">
          {/* Editor + integrated toolbar */}
          <section className="glass overflow-hidden rounded-2xl">
            <PanelHeader label="editor.cpp" hint="Editable source" />

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-black/40 px-3 py-2.5">
              <ToolbarButton onClick={handleRun} disabled={running} primary>
                <Play className="h-3.5 w-3.5" /> Run
              </ToolbarButton>
              <ToolbarButton onClick={handleStep}>
                <StepForward className="h-3.5 w-3.5" /> Step
              </ToolbarButton>
              <ToolbarButton onClick={handlePause}>
                <Pause className="h-3.5 w-3.5" /> Pause
              </ToolbarButton>
              <ToolbarButton onClick={handleReset}>
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </ToolbarButton>
              <ToolbarButton onClick={handleClear}>
                <Eraser className="h-3.5 w-3.5" /> Clear
              </ToolbarButton>

              <div className="ml-auto flex items-center gap-3 rounded-lg border border-border/60 bg-secondary/40 px-3 py-1.5 shadow-[inset_0_0_12px_hsl(0_0%_0%/0.4)]">
                <Gauge className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Speed
                </span>
                <input
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.1}
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="speed-slider w-32 md:w-44 accent-primary"
                />
                <span className="w-10 text-right font-mono text-xs text-foreground tabular-nums">
                  {speed.toFixed(1)}x
                </span>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-2">
              <div className="border-b border-border/60 lg:border-b-0 lg:border-r">
                <textarea
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    handleReset();
                  }}
                  spellCheck={false}
                  placeholder="Type C++ code..."
                  className="block h-56 w-full resize-none bg-transparent px-5 py-4 font-mono text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="bg-black/30 px-5 py-4 font-mono text-[15px] leading-relaxed">
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Live scan view
                </p>
                <div className={`min-h-[8rem] ${glitch ? "animate-glitch" : ""}`}>
                  {renderCode()}
                </div>
              </div>
            </div>
          </section>

          {/* C++ logic viewer */}
          <section className="glass overflow-hidden rounded-2xl">
            <PanelHeader
              label="scanner.cpp"
              hint={activeCppLine ? `→ line ${activeCppLine + 1}` : "Logic"}
            />
            <pre className="scrollbar-thin max-h-[420px] overflow-auto bg-black/40 px-0 py-3 font-mono text-[13px] leading-[1.55]">
              {CPP_LINES.map((line, idx) => {
                const active = idx === activeCppLine;
                return (
                  <div
                    key={idx}
                    className={`flex transition-colors ${
                      active
                        ? "bg-primary/15 border-l-2 border-primary shadow-[inset_0_0_20px_hsl(var(--primary)/0.15)]"
                        : "border-l-2 border-transparent"
                    }`}
                  >
                    <span className="select-none px-3 text-right text-muted-foreground/50 w-12 shrink-0">
                      {idx + 1}
                    </span>
                    <code
                      className={`min-w-0 flex-1 whitespace-pre-wrap break-words ${
                        active ? "text-foreground" : "text-foreground/80"
                      }`}
                    >
                      {line || " "}
                    </code>
                  </div>
                );
              })}
            </pre>
          </section>
        </div>

        {/* RIGHT column - tokens */}
        <section className="glass flex flex-col overflow-hidden rounded-2xl">
          <PanelHeader
            label="tokens.out"
            hint={`${tokens.length} token${tokens.length === 1 ? "" : "s"}`}
          />
          <div className="scrollbar-thin flex-1 overflow-auto p-4 max-h-[640px]">
            {tokens.length === 0 ? (
              <EmptyTokens />
            ) : (
              <ul className="space-y-2">
                {tokens.map((tok, i) => (
                  <li
                    key={i}
                    className={`animate-slide-in flex items-center justify-between gap-3 rounded-xl border px-4 py-3 font-mono text-sm ${TOKEN_COLOR[tok.type]}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${TOKEN_DOT[tok.type]}`} />
                      <span className="text-[10px] uppercase tracking-[0.15em] opacity-80">
                        [{tok.type}]
                      </span>
                      <span className="truncate text-foreground">{tok.value}</span>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      @{tok.start}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Legend />
        </section>
      </div>

      {/* Console */}
      <section className="mx-auto max-w-[1600px] px-4 pb-6 lg:px-5">
        <div className="glass overflow-hidden rounded-2xl">
          <PanelHeader
            label="console.log"
            hint="Live explanation"
            icon={<TerminalIcon className="h-3.5 w-3.5" />}
          />
          <div
            ref={consoleRef}
            className="scrollbar-thin h-48 overflow-auto bg-black/50 px-5 py-4 font-mono text-[13px] leading-relaxed"
          >
            {logs.length === 0 ? (
              <p className="text-muted-foreground">
                <span className="text-primary">$</span> Awaiting input. Press{" "}
                <kbd className="rounded bg-secondary px-1.5 py-0.5 text-xs">Run</kbd> or{" "}
                <kbd className="rounded bg-secondary px-1.5 py-0.5 text-xs">Step</kbd> to begin.
              </p>
            ) : (
              logs.map((l, i) => (
                <div
                  key={i}
                  className={`animate-slide-in ${
                    l.includes("UNKNOWN")
                      ? "text-[hsl(var(--token-invalid))]"
                      : l.includes("complete")
                      ? "text-[hsl(var(--token-number))]"
                      : "text-foreground/85"
                  }`}
                >
                  {l}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

const ToolbarButton = ({
  children,
  onClick,
  disabled,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={
      primary
        ? "inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 hover:shadow-[0_0_18px_hsl(var(--primary)/0.55)] disabled:opacity-50"
        : "inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/50 hover:text-primary hover:shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
    }
  >
    {children}
  </button>
);

const PanelHeader = ({
  label,
  hint,
  icon,
}: {
  label: string;
  hint?: string;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between border-b border-border/60 bg-black/30 px-4 py-2.5">
    <div className="flex items-center gap-2">
      <div className="flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
      </div>
      <span className="ml-2 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        {label}
      </span>
    </div>
    {hint && (
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">
        {hint}
      </span>
    )}
  </div>
);

const EmptyTokens = () => (
  <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
    <div className="mb-3 h-10 w-10 rounded-full border border-dashed border-border" />
    <p className="text-sm text-muted-foreground">No tokens yet</p>
    <p className="mt-1 text-xs text-muted-foreground/60">
      Press Run or Step to populate this panel.
    </p>
  </div>
);

const Legend = () => {
  const items: { type: TokenType; label: string }[] = [
    { type: "KEYWORD", label: "keyword" },
    { type: "IDENTIFIER", label: "ident" },
    { type: "NUMBER", label: "num" },
    { type: "SYMBOL", label: "sym" },
    { type: "MESSAGE", label: "msg" },
    { type: "UNKNOWN", label: "err" },
  ];
  return (
    <div className="flex flex-wrap gap-2 border-t border-border/60 bg-black/30 px-4 py-2.5">
      {items.map((it) => (
        <span
          key={it.type}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
        >
          <span className={`h-2 w-2 rounded-full ${TOKEN_DOT[it.type]}`} />
          {it.label}
        </span>
      ))}
    </div>
  );
};

export default Compiler;
