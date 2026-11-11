import type { ReportSection } from "@/lib/report";

export default function Report({ sections }: { sections: ReportSection[] }) {
  return (
    <article className="space-y-3 leading-relaxed text-slate-800">
      {sections.map((s, i) => (
        <section key={i} className="avoid-break">
          <h3 className="mt-6 border-l-4 border-indigo-500 pl-3 text-lg font-bold">{i + 1}. {s.title}</h3>
          {s.paragraphs.map((p, j) => <p key={j} className="mt-2">{p}</p>)}
        </section>
      ))}
    </article>
  );
}
