# digital-fuesim-manv

The official code for BP2021HG1.

## Installation

1. Install [NodeJs](https://nodejs.org/) (at least version 14.x)
2. [npm](https://www.npmjs.com/) should already come with NodeJs - if not install it
3. Clone this repository
4. Either a or b:

    a) Run `npm run install:all` in the root folder
    b) Run `npm install` in the root directory, `/frontend`, `/shared` and `/backend`

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

We are using [Jest](https://jestjs.io/) for our unit tests.

You can run it during development

-   from the terminal via `npm run test:watch` in the root, `/shared`, `/backend` or `/frontend` folder
-   or via the [recommended vscode extension](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest).

## Styleguide

-   names are never unique, ids are

# Architecture

This repository is a monorepo that consists of the following packages:

-   [frontend](./frontend) the browser based client application ([Angular](https://angular.io/))
-   [backend](./backend) the server side application (NodeJs)
-   [shared](./shared) the shared code that is used by both frontend and backend

One Server can host multiple _exercises_. Mutiple clients can join an exercise. A client can only join one exercise at a time.

## State management and synchronisation

This is a realtime application.

Each client is connected to the server via a [websocket connection](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API). This means you can send and listen for events over a two way communication channel.
Via [socket.io](https://socket.io/docs) it is also possible to make use of a more classic request-response API via [acknowledgements](https://socket.io/docs/v4/emitting-events/#acknowledgements).

### State, actions and reducers

We borrow these core concepts from [Redux](https://redux.js.org/).

#### What is an immutable JSON object?

A JSON object is an object whose properties are only the primitives `string`, `number`, `boolean` or `null` or another JSON object or an array of any of these (only state - no `functions`).
Any object reference can't occur more than once anywhere in an JSON object (including nested objects). This means especially that no circular references are possible.

[An immutable object is an object whose state cannot be modified after it is created](https://en.wikipedia.org/wiki/Immutable_object).

#### State

A state is an immutable JSON object. Each client as well as the server has a global state for an exercise. The single point of truth for all states of an exercise is the server. All these states should be synchronised.

You can find the exercise state [here](./shared/state.ts).

#### Action

An action is an immutable JSON object that describes what should be changed in a state. The changes described by each action are [atomic](<https://en.wikipedia.org/wiki/Atomicity_(database_systems)>) - this means either all the changes described by an action occur or nothing at all.

Actions can not be applied in parallel. The order of actions is important.

You can find all exercise actions [here](./shared/store/exercise.actions.ts).

#### Reducer

A reducer is a [pure function](https://en.wikipedia.org/wiki/Pure_function) (no side effects!) that takes a state and an action of an specific type and returns a new state where the changes described in the action are applied. A state can only be modified by a reducer.
It is advisable (but not guaranteed) that the reducer only changes the references of properties that have been changed.

You can find all exercise reducers [here](./shared/store/exercise.reducer.ts).

### Immutability

Because the state is immutable and reducers (should) only update the properties that have changed, it is very performant to compare two states in the same context, because can short circuit in comparisons between immutable objects, if the references of objects in a property are equal.
It is also very performant to save a state, because we can just save a reference to a state to save it. If the state would have to be changed, a new reference is created, because the state is immutable.

### Synchronisation

1. A client gets a snapshot of the state from the server via `getState`.
2. Always, when an action is applied on the server, it is send to all clients via `performAction` and applied on them too.
3. A client can propose an action to the server via `proposeAction`.
4. The server responds directly to this proposal with a response that indicates a success or rejection via an [acknowledgement](https://socket.io/docs/v4/emitting-events/#acknowledgements).
5. If the proposal was accepted, the action is applied on the server and send to all clients via `performAction`.

### Optimistic updates

A consequence of the synchronisation strategy described before is that it takes one roundtrip from the client to the server and back to get the correct state on the client that initiated the action. This can lead to a bad user experience, because of high latency.

This is where optimistic updates come into play. We just assume optimistically that the proposed action will be applied on the server. Therefore we can apply the action on the client directly without waiting for a `performAction` from the server.

If the server rejects the proposal or one of various race conditions applies, the client corrects its state again.
In our case the [optimisticActionHandler](./frontend/src/app/core/optimistic-action-handler.ts) encapsulates this functionality.
