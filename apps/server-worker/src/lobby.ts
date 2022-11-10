import { Hono } from "hono";
import { uniqueNamesGenerator, starWars } from "unique-names-generator";

interface Session {
  name: string;
  socket: WebSocket;
}

export class Lobby {
  sessions: { [id: string]: Session } = {};
  state: DurableObjectState;
  app: Hono = new Hono();

  constructor(state: DurableObjectState) {
    this.state = state;

    this.app.get("/lobby/members", async (c) => {
      return c.json(this.sessions);
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
      this.sessions[id] = { socket: server, name };

      // broadcast new connection joined
      this.broadcastMembersInfo({ excludeId: id });

      server.addEventListener("close", () => {
        console.log("close");
        delete this.sessions[id];
        this.broadcastMembersInfo();
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
          server.send(JSON.stringify(event));
          // server.broadcast
        }
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    });
  }

  /* broadcast(event: any) {
    Object.keys(this.sessions).forEach((sessionId) => {
      this.sessions[sessionId].socket.send(JSON.stringify(event));
    });
  } */

  broadcastMembersInfo({ excludeId = "" } = {}) {
    Object.keys(this.sessions).forEach((sessionId) => {
      if (excludeId === sessionId) {
        return;
      }
      const event = {
        eventName: "receiveMembersInfo",
        payload: { sessions: this.sessions },
      };
      this.sessions[sessionId].socket.send(JSON.stringify(event));
    });
  }

  async fetch(request: Request) {
    return this.app.fetch(request);
  }
}
