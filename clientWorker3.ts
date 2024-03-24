import { Database } from "jsr:@db/sqlite@0.11";
import { BackendMessage, Mutators } from "./mutators/mutators.ts"

const db = new Database("client3.db");
const mutators = new Mutators(db)
mutators.setupDbSchema()

self.onmessage = (e: MessageEvent) => {
    const backendMessage = JSON.parse(e.data) as BackendMessage

    for (const stmt of backendMessage.updates) {
        db.run(stmt)
    }

    const result = db.prepare("select * FROM Categories").values<[string]>()!;
    console.log("CLIENT3: " + result);
};

console.log("CLIENT3 RUNNING");