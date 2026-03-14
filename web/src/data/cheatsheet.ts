export interface CheatSheetCard {
  id: string;
  pattern: string;
  summary: string;
  session: string;
  layer: "tools" | "planning" | "memory" | "concurrency" | "collaboration";
  code: string;
  tags: string[];
}

export const CHEATSHEET_CARDS: CheatSheetCard[] = [
  {
    id: "agent-loop",
    pattern: "Agent Loop",
    summary: "最小 Agent 核心：while 迴圈 + 工具呼叫 + stop_reason 判斷",
    session: "s01",
    layer: "tools",
    tags: ["核心", "迴圈", "LLM"],
    code: `while True:
    response = client.messages.create(
        tools=TOOLS, messages=messages
    )
    messages.append(response)
    if response.stop_reason != "tool_use":
        return  # LLM 完成任務
    results = execute_tools(response)
    messages.append(results)`,
  },
  {
    id: "dispatch-map",
    pattern: "Dispatch Map",
    summary: "用字典替代 if/elif 鏈，讓新增工具無需修改主迴圈",
    session: "s02",
    layer: "tools",
    tags: ["工具", "路由", "開放封閉"],
    code: `TOOL_HANDLERS = {
    "bash": lambda **kw: run_bash(**kw),
    "read_file": lambda **kw: run_read(**kw),
    "write_file": lambda **kw: run_write(**kw),
}

# 新增工具只需加一行字典
handler = TOOL_HANDLERS.get(block.name)
if handler:
    result = handler(**block.input)`,
  },
  {
    id: "safe-path",
    pattern: "Safe Path",
    summary: "防止路徑穿越攻擊：解析後確認仍在 WORKDIR 範圍內",
    session: "s02",
    layer: "tools",
    tags: ["安全", "路徑", "工具"],
    code: `WORKDIR = Path("/tmp/sandbox")

def safe_path(p: str) -> Path:
    resolved = (WORKDIR / p).resolve()
    if not resolved.is_relative_to(WORKDIR):
        raise PermissionError(f"Path outside workdir: {p}")
    return resolved`,
  },
  {
    id: "todo-manager",
    pattern: "TodoWrite + Nag Reminder",
    summary: "結構化進度追蹤 + 連續 3 輪未更新自動提醒",
    session: "s03",
    layer: "planning",
    tags: ["計劃", "進度", "提醒"],
    code: `# 單一 in_progress 限制 + Nag Reminder
if rounds_since_todo >= 3:
    results.insert(0, {
        "type": "tool_result",
        "content": f"[Reminder] {todo.render()}",
    })

# TodoManager 狀態
# [ ] pending  [>] in_progress  [x] completed`,
  },
  {
    id: "subagent",
    pattern: "Subagent Pattern",
    summary: "子代理從全新 messages=[] 開始，只回傳摘要保持主上下文清潔",
    session: "s04",
    layer: "planning",
    tags: ["子代理", "上下文隔離", "委派"],
    code: `def run_subagent(prompt: str) -> str:
    # 全新上下文，不繼承父代理歷史
    sub_messages = [{"role": "user", "content": prompt}]

    for _ in range(30):  # 安全閥：最多 30 步
        response = client.messages.create(
            tools=SUB_TOOLS,  # 不含 task 工具
            messages=sub_messages,
        )
        if response.stop_reason != "tool_use":
            break
    return get_last_text(sub_messages)  # 只回傳摘要`,
  },
  {
    id: "skill-loading",
    pattern: "Two-Layer Skill Loading",
    summary: "Layer 1（目錄）永遠在 system prompt；Layer 2（內容）按需載入",
    session: "s05",
    layer: "planning",
    tags: ["技能", "知識", "按需載入"],
    code: `# Layer 1: 系統提示中的技能目錄（永遠存在）
SYSTEM = f"""可用技能：
{skill_loader.get_descriptions()}
"""

# Layer 2: load_skill 工具按需注入完整內容
def load_skill(name: str) -> str:
    return skill_loader.get_content(name)
    # 回傳 <skill name="...">...</skill>`,
  },
  {
    id: "context-compact",
    pattern: "Three-Layer Context Compression",
    summary: "無損（micro）→ 有損（auto）→ 歸檔（archival）三層壓縮管道",
    session: "s06",
    layer: "memory",
    tags: ["上下文", "壓縮", "記憶體"],
    code: `# micro_compact: 無損，替換舊工具結果為佔位符
def micro_compact(messages, keep_recent=3):
    for msg in messages[:-keep_recent]:
        replace_tool_results_with_placeholder(msg)

# auto_compact: 有損，LLM 生成摘要
def auto_compact(messages):
    archive(messages)  # 先存檔
    summary = llm_summarize(messages)
    messages[:] = [summary]  # 就地替換`,
  },
  {
    id: "task-graph",
    pattern: "File-Based Task Graph",
    summary: "每個任務一個 JSON 檔案，依賴圖存在磁碟，不受 context 壓縮影響",
    session: "s07",
    layer: "planning",
    tags: ["任務", "依賴圖", "持久化"],
    code: `# task_001.json
{
  "id": "001",
  "status": "pending",    # pending | in_progress | completed
  "blockedBy": ["002"],   # 依賴的任務 ID
  "blocks": []
}

# 完成任務時自動清除依賴
def _clear_dependency(task_id: str):
    for task in all_tasks():
        task["blockedBy"].remove(task_id)`,
  },
  {
    id: "background-tasks",
    pattern: "Drain Pattern",
    summary: "每次 LLM 呼叫前排空通知佇列，一次性注入所有背景任務狀態",
    session: "s08",
    layer: "concurrency",
    tags: ["背景任務", "執行緒", "通知"],
    code: `# daemon=True: 主程式退出時自動終止
t = threading.Thread(target=slow_task, daemon=True)
t.start()

# Drain Pattern: LLM 呼叫前批量注入通知
while True:
    notifications = bg_manager.drain_notifications()
    if notifications:
        messages.extend(notifications)
    response = client.messages.create(...)`,
  },
  {
    id: "jsonl-mailbox",
    pattern: "JSONL Mailbox",
    summary: "append-only 收件匣 + drain 讀取後清空，持久且多代理安全",
    session: "s09",
    layer: "collaboration",
    tags: ["通訊", "JSONL", "持久化"],
    code: `# 傳送：追加寫入（多代理安全）
with open(f"{to}.jsonl", "a") as f:
    f.write(json.dumps(msg) + "\\n")

# 接收：Drain 模式（讀取後清空）
def drain(name: str) -> list[dict]:
    msgs = [json.loads(l) for l in open(f"{name}.jsonl")]
    open(f"{name}.jsonl", "w").close()  # 清空
    return msgs`,
  },
  {
    id: "request-id",
    pattern: "Request ID Correlation",
    summary: "每個請求攜帶唯一 ID，回應對應相同 ID，確保多代理並發通訊正確配對",
    session: "s10",
    layer: "collaboration",
    tags: ["協議", "請求回應", "並發"],
    code: `# 發送請求時生成唯一 ID
req_id = str(uuid4())
tracker[req_id] = {"status": "pending", "target": agent}
bus.send("lead", agent, {
    "type": "shutdown_request",
    "request_id": req_id,
})

# 回應必須攜帶原始 request_id
# tracker[req_id]["status"] = "approved"`,
  },
  {
    id: "atomic-claim",
    pattern: "Atomic Task Claim",
    summary: "讀取-檢查-寫入三步用鎖保護，防止多代理同時認領同一任務",
    session: "s11",
    layer: "collaboration",
    tags: ["原子操作", "鎖", "並發安全"],
    code: `_claim_lock = threading.Lock()

def claim_task(agent_id: str) -> str | None:
    with _claim_lock:
        # 三步原子操作（不可被打斷）
        task = find_pending_task()
        if task is None:
            return None
        task["status"] = "in_progress"
        task["owner"] = agent_id
        save_task(task)
        return task["id"]`,
  },
];
