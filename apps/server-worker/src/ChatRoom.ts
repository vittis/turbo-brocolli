import { Hono } from "hono";

interface Session {
  socket: WebSocket;
}

interface ChatMessage {
  senderName: string;
  body: string;
}

export class ChatRoom {
  sessions: Session[] = [];
  state: DurableObjectState;
  app: Hono = new Hono();
  messages: ChatMessage[] = [];
  lastTimestamp = 0;

  constructor(state: DurableObjectState) {
    this.state = state;

    /* this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage?.get<ChatMessage[]>("messages");
      this.messages = stored || [];
    }); */

    this.app.get("/chat/global", async (c) => {
      const upgradeHeader = c.req.headers.get("Upgrade");
      if (!upgradeHeader || upgradeHeader !== "websocket") {
        return new Response("Expected Upgrade: websocket", { status: 426 });
      }

      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      server.accept();

      this.sessions.push({ socket: server });

      let isReady = false;

      server.addEventListener("message", async (event) => {
        console.log("hi from global chat room ");

        if (event.data === "ready") {
          let storage = await this.state.storage.list({
            reverse: true,
            limit: 100,
          });
          let backlog = [...storage.values()];
          backlog.reverse();
          server.send(JSON.stringify(backlog));
          isReady = true;
          return;
        }

        const message = JSON.parse(event.data as string);
        message.timestamp = Math.max(Date.now(), this.lastTimestamp + 1);
        this.lastTimestamp = message.timestamp;

        const messageStr = JSON.stringify(message);

        this.sessions.forEach((session) => {
          session.socket.send(messageStr);
        });

        let key = new Date(message.timestamp).toISOString();
        await this.state.storage.put(key, messageStr);
      });

      server.addEventListener("close", () => {
        console.log("close from global chat room");
      });
      server.addEventListener("error", () => {
        console.log("close from global chat room");
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    });
  }

  async fetch(request: Request) {
    return this.app.fetch(request);
  }
}
