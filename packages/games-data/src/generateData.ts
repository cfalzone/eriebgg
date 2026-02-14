import { BGGLoader, BGGGame } from "./bgg";
import { promises as fs } from "fs";
import path from "path";

const bgg = BGGLoader.getInstance();

const GAMES_JSON_PATH = path.join(__dirname, "games.json");
const USERS_JSON_PATH = path.join(__dirname, "users.json");

async function main() {
  const fullRefresh = process.argv.includes("--full-refresh");

  bgg.setUsersPath(USERS_JSON_PATH);

  if (!fullRefresh) {
    try {
      const data = await fs.readFile(GAMES_JSON_PATH, "utf-8");
      const parsed = JSON.parse(data) as { Games?: BGGGame[] };
      if (
        parsed.Games &&
        Array.isArray(parsed.Games) &&
        parsed.Games.length > 0
      ) {
        bgg.setInitialCollection(parsed.Games);
        console.log(
          `Loaded ${parsed.Games.length} games from previous run for incremental update`
        );
      }
    } catch {
      // No previous file or invalid; start fresh
      console.log("No previous file or invalid; starting fresh");
    }
  }

  console.log("fetching data");
  const collection = await bgg.getCollection();
  const bggGames = Array.from(collection.values()).filter(
    (g) => (g.users?.length ?? 0) > 0
  );

  console.log(`fetched ${bggGames.length} games, writing data to file`);
  const data = { Games: bggGames };
  const json = JSON.stringify(data);
  await fs.writeFile(GAMES_JSON_PATH, json, "utf-8");
  console.log("... finished writing data");
}

main()
  .then(() => {
    console.log("finished");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
