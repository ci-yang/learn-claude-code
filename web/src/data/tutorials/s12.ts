import type { TutorialSession } from "./types";

const tutorial: TutorialSession = {
  session: "s12",
  title: "教學 s12 / Tutorial s12",
  titleEn: "Tutorial s12",
  steps: [
    {
      id: "intro",
      title: "開始學習 s12",
      titleEn: "Start Learning s12",
      content: `## s12 教學內容

本 Session 的教學內容正在準備中。請參閱對應的文件和程式碼範例。

The tutorial content for this session is being prepared. Please refer to the corresponding documentation and code examples.`,
      concept: {
        title: "s12 核心概念",
        titleEn: "s12 Core Concepts",
        body: "參閱 s12 的設計文件了解更多細節。Refer to the s12 design document for more details.",
      },
    },
  ],
};

export default tutorial;
