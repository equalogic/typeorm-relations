import { addRelationByPath, mergeRelations, removeRelationByPath, subtractRelations } from './util';

describe('util', () => {
  describe('addRelationByPath', () => {
    it('correctly adds a single-level relation', () => {
      const relations = addRelationByPath({ bar: true }, ['foo']);

      expect(relations).toEqual({
        bar: true,
        foo: true,
      });
    });

    it('correctly adds a multi-level relation', () => {
      const relations = addRelationByPath({ xyzzy: true, foo: true }, ['foo', 'bar', 'baz']);

      expect(relations).toEqual({
        xyzzy: true,
        foo: {
          bar: {
            baz: true,
          },
        },
      });
    });
  });

  describe('removeRelationByPath', () => {
    it('correctly removes a single-level relation', () => {
      const relations = removeRelationByPath({ foo: true, bar: true }, ['foo']);

      expect(relations).toEqual({
        bar: true,
      });
    });

    it('correctly removes multi-level relation', () => {
      const relations = removeRelationByPath({ xyzzy: true, foo: { bar: { baz: true } } }, ['foo', 'bar']);

      expect(relations).toEqual({
        xyzzy: true,
        foo: true,
      });
    });
  });

  describe('mergeRelations', () => {
    it('correctly merges simple boolean relations', () => {
      const relations = mergeRelations<any>({ foo: true }, { bar: true });

      expect(relations).toEqual({
        foo: true,
        bar: true,
      });
    });

    it('correctly merges complex nested relations', () => {
      const relations = mergeRelations<any>(
        {
          foo: {
            bar: {
              baz: true,
            },
            xyzzy: true,
          },
        },
        {
          foo: {
            bar: true,
            xyzzy: {
              zyxxy: true,
            },
          },
        },
      );

      expect(relations).toEqual({
        foo: {
          bar: {
            baz: true,
          },
          xyzzy: {
            zyxxy: true,
          },
        },
      });
    });
  });

  describe('subtractRelations', () => {
    it('correctly subtracts simple boolean relations', () => {
      const relations = subtractRelations<any>({ foo: true, bar: true }, { bar: true });

      expect(relations).toEqual({
        foo: true,
      });
    });

    it('correctly subtracts complex nested relations at leaf level', () => {
      const relations = subtractRelations<any>(
        {
          foo: {
            bar: {
              baz: true,
            },
            xyzzy: true,
          },
        },
        {
          foo: {
            bar: {
              baz: true,
            },
          },
        },
      );

      expect(relations).toEqual({
        foo: {
          bar: true,
          xyzzy: true,
        },
      });
    });

    it('correctly subtracts complex nested relations from mid-level', () => {
      const relations = subtractRelations<any>(
        {
          foo: {
            bar: {
              baz: true,
              boz: true,
            },
            xyzzy: true,
          },
        },
        {
          foo: {
            bar: true,
          },
        },
      );

      expect(relations).toEqual({
        foo: {
          xyzzy: true,
        },
      });
    });
  });
});
