import "dotenv/config";
import { Configuration, OpenAIApi } from "openai";
import { readFile, writeFile } from "node:fs/promises";
import { Chunk, EmbeddedChunk } from "./types";
import chunks from "./sp-data.json";
import { resolve } from 'node:path';

const apiKey = process.env.API_KEY;
const model = "text-embedding-ada-002";

const openai = new OpenAIApi(
  new Configuration({
    apiKey,
    basePath: `https://lise-openai-gpt4.openai.azure.com/openai/deployments/${model}`,
    baseOptions: {
      headers: {
        "api-key": apiKey,
      },
      params: {
        "api-version": "2023-03-15-preview",
      },
    },
  })
);

const embeddedChunks: EmbeddedChunk[] = [];
for (const chunk of chunks as Chunk[]) {
  // await new Promise((r) => setTimeout(r, 1));
  const result = await openai.createEmbedding({
    model,
    input: chunk.content,
  });

  const embedding = result.data.data[0].embedding;
  console.log("Created embedding: ", embedding);

  embeddedChunks.push({
    ...chunk,
    embedding,
  });
}

console.log("Embedded chunks:", embeddedChunks);

await writeFile(
  resolve(__dirname, "embeddings.json"),
  JSON.stringify(embeddedChunks, null, 2)
);
