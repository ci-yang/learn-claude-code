import type { TutorialSession } from "./types";

const tutorial: TutorialSession = {
  session: "s04",
  title: "教學 s04 / Tutorial s04",
  titleEn: "Tutorial s04",
  steps: [
    {
      id: "intro",
      title: "開始學習 s04",
      titleEn: "Start Learning s04",
      content: `## s04 教學內容

本 Session 的教學內容正在準備中。請參閱對應的文件和程式碼範例。

The tutorial content for this session is being prepared. Please refer to the corresponding documentation and code examples.`,
      concept: {
        title: "s04 核心概念",
        titleEn: "s04 Core Concepts",
        body: "參閱 s04 的設計文件了解更多細節。Refer to the s04 design document for more details.",
      },
    },
  ],
};

export default tutorial;
