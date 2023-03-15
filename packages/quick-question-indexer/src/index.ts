import fs from "fs";
import path from "path";

import { simpleGit } from "simple-git";

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

async function indexRepo(input: string, output: string, dryrun: boolean) {
  const MAX_DOC_LENGTH = 1600;
  const allDocuments = [];

  for await (const p of walk(input)) {
    const chunks = await parseFile(p);
    for (const { language, code, range } of chunks) {
      const document = new Document({
        pageContent: code.slice(0, MAX_DOC_LENGTH),
        metadata: {
          language,
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

async function gitCloneRepository(name: string, repositoryDir: string) {
  // Clone github
  const git = simpleGit(repositoryDir);
  if (fs.existsSync(repositoryDir)) {
    console.log("Git repository exists, updating...");
    await git.pull();
  } else {
    console.log("Git repository does not exists, cloning...");
    const githubUrl = `https://github.com/${name}`;
    await git.clone(githubUrl, repositoryDir, { "--depth": 1 });
  }
  return {
    revision: await git.revparse("HEAD"),
  };
}

interface IndexParams {
  input: string;
  dryrun: boolean;
}

export interface IndexMetadata {
  revision: string;
}

export async function buildIndex({ input, dryrun }: IndexParams) {
  input = path.resolve(input);
  console.log("Processing metadata", input);
  const metadata = JSON.parse(fs.readFileSync(input, "utf-8"));

  // Setup directories.
  const baseDir = path.dirname(input);
  const repositoryDir = path.join(baseDir, "repository");
  const indexDir = path.join(baseDir, "index");

  const { revision } = await gitCloneRepository(
    metadata.name,
    repositoryDir
  );

  // Build index.
  await indexRepo(repositoryDir, indexDir, dryrun);

  // Save index metadata
  const indexMetadata: IndexMetadata = {
    revision
  };
  await fs.writeFileSync(
    path.join(indexDir, "metadata.json"),
    JSON.stringify(indexMetadata)
  );
}
