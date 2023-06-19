import { BGGLoader } from "./bgg";
import { promises as fs } from "fs";

const bgg = BGGLoader.getInstance();

async function main() {
  console.log("fetching data");

  const bggGames = Array.from((await bgg.getCollection()).values());

  console.log(`fetched ${bggGames.length} games, writing data to file`);

  const data = { Games: bggGames };
  const json = JSON.stringify(data);

  await fs.writeFile("./src/games.json", json, "utf-8");

  console.log("... finished writing data");
}

main()
  .then(async () => {
    console.log("finished");
  })
  .catch(async (e) => {
    console.error(e);
  });
