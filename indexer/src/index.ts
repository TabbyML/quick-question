import fs from "fs";
import path from "path";

import { Command } from "commander";
import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { Document } from "langchain/document";
import { encoding_for_model } from "@dqbd/tiktoken";

import { parseFile } from "./parser";

async function* walk(dir: string): AsyncIterable<string> {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else if (d.isFile()) yield entry;
  }
}

interface IndexParams {
  input: string;
  output: string;
  dryrun: boolean;
}

async function indexRepo({ input, output, dryrun }: IndexParams) {
  const MAX_DOC_LENGTH = 1600;
  const allDocuments = [];

  for await (const p of walk(input)) {
    const chunks = await parseFile(p);
    for (const { code, range } of chunks) {
      const document = new Document({
        pageContent: code.slice(0, MAX_DOC_LENGTH),
        metadata: {
          source: path.relative(input, p),
          range,
        },
      });
      allDocuments.push(document);
    }
  }

  let totalTokens = 0;
  const enc = encoding_for_model("text-embedding-ada-002");

  allDocuments.map((doc) => {
    totalTokens += enc.encode(doc.pageContent).length;
  });
  const approximateOpenAICostForIndexing = (
    (totalTokens / 1000) *
    0.0004
  ).toPrecision(4);

  console.log("Total docs: ", allDocuments.length);
  console.log("Total tokens: ", totalTokens);
  console.log(
    "Approximate OpenAI cost for indexing: $",
    approximateOpenAICostForIndexing
  );

  if (dryrun) {
    return;
  }

  console.log("\nBuilding index...");

  const vectorStore = await HNSWLib.fromDocuments(
    allDocuments,
    new OpenAIEmbeddings()
  );

  // Monkey patch console.log
  const log = console.log;
  console.log = () => {};

  await vectorStore.save(output);
}

const program = new Command();

program
  .requiredOption("-i, --input <path>", "Input directory for source code files")
  .option("-o, --output <path>", "Output directory for index")
  .option("--no-dryrun")
  .action(indexRepo);

program.parse();
