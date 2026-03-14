import { notFound } from "next/navigation";
import { TutorialClient } from "@/components/tutorial/tutorial-client";
import { VERSION_META, VERSION_ORDER } from "@/lib/constants";
import s01 from "@/data/tutorials/s01";
import s02 from "@/data/tutorials/s02";
import s03 from "@/data/tutorials/s03";
import s04 from "@/data/tutorials/s04";
import s05 from "@/data/tutorials/s05";
import s06 from "@/data/tutorials/s06";
import s07 from "@/data/tutorials/s07";
import s08 from "@/data/tutorials/s08";
import s09 from "@/data/tutorials/s09";
import s10 from "@/data/tutorials/s10";
import s11 from "@/data/tutorials/s11";
import s12 from "@/data/tutorials/s12";
import type { TutorialSession } from "@/data/tutorials/types";

const TUTORIALS: Record<string, TutorialSession> = {
  s01, s02, s03, s04, s05, s06,
  s07, s08, s09, s10, s11, s12,
};

export function generateStaticParams() {
  const locales = ["en", "zh", "ja"];
  return locales.flatMap((locale) =>
    VERSION_ORDER.map((session) => ({ locale, session }))
  );
}

export default async function TutorialPage({
  params,
}: {
  params: Promise<{ locale: string; session: string }>;
}) {
  const { locale, session } = await params;
  const tutorial = TUTORIALS[session];
  const meta = VERSION_META[session];

  if (!tutorial || !meta) {
    notFound();
  }

  return (
    <div className="-mx-4 -my-8 sm:-mx-6 lg:-mx-8">
      <TutorialClient tutorial={tutorial} locale={locale} />
    </div>
  );
}
