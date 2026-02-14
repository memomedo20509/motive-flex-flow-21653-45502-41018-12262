import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root")!;
rootElement.innerHTML = "";
createRoot(rootElement).render(<App />);
