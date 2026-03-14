import type { TutorialSession } from "./types";

const tutorial: TutorialSession = {
  session: "s11",
  title: "教學 s11 / Tutorial s11",
  titleEn: "Tutorial s11",
  steps: [
    {
      id: "intro",
      title: "開始學習 s11",
      titleEn: "Start Learning s11",
      content: `## s11 教學內容

本 Session 的教學內容正在準備中。請參閱對應的文件和程式碼範例。

The tutorial content for this session is being prepared. Please refer to the corresponding documentation and code examples.`,
      concept: {
        title: "s11 核心概念",
        titleEn: "s11 Core Concepts",
        body: "參閱 s11 的設計文件了解更多細節。Refer to the s11 design document for more details.",
      },
    },
  ],
};

export default tutorial;
