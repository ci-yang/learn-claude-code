import type { TutorialSession } from "./types";

const tutorial: TutorialSession = {
  session: "s06",
  title: "教學 s06 / Tutorial s06",
  titleEn: "Tutorial s06",
  steps: [
    {
      id: "intro",
      title: "開始學習 s06",
      titleEn: "Start Learning s06",
      content: `## s06 教學內容

本 Session 的教學內容正在準備中。請參閱對應的文件和程式碼範例。

The tutorial content for this session is being prepared. Please refer to the corresponding documentation and code examples.`,
      concept: {
        title: "s06 核心概念",
        titleEn: "s06 Core Concepts",
        body: "參閱 s06 的設計文件了解更多細節。Refer to the s06 design document for more details.",
      },
    },
  ],
};

export default tutorial;
