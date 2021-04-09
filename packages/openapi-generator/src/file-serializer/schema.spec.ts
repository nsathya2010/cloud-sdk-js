import { serializeSchema } from './schema';

it('serializeSchema serializes reference schema', () => {
  expect(
    serializeSchema({
      $ref: '#/components/schemas/my-schema',
      schemaName: 'MySchema'
    })
  ).toEqual('MySchema');
});

describe('serializeSchema for object schemas', () => {
  it('serializes object schema with nested properties and no additional properties', () => {
    expect(
      serializeSchema({
        properties: [
          {
            name: 'simpleProperty',
            required: true,
            schema: { type: 'integer' }
          },
          {
            name: 'nested-property',
            required: false,
            schema: {
              properties: [
                {
                  name: 'stringProperty',
                  required: false,
                  schema: { type: 'string' }
                }
              ]
            }
          }
        ]
      })
    ).toMatchInlineSnapshot(`
      "{
            'simpleProperty': number;
            'nested-property'?: {
                  'stringProperty'?: string;
                };
          }"
    `);
  });

  it('serializes object schema without properties, but additional properties', () => {
    expect(
      serializeSchema({
        properties: [],
        additionalProperties: { type: 'any' }
      })
    ).toEqual('Record<string, any>');
  });

  it('serializes object schema without properties, but specific additional properties', () => {
    expect(
      serializeSchema({
        properties: [],
        additionalProperties: { type: 'string' }
      })
    ).toEqual('Record<string, string>');
  });

  it('serializes object schema without properties and no additional properties', () => {
    expect(
      serializeSchema({
        properties: []
      })
    ).toEqual('Record<string, any>');
  });

  it('serializes object schema with properties and additional properties', () => {
    expect(
      serializeSchema({
        properties: [
          {
            name: 'simpleProperty',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        additionalProperties: { type: 'string' }
      })
    ).toMatchInlineSnapshot(`
      "{
            'simpleProperty': number;
          } | Record<string, string>"
    `);
  });
});

describe('serializeSchema for array schemas', () => {
  it('serializes array schema with nested array', () => {
    expect(
      serializeSchema({
        uniqueItems: false,
        items: { items: { type: 'string' } }
      })
    ).toEqual('string[][]');
  });

  it('serializes array schema with unique items', () => {
    expect(
      serializeSchema({
        uniqueItems: true,
        items: { type: 'string' }
      })
    ).toEqual('Set<string>');
  });
});

it('serializeSchema serializes enum schema', () => {
  expect(
    serializeSchema({
      type: 'string',
      enum: ["'one'", "'two'"]
    })
  ).toEqual("'one' | 'two'");
});

describe('serializeSchema for xOf schemas', () => {
  it('serializes array schema for oneOf', () => {
    expect(
      serializeSchema({
        oneOf: [
          { $ref: '#/components/schemas/XOr1', schemaName: 'XOr1' },
          { $ref: '#/components/schemas/XOr2', schemaName: 'XOr2' }
        ]
      })
    ).toEqual('XOr1 | XOr2');
  });

  it('serializes array schema for anyOf', () => {
    expect(
      serializeSchema({
        anyOf: [
          {
            $ref: '#/components/schemas/InclusiveOr1',
            schemaName: 'InclusiveOr1'
          },
          {
            $ref: '#/components/schemas/InclusiveOr2',
            schemaName: 'InclusiveOr2'
          }
        ]
      })
    ).toEqual('InclusiveOr1 | InclusiveOr2');
  });

  it('serializes array schema for allOf', () => {
    expect(
      serializeSchema({
        allOf: [
          { $ref: '#/components/schemas/And1', schemaName: 'And1' },
          { $ref: '#/components/schemas/And2', schemaName: 'And2' }
        ]
      })
    ).toEqual('And1 & And2');
  });
});

it('serializeSchema serializes not schema', () => {
  expect(
    serializeSchema({
      not: { type: 'string' }
    })
  ).toEqual('any');
});
