import type { TutorialSession } from "./types";

const tutorial: TutorialSession = {
  session: "s05",
  title: "教學 s05 / Tutorial s05",
  titleEn: "Tutorial s05",
  steps: [
    {
      id: "intro",
      title: "開始學習 s05",
      titleEn: "Start Learning s05",
      content: `## s05 教學內容

本 Session 的教學內容正在準備中。請參閱對應的文件和程式碼範例。

The tutorial content for this session is being prepared. Please refer to the corresponding documentation and code examples.`,
      concept: {
        title: "s05 核心概念",
        titleEn: "s05 Core Concepts",
        body: "參閱 s05 的設計文件了解更多細節。Refer to the s05 design document for more details.",
      },
    },
  ],
};

export default tutorial;
