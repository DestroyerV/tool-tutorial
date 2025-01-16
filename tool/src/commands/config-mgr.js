import { cosmiconfigSync } from "cosmiconfig";
import { readFileSync } from "fs";
import Ajv from "ajv";
import betterAjvErrors from "better-ajv-errors";
import createLogger from "../logger.js";

const schema = JSON.parse(
  readFileSync(new URL("../config/schema.json", import.meta.url))
);
const logger = createLogger("config-mgr");

const ajv = new Ajv();

const configLoader = cosmiconfigSync("tool");

export default async function getConfig() {
  const result = configLoader.search(process.cwd());
  if (!result) {
    logger.warning("Could not find configuration, using default");
    return { port: 1234 };
  } else {
    const isValid = ajv.validate(schema, result.config);
    if (!isValid) {
      logger.warning("Invalid configuration was supplied");
      console.log(betterAjvErrors(schema, result.config, ajv.errors));
      process.exit(1);
    }
    logger.debug("Found configuration", JSON.stringify(result.config));
    return result.config;
  }
}
