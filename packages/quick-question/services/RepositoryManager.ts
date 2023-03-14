import fs from "fs";
import path from "path";

import { exec } from "child_process";

export interface Metadata {
  name: string;
  exampleQueries: string[];
}

export type IndexingStatus = "init" | "success" | "pending" | "failed";

class RepositoryManager {
  indexingJob: Promise<IndexingStatus>;
  metadata: Metadata;

  constructor() {
    if (
      fs.existsSync(
        path.join(process.cwd(), process.env.REPO_DIR!, "index/docstore.json")
      )
    ) {
      this.indexingJob = Promise.resolve("success");
    } else {
      this.indexingJob = indexJob();
    }

    const metadataFile = path.join(
      process.cwd(),
      process.env.REPO_DIR!,
      "metadata.json"
    );
    this.metadata = JSON.parse(fs.readFileSync(metadataFile, "utf-8"));
  }
}

async function indexJob(): Promise<IndexingStatus> {
  return await new Promise((resolve, reject) => {
    exec("yarn index --no-dryrun", (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        reject(error);
      }
      resolve(error ? "failed" : "success");
    });
  });
}

export const repository = new RepositoryManager();
