export type QuestionDifficulty = "warm-up" | "practice" | "challenge";
export type QuestionType = "single" | "multiple" | "fill-in";

export interface SingleChoiceQuestion {
  id: string;
  type: "single";
  difficulty: QuestionDifficulty;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface MultipleChoiceQuestion {
  id: string;
  type: "multiple";
  difficulty: QuestionDifficulty;
  question: string;
  options: string[];
  answers: number[];
  explanation: string;
}

export interface FillInBlank {
  id: string;
  label: string;
  answer: string;
  hint?: string;
}

export interface FillInQuestion {
  id: string;
  type: "fill-in";
  difficulty: QuestionDifficulty;
  question: string;
  blanks: FillInBlank[];
  explanation: string;
}

export type Question = SingleChoiceQuestion | MultipleChoiceQuestion | FillInQuestion;

export interface QuizSession {
  session: string;
  title: string;
  questions: Question[];
}

export interface QuizAnswer {
  questionId: string;
  type: QuestionType;
  selectedOptions?: number[];
  fillInAnswers?: Record<string, string>;
  isCorrect?: boolean;
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, QuizAnswer>;
  showExplanation: boolean;
  isCompleted: boolean;
}

export interface QuizProgress {
  session: string;
  completed: boolean;
  score: number;
  total: number;
  completedAt?: string;
}
