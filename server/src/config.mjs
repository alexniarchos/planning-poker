import dotenv from "dotenv";
import path from "path";

function initConfig() {
  dotenv.config({
    path: path.join(new URL(".", import.meta.url).pathname, "../.env"),
  });
}

initConfig();

export { initConfig };
