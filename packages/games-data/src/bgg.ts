import { XMLParser } from "fast-xml-parser";
import fetch from "node-fetch";
import { promises as fs } from "fs";

export interface BGGGame {
  id: string;
  name: string;
  users?: BGGUser[];
  type: string;
  image: string;
  thumb: string;
  yearPublished: string;
}

export interface BGGUser {
  username: string;
  display: string;
}

const rootPath = "https://www.boardgamegeek.com/xmlapi2";
const maxTries = 3;
const delayBetweenUsersMs = 2000;
const requestTimeoutMs = 60000;
const retryBaseDelayMs = 3000;

/** BGG now requires a registered app token. Get one at https://boardgamegeek.com/applications */
function getRequestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": "ErieBGG/1.0 (https://github.com/cfalzone/eriebgg)",
  };
  // BGG_API_TOKEN is set in CI (GitHub secret) and locally; see turbo.json globalEnv
  const token = process.env["BGG_API_TOKEN"]?.trim();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetriableNetworkError(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  return code === "ETIMEDOUT" || code === "ECONNRESET" || code === "ENOTFOUND";
}

export class BGGLoader {
  private static instance: BGGLoader;

  private users: BGGUser[] = [];
  private usersPath: string | null = null;

  private collection: Map<string, BGGGame>;
  private parser: XMLParser;

  private constructor() {
    this.parser = new XMLParser({ ignoreAttributes: false });
    this.collection = new Map<string, BGGGame>();
  }

  public setUsersPath(filePath: string): void {
    this.usersPath = filePath;
  }

  public setInitialCollection(games: BGGGame[]): void {
    this.collection = new Map<string, BGGGame>();
    for (const g of games) {
      const copy = { ...g, users: [] };
      this.collection.set(g.id, copy);
    }
  }

  private getDefaultUsers(): BGGUser[] {
    return [
      { username: "cfalzone", display: "Chris" },
      { username: "Peasly23", display: "Clark" },
      { username: "Kailinne", display: "Carol" },
      { username: "norbert88", display: "Jonathan" },
      { username: "jimlocke1", display: "Jim" },
      { username: "Katica00", display: "Karen" },
      { username: "LordOfTheWyrms", display: "Rich" },
      { username: "maggiebakestre", display: "Maggie" },
      { username: "mathdood", display: "Zach" },
      { username: "Zaezel", display: "Gary" },
      { username: "Monobueno", display: "Jess" },
      { username: "knifedoc", display: "JT" },
      { username: "Redrising2", display: "Matt" },
      { username: "Demon7528", display: "Lonny" },
    ];
  }

  private async ensureUsersLoaded(): Promise<void> {
    if (this.users.length > 0) return;
    if (this.usersPath) {
      try {
        const data = await fs.readFile(this.usersPath, "utf-8");
        const parsed = JSON.parse(data) as BGGUser[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.users = parsed;
          return;
        }
      } catch {
        // fall back to default
      }
    }
    this.users = this.getDefaultUsers();
  }

  public static getInstance(): BGGLoader {
    if (!BGGLoader.instance) {
      BGGLoader.instance = new BGGLoader();
    }

    return BGGLoader.instance;
  }

  private async loadCollection() {
    await this.ensureUsersLoaded();
    for (let i = 0; i < this.users.length; i++) {
      const user = this.users[i];
      try {
        await this.loadUser(user);
      } catch (err) {
        console.error(`Skipping user ${user.username} after failure:`, err);
      }
      if (i < this.users.length - 1) {
        await delay(delayBetweenUsersMs);
      }
    }
  }

  private async loadUser(user: { username: string; display: string }) {
    if (!user.username) throw new Error("A username is required");

    const bggUrl = `${rootPath}/collection?username=${user.username}&subtype=boardgame&excludesubtype=boardgameexpansion&own=1`;

    try {
      const games = await this.fetchGames(bggUrl);
      const rawItems = games?.items?.item;
      const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];
      items.forEach((g: any) => {
        // Convert the game json from BGG into an object
        let game = this.fromBgg(g);

        // See if we already have this game in our collection
        const colGame = this.collection.get(game.id);
        if (colGame) game = colGame;

        // Add the user to list of people who own the game
        let users: BGGUser[] = game.users ?? [];
        users.push(user);
        game.users = users;

        // Update the collection
        this.collection.set(game.id, game);
      });
    } catch (err) {
      console.error(`Failed to fetch games for ${user.username}`, err);
      throw err;
    }
  }

  private async fetchGames(url: string, tries = 0): Promise<any> {
    console.log(`Fetching Collection from ${url} (tries=${tries})`);
    const nextTry = tries + 1;
    const backoffMs = retryBaseDelayMs * Math.pow(2, tries);

    let resp: Awaited<ReturnType<typeof fetch>>;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);
      resp = await fetch(url, {
        signal: controller.signal,
        headers: getRequestHeaders(),
      });
      clearTimeout(timeoutId);
    } catch (err) {
      if (isRetriableNetworkError(err) && tries < maxTries) {
        console.log(`Network error (retry ${nextTry}/${maxTries} in ${backoffMs}ms):`, (err as Error).message);
        await delay(backoffMs);
        return this.fetchGames(url, nextTry);
      }
      throw err;
    }

    if (resp.status === 200) {
      const xmlStr = await resp.text();
      console.log(`Finished Fetching Collection from ${url}`);
      return this.parser.parse(xmlStr);
    }

    if (resp.status === 401 && !process.env["BGG_API_TOKEN"]) {
      console.error(
        "BGG returned 401. The XML API now requires a registered app token. " +
          "Register at https://boardgamegeek.com/applications and set BGG_API_TOKEN in your environment."
      );
    }

    if (tries >= maxTries) {
      throw new Error(`Max tries exceeded (last status ${resp.status})`);
    }
    console.log(`Status ${resp.status} (retry ${nextTry}/${maxTries} in ${backoffMs}ms)`);
    await delay(backoffMs);
    return this.fetchGames(url, nextTry);
  }

  private fromBgg(input: any): BGGGame {
    return {
      id: input["@_objectid"],
      name: input.name["#text"],
      type: input["@_subtype"],
      image: input.image,
      thumb: input.thumbnail,
      yearPublished: input.yearpublished,
    };
  }

  public async getCollection() {
    await this.loadCollection();
    return this.collection;
  }
}
