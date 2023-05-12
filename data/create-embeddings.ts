import "dotenv/config";
import { Configuration, OpenAIApi } from "openai";
import { writeFile } from "node:fs/promises";
import { EmbeddedChunk } from "./types";
import cliProgress, { SingleBar } from "cli-progress";
import chunks from "./sp-data.json";

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
const totalChunks = chunks.length;
const progressBar = new SingleBar({}, cliProgress.Presets.shades_classic);
progressBar.start(totalChunks, 0);
for (const [i, chunk] of chunks.entries()) {
  await new Promise((r) => setTimeout(r, 20));
  const result = await openai.createEmbedding({
    model,
    input: chunk.content,
  });

  const embedding = result.data.data[0].embedding;
  progressBar.update(i + 1);

  embeddedChunks.push({
    ...chunk,
    embedding,
  });
}
progressBar.stop();

console.log("Embedded chunks:", embeddedChunks);

await writeFile(
  "./data/embeddings.json",
  JSON.stringify(embeddedChunks, null, 2)
);
