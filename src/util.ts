import mergeWith from 'lodash.mergewith';
import { FindOptionsRelations, FindOptionsRelationsProperty } from 'typeorm';

export function addRelationByPath<Entity>(
  relations: FindOptionsRelations<Entity>,
  path: string[],
): FindOptionsRelations<Entity> {
  const [property, nextProperty] = path;

  if (property == null) {
    return relations;
  }

  const result = { ...relations };

  if (!result[property]) {
    result[property] = nextProperty != null ? {} : true;
  }

  if (nextProperty != null) {
    return {
      ...result,
      [property]: addRelationByPath(result[property], path.slice(1)),
    };
  }

  return result;
}

export function removeRelationByPath<Entity>(
  relations: FindOptionsRelations<Entity>,
  path: string[],
): FindOptionsRelations<Entity> {
  const [property, nextProperty] = path;

  if (property == null) {
    return relations;
  }

  const result = { ...relations };

  if (nextProperty != null) {
    const nextResult = removeRelationByPath(result[property], path.slice(1));

    return {
      ...result,
      [property]: Object.keys(nextResult).length > 0 ? nextResult : true,
    };
  } else {
    delete result[property];
  }

  return result;
}

export function mergeRelations<Entity>(
  relationsA: FindOptionsRelations<Entity>,
  relationsB: FindOptionsRelations<Entity>,
): FindOptionsRelations<Entity> {
  const result = { ...relationsA };

  mergeWith(
    result,
    relationsB,
    (
      valueA: FindOptionsRelationsProperty<any>,
      valueB: FindOptionsRelationsProperty<any>,
    ): FindOptionsRelationsProperty<any> | undefined => {
      // when valueB is falsy, keep valueA
      if (!valueB) {
        return valueA;
      }

      // when valueA is nullish or boolean, use valueB
      if (valueA == null || typeof valueA !== 'object') {
        return valueB;
      }

      // when valueA is a nested relation object and valueB is boolean, keep valueA
      if (typeof valueB !== 'object') {
        return valueA;
      }

      // both valueA and valueB are nested relation objects, so let lodash.merge recurse down
      return undefined;
    },
  );

  return result;
}

export function subtractRelations<Entity>(
  relations: FindOptionsRelations<Entity>,
  relationsToSubtract: FindOptionsRelations<Entity>,
): FindOptionsRelations<Entity> {
  return Object.keys(relations).reduce((result, key) => {
    // When the relation is not in relationsToSubtract, keep it as is
    if (relationsToSubtract[key] == null) {
      result[key] = relations[key];

      return result;
    }

    // When the relation to subtract is an object, recurse into it
    if (typeof relationsToSubtract[key] === 'object') {
      const subtracted = subtractRelations(
        typeof relations[key] === 'boolean' ? {} : relations[key],
        relationsToSubtract[key],
      );

      if (Object.keys(subtracted).length > 0) {
        result[key] = subtracted;
      } else {
        result[key] = true;
      }

      return result;
    }

    // Otherwise continue without including the relation in the result
    return result;
  }, {} as FindOptionsRelations<Entity>);
}

export function isKeyOf<Target extends Record<string, any>>(key: unknown, target?: Target): key is keyof Target {
  return typeof key === 'string' && (target == null || key in target);
}
