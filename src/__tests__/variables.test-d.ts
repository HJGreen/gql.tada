import { expectTypeOf, test } from 'vitest';
import type { simpleIntrospection } from './fixtures/simpleIntrospection';
import type { parseDocument } from '../parser';
import type { mapIntrospection } from '../introspection';
import type { getVariablesType } from '../variables';

type introspection = mapIntrospection<typeof simpleIntrospection>;

test('parses document-variables correctly', () => {
  const query = `
    mutation ($id: ID!) {
      toggleTodo { id }
    }
  `;

  type doc = parseDocument<typeof query>;
  type variables = getVariablesType<doc, introspection>;

  expectTypeOf<variables>().toEqualTypeOf<{ id: string | number }>();
});

test('works for input-objects', () => {
  const query = `
    mutation ($id: ID!, $input: TodoPayload!) {
      toggleTodo (id: $id input: $input) { id }
    }
  `;

  type doc = parseDocument<typeof query>;
  type variables = getVariablesType<doc, introspection>;

  expectTypeOf<variables>().toEqualTypeOf<{
    id: string | number;
    input: { title: string; complete?: boolean | null };
  }>();
});

test('allows optionals for default values', () => {
  const query = `
    mutation ($id: ID! = "default") {
      toggleTodo (id: $id) { id }
    }
  `;

  type doc = parseDocument<typeof query>;
  type variables = getVariablesType<doc, introspection>;

  expectTypeOf<variables>().toEqualTypeOf<{ id?: string | number | undefined }>();
  expectTypeOf<variables['id']>().toEqualTypeOf<string | number | undefined>();
});

test('allows optionals for nullable values', () => {
  const query = `
    mutation ($id: ID) {
      toggleTodo (id: $id) { id }
    }
  `;

  type doc = parseDocument<typeof query>;
  type variables = getVariablesType<doc, introspection>;

  expectTypeOf<variables>().toEqualTypeOf<{ id?: string | number | null | undefined }>();
  expectTypeOf<variables['id']>().toEqualTypeOf<string | number | null | undefined>();
});
