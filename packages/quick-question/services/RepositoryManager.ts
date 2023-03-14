import fs from "fs";
import path from "path";

import { buildIndex } from "quick-question-indexer";

export interface Metadata {
  name: string;
  exampleQueries: string[];
}

export type IndexingStatus = "init" | "success" | "pending" | "failed";

class RepositoryManager {
  indexingJob?: Promise<void>;
  indexingStatus: IndexingStatus = "init";
  metadata: Metadata;

  constructor() {
    const metadataFile = path.join(
      process.cwd(),
      process.env.REPO_DIR!,
      "metadata.json"
    );
    this.metadata = JSON.parse(fs.readFileSync(metadataFile, "utf-8"));
  }

  getIndexingStatus(): IndexingStatus {
    if (
      fs.existsSync(
        path.join(process.cwd(), process.env.REPO_DIR!, "index/docstore.json")
      )
    ) {
      return "success";
    }

    if (!this.indexingJob) {
      this.indexingStatus = "pending";
      this.indexingJob = createIndexingJob().then((status) => {
        this.indexingStatus = status;
      });
    }

    return this.indexingStatus;
  }
}

async function createIndexingJob(): Promise<IndexingStatus> {
  try {
    await buildIndex({
      input: path.join(process.cwd(), process.env.REPO_DIR!, "metadata.json"),
      dryrun: false,
    });
    return "success";
  } catch (err) {
    console.error("Failed indexing", err);
    return "failed";
  }
}

export function getRepositoryManager(ctx: any): RepositoryManager {
  if (!ctx.repositoryManager) {
    ctx.repositoryManager = new RepositoryManager();
  }
  return ctx.repositoryManager;
}
