import type { TutorialSession } from "./types";

const tutorial: TutorialSession = {
  session: "s02",
  title: "工具擴展 / Tools",
  titleEn: "Tools",
  steps: [
    {
      id: "intro",
      title: "從一個工具到多個工具",
      titleEn: "From One Tool to Many",
      content: `## 從一個工具到多個工具 / From One Tool to Many

s01 只有 \`bash\` 一個工具。s02 引入工具擴展的核心設計問題：

**如何新增工具，而不修改主迴圈？**

答案是 **Dispatch Map（分發映射）**：用一個字典把工具名稱對應到處理函式。

新增工具只需在字典裡加一行，主迴圈完全不變。這是「開放/封閉原則」的實踐。`,
      concept: {
        title: "開放/封閉原則",
        titleEn: "Open/Closed Principle",
        body: "對擴展開放，對修改封閉。新增工具時，不需要修改現有的任何程式碼。Open for extension, closed for modification. Adding new tools requires no changes to existing code.",
      },
    },
    {
      id: "dispatch-map",
      title: "Dispatch Map 設計",
      titleEn: "Dispatch Map Design",
      content: `## Dispatch Map：替代 if/elif 鏈 / Replacing if/elif Chains

傳統的 if/elif 鏈：每新增一個工具就要修改主迴圈。

Dispatch Map：工具名稱 → 處理函式的字典，主迴圈只需查字典。`,
      code: `# 舊做法：if/elif 鏈（每次新增工具都要改這裡）
# Old: if/elif chain (must modify for each new tool)
if block.name == "bash":
    result = run_bash(**block.input)
elif block.name == "read_file":
    result = run_read(**block.input)
# 新增工具就要在這裡加 elif...

# 新做法：Dispatch Map（新增工具只加字典一行）
# New: Dispatch Map (add one dict entry per new tool)
TOOL_HANDLERS: dict[str, Callable] = {
    "bash":       lambda **kw: run_bash(**kw),
    "read_file":  lambda **kw: run_read(**kw),
    "write_file": lambda **kw: run_write(**kw),
    "list_dir":   lambda **kw: run_list(**kw),
}

handler = TOOL_HANDLERS.get(block.name)
result = handler(**block.input) if handler else "Unknown tool"`,
      codeLanguage: "python",
      codeHighlightLines: [10, 11, 12, 13, 14],
      concept: {
        title: "字典作為路由表",
        titleEn: "Dictionary as Router",
        body: "字典查找是 O(1) 操作，比 if/elif 鏈更快，更容易擴展。Dictionary lookup is O(1), faster than if/elif chains, and far easier to extend.",
      },
    },
    {
      id: "safe-path",
      title: "Safe Path：路徑安全",
      titleEn: "Safe Path: Path Safety",
      content: `## Safe Path：防止路徑穿越攻擊 / Preventing Path Traversal

新增 \`read_file\` 和 \`write_file\` 工具後，需要防止 \`../../etc/passwd\` 這類路徑穿越攻擊。

解法：**解析後確認仍在 WORKDIR 範圍內**。`,
      code: `import os
from pathlib import Path

WORKDIR = Path("/workspace")

def safe_path(raw: str) -> Path:
    """解析路徑後確認仍在工作目錄內 / Resolve and verify within workdir"""
    resolved = (WORKDIR / raw).resolve()
    if not str(resolved).startswith(str(WORKDIR)):
        raise PermissionError(f"Path escape attempt: {raw}")
    return resolved`,
      codeLanguage: "python",
      codeHighlightLines: [8, 9],
      concept: {
        title: "路徑穿越攻擊",
        titleEn: "Path Traversal Attack",
        body: "攻擊者可用 ../../../ 跳出工作目錄。解法是先 resolve() 得到絕對路徑，再確認是否在允許範圍內。Attackers use ../../../ to escape the working directory. The fix: resolve() to absolute path, then verify it's within allowed bounds.",
      },
    },
  ],
};

export default tutorial;
