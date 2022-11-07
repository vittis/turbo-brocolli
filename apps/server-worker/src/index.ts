import { Hono } from "hono";
import ShortUniqueId from "short-unique-id";
export { Counter } from "./counter";
export { Lobby } from "./lobby";
import { logger } from "hono/logger";

interface Env {
  COUNTER: DurableObjectNamespace;
  LOBBY: DurableObjectNamespace;
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());

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

export default app;
