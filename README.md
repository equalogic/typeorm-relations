<div align="center">
  <img src="https://github.com/equalogic/typeorm-relations/raw/master/resources/logo@720w.png" width="720" height="420">
  <br>
  <br>
  <a href="https://npmjs.com/package/typeorm-relations">
    <img src="https://img.shields.io/npm/v/typeorm-relations">
  </a>
  <a href="https://npmjs.com/package/typeorm-relations">
    <img src="https://img.shields.io/npm/dy/typeorm-relations">
  </a>
  <br>
  <br>
</div>

A toolkit for working with TypeORM relations objects.

## Installation

```
npm i typeorm-relations
```

This library is written in TypeScript, so type definitions are included in the box.

You must also install [typeorm](https://typeorm.io/) v0.3.x as a peer dependency (you should have this already).

## Introduction

[Relations in TypeORM](https://typeorm.io/relations) are used to describe related objects. When defining your schema
you can declare properties on your entities as representing either one-to-one, many-to-one, one-to-many, or many-to-many
relations to other entities.

When fetching an entity, you use the [`relations` option](https://typeorm.io/find-options) on Repository/EntityManager
`findX()` methods to tell TypeORM which of the entity's related entities should also be fetched from the database at the
same time, by way of SQL `JOIN` clauses.

TypeORM v0.3.0 introduced a new object format for the `relations` option. In earlier versions it only accepted an array
of strings, but the new object format allows for better type safety. A `FindOptionsRelations` object looks like this:

```
{
    profile: true,
    photos: true,
    videos: {
        videoAttributes: true,
    },
}
```

It's easy enough to write out relations objects by hand. But what if you need to select relations conditionally, or
generate your relations based on some other information? Then you may find you want an easy way to manipulate relations
objects by adding or removing entries, or merging multiple relations objects together.

That's where `typeorm-relations` comes in! It's a toolkit for working with relations objects.

## Usage

Use the `RelationMap` class to work with relations when you're performing a query.

A simple example:

```ts
import { RelationMap } from 'typeorm-relations';

const userRelationMap = new RelationMap<User>({
  profile: true,
  photos: true,
  videos: true,
});

if (needsVideoAttributes) {
  userRelationMap.add({
    videos: {
      videoAttributes: true,
    },
  });
}

const users = await userRepository.find({
  /*
   * When needsVideoAttributes === true, this will be equivalent to:
   *
   * relations: {
   *   profile: true,
   *   photos: true,
   *   videos: {
   *     videoAttributes: true,
   *   },
   * }
   */
  relations: userRelationMap.toFindOptionsRelations(),
});
```

### RelationMap

#### `RelationMap.constructor(initial?: FindOptionsRelations)`

Instantiate with `new RelationMap()`. Pass a relations object to the constructor to set the initial value.

```ts
new RelationMap<User>({ profile: true });
```

#### `RelationMap.add(source: FindOptionsRelations | RelationMap | string | string[])`

Mutates the `RelationMap` instance by adding relations. Accepts several kinds of input:

1.  Add a relations object, or another `RelationMap` instance, to merge the values.

    Example:

    ```ts
    const relationMapA = new RelationMap<User>({
      profile: true,
      videos: true,
    });
    const relationMapB = new RelationMap<User>({
      photos: {
        photoAttributes: true,
      },
    });

    relationMapA.add({
      videos: {
        videoAttributes: true,
      },
    });
    relationMapA.add(relationMapB);
    ```

    Results in `relationMapA` containing the value:

    ```
    {
      profile: true,
      videos: {
        videoAttributes: true
      },
      photos: {
        photoAttributes: true
      }
    }
    ```

2.  Add a single relation property by key name. Note: this only works with properties that exist at the top level of the
    given entity.

    ```ts
    const relationMap = new RelationMap<User>({
      profile: true,
      videos: true,
    });
    relationMap.add('photos');
    ```

    Results in `relationMap` containing the value:

    ```
    {
      profile: true,
      videos: true,
      photos: true
    }
    ```

3.  Add a single relation property by key path, specified as an array of strings.

    ```ts
    const relationMap = new RelationMap<User>({
      profile: true,
      videos: true,
    });
    relationMap.add(['photos', 'photoAttributes']);
    ```

    Results in `relationMap` containing the value:

    ```
    {
      profile: true,
      videos: true,
      photos: {
        photoAttributes: true
      }
    }
    ```

#### `RelationMap.toFindOptionsRelations()`

Returns a plain object representation of the relations, suitable for use with any of TypeORM's repository methods that
accept [`find` options](https://typeorm.io/find-options).

Example:

```ts
const products = await dataSource.getRepository(Product).find({
  relations: relationMap.toFindOptionsRelations(),
  where: { ... },
  order: { ... }
})
```

If you are using a `SelectQueryBuilder`, you can join the relations using `setFindOptions()` like this:

```ts
queryBuilder.setFindOptions({ relations: relationMap.toFindOptionsRelations() });
```

## License

MIT
