# Frontend

This is an [angular](https://angular.io/) application. It doesn't run standalone but requires the built code from [shared](../shared) at build time and a working [backend](../backend) at runtime.

Please look in the [root readme](../README.md) for general information about how to start and develop the whole application.

### Code scaffolding

You can either use the [Angular CLI](https://angular.io/cli):

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|guard|module|web-worker `.

Or an extension:
[Angular Schematics (vscode)](https://marketplace.visualstudio.com/items?itemName=cyrilletuzi.angular-schematics).

## Architecture

For most, the frontend follows the [project file structure dictated by angular](https://angular.io/guide/file-structure).

We call Angular components, pipes, directives, services and modules "Angular elements".

In [src/app/state](./src/app/state) are all actions, reducers, selectors and state that are used by [NGRX](https://ngrx.io/).

In `src/app` and every descending folder the following guidelines apply:

-   `/core`:
    -   singleton-services and route guards that can be used by all other Angular elements that are direct or indirect children of the `core`'s parent-folder
-   `/shared`:
    -   utility Angular elements as well as classes, functions, types etc. that (can) have multiple instances and can be used by all other Angular elements that are direct or indirect children of the `shared`'s parent-folder
    -   every folder with Angular components, pipes or directives in a `shared`-folder should have it's own module, that exports these Angular elements
-   `/features`
    -   here are components/pipes/directives that should only be used in the `/pages`-folder at the same level (in opposite to `/shared` no nested folders)
-   `/pages`:
    -   in here all Angular elements and utilities located that are only used on the according route (-> lazy loading)

### State management

We are using [NGRX](https://ngrx.io/) for state management.
