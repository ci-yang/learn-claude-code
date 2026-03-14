import type { TutorialSession } from "./types";

const tutorial: TutorialSession = {
  session: "s07",
  title: "教學 s07 / Tutorial s07",
  titleEn: "Tutorial s07",
  steps: [
    {
      id: "intro",
      title: "開始學習 s07",
      titleEn: "Start Learning s07",
      content: `## s07 教學內容

本 Session 的教學內容正在準備中。請參閱對應的文件和程式碼範例。

The tutorial content for this session is being prepared. Please refer to the corresponding documentation and code examples.`,
      concept: {
        title: "s07 核心概念",
        titleEn: "s07 Core Concepts",
        body: "參閱 s07 的設計文件了解更多細節。Refer to the s07 design document for more details.",
      },
    },
  ],
};

export default tutorial;
