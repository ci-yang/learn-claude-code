// 各 Session 之間的 diff 重點摘要
// Summary of key differences between sessions

export interface SessionDiff {
  session: string;        // 當前 session
  prevSession: string | null;  // 前一個 session
  title: string;
  titleEn: string;
  layer: "tools" | "planning" | "memory" | "concurrency" | "collaboration";
  locDelta: number;        // 程式碼行數差異
  newTools: string[];      // 新增工具
  newClasses: string[];    // 新增類別
  newFunctions: string[];  // 新增函式
  keyChange: string;       // 核心變更摘要
  keyChangeEn: string;
  codeSnippet?: {          // 代表性程式碼片段
    before?: string;
    after: string;
    language: string;
    description: string;
    descriptionEn: string;
  };
}

export const SESSION_DIFFS: SessionDiff[] = [
  {
    session: "s01",
    prevSession: null,
    title: "代理迴圈",
    titleEn: "The Agent Loop",
    layer: "tools",
    locDelta: 84,
    newTools: ["bash"],
    newClasses: [],
    newFunctions: ["run_bash", "agent_loop"],
    keyChange: "建立最小可行 Agent：while 迴圈 + bash 工具 + stop_reason 判斷",
    keyChangeEn: "Minimal viable agent: while loop + bash tool + stop_reason check",
    codeSnippet: {
      after: `while True:
    response = client.messages.create(tools=TOOLS, messages=messages)
    messages.append({"role": "assistant", "content": response.content})
    if response.stop_reason != "tool_use":
        return  # 完成
    results = execute_tools(response)
    messages.append({"role": "user", "content": results})`,
      language: "python",
      description: "核心 Agent Loop — 約 20 行完成全部邏輯",
      descriptionEn: "Core Agent Loop — complete logic in ~20 lines",
    },
  },
  {
    session: "s02",
    prevSession: "s01",
    title: "工具擴展",
    titleEn: "Tools",
    layer: "tools",
    locDelta: 68,
    newTools: ["read_file", "write_file", "list_dir"],
    newClasses: [],
    newFunctions: ["run_read_file", "run_write_file", "run_list_dir", "safe_path"],
    keyChange: "加入 Dispatch Map 取代 if/elif 鏈；新增路徑安全檢查",
    keyChangeEn: "Replace if/elif chain with Dispatch Map; add path safety check",
    codeSnippet: {
      before: `if block.name == "bash":
    result = run_bash(**block.input)
elif block.name == "read_file":
    result = run_read(**block.input)
# 每次新增工具都要改這裡`,
      after: `TOOL_HANDLERS = {
    "bash":       lambda **kw: run_bash(**kw),
    "read_file":  lambda **kw: run_read(**kw),
    "write_file": lambda **kw: run_write(**kw),
}
handler = TOOL_HANDLERS.get(block.name)
result = handler(**block.input) if handler else "Unknown"`,
      language: "python",
      description: "Dispatch Map — 新增工具只需加字典一行",
      descriptionEn: "Dispatch Map — add one dict entry per new tool",
    },
  },
  {
    session: "s03",
    prevSession: "s02",
    title: "TodoWrite",
    titleEn: "TodoWrite",
    layer: "planning",
    locDelta: 56,
    newTools: ["todo_write", "todo_read"],
    newClasses: ["TodoManager"],
    newFunctions: ["todo_write", "todo_read", "get_nag_reminder"],
    keyChange: "加入 TodoManager 讓 Agent 在執行前先建立計畫；nag reminder 強制規劃",
    keyChangeEn: "Add TodoManager: agent plans before acting; nag reminder enforces planning",
    codeSnippet: {
      after: `class TodoManager:
    def write(self, todos: list[dict]) -> str:
        self._todos = todos
        return f"Saved {len(todos)} todos"

    def get_nag_reminder(self) -> str:
        pending = [t for t in self._todos if t["status"] == "pending"]
        if pending:
            return f"\\n⚠️ Reminder: {len(pending)} pending todos"
        return ""`,
      language: "python",
      description: "TodoManager — Agent 的外顯計畫系統",
      descriptionEn: "TodoManager — agent's explicit planning system",
    },
  },
  {
    session: "s04",
    prevSession: "s03",
    title: "子代理",
    titleEn: "Subagents",
    layer: "planning",
    locDelta: 74,
    newTools: ["task"],
    newClasses: [],
    newFunctions: ["run_subagent", "spawn_agent"],
    keyChange: "加入子代理機制：獨立 messages[] 隔離上下文，防止污染主對話",
    keyChangeEn: "Add subagent mechanism: isolated messages[] prevents main context pollution",
    codeSnippet: {
      after: `def spawn_subagent(task: str, tools: list) -> str:
    """獨立的 messages 上下文 / Isolated messages context"""
    sub_messages = [{"role": "user", "content": task}]
    for _ in range(30):  # 子代理有步數上限
        response = client.messages.create(
            tools=tools, messages=sub_messages
        )
        if response.stop_reason != "tool_use":
            return extract_text(response)
        sub_messages = update_messages(sub_messages, response)`,
      language: "python",
      description: "子代理 — 獨立 messages 防止上下文污染",
      descriptionEn: "Subagent — isolated messages prevents context pollution",
    },
  },
  {
    session: "s05",
    prevSession: "s04",
    title: "技能按需載入",
    titleEn: "Skills",
    layer: "planning",
    locDelta: 62,
    newTools: ["load_skill"],
    newClasses: ["SkillLoader"],
    newFunctions: ["load_skill", "inject_skill_result"],
    keyChange: "SkillLoader 按需注入知識：用 tool_result 注入而非 system prompt，避免預先填充",
    keyChangeEn: "SkillLoader injects knowledge on demand via tool_result, not system prompt",
    codeSnippet: {
      after: `class SkillLoader:
    def load(self, skill_name: str) -> str:
        """透過 tool_result 注入，而非塞進 system prompt"""
        skill_file = SKILLS_DIR / f"{skill_name}.md"
        if not skill_file.exists():
            return f"Skill '{skill_name}' not found"
        content = skill_file.read_text()
        return f"[Skill Loaded: {skill_name}]\\n{content}"`,
      language: "python",
      description: "SkillLoader — 按需注入知識，不預先污染 system prompt",
      descriptionEn: "SkillLoader — inject knowledge on demand, don't pollute system prompt upfront",
    },
  },
  {
    session: "s06",
    prevSession: "s05",
    title: "上下文壓縮",
    titleEn: "Compact",
    layer: "memory",
    locDelta: 88,
    newTools: ["compact_context"],
    newClasses: ["ContextCompactor"],
    newFunctions: ["micro_compact", "auto_compact", "archive_messages"],
    keyChange: "三層壓縮策略：micro-compact（即時）+ auto-compact（閾值）+ archival（歸檔）",
    keyChangeEn: "Three-layer compression: micro-compact (immediate) + auto-compact (threshold) + archival",
    codeSnippet: {
      after: `class ContextCompactor:
    MICRO_THRESHOLD = 10    # 超過 10 條訊息觸發 micro
    AUTO_THRESHOLD = 0.7    # context 用了 70% 觸發 auto

    def check_and_compact(self, messages, token_usage):
        if token_usage / MAX_TOKENS > self.AUTO_THRESHOLD:
            return self.auto_compact(messages)
        if len(messages) > self.MICRO_THRESHOLD:
            return self.micro_compact(messages)
        return messages`,
      language: "python",
      description: "三層壓縮 — 讓 Agent 能無限工作不失去連貫性",
      descriptionEn: "Three-layer compression — enables infinite sessions without losing coherence",
    },
  },
  {
    session: "s07",
    prevSession: "s06",
    title: "任務系統",
    titleEn: "Tasks",
    layer: "planning",
    locDelta: 112,
    newTools: ["task_create", "task_update", "task_list", "task_next"],
    newClasses: ["TaskManager", "Task"],
    newFunctions: ["create_task", "update_status", "get_next_tasks", "resolve_deps"],
    keyChange: "基於檔案的任務圖：支援依賴關係、優先級、並行執行",
    keyChangeEn: "File-based task graph: supports dependencies, priority, parallel execution",
    codeSnippet: {
      after: `@dataclass
class Task:
    id: str
    title: str
    status: Literal["pending", "in_progress", "done", "failed"]
    deps: list[str] = field(default_factory=list)
    priority: int = 0

class TaskManager:
    def get_next_tasks(self) -> list[Task]:
        """回傳所有依賴已完成的待辦任務"""
        return [t for t in self.tasks.values()
                if t.status == "pending"
                and all(self.tasks[d].status == "done" for d in t.deps)]`,
      language: "python",
      description: "TaskManager — 依賴感知的任務調度",
      descriptionEn: "TaskManager — dependency-aware task scheduling",
    },
  },
  {
    session: "s08",
    prevSession: "s07",
    title: "後台任務",
    titleEn: "Background Tasks",
    layer: "concurrency",
    locDelta: 96,
    newTools: ["bg_run", "bg_status", "bg_result"],
    newClasses: ["BackgroundManager", "BackgroundTask"],
    newFunctions: ["start_background_task", "check_notifications", "poll_result"],
    keyChange: "BackgroundManager + 通知佇列：Agent 可在等待慢速操作時繼續處理其他事",
    keyChangeEn: "BackgroundManager + notification queue: agent keeps working while waiting for slow ops",
    codeSnippet: {
      after: `class BackgroundManager:
    def run(self, command: str, task_id: str) -> str:
        """非阻塞執行 / Non-blocking execution"""
        thread = threading.Thread(
            target=self._worker,
            args=(command, task_id)
        )
        thread.daemon = True
        thread.start()
        return f"Background task {task_id} started"

    def get_notifications(self) -> list[dict]:
        """取出所有待處理通知 / Get pending notifications"""
        notifs = []
        while not self._queue.empty():
            notifs.append(self._queue.get_nowait())
        return notifs`,
      language: "python",
      description: "BackgroundManager — 非阻塞執行，Agent 繼續思考",
      descriptionEn: "BackgroundManager — non-blocking execution, agent keeps thinking",
    },
  },
  {
    session: "s09",
    prevSession: "s08",
    title: "Agent 團隊",
    titleEn: "Agent Teams",
    layer: "collaboration",
    locDelta: 104,
    newTools: ["send_message", "check_mailbox", "list_teammates"],
    newClasses: ["TeammateManager", "Mailbox"],
    newFunctions: ["spawn_teammate", "send_to_teammate", "read_mailbox"],
    keyChange: "TeammateManager + 檔案型信箱：主 Agent 可委派任務給持久性隊友",
    keyChangeEn: "TeammateManager + file-based mailbox: lead agent delegates to persistent teammates",
    codeSnippet: {
      after: `class Mailbox:
    """基於檔案系統的非同步訊息佇列"""
    def send(self, to: str, message: dict) -> None:
        msg_file = self.inbox_dir / to / f"{uuid4()}.json"
        msg_file.write_text(json.dumps(message))

    def read(self, agent_id: str) -> list[dict]:
        inbox = self.inbox_dir / agent_id
        messages = []
        for f in sorted(inbox.glob("*.json")):
            messages.append(json.loads(f.read_text()))
            f.unlink()  # 讀後即刪
        return messages`,
      language: "python",
      description: "Mailbox — 基於檔案的非同步訊息傳遞",
      descriptionEn: "Mailbox — file-based async message passing",
    },
  },
  {
    session: "s10",
    prevSession: "s09",
    title: "團隊協議",
    titleEn: "Team Protocols",
    layer: "collaboration",
    locDelta: 78,
    newTools: ["request", "respond"],
    newClasses: ["ProtocolHandler"],
    newFunctions: ["send_request", "handle_response", "correlate_request"],
    keyChange: "request_id 關聯：標準化請求/回應協議，讓多 Agent 溝通有序",
    keyChangeEn: "request_id correlation: standardized request/response protocol for ordered multi-agent comms",
    codeSnippet: {
      after: `def send_request(self, to: str, action: str, payload: dict) -> str:
    request_id = str(uuid4())
    message = {
        "type": "request",
        "request_id": request_id,  # 用於關聯回應
        "from": self.agent_id,
        "action": action,
        "payload": payload,
    }
    self.mailbox.send(to, message)
    return request_id

def handle_response(self, response: dict) -> None:
    rid = response["request_id"]
    # 將回應關聯回原始請求
    self._pending[rid].set_result(response["payload"])`,
      language: "python",
      description: "request_id 關聯 — 讓所有團隊協商有序進行",
      descriptionEn: "request_id correlation — ordered negotiation for all team communication",
    },
  },
  {
    session: "s11",
    prevSession: "s10",
    title: "自主代理",
    titleEn: "Autonomous Agents",
    layer: "collaboration",
    locDelta: 86,
    newTools: ["scan_board", "claim_task", "release_task"],
    newClasses: ["AutonomousAgent"],
    newFunctions: ["scan_task_board", "claim_task", "self_assign"],
    keyChange: "隊友掃描任務板自動認領：無需主 Agent 逐一分配任務",
    keyChangeEn: "Teammates scan and self-claim tasks: no need for lead agent to assign each one",
    codeSnippet: {
      after: `class AutonomousAgent:
    def run(self):
        while True:
            # 掃描任務板，自動認領可做的任務
            available = self.task_board.scan(status="pending")
            for task in available:
                if self.can_handle(task):
                    if self.task_board.claim(task.id, self.agent_id):
                        self.execute(task)
                        break
            else:
                # 沒有可做的任務，等待新任務
                time.sleep(POLL_INTERVAL)`,
      language: "python",
      description: "自主代理 — 掃描任務板、自主認領、無需指派",
      descriptionEn: "Autonomous agent — scan board, self-claim, no assignment needed",
    },
  },
  {
    session: "s12",
    prevSession: "s11",
    title: "Worktree 任務隔離",
    titleEn: "Worktree + Task Isolation",
    layer: "collaboration",
    locDelta: 94,
    newTools: ["wt_create", "wt_exec", "wt_cleanup"],
    newClasses: ["WorktreeManager", "WorktreeTask"],
    newFunctions: ["create_worktree", "exec_in_worktree", "cleanup_worktree"],
    keyChange: "每個任務在獨立目錄（git worktree）中執行；任務 ID 繫結 worktree 生命週期",
    keyChangeEn: "Each task executes in its own directory (git worktree); task ID binds worktree lifecycle",
    codeSnippet: {
      after: `class WorktreeManager:
    def create(self, task_id: str, branch: str) -> Path:
        """為每個任務建立獨立工作目錄"""
        wt_path = self.base_dir / f"wt-{task_id}"
        subprocess.run([
            "git", "worktree", "add",
            str(wt_path), branch
        ], check=True)
        self._registry[task_id] = wt_path
        return wt_path

    def cleanup(self, task_id: str) -> None:
        """任務完成後清理 worktree"""
        wt_path = self._registry.pop(task_id, None)
        if wt_path:
            subprocess.run(["git", "worktree", "remove", str(wt_path)])`,
      language: "python",
      description: "WorktreeManager — 目錄隔離讓多任務並行安全",
      descriptionEn: "WorktreeManager — directory isolation enables safe parallel task execution",
    },
  },
];
