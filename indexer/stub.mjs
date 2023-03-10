export class StubEmbeddings {
  async embedDocuments(documents) {
    const vecs = [];
    for (const x of documents) {
      vecs.push([0.5, 0.5]);
    }
    return vecs;
  }

  async embedQuery(document) {
    return [0.5, 0.5];
  }
}

