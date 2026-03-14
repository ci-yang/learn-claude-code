import type { TutorialSession } from "./types";

const tutorial: TutorialSession = {
  session: "s10",
  title: "教學 s10 / Tutorial s10",
  titleEn: "Tutorial s10",
  steps: [
    {
      id: "intro",
      title: "開始學習 s10",
      titleEn: "Start Learning s10",
      content: `## s10 教學內容

本 Session 的教學內容正在準備中。請參閱對應的文件和程式碼範例。

The tutorial content for this session is being prepared. Please refer to the corresponding documentation and code examples.`,
      concept: {
        title: "s10 核心概念",
        titleEn: "s10 Core Concepts",
        body: "參閱 s10 的設計文件了解更多細節。Refer to the s10 design document for more details.",
      },
    },
  ],
};

export default tutorial;
