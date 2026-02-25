"use client";

import { useState, useEffect } from "react";
import { Save, Settings, Server, Key, Cpu } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    llmBaseUrl: "http://localhost:11434",
    llmModel: "llama3.2",
    llmApiKey: "",
    llmProvider: "ollama",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data && data.llmBaseUrl) {
            setFormData({
              llmBaseUrl: data.llmBaseUrl || "http://localhost:11434",
              llmModel: data.llmModel || "llama3.2",
              llmApiKey: data.llmApiKey || "",
              llmProvider: data.llmProvider || "ollama",
            });
          }
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage("Settings saved successfully.");
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage("Failed to save settings.");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f6feb]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-xl shadow-sm">
          <Settings className="w-6 h-6 text-[#8b949e]" />
        </div>
        <div>
          <h1 className="text-2xl font-mono font-bold text-[#e6edf3]">
            Configuration
          </h1>
          <p className="text-[#8b949e] text-sm mt-1">
            Manage your AI models and API connections.
          </p>
        </div>
      </header>

      <form onSubmit={handleSave} className="space-y-6">

        <section className="bg-[#161b22]/50 backdrop-blur-md border border-[#21262d] rounded-2xl p-6 shadow-lg">
          <label className="block text-sm font-medium text-[#c9d1d9] mb-3">
            Active Summarization Engine
          </label>
          <div className="flex bg-[#0d1117] p-1.5 rounded-xl border border-[#30363d]">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, llmProvider: "ollama" })}
              className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${formData.llmProvider === "ollama"
                ? "bg-[#1f6feb] text-white shadow-md"
                : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]"
                }`}
            >
              <Cpu className="w-4 h-4" />
              Local Ollama
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, llmProvider: "openai" })}
              className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${formData.llmProvider === "openai"
                ? "bg-[#2ea043] text-white shadow-md"
                : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]"
                }`}
            >
              <Key className="w-4 h-4" />
              OpenAI (Cloud)
            </button>
          </div>
        </section>

        <section className={`transition-all duration-300 ${formData.llmProvider !== 'ollama' ? 'hidden' : ''} bg-[#161b22]/50 backdrop-blur-md border border-[#21262d] rounded-2xl p-6 shadow-lg`}>
          <h2 className="text-lg font-mono font-semibold text-[#e6edf3] mb-6 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#8957e5]" />
            Local Ollama Integration
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#c9d1d9] mb-2 flex items-center gap-2">
                <Server className="w-4 h-4 text-[#8b949e]" />
                Ollama URL
              </label>
              <input
                type="text"
                value={formData.llmBaseUrl}
                onChange={(e) =>
                  setFormData({ ...formData, llmBaseUrl: e.target.value })
                }
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#1f6feb]/50 focus:border-[#1f6feb] transition-shadow placeholder-[#484f58] font-mono text-sm shadow-inner"
                placeholder="http://localhost:11434"
              />
              <p className="text-xs text-[#8b949e] mt-2 ml-1">
                The endpoint where your local Ollama instance is running.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#c9d1d9] mb-2 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#8b949e]" />
                Ollama Model
              </label>
              <input
                type="text"
                value={formData.llmModel}
                onChange={(e) =>
                  setFormData({ ...formData, llmModel: e.target.value })
                }
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#1f6feb]/50 focus:border-[#1f6feb] transition-shadow placeholder-[#484f58] font-mono text-sm shadow-inner"
                placeholder="llama3.2"
              />
              <p className="text-xs text-[#8b949e] mt-2 ml-1">
                Ensure this model is installed via `ollama run &lt;model&gt;`.
              </p>
            </div>
          </div>
        </section>

        <section className={`transition-all duration-300 ${formData.llmProvider !== 'openai' ? 'hidden' : ''} bg-[#161b22]/50 backdrop-blur-md border border-[#21262d] rounded-2xl p-6 shadow-lg`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-mono font-semibold text-[#e6edf3] flex items-center gap-2">
              <Key className="w-5 h-5 text-[#2ea043]" />
              OpenAI Compatible API
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#c9d1d9] mb-2">
                Provider Base URL
              </label>
              <input
                type="text"
                value={formData.llmBaseUrl}
                onChange={(e) =>
                  setFormData({ ...formData, llmBaseUrl: e.target.value })
                }
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2ea043]/50 focus:border-[#2ea043] transition-shadow placeholder-[#484f58] font-mono text-sm shadow-inner"
                placeholder="https://api.openai.com/v1"
              />
              <p className="text-xs text-[#8b949e] mt-2 ml-1">
                Base API endpoint. Ex: OpenAI, Groq, Together, DeepSeek, Anthropic.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#c9d1d9] mb-2">
                Model ID
              </label>
              <input
                type="text"
                value={formData.llmModel}
                onChange={(e) =>
                  setFormData({ ...formData, llmModel: e.target.value })
                }
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2ea043]/50 focus:border-[#2ea043] transition-shadow placeholder-[#484f58] font-mono text-sm shadow-inner"
                placeholder="gpt-4o-mini"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#c9d1d9] mb-2">
                Provider API Key
              </label>
              <input
                type="password"
                value={formData.llmApiKey}
                onChange={(e) =>
                  setFormData({ ...formData, llmApiKey: e.target.value })
                }
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2ea043]/50 focus:border-[#2ea043] transition-shadow placeholder-[#484f58] font-mono text-sm shadow-inner"
                placeholder="sk-..."
              />
              <p className="text-xs text-[#8b949e] mt-2 ml-1">
                Your API key is securely encrypted inside your local SQLite database.
              </p>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-4 pt-4">
          {message && (
            <p className="text-sm text-[#2ea043] font-medium animate-in fade-in run-in-from-right-4">
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
