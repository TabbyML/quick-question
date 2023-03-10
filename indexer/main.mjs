import fs from "fs";
import path from "path";

import { Command } from "commander";
import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { encoding_for_model } from "@dqbd/tiktoken";

const codeSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 800,
  chunkOverlap: 0,
  separators: [
    // First, try to split along class definitions
    "\nclass ",
    "\ndef ",
    "\n\tdef ",

    // Now split by the normal type of lines
    "\n\n",
    "\n",
    " ",
    "",
  ],
});

async function* walk(dir) {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else if (d.isFile()) yield entry;
  }
}

async function indexRepo({ input, output, dryrun }) {
  let allDocuments = [];

  for await (const p of walk(input)) {
    if (p.endsWith(".py")) {
      const content = fs.readFileSync(p);
      const documents = codeSplitter.createDocuments(
        [fs.readFileSync(p, "utf-8")],
        [
          {
            source: p,
          },
        ]
      );
      allDocuments = [...allDocuments, ...documents];
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
