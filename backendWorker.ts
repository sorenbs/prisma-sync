import { Database } from "jsr:@db/sqlite@0.11";
import { ClientMessage, Mutators } from "./mutators/mutators.ts";

const db = new Database("server.db");
const mutators = new Mutators(db)
mutators.setupDbSchema()
// mutators.createCategoryOrIncrementIfExists({ name: "Food", incrementBy: 1 })

self.onmessage = (e: MessageEvent) => {

    const data = JSON.parse(e.data) as ClientMessage

    if (data.mutationName == "createCategoryOrIncrementIfExists") {
        const updates = mutators.createCategoryOrIncrementIfExists(data.args as { name: string; incrementBy: number; })
        const backendMessage = { updates }
        self.postMessage(JSON.stringify(backendMessage))
    }

    const result = db.prepare("select * FROM Categories").values<[string]>()!;
    console.log("BACKEND: " + result);
};

console.log("BACKEND RUNNING");