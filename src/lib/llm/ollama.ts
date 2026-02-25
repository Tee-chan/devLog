export async function summarizeCommits(
  messages: { sha: string; message: string }[],
  settings?: { llmBaseUrl?: string | null; llmModel?: string | null }
) {
  if (!messages.length) return "";

  const host = settings?.llmBaseUrl || process.env.OLLAMA_HOST || "http://localhost:11434";
  const model = settings?.llmModel || process.env.OLLAMA_MODEL || "llama3.2";

  const prompt = [
    "We help developers prepare for a daily standup.",
    "Summarize the following git commits into 3–6 short, readable bullet points.",
    "Focus on user-visible changes, refactors, and fixes. Combine related commits.",
    "",
    "Commits:",
    ...messages.map((m) => `- [${m.sha.slice(0, 7)}] ${m.message}`),
  ].join("\n");

  try {
    const res = await fetch(`${host}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: false,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Ollama error (${res.status} ${res.statusText}): ${text}`
      );
    }

    const data = (await res.json()) as {
      message?: { content?: string };
    };

    return data.message?.content?.trim() ?? "";
  } catch (err) {
    console.error("Failed to summarize commits with Ollama:", err);
    return "";
  }
}

