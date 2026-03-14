import type { TutorialSession } from "./types";

const tutorial: TutorialSession = {
  session: "s01",
  title: "代理迴圈 / The Agent Loop",
  titleEn: "The Agent Loop",
  steps: [
    {
      id: "intro",
      title: "什麼是 Agent Loop？",
      titleEn: "What is the Agent Loop?",
      content: `## 什麼是 Agent Loop？ / What is an Agent Loop?

> **格言**：「神奇不在模型，神奇在迴圈。」 / "The magic isn't in the model, it's in the loop."

想像一台奇特的自動售貨機：

1. 你說出你想要什麼（使用者輸入）
2. 售貨機思考一下，決定按下某個按鈕（LLM 呼叫）
3. 按鈕動作執行（工具執行）
4. 結果出現，售貨機再思考（結果回傳）
5. 不需要繼續了，直接告訴你結果（\`end_turn\`）

這個「思考 → 行動 → 看結果 → 再思考」的循環，就是 AI Agent 的核心秘密。`,
      concept: {
        title: "核心迴圈概念",
        titleEn: "The Core Loop",
        body: "所有 AI Coding Agent 共享同一個循環：呼叫模型 → 執行工具 → 結果回傳 → 重複。All AI coding agents share the same loop: call model → execute tool → feed results back → repeat.",
        links: [
          { label: "Anthropic API 文件", href: "https://docs.anthropic.com/en/docs/agents" },
        ],
      },
    },
    {
      id: "stop-reason",
      title: "stop_reason：迴圈的開關",
      titleEn: "stop_reason: The Loop Switch",
      content: `## \`stop_reason\`：迴圈的開關 / The Loop Switch

LLM 每次回應都帶有一個 \`stop_reason\`：

- **\`tool_use\`**：「我還沒完成，我需要用工具」
- **\`end_turn\`**：「我完成了，可以顯示結果了」

迴圈的唯一退出條件就是 \`stop_reason != "tool_use"\`。

這個設計讓 LLM **自己決定**何時完成任務，而不是靠人工設定的步數上限。`,
      code: `while True:
    response = client.messages.create(
        model="claude-opus-4-5",
        tools=TOOLS,
        messages=messages
    )
    messages.append({"role": "assistant", "content": response.content})

    # 唯一的退出條件 / The only exit condition
    if response.stop_reason != "tool_use":
        return  # LLM 完成任務 / Task complete

    # 繼續執行工具... / Continue executing tools...`,
      codeLanguage: "python",
      codeHighlightLines: [8, 9],
      concept: {
        title: "stop_reason 的兩個值",
        titleEn: "Two Values of stop_reason",
        body: "tool_use = 繼續迴圈；end_turn = 退出迴圈。這是整個 Agent 架構中最關鍵的控制流程。tool_use = continue loop; end_turn = exit loop. This is the most critical control flow in the entire agent architecture.",
      },
    },
    {
      id: "messages-state",
      title: "messages：唯一的狀態",
      titleEn: "messages: The Only State",
      content: `## \`messages\`：Agent 的全部記憶 / The Agent's Complete Memory

對話歷史（\`messages\` 列表）是 Agent 的全部「記憶」。

每次工具執行後，結果以 \`tool_result\` 的形式追加到 \`messages\`：

\`\`\`
messages = [
  { role: "user",      content: "幫我執行測試" },
  { role: "assistant", content: [tool_use: bash "pytest"] },
  { role: "user",      content: [tool_result: "所有測試通過"] },  ← 工具結果
  { role: "assistant", content: "測試全部通過！" }
]
\`\`\`

**為什麼工具結果要用 \`user\` 角色？** 這是 Anthropic API 的規範，語意上表示「環境回傳給模型的資訊」。`,
      concept: {
        title: "messages 是唯一狀態",
        titleEn: "messages is the Only State",
        body: "沒有資料庫，沒有全域變數，只有 messages 列表。Agent 的所有知識和歷史都在這裡。No database, no global variables, only the messages list. All agent knowledge and history lives here.",
      },
    },
    {
      id: "run-bash",
      title: "run_bash()：安全的工具執行",
      titleEn: "run_bash(): Safe Tool Execution",
      content: `## \`run_bash()\`：最簡單的安全設計 / Minimal Safety Design

工具函式展示了三層安全設計：

1. **黑名單攔截** — 禁止危險指令如 \`rm -rf /\`、\`sudo\`
2. **輸出截斷** — \`out[:50000]\` 防止超大輸出淹沒上下文
3. **超時保護** — \`timeout=120\` 防止無限等待

這是「工具函式應該有邊界，不是裸露的 shell 執行」的具體實現。`,
      code: `BLOCKED = ["rm -rf /", "sudo", ":(){:|:&};:"]

def run_bash(command: str) -> str:
    # 1. 黑名單攔截 / Blocklist check
    for bad in BLOCKED:
        if bad in command:
            return f"Blocked: {bad}"

    # 2. 執行並超時保護 / Execute with timeout
    result = subprocess.run(
        command, shell=True, capture_output=True,
        text=True, timeout=120
    )
    out = result.stdout + result.stderr

    # 3. 輸出截斷 / Output truncation
    return out[:50000] if out else "(no output)"`,
      codeLanguage: "python",
      codeHighlightLines: [3, 4, 5, 10, 14, 15],
      concept: {
        title: "三層安全設計",
        titleEn: "Three Safety Layers",
        body: "黑名單 + 超時 + 截斷。這三層設計防止了最常見的工具濫用情況。Blocklist + timeout + truncation. These three layers prevent the most common tool abuse scenarios.",
      },
    },
    {
      id: "full-loop",
      title: "完整 Agent Loop",
      titleEn: "The Complete Agent Loop",
      content: `## 完整的 Agent Loop / The Complete Agent Loop

現在把所有部分組合起來：

1. 使用者輸入加入 \`messages\`
2. 呼叫 LLM（\`client.messages.create\`）
3. 記錄 LLM 回應到 \`messages\`
4. 若 \`stop_reason == "tool_use"\`：執行工具，追加結果，回到步驟 2
5. 若 \`stop_reason == "end_turn"\`：結束，回傳最終訊息

整個核心不到 **20 行程式碼**。後面 11 個 Session 全部都是在這個基礎上疊加，迴圈本身幾乎不會改變。`,
      code: `def agent_loop(user_message: str) -> str:
    messages = [{"role": "user", "content": user_message}]

    while True:
        # 步驟 2：呼叫 LLM
        response = client.messages.create(
            model="claude-opus-4-5", max_tokens=8096,
            system=SYSTEM_PROMPT, tools=TOOLS, messages=messages
        )
        # 步驟 3：記錄回應
        messages.append({"role": "assistant", "content": response.content})

        # 步驟 4/5：判斷退出
        if response.stop_reason != "tool_use":
            return next(b.text for b in response.content if hasattr(b, "text"))

        # 步驟 4：執行工具，追加結果
        results = []
        for block in response.content:
            if block.type == "tool_use":
                output = run_bash(block.input["command"])
                results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": output,
                })
        messages.append({"role": "user", "content": results})`,
      codeLanguage: "python",
      codeHighlightLines: [4, 5, 6, 13, 14, 17, 18, 19, 20],
      concept: {
        title: "這就是全部了",
        titleEn: "That's All There Is",
        body: "s01 結束後，你手中已有一個功能完整的 AI Coding Agent。後面 11 個 Session 都是在這個基礎上疊加機制。After s01, you have a fully functional AI coding agent. The next 11 sessions add mechanisms on top of this foundation.",
        links: [
          { label: "查看 s01 源碼", href: "https://github.com/shareAI-lab/learn-claude-code" },
        ],
      },
    },
  ],
};

export default tutorial;
