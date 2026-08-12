import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeXPixel } from "./lib/x-pixel";

initializeXPixel();

const rootElement = document.getElementById("root")!;
rootElement.innerHTML = "";
createRoot(rootElement).render(<App />);
