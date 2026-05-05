import { useNavigate } from "react-router-dom";
import { ArrowRight, Terminal } from "lucide-react";
import ecuLogo from "@/assets/ecu-logo.png";

const TEAM_MEMBERS = [
  { name: "Ahmed Elbrazany", id: "192300475" },
  { name: "Abdelaziz Amir", id: "192300477" },
  { name: "Mohammed Amr", id: "192300311" },
  { name: "Abdallah Mousa", id: "192300370" },
  { name: "Ahmed Abdelaziz", id: "192300312" },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />

      <section className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <img
          src={ecuLogo}
          alt="Egyptian Chinese University logo"
          className="mb-10 h-24 w-auto animate-fade-up drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
          style={{ animationDelay: "0ms" }}
        />

        <div
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/40 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Compiler Design Project
        </div>

        <h1
          className="mb-4 font-[Space_Grotesk] text-5xl font-bold leading-[1.05] text-gradient sm:text-6xl md:text-7xl animate-fade-up"
          style={{ animationDelay: "220ms" }}
        >
          Lexical Analysis
          <br />
          <span className="bg-gradient-to-r from-primary to-red-400 bg-clip-text text-transparent">
            Scanner
          </span>
        </h1>

        <p
          className="mb-12 max-w-md text-base text-muted-foreground animate-fade-up"
          style={{ animationDelay: "320ms" }}
        >
          Egyptian Chinese University
        </p>

        <button
          onClick={() => navigate("/compiler")}
          className="group relative mb-14 inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_50px_hsl(0_84%_55%/0.55)] animate-pulse-glow animate-fade-up"
          style={{ animationDelay: "420ms" }}
        >
          <Terminal className="h-5 w-5" />
          Open Compiler
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>

        <div
          className="grid w-full max-w-2xl gap-4 text-sm sm:grid-cols-2 animate-fade-up"
          style={{ animationDelay: "560ms" }}
        >
          <div className="glass rounded-2xl p-5 text-left">
            <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
              Supervisor
            </p>
            <p className="font-medium text-foreground">Dr. Hossam Reda</p>
          </div>

          <div className="glass rounded-2xl p-5 text-left sm:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Team Members
              </p>
              <span className="rounded-full border border-border/70 bg-secondary/40 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {TEAM_MEMBERS.length} Students
              </span>
            </div>

            <div className="space-y-2.5">
              {TEAM_MEMBERS.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-black/20 px-3 py-2.5 transition-colors hover:border-primary/35"
                >
                  <p className="truncate font-medium text-foreground">
                    {member.name}
                  </p>
                  <span className="shrink-0 rounded-md border border-primary/25 bg-primary/10 px-2 py-1 font-mono text-xs text-primary">
                    {member.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
