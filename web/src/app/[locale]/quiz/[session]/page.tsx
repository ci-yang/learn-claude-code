import { notFound } from "next/navigation";
import Link from "next/link";
import { QuizClient } from "@/components/quiz/quiz-client";
import { VERSION_META, VERSION_ORDER } from "@/lib/constants";
import type { QuizSession } from "@/types/quiz";

// Import all exercise JSON files
import s01 from "@/data/exercises/s01.json";
import s02 from "@/data/exercises/s02.json";
import s03 from "@/data/exercises/s03.json";
import s04 from "@/data/exercises/s04.json";
import s05 from "@/data/exercises/s05.json";
import s06 from "@/data/exercises/s06.json";
import s07 from "@/data/exercises/s07.json";
import s08 from "@/data/exercises/s08.json";
import s09 from "@/data/exercises/s09.json";
import s10 from "@/data/exercises/s10.json";
import s11 from "@/data/exercises/s11.json";
import s12 from "@/data/exercises/s12.json";

const EXERCISES: Record<string, QuizSession> = {
  s01: s01 as QuizSession,
  s02: s02 as QuizSession,
  s03: s03 as QuizSession,
  s04: s04 as QuizSession,
  s05: s05 as QuizSession,
  s06: s06 as QuizSession,
  s07: s07 as QuizSession,
  s08: s08 as QuizSession,
  s09: s09 as QuizSession,
  s10: s10 as QuizSession,
  s11: s11 as QuizSession,
  s12: s12 as QuizSession,
};

export function generateStaticParams() {
  const locales = ["en", "zh", "ja"];
  return locales.flatMap((locale) =>
    VERSION_ORDER.map((session) => ({ locale, session }))
  );
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ locale: string; session: string }>;
}) {
  const { locale, session } = await params;
  const quizData = EXERCISES[session];
  const meta = VERSION_META[session];

  if (!quizData || !meta) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <Link href={`/${locale}/${session}`} className="hover:underline">
            {meta.title}
          </Link>
          <span>/</span>
          <span>練習測驗</span>
        </div>
        <h1 className="text-2xl font-bold">
          {session.toUpperCase()}: {quizData.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          共 {quizData.questions.length} 題 · 選擇題與填空題
        </p>
      </div>

      {/* Quiz Component */}
      <QuizClient quizSession={quizData} locale={locale} />
    </div>
  );
}
