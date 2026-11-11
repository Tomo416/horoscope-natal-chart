/** Claudeが返すMarkdown（## 見出し・段落・箇条書き・**太字**）を簡易レンダリング */
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((s, i) =>
    s.startsWith("**") ? <strong key={i}>{s.slice(2, -2)}</strong> : s
  );
}

export default function Report({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <article className="space-y-3 leading-relaxed text-slate-800">
      {blocks.map((b, i) => {
        if (b.startsWith("## ")) {
          const [head, ...rest] = b.split("\n");
          return (
            <section key={i}>
              <h3 className="mt-6 border-l-4 border-indigo-500 pl-3 text-lg font-bold">{head.slice(3)}</h3>
              {rest.length > 0 && <p className="mt-2">{inline(rest.join(" "))}</p>}
            </section>
          );
        }
        if (/^[-*] /m.test(b)) {
          return <ul key={i} className="list-disc pl-6">{b.split("\n").map((l, j) => <li key={j}>{inline(l.replace(/^[-*] /, ""))}</li>)}</ul>;
        }
        if (b.startsWith("# ")) return <h2 key={i} className="text-xl font-bold">{b.slice(2)}</h2>;
        return <p key={i}>{inline(b)}</p>;
      })}
    </article>
  );
}
