# pi-local-models.ts — dynamic model discovery for pi coding agent
#
# What: pi reads ~/.pi/agent/models.json statically, so every model swap on a
# local llama.cpp / vLLM / Ollama server means hand-editing that file. This
# extension fetches /v1/models at pi startup and registers the live list, so
# pi always sees what the server actually serves. /localmodels re-fetches
# mid-session without restarting pi.
#
# Setup on a new machine (pi 1.x installed):
#   1. mkdir -p ~/.pi/agent/extensions
#   2. curl -o ~/.pi/agent/extensions/local-models.ts \
#        https://raw.githubusercontent.com/dineshr93/architectures/main/pi-local-models.ts
#   3. Edit ENDPOINTS below: one entry per local OpenAI-compatible server.
#      Keep `provider` ids matching any existing auth.json entries if you use
#      /login-stored keys; plain llama.cpp needs no auth (dummy key is fine).
#   4. Verify: pi --list-models   (your served models appear under the provider id)
#   5. Optional: drop the now-redundant "models" array for these providers from
#      ~/.pi/agent/models.json, and point settings.json "defaultModel" at a
#      model id the server actually serves.
#
# In an existing pi session: run /localmodels to re-fetch after swapping models.

const ENDPOINTS = [
  { provider: "llamacpp-local", baseUrl: "http://127.0.0.1:8888/v1" },
]

const THINKING_LEVEL_MAP = { off: null, minimal: "low", low: "low", medium: "medium", high: "high", xhigh: "xhigh" }

async function fetchModels(baseUrl) {
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/models`, {
    headers: { Authorization: "***" }, // llama.cpp ignores the key
    signal: AbortSignal.timeout(3000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return (data.data ?? []).map((m) => {
    const ctx = m.context_length ?? m.max_model_len ?? m.meta?.n_ctx ?? m.meta?.n_ctx_train ?? 131072
    return {
      id: m.id,
      name: m.id,
      reasoning: true,
      thinkingLevelMap: THINKING_LEVEL_MAP,
      input: ["text"], // ponytail: /v1/models has no vision flag; override per-id if a served model takes images
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: ctx,
      maxTokens: m.max_tokens_cap ?? Math.min(ctx, 8192),
    }
  })
}

export default async function (pi) {
  const sync = async () => {
    const results = await Promise.allSettled(ENDPOINTS.map(async ({ provider, baseUrl }) => {
      const models = await fetchModels(baseUrl)
      pi.registerProvider(provider, { name: provider, baseUrl, apiKey: "***", api: "openai-completions", models })
      return `${provider}: ${models.length} model(s)`
    }))
    return results.map((r, i) => r.status === "fulfilled" ? r.value : `${ENDPOINTS[i].provider}: fetch failed (${r.reason})`)
  }

  const summary = await sync()
  pi.on("session_start", async (_event, ctx) => {
    if (ctx.hasUI) ctx.ui.notify(`local-models: ${summary.join(", ")}`)
  })

  pi.registerCommand("localmodels", {
    description: "Re-fetch model lists from local /v1/models endpoints",
    handler: async (_args, ctx) => ctx.ui.notify(`local-models: ${(await sync()).join(", ")}`),
  })
}
