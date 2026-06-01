import { createApp } from "./app.js";
import { env } from "./env.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`nlh-website-backend listening on http://localhost:${env.PORT}`);
});
