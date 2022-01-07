# digital-fuesim-manv

The official code for BP2021HG1.

## Installation

1. Install [NodeJs](https://nodejs.org/) (at least version 14.x)
2. [npm](https://www.npmjs.com/) should already come with NodeJs - if not install it
3. Clone this repository
4. Run `npm run setup` from the root folder

## Starting for development

### Option 1:

If you are using [vscode](https://code.visualstudio.com/), you can run the [task](https://code.visualstudio.com/docs/editor/tasks) `Start all` to start everything in one go.

### Option 2:

1. Open a terminal in `/shared` and run `npm run watch`
2. Open another terminal in `/frontend` and run `npm run start`
3. Open another terminal in `/backend` and run `npm run start`

## Debugging

There are already the following [debug configurations](https://code.visualstudio.com/docs/editor/debugging) for vscode saved:

-   [frontend] Launch Chrome against localhost
-   Debug Jest Tests

In addition you can make use of the following browser extensions:

-   [Angular DevTools](https://chrome.google.com/webstore/detail/angular-devtools/ienfalfjdbdpebioblfackkekamfmbnh)
-   [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension/) for [NgRx](https://ngrx.io/guide/store-devtools)

## Testing

### Unit tests

We are using [Jest](https://jestjs.io/) for our unit tests.

You can run it during development

-   from the terminal via `npm run test:watch` in the root, `/shared`, `/backend` or `/frontend` folder
-   or via the [recommended vscode extension](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest).

### End to end tests

We are using [cypress](https://www.npmjs.com/package/cypress) to run the end-to-end tests. You can find the code under `/frontend/cypress` in the repository.

#### Running the tests

To run the tests locally, it is recommended to use the vscode [task](https://code.visualstudio.com/docs/editor/tasks) `Start all & cypress`. Alternatively, you can start the frontend and backend manually and then run `npm run cy:open` in `/frontend`.

If you only want to check whether the tests pass, you can run `npm run cy:run` in `/frontend` instead.

#### Visual regression testing

We are also making use of visual regression tests via [cypress-image-diff](https://github.com/uktrade/cypress-image-diff).
The screenshots are stored under `/frontend/cypress-visual-screenshots`.

The `baseline` folder contains the reference screenshots (the desired result).
If a test fails a new screenshot is taken and put in the `comparison` folder.
If the new screenshot is the new desired result, then you only have to move it in the `baseline` folder and replace the old reference screenshot with the same name.
In the `diff` folder you can see the changes between the baseline and the comparison screenshot.

## Styleguide

-   names are never unique, ids are

# Architecture

This repository is a monorepo that consists of the following packages:

-   [frontend](./frontend) the browser-based client application ([Angular](https://angular.io/))
-   [backend](./backend) the server-side application (NodeJs)
-   [shared](./shared) the shared code that is used by both frontend and backend

One server can host multiple _exercises_. Mutiple clients can join an exercise. A client can only join one exercise at a time.

## State management and synchronisation

This is a realtime application.

Each client is connected to the server via a [websocket connection](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API). This means you can send and listen for events over a two-way communication channel.
Via [socket.io](https://socket.io/docs) it is also possible to make use of a more classic request-response API via [acknowledgments](https://socket.io/docs/v4/emitting-events/#acknowledgements).

### State, actions and reducers

We borrow these core concepts from [Redux](https://redux.js.org/).

#### What is an immutable JSON object?

A JSON object is an object whose properties are only the primitives `string`, `number`, `boolean` or `null` or another JSON object or an array of any of these (only state - no `functions`).
Any object reference can't occur more than once anywhere in a JSON object (including nested objects). This means especially that no circular references are possible.

[An immutable object is an object whose state cannot be modified after it is created](https://en.wikipedia.org/wiki/Immutable_object). In the code immutability is conveyed via typescripts [readonly](https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties) and the helper type `Immutable<T>`.

#### State

A state is an immutable JSON object. Each client as well as the server has a global state for an exercise. The single point of truth for all states of an exercise is the server. All these states should be synchronized.

You can find the exercise state [here](./shared/src/state.ts).

#### Action

An action is an immutable JSON object that describes what should change in a state. The changes described by each action are [atomic](<https://en.wikipedia.org/wiki/Atomicity_(database_systems)>) - this means either all or none of the changes described by an action are applied.

Actions cannot be applied in parallel. The order of actions is important.

It is a bad practice to encode part of the state in the action (or values derived/calculated from it). Instead, you should only read the state in the accompanying reducer.

You can find all exercise actions [here](./shared//src/store/exercise.actions.ts).

#### Reducer

A reducer is a [pure function](https://en.wikipedia.org/wiki/Pure_function) (no side effects!) that takes a state and an action of a specific type and returns a new state where the changes described in the action are applied. A state can only be modified by a reducer.

To be able to apply certain optimizations, it is advisable (but not necessary or guaranteed) that the reducer only changes the references of properties that have been changed.

You can find all exercise reducers [here](./shared/src/store/exercise.reducer.ts).

### Immutability

It isn't necessary to copy the whole immutable object by value if it should be updated. Instead, only the objects that were modified should be shallow copied recursively. [Immer](https://immerjs.github.io/immer/) provides a simple way to do this.

Because the state is immutable and reducers (should) only update the properties that have changed, you can short circuit in comparisons between immutable objects, if the references of objects in a property are equal. Therefore it is very performant to compare two states in the same context.

To save a state it is enough to save its reference. Therefore it is very performant as well.
If the state would have to be changed, a new reference is created as the state is immutable.

### Large values (WIP)

Large values (images, large text, binary, etc.) are not directly stored in the state. Instead, the store only contains UUIDs that identify the blob. The blob can be retrieved via a separate (yet to be implemented) REST API.

The blob that belongs to a UUID cannot be changed or deleted while the state is still saved on the server. To change a blob, a new one should be uploaded and the old UUID in the state replaced with the new one.

If an action would add a new blobId to the state, the blob should have previously been uploaded to the server.

A blob should only be downloaded on demand (lazy) and cached.

### Synchronisation

1. A client gets a snapshot of the state from the server via `getState`.
2. Any time an action is applied on the server, it is sent to all clients via `performAction` and applied on them too. Due to the maintained packet ordering via a websocket and the fact that the backend works single-threaded, it is impossible for a client to receive actions out of order or receive actions already included in the state received by `getState`. 
3. A client can propose an action to the server via `proposeAction`.
4. If the proposal was accepted, the action is applied on the server and sent to all clients via `performAction`.
5. The server responds to a proposal with a response that indicates a success or rejection via an [acknowledgment](https://socket.io/docs/v4/emitting-events/#acknowledgements). A successful response is always sent after the `performAction` was broadcasted.

### Optimistic updates

A consequence of the synchronization strategy described before is that it takes one roundtrip from the client to the server and back to get the correct state on the client that initiated the action. This can lead to a bad user experience because of high latency.

This is where optimistic updates come into play. We just assume optimistically that the proposed action will be applied on the server. Therefore we can apply the action on the client directly without waiting for a `performAction` from the server.

If the server rejects the proposal or a race condition occurs, the client corrects its state again.
In our case the [optimisticActionHandler](./frontend/src/app/core/optimistic-action-handler.ts) encapsulates this functionality.

The state in the frontend is not guaranteed to be correct. It is only guaranteed to automatically correct itself.

If you need to read from the state to change it, you should do this inside the action reducer because the `currentState` passed into a reducer is always guaranteed to be correct.

### Performance considerations

-   Do _not_ save a very large JS primitve (a large string like a base64 encoded image) in a part of the state that is often modified (like the root). This primitive would be copied on each change. Instead, the primitive should be saved as part of a separate object. This makes use of the performance benefits of shallow copies.
-   Currently, every client maintains the whole state, and every action is sent to all clients. There is no way to only subscribe to a part of the state and only receive updates for that part.
