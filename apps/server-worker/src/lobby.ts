import { Hono } from "hono";
import { uniqueNamesGenerator, starWars } from "unique-names-generator";

interface Session {
  name: string;
  socket: WebSocket;
  id: string;
}

interface GameRoom {
  id: string;
  hostId: string;
  members: Session[];
}

export class Lobby {
  sessions: { [id: string]: Session } = {};
  state: DurableObjectState;
  app: Hono = new Hono();
  rooms: GameRoom[] = [];

  constructor(state: DurableObjectState) {
    this.state = state;

    this.app.get("/lobby/members", async (c) => {
      return c.json(this.sessions);
    });

    this.app.get("/lobby/rooms", async (c) => {
      return c.json(this.rooms);
    });

    this.app.get("/socket", async (c) => {
      const upgradeHeader = c.req.headers.get("Upgrade");
      if (!upgradeHeader || upgradeHeader !== "websocket") {
        return new Response("Expected Upgrade: websocket", { status: 426 });
      }

      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      server.accept();

      const id = self.crypto.randomUUID();
      const name = uniqueNamesGenerator({
        dictionaries: [starWars],
      });
      this.sessions[id] = { socket: server, name, id };
      let isReady = false;

      // broadcast new connection joined
      this.broadcastMembersInfo({ excludeId: id });

      server.addEventListener("close", () => {
        console.log("close");
        delete this.sessions[id];
        this.broadcastMembersInfo();

        const room = this.rooms.find((room) => room.hostId === id);
        if (!room) return;
        // todo check if there're members, remove member individually
        this.rooms = this.rooms.filter((room) => room.hostId !== id);
      });
      server.addEventListener("error", () => {
        console.log("error");
        delete this.sessions[id];
        this.broadcastMembersInfo();
      });

      server.addEventListener("message", (event) => {
        console.log("received message: ", event.data);
        if (event.data === "askInfo") {
          const event = {
            eventName: "receiveInfo",
            payload: {
              name,
              id,
              sessions: this.sessions,
            },
          };
          isReady = true;
          server.send(JSON.stringify(event));
          return;
          // server.broadcast
        }

        if (event.data === "askCreateRoom") {
          const roomId = self.crypto.randomUUID();
          const room: GameRoom = {
            hostId: id,
            id: roomId,
            members: [this.sessions[id]],
          };
          this.rooms.push(room);

          const event = {
            eventName: "receiveRooms",
            payload: { rooms: this.rooms },
          };

          this.broadcast(event);

          return;
        }
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    });
  }

  broadcast(event: any) {
    const keys = Object.keys(this.sessions);
    for (let i = 0; i < keys.length; i++) {
      this.sessions[keys[i]].socket.send(JSON.stringify(event));
    }
  }

  broadcastMembersInfo({ excludeId = "" } = {}) {
    const keys = Object.keys(this.sessions);
    for (let i = 0; i < keys.length; i++) {
      if (excludeId === keys[i]) {
        return;
      }
      const event = {
        eventName: "receiveMembersInfo",
        payload: { sessions: this.sessions },
      };
      this.sessions[keys[i]].socket.send(JSON.stringify(event));
    }
  }

  async fetch(request: Request) {
    return this.app.fetch(request);
  }
}
