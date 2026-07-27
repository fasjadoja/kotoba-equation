import Link from "next/link";

type Section = { title: string; body: string[] };

export default function LegalPage({ title, sections }: { title: string; sections: Section[] }) {
  return (
    <div className="mx-auto max-w-2xl px-6 pb-24 pt-10">
      <Link href="/" className="text-xs text-neutral-400 hover:text-neutral-900">
        ← formula.studio
      </Link>
      <h1 className="mt-8 text-lg font-semibold text-neutral-900">{title}</h1>
      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-sm text-neutral-900">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-2 text-sm leading-relaxed text-neutral-500">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
