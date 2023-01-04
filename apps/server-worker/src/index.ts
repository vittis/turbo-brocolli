import { Hono } from "hono";
import { logger } from "hono/logger";

/* durable objects exports */
export { Counter } from "./counter";
export { Lobby } from "./lobby";
export { ChatRoom } from "./ChatRoom";

interface Env {
  COUNTER: DurableObjectNamespace;
  LOBBY: DurableObjectNamespace;
  CHAT_ROOM: DurableObjectNamespace;
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());

app.get("/lobby/*", async (c) => {
  const id = c.env.LOBBY.idFromName("Lobby");
  const obj = c.env.LOBBY.get(id);
  return await obj.fetch(c.req);
});

app.get("/counter/*", async (c) => {
  const id = c.env.COUNTER.idFromName("A");
  const obj = c.env.COUNTER.get(id);
  const resp = await obj.fetch(c.req.url);

  if (resp.status === 404) {
    return c.text("404 Not Found", 404);
  }

  const count = parseInt(await resp.text());
  return c.text(`Count is ${count}`);
});

app.get("/socket", async (c) => {
  const id = c.env.LOBBY.idFromName("Lobby");
  const obj = c.env.LOBBY.get(id);
  const resp = await obj.fetch(c.req);

  return resp;
});

app.get("/chat/global", async (c) => {
  const id = c.env.CHAT_ROOM.idFromName("global");
  const obj = c.env.CHAT_ROOM.get(id);
  const resp = await obj.fetch(c.req);

  return resp;
});

export default app;
