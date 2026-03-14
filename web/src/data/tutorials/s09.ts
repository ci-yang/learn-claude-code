import type { TutorialSession } from "./types";

const tutorial: TutorialSession = {
  session: "s09",
  title: "教學 s09 / Tutorial s09",
  titleEn: "Tutorial s09",
  steps: [
    {
      id: "intro",
      title: "開始學習 s09",
      titleEn: "Start Learning s09",
      content: `## s09 教學內容

本 Session 的教學內容正在準備中。請參閱對應的文件和程式碼範例。

The tutorial content for this session is being prepared. Please refer to the corresponding documentation and code examples.`,
      concept: {
        title: "s09 核心概念",
        titleEn: "s09 Core Concepts",
        body: "參閱 s09 的設計文件了解更多細節。Refer to the s09 design document for more details.",
      },
    },
  ],
};

export default tutorial;
