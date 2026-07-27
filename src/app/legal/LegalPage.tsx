import Link from "next/link";

type Section = { title: string; body: string[] };

export default function LegalPage({ title, sections }: { title: string; sections: Section[] }) {
  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
      <Link
        href="/"
        className="text-[11px] uppercase tracking-brand text-faint transition hover:text-ink"
      >
        FORMULA STUDIO
      </Link>
      <h1 className="mt-10 border-b border-line pb-4 text-base tracking-[0.06em] text-ink">
        {title}
      </h1>
      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-[13px] text-ink">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-2 text-[13px] leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
