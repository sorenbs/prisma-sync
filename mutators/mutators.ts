import { Database } from "jsr:@db/sqlite@0.11";

export type ClientMessage = {
    mutationName: string
    args: unknown
}

export type BackendMessage = {
    updates: string[]
}

export class Mutators {
    db: Database

    constructor(db: Database) {
        this.db = db;
    }

    setupDbSchema() {
        // This stuff will be schema.prisma 🤩
        const result1 = this.db.prepare(`CREATE TABLE IF NOT EXISTS "Categories" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "name" TEXT NOT NULL, "count" INTEGER NOT NULL);`).value<[string]>()!;
        const result2 = this.db.prepare(`PRAGMA journal_mode=WAL`).value()!;
        const result3 = this.db.prepare(`PRAGMA wal_autocheckpoint=0;`).value()!;
        console.log(result3)
        return [result1, result2]
    }

    /**
     * 
     * This is an example of the Mutator functions developers will be writing.
     * This function demonstrates how it is safe to perform a read and then branch the writes based on data from the read as
     * all mutator executions are serialised on the server.
     * The final version of this will use Prisma for data access, and automatically track the executed DB writes. 
     */
    createCategoryOrIncrementIfExists(args: { name: string, incrementBy: number }) {
        const { name, incrementBy } = args
        const updates = []
        const category = this.db.prepare(`SELECT count FROM Categories WHERE name = ?`).value(name) // All of this will be Prisma queries, obviously 😅

        if (category) {
            updates.push(`UPDATE Categories SET count = ${category[0] as number + incrementBy} WHERE name = '${name}'`)
            this.db.prepare(`UPDATE Categories SET count = ? WHERE name = ?`).run(category[0] as number + incrementBy, name)
        } else {
            updates.push(`INSERT INTO Categories (name, count) VALUES ('${name}', ${incrementBy})`)
            this.db.prepare(`INSERT INTO Categories (name, count) VALUES (?, ?)`).run(name, incrementBy)
        }

        return updates;
    }
}

