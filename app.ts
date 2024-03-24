
/**
 * This is the entry point. All it does is broadcast messages from any client to the server. And from the server to all clients.
 * The server runs the mutator with the given arguments and then sends all executed SQL back to all connected clients.
 * Clients send mutator/argument pairs to the server, and executes SQL it receives back from the server.
 * 
 * In this model, clients only update their local DB after receiving the autoritative updates from the server.
 * This introduces delay, and requires the client to be online. We'll fix this in the next version.
 */

try {
    Deno.removeSync("server.db");
    Deno.removeSync("server.db-shm");
    Deno.removeSync("server.db-wal");
    Deno.removeSync("client1.db");
    Deno.removeSync("client1.db-shm");
    Deno.removeSync("client1.db-wal");
    Deno.removeSync("client2.db");
    Deno.removeSync("client2.db-shm");
    Deno.removeSync("client2.db-wal");
    Deno.removeSync("client3.db");
    Deno.removeSync("client3.db-shm");
    Deno.removeSync("client3.db-wal");
} catch {}


const backend = new Worker(import.meta.resolve("./backendWorker.ts"), { type: "module" });
const client1 = new Worker(import.meta.resolve("./clientWorker1.ts"), { type: "module" });
const client2 = new Worker(import.meta.resolve("./clientWorker2.ts"), { type: "module" });
const client3 = new Worker(import.meta.resolve("./clientWorker3.ts"), { type: "module" });

backend.onmessage = (e) => {
    console.log("APP forwarding message from Backend: " + e.data);
    client1.postMessage(e.data)
    client2.postMessage(e.data)
    client3.postMessage(e.data)
};

client1.onmessage = e => backend.postMessage(e.data);
client2.onmessage = e => backend.postMessage(e.data);
client3.onmessage = e => backend.postMessage(e.data);