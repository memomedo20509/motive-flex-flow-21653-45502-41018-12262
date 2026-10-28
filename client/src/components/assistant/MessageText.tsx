function InlineText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => (
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={index} className="font-bold text-foreground">{part.slice(2, -2)}</strong>
          : <span key={index}>{part}</span>
      ))}
    </>
  );
}

export function MessageText({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-2 leading-7">
      {lines.map((line, index) => {
        const clean = line.trim();
        if (!clean) return <div key={index} className="h-1" aria-hidden="true" />;
        const heading = clean.match(/^#{1,4}\s+(.+)$/);
        if (heading) return <p key={index} className="pt-1 font-bold text-foreground"><InlineText text={heading[1]} /></p>;
        const bullet = clean.match(/^[-•*]\s+(.+)$/);
        if (bullet) return <p key={index} className="flex gap-2 pr-1"><span className="text-secondary">•</span><span><InlineText text={bullet[1]} /></span></p>;
        const numbered = clean.match(/^(\d+)[.)]\s+(.+)$/);
        if (numbered) return <p key={index} className="flex gap-2 pr-1"><span className="font-semibold text-secondary">{numbered[1]}.</span><span><InlineText text={numbered[2]} /></span></p>;
        return <p key={index}><InlineText text={clean} /></p>;
      })}
    </div>
  );
}
