import { XMLParser } from "fast-xml-parser";
import fetch from "node-fetch";

export interface BGGGame {
  id: string;
  name: string;
  users?: string[];
  type: string;
  image: string;
  thumb: string;
  yearPublished: string;
}

const rootPath = "https://www.boardgamegeek.com/xmlapi2";
const maxTries = 3;

export class BGGLoader {
  private static instance: BGGLoader;

  // List of BGG User Names that we will pull collections from
  private users = ["cfalzone", "Peasly23"];

  private collection: Map<string, BGGGame>;
  private parser: XMLParser;

  private constructor() {
    this.parser = new XMLParser({ ignoreAttributes: false });
    this.collection = new Map<string, BGGGame>();
  }

  public static getInstance(): BGGLoader {
    if (!BGGLoader.instance) {
      BGGLoader.instance = new BGGLoader();
    }

    return BGGLoader.instance;
  }

  private async loadCollection() {
    await Promise.all(this.users.map((user) => this.loadUser(user)));
  }

  private async loadUser(user: string) {
    if (!user) throw new Error("A user is required");

    const bggUrl = `${rootPath}/collection?username=${user}&subtype=boardgame&excludesubtype=boardgameexpansion&own=1`;

    try {
      const games = await this.fetchGames(bggUrl);
      // console.log(`Loaded Games for user ${user}`, games.items.item);
      games.items.item.forEach((g: any) => {
        // Convert the game json from BGG into an object
        let game = this.fromBgg(g);

        // See if we already have this game in our collection
        const colGame = this.collection.get(game.id);
        if (colGame) game = colGame;

        // Add the user to list of people who own the game
        let users: string[] = game.users ?? [];
        users.push(user);
        game.users = users;

        // Update the collection
        this.collection.set(game.id, game);
      });
    } catch (err) {
      console.error(`Failed to fetch games for ${user}`, err);
      throw err;
    }
  }

  private async fetchGames(url: string, tries = 0): Promise<any> {
    console.log(`Fetching Collection from ${url} (tries=${tries})`);
    const resp = await fetch(url);
    if (resp.status === 200) {
      const xmlStr = await resp.text();
      console.log(`Finished Fetching Collection from ${url}`);
      // console.log("Collection XML", xmlStr);
      return this.parser.parse(xmlStr);
    } else {
      if (tries > maxTries) {
        throw new Error("Maxtries exceeded");
      }
      return this.fetchGames(url, tries++);
    }
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
    if (!this.collection || this.collection.size === 0)
      await this.loadCollection();
    return this.collection;
  }
}
