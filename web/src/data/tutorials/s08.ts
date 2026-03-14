import type { TutorialSession } from "./types";

const tutorial: TutorialSession = {
  session: "s08",
  title: "教學 s08 / Tutorial s08",
  titleEn: "Tutorial s08",
  steps: [
    {
      id: "intro",
      title: "開始學習 s08",
      titleEn: "Start Learning s08",
      content: `## s08 教學內容

本 Session 的教學內容正在準備中。請參閱對應的文件和程式碼範例。

The tutorial content for this session is being prepared. Please refer to the corresponding documentation and code examples.`,
      concept: {
        title: "s08 核心概念",
        titleEn: "s08 Core Concepts",
        body: "參閱 s08 的設計文件了解更多細節。Refer to the s08 design document for more details.",
      },
    },
  ],
};

export default tutorial;
