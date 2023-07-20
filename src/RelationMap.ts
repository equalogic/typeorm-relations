import { FindOptionsRelations } from 'typeorm';
import { FindOptionsRelationsProperty } from 'typeorm/find-options/FindOptionsRelations';
import { addRelationByPath, isKeyOf, mergeRelations } from './util';

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

  public add(source: RelationMap<Entity> | FindOptionsRelations<Entity> | keyof Entity | string[]): this {
    this.value = Array.isArray(source)
      ? addRelationByPath(this.value, source)
      : mergeRelations(
          this.value,
          source instanceof RelationMap
            ? source.valueOf()
            : isKeyOf<Entity>(source)
            ? // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              ({ [source]: true } as FindOptionsRelations<Entity>)
            : source,
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
