import { RelationMap } from './RelationMap';

describe('RelationMap', () => {
  describe('add()', () => {
    it('correctly adds a relation by top level key', () => {
      const relationMap = new RelationMap<any>({ foo: true, bar: true });
      relationMap.add('baz');

      expect(relationMap.valueOf()).toEqual({
        foo: true,
        bar: true,
        baz: true,
      });
    });

    it('correctly adds a relation by path array', () => {
      const relationMap = new RelationMap<any>({ xyzzy: true, foo: true });
      relationMap.add(['foo', 'bar', 'baz']);

      expect(relationMap.valueOf()).toEqual({
        xyzzy: true,
        foo: {
          bar: {
            baz: true,
          },
        },
      });
    });

    it('correctly merges a simple relation object', () => {
      const relationMap = new RelationMap<any>({ foo: true });
      relationMap.add({ bar: true });

      expect(relationMap.valueOf()).toEqual({
        foo: true,
        bar: true,
      });
    });

    it('correctly merges complex nested relation objects', () => {
      const relationMap = new RelationMap<any>({
        foo: {
          bar: {
            baz: true,
          },
          xyzzy: true,
        },
      });
      relationMap.add({
        foo: {
          bar: true,
          xyzzy: {
            zyxxy: true,
          },
        },
      });

      expect(relationMap.valueOf()).toEqual({
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

    it('correctly merges another RelationMap', () => {
      const relationMapA = new RelationMap<any>({
        foo: {
          bar: {
            baz: true,
          },
          xyzzy: true,
        },
      });
      const relationMapB = new RelationMap<any>({
        foo: {
          bar: true,
          xyzzy: {
            zyxxy: true,
          },
        },
      });

      relationMapA.add(relationMapB);

      expect(relationMapA.valueOf()).toEqual({
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
});
