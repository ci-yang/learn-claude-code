import type { TutorialSession } from "./types";

const tutorial: TutorialSession = {
  session: "s03",
  title: "教學 s03 / Tutorial s03",
  titleEn: "Tutorial s03",
  steps: [
    {
      id: "intro",
      title: "開始學習 s03",
      titleEn: "Start Learning s03",
      content: `## s03 教學內容

本 Session 的教學內容正在準備中。請參閱對應的文件和程式碼範例。

The tutorial content for this session is being prepared. Please refer to the corresponding documentation and code examples.`,
      concept: {
        title: "s03 核心概念",
        titleEn: "s03 Core Concepts",
        body: "參閱 s03 的設計文件了解更多細節。Refer to the s03 design document for more details.",
      },
    },
  ],
};

export default tutorial;
