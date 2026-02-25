export async function summarizeWithOpenAI(
    messages: { sha: string; message: string }[],
    options: {
        apiKey: string;
        baseUrl?: string;
        model?: string;
    }
) {
    if (!messages.length) return "";
    if (!options.apiKey) throw new Error("API key is missing");

    const endpoint = options.baseUrl && options.baseUrl.trim() !== ""
        ? options.baseUrl.replace(/\/$/, "") + "/chat/completions"
        : "https://api.openai.com/v1/chat/completions";

    const model = options.model && options.model.trim() !== "" ? options.model : "gpt-4o-mini";

    const prompt = [
        "We help developers prepare for a daily standup.",
        "Summarize the following git commits into 3–6 short, readable bullet points.",
        "Focus on user-visible changes, refactors, and fixes. Combine related commits.",
        "",
        "Commits:",
        ...messages.map((m) => `- [${m.sha.slice(0, 7)}] ${m.message}`),
    ].join("\n");

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${options.apiKey}`,
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: prompt }],
            }),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Cloud LLM error (${res.status}): ${text}`);
        }

        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() ?? "";
    } catch (err) {
        console.error("Failed to summarize commits with Cloud Provider:", err);
        return "";
    }
}
