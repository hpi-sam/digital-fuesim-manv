# Frontend

This is an [angular](https://angular.io/) application. It doesn't run standalone but requires the built code from [shared](../shared) at build time and a working [backend](../backend) at runtime.

Please look in the [root readme](../README.md) for general information about how to start and develop the whole application.

### Code scaffolding

You can either use the [Angular CLI](https://angular.io/cli):

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|guard|module|web-worker `.

Or an extension:
[Angular Schematics (vscode)](https://marketplace.visualstudio.com/items?itemName=cyrilletuzi.angular-schematics).

## Environments

You can build the application with different [application environments](https://angular.io/guide/build).

Keep in mind that it is also possible to add a [proxy](https://angular.io/guide/build#proxying-to-a-backend-server) during development if you want to change e.g. the backend URL.

## Style guide

### CSS

-   We are using [bootstrap](https://getbootstrap.com) as a style framework.
-   Where should I put my CSS? (Guideline)
    1. Use bootstrap classes whenever possible (look at the [utility classes](https://getbootstrap.com/docs/5.0/utilities/api/)).
    2. If you can reuse the styling, add a class to the [style.scss](./src/styles.scss) (or the component's-`.scss` if it's only used there).
    3. If the styling is custom and only applicable to one specific element, use inline CSS.
    4. If the inline styling is very big, complicated, or makes use of any SCSS or advanced CSS not applicable to inline styles, put it into the component's SCSS file.
    -   See also [bootstraps best practices](https://getbootstrap.com/docs/5.0/extend/approach/#summary).

### Templates

-   Order of attributes in the Angular templates

    -   As long as eslint doesn't have [a lint rule for it](https://github.com/angular-eslint/angular-eslint/pull/605) it is just encouraged to use the following order of attributes.

    1. structural directive (e.g. `*ngIf`)
    2. template reference (e.g. `#myId`)
    3. inputs (e.g. `[myInput]`)
    4. two way binding/banana in the box (e.g. `[(myBanana)]`)
    5. Outputs (e.g. `(onChange)`)
    6. Directives (e.g. `[myDirective]`, `[class.my_class]`, `[ngStyle]`, `[attr.myAttr]`)
    7. `class` attribute
    8. `style` attribute
    9. other attributes (e.g. `href`, `type`)

## Libraries

-   [bootstrap](https://getbootstrap.com) - A styling framework
    -   [Documentation](https://getbootstrap.com/docs)
    -   [Cheatsheet](https://getbootstrap.com/docs/5.1/examples/cheatsheet/)
-   [ngBootstrap](https://ng-bootstrap.github.io/) - Angular components for bootstrap
    -   [Documentation](https://ng-bootstrap.github.io/#/components/accordion/examples)
-   [openlayers](https://openlayers.org/) - A library for displaying maps
    -   [Introduction](https://openlayers.org/workshop/en/)
    -   [API docs](https://openlayers.org/en/latest/apidoc/)
    -   [Examples](https://openlayers.org/en/latest/examples/)
-   [lodash-es](https://lodash.com/) - A utility library for common JS tasks
    -   [Documentation](https://lodash.com/docs)
-   [rxjs](https://rxjs-dev.firebaseapp.com/) - A library for reactive programming (= observer pattern on steroids)
    -   [Glossar](https://rxjs-dev.firebaseapp.com/guide/glossary-and-semantics)
    -   [Operator Decision Tree](https://rxjs-dev.firebaseapp.com/operator-decision-tree)
    -   [Operators](https://rxjs.dev/api?query=operators)
-   [NGRX](https://ngrx.io/) - A library for state management

## Architecture

For most, the frontend follows the [project file structure dictated by angular](https://angular.io/guide/file-structure).

We call Angular components, pipes, directives, services, and modules "Angular elements".

In [src/app/state](./src/app/state) are all actions, reducers, selectors and state that are used by [NGRX](https://ngrx.io/).

In `src/app` and every descending folder the following guidelines apply:

-   `/core`:
    -   singleton-services and route guards that can be used by all other Angular elements that are direct or indirect children of the `core`'s parent-folder
-   `/shared`:
    -   utility Angular elements as well as classes, functions, types, etc. that (can) have multiple instances and can be used by all other Angular elements that are direct or indirect children of the `shared`'s parent-folder
    -   every folder with Angular components, pipes, or directives in a `shared`-folder should have its own module, that exports these Angular elements
-   `/features`
    -   here are components/pipes/directives that should only be used in the `/pages`-folder at the same level (in opposite to `/shared` no nested folders)
-   `/pages`:
    -   in here all Angular elements and utilities located that are only used according to the route (-> lazy loading)

Commonly used exercise-[selectors](https://ngrx.io/guide/store/selectors) should go in [./src/app/state/exercise/exercise.selectors.ts](./src/app/state/exercise/exercise.selectors.ts).

You can assume that the Store has the current exercise state if you are in `src/app/pages/exercises/exercise`. We use [route guards](https://angular.io/guide/router-tutorial-toh#canactivate-requiring-authentication) for this.

If you want to modify the exercise state do not do it via [reducers](https://ngrx.io/guide/store/reducers) in the store, but propose an action (optimistically) via the [ApiService](.\src\app\core\api.service.ts). The action will automatically be applied to the store.

By default, we don't use `ChangeDetectionStrategy.OnPush` because it makes the code more complicated and increases the skill level needed to work with the code while providing a mostly negligible performance benefit.
