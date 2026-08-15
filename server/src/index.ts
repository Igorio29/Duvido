import { config } from "dotenv";
import { resolve } from "node:path";
import { app } from "./app.js";

// Os scripts do workspace executam com server/ como diretório atual.
config({ path: resolve(process.cwd(), "../.env") });

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`DUVIDO! API em http://localhost:${port}`));
