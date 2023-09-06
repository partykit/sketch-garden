import { PartyKitServer, PartyKitRoom } from "partykit/server";
import { onConnect } from "y-partykit";
import { syncedStore, getYjsDoc } from "@syncedstore/core";
import { YPartyKitStorage } from "y-partykit/storage";

type YJsRoom = PartyKitRoom & {
  store?: any;
};

type Lineage = string[];

type Lineages = {
  [key: string]: Lineage;
};

type PopulatedCell = {
  lineage: string;
  index: number;
  emoji: string;
};

export type Cell = PopulatedCell | null;

// Garden is a map of index to cell
// The index is left to right, top to bottom
export type Garden = {
  [key: number]: Cell;
};

export const gardenDimensions = {
  width: 10,
  height: 10,
};

const lineages = {
  deciduous: ["🌱", "🌳", "🌳", "🌳", "🌳", "🌳", "🍂", "🐌"],
  evergreen: ["🌰", "🌲", "🌲", "🌲", "🌲", "🌲", "🍃"],
  squirrel: ["🌰", "🌰", "🌰", "🐿️", "🐿️"],
  sprout: ["🌱", "🌱", "🌱", "🌱", "🍄", "🍄", "🍄", "🦌", "🦌"],
  flower: ["🌱", "🌱", "🌸", "🌸", "🌸", "🌸", "🌸", "🌸", "🐝", "🐝"],
  fern: [
    "🌿",
    "🌿",
    "🌿",
    "🌿",
    "🌿",
    "🌿",
    "🌿",
    "🌿",
    "🐻",
    "🐻",
    "👣",
    "👣",
  ],
} as Lineages;

export const yDocShape = { garden: {} as Garden };

export const getStarterEmojis = () => {
  // returns a list of { lineage, emoji } objects where the emoji is the
  // first emoji in the lineage
  return Object.keys(lineages).map((lineage) => {
    return {
      lineage,
      index: 0,
      emoji: lineages[lineage][0],
    };
  }) as Cell[];
};

const GARDEN_TICK = 1500; // milliseconds

export default {
  onConnect(ws, room) {
    return onConnect(ws, room, {
      persist: true,
      callback: {
        async handler(ydoc) {
          try {
            // We can manipulate the yDoc here... but we want to evolve it independently of the clients.
            // So we stash it on the room object, and access it later in onAlarm.
            // NOTE: This is a hack! If the number of websocket connections goes to zero, the room object
            // will be destroyed, we'll lose the yDoc, and the garden will stop evolving. There are
            // ways to persist the yDoc, but that's a task for another day.
            /*
            if (!(room as YJsRoom).store) {
              const store = syncedStore(yDocShape, ydoc);
              (room as YJsRoom).store = store;
            }
            */
            // If there's no alarm set already, set one for the next tick
            const alarm = await room.storage.getAlarm();
            if (alarm === null) {
              await room.storage.setAlarm(new Date().getTime() + GARDEN_TICK);
            }
          } catch (e) {
            console.error("Callback error", e);
          }
        },
      },
    });
  },
  async onAlarm(room) {
    // We've been woken up. Load the yDoc and iterate the garden
    // NOTE: This is a hack! The store will be empty if the number of websocket connections goes to zero.
    // Old way:
    // const store = (room as YJsRoom).store;
    // New way:
    // BUG: Changes to the ydoc do not persist
    const roomStorage = new YPartyKitStorage(room.storage);
    const ydoc = await roomStorage.getYDoc("shared-garden"); // room.id is not available
    const store = syncedStore(yDocShape, ydoc);

    // Test updating the ydoc without going through synced store
    const g = ydoc.getMap("garden");
    ydoc.transact(() => {
      g.set("99", { lineage: "deciduous", index: 0, emoji: "🏏" });
    });
    console.log("[proof of running] onAlarm", store.garden);

    Object.entries(store.garden as Garden).forEach(([index_s, cell]) => {
      const index = parseInt(index_s);
      console.log("[proof of running] index", index);
      if (cell) {
        // Check the lineage and index against the lineages map
        // If the index can be incremented, increment it and update the emoji.
        // If it can't be incremented, remove the cell from the garden.
        const lineage = lineages[cell.lineage];
        if (lineage) {
          if (cell.index < lineage.length - 1) {
            console.log(
              "[proof of running] incrementing index",
              cell.index,
              lineage.length
            );
            cell.index++;
            cell.emoji = lineage[cell.index];
          } else {
            delete store.garden[index];
          }
        } else {
          delete store.garden[index];
        }
      }
    });

    // Set the alarm if the garden isn't already empty (all lineages tend to an empty garden,
    // given enough ticks).
    const keys = Object.keys(store.garden);
    if (keys.length > 0) {
      await room.storage.setAlarm(new Date().getTime() + GARDEN_TICK);
    }
  },

  // For debug, dump the current state of the yDoc
  // When run locally, this can be seen at http://127.0.0.1:1999/party/shared-garden
  async onRequest(req, room) {
    const roomStorage = new YPartyKitStorage(room.storage);
    const ydoc = await roomStorage.getYDoc(room.id);

    if (req.method === "GET") {
      if (!ydoc) {
        return new Response("No ydoc yet", { status: 404 });
      }
      const map = ydoc.getMap("garden");
      return new Response(JSON.stringify(map.toJSON(), null, 2));
    }

    return new Response("Unsupported method", { status: 400 });
  },
} satisfies PartyKitServer;
