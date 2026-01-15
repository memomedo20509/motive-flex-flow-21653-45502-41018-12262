import { hydrateRoot, createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root")!;
const isSSR = rootElement.innerHTML.trim().length > 0;

if (isSSR) {
  hydrateRoot(rootElement, <App />);
} else {
  createRoot(rootElement).render(<App />);
}
