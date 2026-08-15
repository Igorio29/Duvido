import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { app } from "./app.js";

// Tanto src/index.ts quanto dist/index.js ficam dois níveis abaixo da raiz.
config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`DUVIDO! API em http://localhost:${port}`));
