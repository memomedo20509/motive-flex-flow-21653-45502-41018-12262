import type { AssistantPage } from "@shared/schema";

function clean(text: string | null | undefined, max: number) {
  return (text || "").replace(/\s+/g, " ").trim().slice(0, max);
}

/** What the visitor is looking at right now, trimmed to fit the chat API limits. */
export function readPageSnapshot(path: string): AssistantPage {
  const main: HTMLElement = document.querySelector("main") || document.body;
  const h1 = clean(main.querySelector("h1")?.textContent, 200);
  const title = h1 || clean(document.title.split("|")[0], 200);
  const headings = Array.from(main.querySelectorAll("h2, h3"))
    .map((heading) => clean(heading.textContent, 160))
    .filter((heading, index, list) => heading.length > 2 && list.indexOf(heading) === index)
    .slice(0, 10);
  const excerpt = clean(main.innerText, 1200);
  return { path: path.slice(0, 300), title, headings, excerpt };
}
