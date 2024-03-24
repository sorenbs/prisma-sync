import { Database } from "jsr:@db/sqlite@0.11";
import { BackendMessage, ClientMessage, Mutators } from "./mutators/mutators.ts"

const db = new Database("client1.db");
const mutators = new Mutators(db)
mutators.setupDbSchema()

self.onmessage = (e: MessageEvent) => {
    const backendMessage = JSON.parse(e.data) as BackendMessage

    for (const stmt of backendMessage.updates) {
        db.run(stmt)
    }

    const result = db.prepare("select * FROM Categories").values<[string]>()!;
    console.log("CLIENT1: " + result);
};

setInterval(() => {
    const clientMessage = {
        mutationName: "createCategoryOrIncrementIfExists",
        args: { name: "Food", incrementBy: 1 }
    } as ClientMessage

    self.postMessage(JSON.stringify(clientMessage))
}, 1000)

console.log("CLIENT1 RUNNING");