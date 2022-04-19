# digital-fuesim-manv

The official code for BP2021HG1

You can find the (internal) documentation for this project [here](https://github.com/hpi-sam/BP2021HG1).

The (internal) project-board is [here](https://github.com/orgs/hpi-sam/projects/4).

## Installation

1. Make sure to have [git lfs](https://git-lfs.github.com/) installed.
2. Install [NodeJs](https://nodejs.org/) (at least version 16.x) (if you need different node versions on your machine we recommend [nvm](https://github.com/nvm-sh/nvm) or [nvm for windows](https://github.com/coreybutler/nvm-windows))
3. [npm](https://www.npmjs.com/) should already come with NodeJs - if not install it
4. Clone this repository
5. Run `npm run setup` from the root folder
6. (Optional) We have a list of recommended [vscode](https://code.visualstudio.com/) extensions. We strongly recommend you to use them if you are developing. You can see them via [the `@recommended` filter in the extensions panel](https://code.visualstudio.com/docs/editor/extension-marketplace#_recommended-extensions).

## Starting for development

### Option 1:

If you are using [vscode](https://code.visualstudio.com/), you can run the [task](https://code.visualstudio.com/docs/editor/tasks) `Start all` to start everything in one go.

### Option 2:

1. Open a terminal in `/shared` and run `npm run watch`
2. Open another terminal in `/frontend` and run `npm run start`
3. Open another terminal in `/backend` and run `npm run start`

## Starting for deployment (using docker)

You need to have [`docker`](https://www.docker.com/) installed.

### With docker-compose (recommended)

1. [`docker-compose`](https://docs.docker.com/compose/) needs to be installed.
2. Run `docker-compose up -d` in the root directory.

### Without docker-compose

1. Execute `docker run -p -d 80:80 digitalfuesimmanv/dfm`.

The server will start listening using nginx on port `80` for all services (frontend, API, WebSockets).

### Building the container from scratch

#### Option 1

1. Uncomment the build section of [the docker-compose file](./docker-compose.yml).
2. Run `docker-compose build`

#### Option 2

1. Run `docker build -f docker/Dockerfile -t digital-fuesim-manv .`

## Before you commit

-   We are using [git lfs](https://git-lfs.github.com/). You can see the file types that currently use git lfs in [.gitattributes](.gitattributes). If you add another binary (or very large) file type to the repository you should add it there too.
-   To see the images stored in [git lfs](https://git-lfs.github.com/) in diff views in vscode we recommend running the following command once: `git config diff.lfs.textconv cat`.
-   We are using [prettier](https://prettier.io/) as our code formatter. Run it via `npm run prettier` in the root to format all files and make the CI happy. Please use the [vscode extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).
-   We are using [eslint](https://eslint.org/) as our linter. Run it via `npm run lint:fix` in the root to lint (and auto fix if possible) all files. Please use the [vscode extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

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
-   private properties that may be used with getters/setters (and only those!) start with one leading underscore (`_`)
-   `dependencies` should be used for packages that must be installed when running the app (e.g. `express`), whereas `devDependencies` should be used for packages only required for developing, debugging, building, or testing (e.g. `jest`), which includes all `@types` packages. We try to follow this route even for the frontend and the backend, although it is not important there. See also [this](https://stackoverflow.com/a/22004559) answer on StackOverflow for more information about the differences.
-   Use JSDoc features for further documentation because editors like VSCode can display them better.
    -   Be aware that JSDoc comments must always go above the Decorator of the class/component/function/variable etc.
    ```ts
    /**
     * Here is a description of the class/function/variable/etc.
     *
     * @param myParam a description of the parameter
     * @returns a nice variable that is bigger than {@link myVariable}
     * @throws myError when something goes wrong
     */
    ```
-   You should use the keyword `TODO` to mark things that need to be done later. Whether an issue should be created is an individual decision.

# Architecture

This repository is a monorepo that consists of the following packages:

-   [frontend](./frontend) the browser-based client application ([Angular](https://angular.io/))
-   [backend](./backend) the server-side application ([NodeJs](https://nodejs.org/))
-   [shared](./shared) the shared code that is used by both frontend and backend

Each package has its own `README.md` file with additional documentation. Please check them out before you start working on the project.

One server can host multiple _exercises_. Multiple clients can join an exercise. A client can only join one exercise at a time.

## State management and synchronization

This is a real-time application.

Each client is connected to the server via a [WebSocket connection](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API). This means you can send and listen for events over a two-way communication channel.
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

#### Reducer

A reducer is a [pure function](https://en.wikipedia.org/wiki/Pure_function) (no side effects!) that takes a state and an action of a specific type and returns a new state where the changes described in the action are applied. A state can only be modified by a reducer.

To be able to apply certain optimizations, it is advisable (but not necessary or guaranteed) that the reducer only changes the references of properties that have been changed.

You can find all exercise actions and reducers [here](./shared/src/store/action-reducers). Please orient yourself on the already implemented actions, and don't forget to register them in [shared/src/store/action-reducers/action-reducers.ts](shared/src/store/action-reducers/action-reducers.ts)

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
2. Any time an action is applied on the server, it is sent to all clients via `performAction` and applied to them too. Due to the maintained packet ordering via a WebSocket and the fact that the synchronization of the state in the backend works synchronously, it is impossible for a client to receive actions out of order or receive actions already included in the state received by `getState`.
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

## Licenses and Attributions

-   License information about used images can be found [here](frontend/src/assets/image-sources.md). All images are licensed under their original license.
