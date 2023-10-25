import { FindOptionsRelations, FindOptionsRelationsProperty } from 'typeorm';
import { addRelationByPath, isKeyOf, mergeRelations, removeRelationByPath, subtractRelations } from './util';

export type RelationMapInput<Entity extends Record<string, any>> = {
  [P in keyof Entity]?: P extends 'toString'
    ? unknown
    : Entity[P] extends Array<any>
    ?
        | FindOptionsRelationsProperty<Entity[P][number]>
        | RelationMap<Entity[P][number]>
        | RelationMapInput<Entity[P][number]>
    :
        | FindOptionsRelationsProperty<NonNullable<Entity[P]>>
        | RelationMap<NonNullable<Entity[P]>>
        | RelationMapInput<NonNullable<Entity[P]>>;
};

function normalizeRelationMapInput<Entity extends Record<string, any>>(
  input: RelationMapInput<Entity>,
): FindOptionsRelations<Entity> {
  return Object.keys(input).reduce((result, key: keyof Entity) => {
    const value = input[key];

    if (value instanceof RelationMap) {
      result[key] = value.valueOf() as FindOptionsRelations<Entity>[typeof key];
    } else if (value != null && typeof value === 'object') {
      result[key] = normalizeRelationMapInput(value) as FindOptionsRelations<Entity>[typeof key];
    } else if (typeof value === 'boolean') {
      result[key] = value as any;
    }

    return result;
  }, {} as FindOptionsRelations<Entity>);
}

export class RelationMap<Entity extends Record<string, any> = Record<string, any>> {
  private value: FindOptionsRelations<Entity>;

  public constructor(relations: FindOptionsRelations<Entity> = {}) {
    this.value = relations;
  }

  public valueOf(): FindOptionsRelations<Entity> {
    return this.value;
  }

  public toFindOptionsRelations(): FindOptionsRelations<Entity> {
    return this.value;
  }

  public add(relationsToAdd: RelationMap<Entity> | RelationMapInput<Entity> | keyof Entity | string[]): this {
    if (Array.isArray(relationsToAdd)) {
      this.value = addRelationByPath(this.value, relationsToAdd);
    } else if (isKeyOf<Entity>(relationsToAdd)) {
      this.value = mergeRelations(this.value, { [relationsToAdd]: true } as FindOptionsRelations<Entity>);
    } else {
      this.value = mergeRelations(
        this.value,
        relationsToAdd instanceof RelationMap ? relationsToAdd.valueOf() : normalizeRelationMapInput(relationsToAdd),
      );
    }

    return this;
  }

  public remove(relationsToRemove: RelationMap<Entity> | RelationMapInput<Entity> | keyof Entity | string[]): this {
    if (Array.isArray(relationsToRemove)) {
      this.value = removeRelationByPath(this.value, relationsToRemove);
    } else if (isKeyOf<Entity>(relationsToRemove)) {
      this.value = subtractRelations(this.value, { [relationsToRemove]: true } as FindOptionsRelations<Entity>);
    } else {
      this.value = subtractRelations(
        this.value,
        relationsToRemove instanceof RelationMap
          ? relationsToRemove.valueOf()
          : normalizeRelationMapInput(relationsToRemove),
      );
    }

    return this;
  }

  public has(path: keyof Entity | string[]): boolean {
    if (!Array.isArray(path)) {
      path = [String(path)];
    }

    let found: boolean = true;

    path.reduce(
      (current: FindOptionsRelations<Entity> | FindOptionsRelationsProperty<any> | null, property: string) => {
        const entry: FindOptionsRelationsProperty<any> | null =
          current != null && typeof current === 'object' && property in current ? current[property] : null;

        if (entry == null || entry === false) {
          found = false;
        }

        return entry;
      },
      this.value,
    );

    return found;
  }
}
