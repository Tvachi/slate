"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Activity, Clock, CheckCircle, Info, Loader2, Stethoscope } from "lucide-react";
import type { TriageResult } from "./api/triage/route";

type TriageResponse = TriageResult & {
  _debug?: { requestId: string; durationMs: number; inputTokens: number; outputTokens: number };
};

const SAMPLE_CASES = [
  {
    label: "Chest Pain",
    emoji: "❤️",
    symptoms:
      "55-year-old male presenting with crushing chest pain radiating to the left arm for the past 30 minutes. Associated diaphoresis, nausea, and shortness of breath. History of hypertension and type 2 diabetes. BP 160/100, HR 110, SpO2 94% on room air.",
  },
  {
    label: "Pediatric Fever",
    emoji: "🌡️",
    symptoms:
      "3-year-old girl brought in by parents with fever of 39.8°C (103.6°F) for 2 days. Child appears irritable and lethargic. Decreased oral intake. No rash. No neck stiffness. No recent travel. Up to date on vaccinations. Parents report one episode of febrile seizure history 6 months ago.",
  },
  {
    label: "Mild Back Pain",
    emoji: "🦴",
    symptoms:
      "28-year-old female with 3 days of mild lower back pain after moving furniture. Pain is 4/10, non-radiating, relieved by ibuprofen. No bowel or bladder symptoms. No trauma. No fever. Able to ambulate normally. No history of back problems.",
  },
];

const TRIAGE_CONFIG: Record<
  number,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    glow: string;
    icon: React.ReactNode;
    description: string;
  }
> = {
  1: {
    label: "Level 1 — Immediate",
    color: "text-red-400",
    bg: "bg-red-950/40",
    border: "border-red-500",
    glow: "shadow-red-900/50",
    icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
    description: "Resuscitation required — life-threatening",
  },
  2: {
    label: "Level 2 — Emergent",
    color: "text-orange-400",
    bg: "bg-orange-950/40",
    border: "border-orange-500",
    glow: "shadow-orange-900/50",
    icon: <Activity className="w-6 h-6 text-orange-400" />,
    description: "High risk — emergent intervention needed",
  },
  3: {
    label: "Level 3 — Urgent",
    color: "text-yellow-400",
    bg: "bg-yellow-950/40",
    border: "border-yellow-600",
    glow: "shadow-yellow-900/50",
    icon: <Clock className="w-6 h-6 text-yellow-400" />,
    description: "Stable but requires urgent evaluation",
  },
  4: {
    label: "Level 4 — Less Urgent",
    color: "text-green-400",
    bg: "bg-green-950/40",
    border: "border-green-600",
    glow: "shadow-green-900/50",
    icon: <CheckCircle className="w-6 h-6 text-green-400" />,
    description: "Semi-urgent — non-critical condition",
  },
  5: {
    label: "Level 5 — Non-Urgent",
    color: "text-blue-400",
    bg: "bg-blue-950/40",
    border: "border-blue-600",
    glow: "shadow-blue-900/50",
    icon: <Info className="w-6 h-6 text-blue-400" />,
    description: "Routine — could be seen in primary care",
  },
};

export default function TriagePage() {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState<TriageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!symptoms.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "An error occurred. Please try again.");
        return;
      }

      setResult(data);
    } catch {
      setError("Failed to connect to the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function loadSample(sample: (typeof SAMPLE_CASES)[0]) {
    setSymptoms(sample.symptoms);
    setResult(null);
    setError(null);
  }

  const config = result ? TRIAGE_CONFIG[result.triageLevel] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-600/30">
            <Stethoscope className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              TriageAI
            </h1>
            <p className="text-xs text-slate-400">AI-Assisted Patient Triage System</p>
          </div>
          <div className="ml-auto">
            <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
              Demo Only
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Disclaimer */}
        <div className="flex gap-3 p-4 rounded-lg border border-amber-600/40 bg-amber-950/20 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm">
            <strong className="text-amber-300">For demonstration purposes only.</strong>{" "}
            This AI triage tool is not a substitute for professional medical judgment.
            In a real emergency, call emergency services immediately. All clinical
            decisions must be made by qualified healthcare professionals.
          </p>
        </div>

        {/* Input Form */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-1">Patient Symptom Assessment</h2>
          <p className="text-sm text-slate-400 mb-5">
            Describe the patient&apos;s symptoms, vital signs, and relevant history in Thai or English.
          </p>

          {/* Sample Case Buttons */}
          <div className="mb-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
              Sample Cases
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_CASES.map((sample) => (
                <Button
                  key={sample.label}
                  variant="outline"
                  size="sm"
                  onClick={() => loadSample(sample)}
                  className="text-xs border-slate-700 text-slate-300 hover:border-slate-500"
                >
                  <span>{sample.emoji}</span>
                  {sample.label}
                </Button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe the patient's chief complaint, symptoms, vital signs, relevant medical history, and any other pertinent information...

ระบุอาการหลัก, อาการที่พบ, สัญญาณชีพ, ประวัติทางการแพทย์ที่เกี่ยวข้อง..."
              className="min-h-[160px] text-sm leading-relaxed resize-none"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={!symptoms.trim() || loading}
              className="w-full h-11 text-sm font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Symptoms...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  Analyze &amp; Triage Patient
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950/30 p-5 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-300 mb-1">Analysis Failed</p>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Triage Result */}
        {result && config && (
          <div className="space-y-4">
            {/* Triage Level Banner */}
            <div
              className={`rounded-xl border-2 ${config.border} ${config.bg} p-6 shadow-2xl ${config.glow}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl border ${config.border} bg-slate-900/50`}>
                  {config.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`text-3xl font-black tracking-tight ${config.color}`}
                    >
                      {config.label}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${config.color} opacity-80`}>
                    {config.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Recommended Department:
                    </span>
                    <span className="text-sm font-semibold text-white bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                      🏥 {result.recommendedDepartment}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Level Indicator */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                Triage Scale
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => {
                  const levelConfig = TRIAGE_CONFIG[level];
                  const isActive = level === result.triageLevel;
                  return (
                    <div
                      key={level}
                      className={`flex-1 rounded-lg p-3 text-center transition-all border ${
                        isActive
                          ? `${levelConfig.bg} ${levelConfig.border} scale-105 shadow-lg`
                          : "bg-slate-800/50 border-slate-700 opacity-40"
                      }`}
                    >
                      <div
                        className={`text-xl font-black ${isActive ? levelConfig.color : "text-slate-600"}`}
                      >
                        {level}
                      </div>
                      <div
                        className={`text-[10px] mt-0.5 font-medium ${isActive ? levelConfig.color : "text-slate-600"}`}
                      >
                        {["Immediate", "Emergent", "Urgent", "Less Urgent", "Non-Urgent"][level - 1]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clinical Reasoning */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-400" />
                Clinical Reasoning
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {result.clinicalReasoning}
              </p>
            </div>

            {/* Key Concerns & Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Key Concerns */}
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Key Concerns
                </h3>
                <ul className="space-y-2">
                  {result.keyConcerns.map((concern, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-amber-400 mt-0.5 shrink-0">▸</span>
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Actions */}
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Recommended Actions
                </h3>
                <ol className="space-y-2">
                  {result.recommendedActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-green-400 font-bold shrink-0 w-5 text-right">
                        {i + 1}.
                      </span>
                      {action}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Footer disclaimer */}
            <p className="text-xs text-slate-600 text-center py-2">
              AI-generated triage assessment • Always defer to qualified medical professionals • Not for clinical use
            </p>

            {/* Debug Panel */}
            {result._debug && (
              <details className="rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
                <summary className="px-4 py-3 text-xs font-mono text-slate-500 cursor-pointer hover:text-slate-400 select-none flex items-center gap-2">
                  <span className="text-green-500">●</span>
                  Debug Info — Request {result._debug.requestId} · {result._debug.durationMs}ms · {result._debug.inputTokens + result._debug.outputTokens} tokens
                </summary>
                <div className="border-t border-slate-700 p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "Request ID", value: result._debug.requestId },
                      { label: "Duration", value: `${result._debug.durationMs}ms` },
                      { label: "Input Tokens", value: result._debug.inputTokens.toLocaleString() },
                      { label: "Output Tokens", value: result._debug.outputTokens.toLocaleString() },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-slate-800 rounded-lg p-3">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</div>
                        <div className="text-sm font-mono text-slate-200">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Full API Response (JSON)</div>
                    <pre className="text-xs font-mono text-green-400 bg-slate-950 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-all">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
