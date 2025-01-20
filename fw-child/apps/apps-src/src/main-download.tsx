// This file is still work in progress.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/Global.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <h1>Hi! I'm the download page.</h1>
    </StrictMode>,
);
