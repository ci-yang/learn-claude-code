export interface TutorialConcept {
  title: string;
  titleEn: string;
  body: string;
  links?: { label: string; href: string }[];
}

export interface TutorialStep {
  id: string;
  title: string;
  titleEn: string;
  content: string; // markdown
  code?: string;
  codeLanguage?: string;
  codeHighlightLines?: number[];
  concept?: TutorialConcept;
}

export interface TutorialSession {
  session: string;
  title: string;
  titleEn: string;
  steps: TutorialStep[];
}
