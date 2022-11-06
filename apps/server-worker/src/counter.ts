import { Hono } from "hono";

export class Counter {
  value: number = 0;
  state: DurableObjectState;
  app: Hono = new Hono();

  constructor(state: DurableObjectState) {
    this.state = state;
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage?.get<number>("value");
      this.value = stored || 0;
    });

    this.app.get("/counter/increment", async (c) => {
      const currentValue = ++this.value;
      await this.state.storage?.put("value", this.value);
      return c.text(currentValue.toString());
    });

    this.app.get("/counter/decrement", async (c) => {
      const currentValue = --this.value;
      await this.state.storage?.put("value", this.value);
      return c.text(currentValue.toString());
    });

    this.app.get("/counter", async (c) => {
      return c.text(this.value.toString());
    });
  }

  async fetch(request: Request) {
    return this.app.fetch(request);
  }
}
