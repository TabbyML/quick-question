// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { query } = req.body;
  switch (req.method) {
    case "POST": {
      const vectorStore = await HNSWLib.load(
        "public/repos/huggingface/diffusers",
        new OpenAIEmbeddings()
      );
      const queryResult = await vectorStore.similaritySearchWithScore(query, 5);

      let formattedResults: {
        pageContent: any;
        metadata: { source: any; score: any };
      }[] = [];
      queryResult.map((result: any[]) => {
        formattedResults.push({
          pageContent: result[0].pageContent,
          metadata: {
            source: result[0].metadata.source,
            score: result[1],
          },
        });
      });

      return res.status(200).json(formattedResults);
    }
    default: {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
}
