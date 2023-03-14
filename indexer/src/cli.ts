import { Command } from "commander";
import { buildIndex } from "./index";

const program = new Command();

program
  .requiredOption("-i, --input <config>", "Configuration file")
  .option("--no-dryrun")
  .action(buildIndex);

program.parse();
