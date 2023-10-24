import { FindOptionsRelations } from 'typeorm';
import { FindOptionsRelationsProperty } from 'typeorm/find-options/FindOptionsRelations';
import { addRelationByPath, isKeyOf, mergeRelations, removeRelationByPath, subtractRelations } from './util';

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

  public add(relationsToAdd: RelationMap<Entity> | FindOptionsRelations<Entity> | keyof Entity | string[]): this {
    this.value = Array.isArray(relationsToAdd)
      ? addRelationByPath(this.value, relationsToAdd)
      : mergeRelations(
          this.value,
          relationsToAdd instanceof RelationMap
            ? relationsToAdd.valueOf()
            : isKeyOf<Entity>(relationsToAdd)
            ? // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              ({ [relationsToAdd]: true } as FindOptionsRelations<Entity>)
            : relationsToAdd,
        );

    return this;
  }

  public remove(relationsToRemove: RelationMap<Entity> | FindOptionsRelations<Entity> | keyof Entity | string[]): this {
    this.value = Array.isArray(relationsToRemove)
      ? removeRelationByPath(this.value, relationsToRemove)
      : subtractRelations(
          this.value,
          relationsToRemove instanceof RelationMap
            ? relationsToRemove.valueOf()
            : isKeyOf<Entity>(relationsToRemove)
            ? // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              ({ [relationsToRemove]: true } as FindOptionsRelations<Entity>)
            : relationsToRemove,
        );

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
