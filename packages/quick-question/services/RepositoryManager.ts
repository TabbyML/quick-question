import fs from "fs";
import path from "path";

import { globSync } from "glob";
import { buildIndex, IndexMetadata } from "quick-question-indexer";

export interface Metadata {
  name: string;
  exampleQueries: string[];
}

export type IndexingStatus = "init" | "success" | "pending" | "failed";

export interface ProjectInfo {
  metadata: Metadata;
  indexingStatus: IndexingStatus;
  indexMetadata: IndexMetadata | null;
}

class Project {
  readonly projectDir: string;
  readonly metadata: Metadata;
  indexingStatus: IndexingStatus = "init";
  indexingJob?: Promise<void>;
  indexMetadata?: IndexMetadata;

  constructor(metadataFile: string) {
    this.projectDir = path.dirname(metadataFile);
    this.metadata = JSON.parse(fs.readFileSync(metadataFile, "utf-8"));
  }

  fetchIndexingStatus(dryrun: boolean): IndexingStatus {
    if (fs.existsSync(path.join(this.projectDir, "index/docstore.json"))) {
      return "success";
    }

    if (!this.indexingJob && !dryrun) {
      this.indexingStatus = "pending";
      this.indexingJob = createIndexingJob(this.projectDir).then((status) => {
        this.indexingStatus = status;
      });
    }

    return this.indexingStatus;
  }

  fetchIndexMetadata(): IndexMetadata | null {
    if (this.indexingStatus !== "success") {
      return null;
    }
    const indexMetadataFile = path.join(this.projectDir, "index/metadata.json");
    if (fs.existsSync(indexMetadataFile)) {
      this.indexMetadata = JSON.parse(
        fs.readFileSync(indexMetadataFile, "utf-8")
      ) as IndexMetadata;
    }
    return this.indexMetadata  || null;
  }
}

async function createIndexingJob(projectDir: string): Promise<IndexingStatus> {
  try {
    await buildIndex({
      input: path.join(projectDir, "metadata.json"),
      dryrun: false,
    });
    return "success";
  } catch (err) {
    console.error("Failed indexing", err);
    return "failed";
  }
}

class RepositoryManager {
  private readonly projects: Project[];

  constructor() {
    this.projects = globSync(
      path.join(process.env.REPO_DIR!, "*", "metadata.json")
    ).map((x) => new Project(x));
  }

  collectProjectInfos(): ProjectInfo[] {
    return this.projects.map((x) => ({
      metadata: x.metadata,
      indexingStatus: x.fetchIndexingStatus(true),
      indexMetadata: x.fetchIndexMetadata(),
    }));
  }

  fetchProjectInfo(name: string): ProjectInfo {
    for (const x of this.projects) {
      if (x.metadata.name === name)
        return {
          metadata: x.metadata,
          indexingStatus: x.fetchIndexingStatus(false),
          indexMetadata: x.fetchIndexMetadata(),
        };
    }

    throw new Error("Invalid project name " + name);
  }

  getProject(name: string): Project {
    for (const x of this.projects) {
      if (x.metadata.name === name) return x;
    }

    throw new Error("Invalid project name " + name);
  }
}

export function getRepositoryManager(ctx: any): RepositoryManager {
  if (!ctx.repositoryManager) {
    ctx.repositoryManager = new RepositoryManager();
  }
  return ctx.repositoryManager;
}
