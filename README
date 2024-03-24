# Rebasing

The sync mechanism works by rebasing remote changes onto local changes. Specifically that means:

1. Remote changes are received
2. Any local changes newer than the remote change is temporarily undone
3. Remote changes are applied
4. pending local changes are re-applied

This is currently implemented using SQLite `Savepoints`, which works because the demo app doesn't use explicit transactions. We will need a different mechanism for a real implementation - perhaps based on a custom VFS that can cheaply remove any pending statements in the wal file.

# The test setup

The file `mutators/mutators.ts` holds the named mutators provided by the application developer. It is shared between all clients and the sync server. The test app has only one named mutator called `createCategoryOrIncrementIfExists`.

This test setup has 3 clients that behave in the following way:

- **client1**: sends an "increment by 1" command every second, with a simulated 3 second network latency. Stops after 10 commands
- **client2**: sends an "decrement by 3" command every 4 seconds, with a simulated 300ms network latency. Stops after 3 commands
- **client3**: doesn't send any commands

As you can see, we expect the end result to be a single row with the values `(id = 1, name = "Food", count = 1)`, and we expect all three clients and the server to converge to this result.

# Transcript

This is a transcript of running the test setup:

```
[ 0 ]
[ 0 ]
[ 0 ]
[ 0 ]
BACKEND RUNNING
client3 RUNNING
client1 RUNNING
client2 RUNNING
BACKEND: 1,Food,1
APP forwarding message from Backend: {"updates":["INSERT INTO Categories (name, count) VALUES ('Food', 1)"],"latestSequenceNumbers":{"client1":0}}
client1 Processing local message: 1 which is ahead of server 0
client2: 1,Food,1
client1 Processing local message: 2 which is ahead of server 0
client1 Processing local message: 3 which is ahead of server 0
client3: 1,Food,1
client1: 1,Food,4
BACKEND: 1,Food,-2
APP forwarding message from Backend: {"updates":["UPDATE Categories SET count = -2 WHERE name = 'Food'"],"latestSequenceNumbers":{"client1":0,"client2":0}}
client3: 1,Food,-2
client2: 1,Food,-2
client1 Processing local message: 1 which is ahead of server 0
client1 Processing local message: 2 which is ahead of server 0
client1 Processing local message: 3 which is ahead of server 0
client1: 1,Food,1
BACKEND: 1,Food,-1
APP forwarding message from Backend: {"updates":["UPDATE Categories SET count = -1 WHERE name = 'Food'"],"latestSequenceNumbers":{"client1":1,"client2":0}}
client2: 1,Food,-1
client3: 1,Food,-1
client1 Processing local message: 2 which is ahead of server 1
client1 Processing local message: 3 which is ahead of server 1
client1 Processing local message: 4 which is ahead of server 1
client1: 1,Food,2
BACKEND: 1,Food,0
APP forwarding message from Backend: {"updates":["UPDATE Categories SET count = 0 WHERE name = 'Food'"],"latestSequenceNumbers":{"client1":2,"client2":0}}
client1 Processing local message: 3 which is ahead of server 2
client1 Processing local message: 4 which is ahead of server 2
client1 Processing local message: 5 which is ahead of server 2
client1: 1,Food,3
client2: 1,Food,0
client3: 1,Food,0
BACKEND: 1,Food,1
APP forwarding message from Backend: {"updates":["UPDATE Categories SET count = 1 WHERE name = 'Food'"],"latestSequenceNumbers":{"client1":3,"client2":0}}
client1 Processing local message: 4 which is ahead of server 3
client1 Processing local message: 5 which is ahead of server 3
client3: 1,Food,1
client1 Processing local message: 6 which is ahead of server 3
client2: 1,Food,1
client1: 1,Food,4
APP forwarding message from Backend: {"updates":["UPDATE Categories SET count = 2 WHERE name = 'Food'"],"latestSequenceNumbers":{"client1":4,"client2":0}}
BACKEND: 1,Food,2
client2 Processing local message: 1 which is ahead of server 0
client2: 1,Food,-1
client1 Processing local message: 5 which is ahead of server 4
client1 Processing local message: 6 which is ahead of server 4
client1 Processing local message: 7 which is ahead of server 4
client1: 1,Food,5
client3: 1,Food,2
APP forwarding message from Backend: {"updates":["UPDATE Categories SET count = -1 WHERE name = 'Food'"],"latestSequenceNumbers":{"client1":4,"client2":1}}
BACKEND: 1,Food,-1
client2: 1,Food,-1
client1 Processing local message: 5 which is ahead of server 4
client1 Processing local message: 6 which is ahead of server 4
client1 Processing local message: 7 which is ahead of server 4
client1: 1,Food,2
client3: 1,Food,-1
APP forwarding message from Backend: {"updates":["UPDATE Categories SET count = 0 WHERE name = 'Food'"],"latestSequenceNumbers":{"client1":5,"client2":1}}
BACKEND: 1,Food,0
client3: 1,Food,0
client1 Processing local message: 6 which is ahead of server 5
client1 Processing local message: 7 which is ahead of server 5
client1 Processing local message: 8 which is ahead of server 5
client1: 1,Food,3
client2: 1,Food,0
BACKEND: 1,Food,1
APP forwarding message from Backend: {"updates":["UPDATE Categories SET count = 1 WHERE name = 'Food'"],"latestSequenceNumbers":{"client1":6,"client2":1}}
client1 Processing local message: 7 which is ahead of server 6
client1 Processing local message: 8 which is ahead of server 6
client2: 1,Food,1
client1 Processing local message: 9 which is ahead of server 6
client1: 1,Food,4
client3: 1,Food,1
BACKEND: 1,Food,2
APP forwarding message from Backend: {"updates":["UPDATE Categories SET count = 2 WHERE name = 'Food'"],"latestSequenceNumbers":{"client1":7,"client2":1}}
client3: 1,Food,2
client1 Processing local message: 8 which is ahead of server 7
client1 Processing local message: 9 which is ahead of server 7
client1: 1,Food,4
client2: 1,Food,2
APP forwarding message from Backend: {"updates":["UPDATE Categories SET count = 3 WHERE name = 'Food'"],"latestSequenceNumbers":{"client1":8,"client2":1}}
BACKEND: 1,Food,3
client3: 1,Food,3
client2 Processing local message: 2 which is ahead of server 1
client1 Processing local message: 9 which is ahead of server 8
client2: 1,Food,0
client1: 1,Food,4
APP forwarding message from Backend: {"updates":["UPDATE Categories SET count = 0 WHERE name = 'Food'"],"latestSequenceNumbers":{"client1":8,"client2":2}}
BACKEND: 1,Food,0
client1 Processing local message: 9 which is ahead of server 8
client2: 1,Food,0
client3: 1,Food,0
client1: 1,Food,1
APP forwarding message from Backend: {"updates":["UPDATE Categories SET count = 1 WHERE name = 'Food'"],"latestSequenceNumbers":{"client1":9,"client2":2}}
BACKEND: 1,Food,1
client3: 1,Food,1
client1: 1,Food,1
client2: 1,Food,1
```

As you can see, the clients have diverging views of the world during the execution, due to network latency. But when everything settles down in the end, they all end up with the same result: `(id = 1, name = "Food", count = 1)`.