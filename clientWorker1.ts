import { Database } from "jsr:@db/sqlite@0.11";
import { BackendMessage, ClientMessage, Mutators } from "./mutators/mutators.ts"

let clientId = "client1"
let db = new Database(`${clientId}.db`);
let mutators = new Mutators(db)
mutators.setupDbSchema()

const clientMessages = new Array<ClientMessage>()
let sequence = 0

db.exec("SAVEPOINT rebase")

self.onmessage = (e: MessageEvent) => {
    const backendMessage = JSON.parse(e.data) as BackendMessage

    // Below is the rebase algorithm in 3 steps

    // Step 1: delete any local changes.

    db.exec("ROLLBACK TO SAVEPOINT rebase")

    // Step 2: apply all remote changes

    for (const stmt of backendMessage.updates) {
        db.run(stmt)
    }

    // Step 3: apply any local changes that are newer than remote changes

    db.exec("SAVEPOINT rebase")

    const latestCommittedSequenceNumber = backendMessage.latestSequenceNumbers[clientId] || 0 as number
    const localMessagesToProcess = clientMessages.filter(x => x.sequenceNumber > latestCommittedSequenceNumber)
    for (const messageToProcess of localMessagesToProcess) {
        console.log(`${clientId} Processing local message: ${messageToProcess.sequenceNumber} which is ahead of server ${latestCommittedSequenceNumber}`)
        mutators.createCategoryOrIncrementIfExists(messageToProcess.args as { name: string; incrementBy: number; })
    }


    const result = db.prepare("select * FROM Categories").values<[string]>()!;
    console.log(`${clientId}: ` + result);
};

let inervalCount = 0
const interval = setInterval(() => {
    const clientMessage = {
        mutationName: "createCategoryOrIncrementIfExists",
        args: { name: "Food", incrementBy: 1 },
        sequenceNumber: sequence,
        clientId: clientId
    } as ClientMessage

    sequence++
    clientMessages.push(clientMessage)

    // optimistic update
    mutators.createCategoryOrIncrementIfExists(clientMessage.args as { name: string; incrementBy: number; })

    // simulating network latency
    setTimeout(() => {
        self.postMessage(JSON.stringify(clientMessage))
    }, 3000)

    if(inervalCount++ >= 9) {
        clearInterval(interval)
    }
    

}, 1000)

console.log(`${clientId} RUNNING`);