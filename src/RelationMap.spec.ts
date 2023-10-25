import { RelationMap } from './RelationMap';

enum TestAbcEnum {
  a = 'a',
  b = 'b',
  c = 'c',
}

type TestQuxEntity = {
  id: string;
  bar: TestBarEntity;
  abcs: TestAbcEnum[];
};

type TestFooEntity = {
  id: string;
  quxs: TestQuxEntity[];
};

type TestBarEntity = {
  id: string;
};

type TestEntity = {
  foo: TestFooEntity;
  bars: TestBarEntity[];
  abcs: TestAbcEnum[];
};

describe('RelationMap', () => {
  describe('constructor', () => {
    it('accepts another RelationMap as input', () => {
      const relations = new RelationMap<TestEntity>(new RelationMap<TestEntity>({ foo: true }));

      expect(relations.valueOf()).toEqual({
        foo: true,
      });
    });

    it('accepts a nested RelationMap as input', () => {
      const relations = new RelationMap<TestEntity>({
        foo: new RelationMap<TestFooEntity>({ quxs: true }),
      });

      expect(relations.valueOf()).toEqual({
        foo: {
          quxs: true,
        },
      });
    });

    it('works with complex entity classes', () => {
      const relationsA = new RelationMap<TestEntity>({ foo: true });
      const relationsB = new RelationMap<TestEntity>({ bars: true });
      relationsA.add(relationsB);

      const quxRelations = new RelationMap<TestQuxEntity>({ bar: true });
      relationsA.add({ foo: { quxs: quxRelations } });

      expect(relationsA.valueOf()).toEqual({
        foo: {
          quxs: {
            bar: true,
          },
        },
        bars: true,
      });
    });
  });

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

    it('correctly merges a nested RelationMap', () => {
      const rootRelationMap = new RelationMap<any>({
        foo: {
          bar: {
            baz: true,
          },
          xyzzy: true,
        },
      });
      const xyzzyRelationMap = new RelationMap<any>({
        zyxxy: true,
      });

      rootRelationMap.add({
        foo: {
          xyzzy: xyzzyRelationMap,
        },
      });

      expect(rootRelationMap.valueOf()).toEqual({
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

  describe('remove()', () => {
    it('correctly removes a relation by top level key', () => {
      const relationMap = new RelationMap<any>({ foo: true, bar: true });
      relationMap.remove('foo');

      expect(relationMap.valueOf()).toEqual({
        bar: true,
      });
    });

    it('correctly removes a relation by path array', () => {
      const relationMap = new RelationMap<any>({
        xyzzy: true,
        foo: {
          bar: {
            baz: true,
          },
        },
      });
      relationMap.remove(['foo', 'bar', 'baz']);

      expect(relationMap.valueOf()).toEqual({
        xyzzy: true,
        foo: {
          bar: true,
        },
      });
    });

    it('correctly subtracts a simple relation object', () => {
      const relationMap = new RelationMap<any>({ foo: true, bar: true });
      relationMap.remove({ bar: true });

      expect(relationMap.valueOf()).toEqual({
        foo: true,
      });
    });

    it('correctly subtracts complex nested relation objects', () => {
      const relationMap = new RelationMap<any>({
        foo: {
          bar: {
            baz: true,
          },
          xyzzy: {
            zyxxy: true,
          },
        },
      });
      relationMap.remove({
        foo: {
          bar: true,
          xyzzy: {
            zyxxy: true,
          },
        },
      });

      expect(relationMap.valueOf()).toEqual({
        foo: {
          xyzzy: true,
        },
      });
    });

    it('correctly subtracts another RelationMap', () => {
      const relationMapA = new RelationMap<any>({
        foo: {
          bar: {
            baz: true,
          },
          xyzzy: {
            zyxxy: true,
          },
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

      relationMapA.remove(relationMapB);

      expect(relationMapA.valueOf()).toEqual({
        foo: {
          xyzzy: true,
        },
      });
    });

    it('correctly subtracts a nested RelationMap', () => {
      const rootRelationMap = new RelationMap<any>({
        foo: {
          bar: {
            baz: true,
          },
          xyzzy: {
            zyxxy: true,
          },
        },
      });
      const xyzzyRelationMap = new RelationMap<any>({
        zyxxy: true,
      });

      rootRelationMap.remove({
        foo: {
          xyzzy: xyzzyRelationMap,
        },
      });

      expect(rootRelationMap.valueOf()).toEqual({
        foo: {
          bar: {
            baz: true,
          },
          xyzzy: true,
        },
      });
    });
  });

  describe('has()', () => {
    it('correctly finds selected paths', () => {
      const relationMap = new RelationMap<any>({
        foo: {
          bar: {
            baz: true,
          },
        },
      });

      expect(relationMap.has('foo')).toEqual(true);
      expect(relationMap.has(['foo', 'bar'])).toEqual(true);
      expect(relationMap.has(['foo', 'bar', 'baz'])).toEqual(true);
    });

    it("doesn't find unselected paths", () => {
      const relationMap = new RelationMap<any>({
        foo: {
          bar: {
            baz: true,
          },
        },
      });

      expect(relationMap.has('bar')).toEqual(false);
      expect(relationMap.has(['baz', 'bar', 'foo'])).toEqual(false);
      expect(relationMap.has(['foo', 'xyzzy'])).toEqual(false);
    });
  });
});
