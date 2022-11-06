import { Hono } from "hono";
export { Counter } from "./counter";

interface Env {
  COUNTER: DurableObjectNamespace;
}

const app = new Hono<{ Bindings: Env }>();

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
  const upgradeHeader = c.req.headers.get("Upgrade");
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }

  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();
  server.addEventListener("message", (event) => {
    console.log(event.data);
    server.send("anything");
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
});

export default app;
