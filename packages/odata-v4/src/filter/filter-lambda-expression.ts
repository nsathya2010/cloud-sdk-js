import {
  FilterLambdaExpression,
  EntityBase,
  and,
  Filterable,
  toFilterableList
} from '@sap-cloud-sdk/odata-common/internal';
import { DeSerializers } from '../de-serializers';

/**
 * Will return the entity if at least one element of the one-to-many link relation fulfills the condition.
 * @param filters - A filter condition like MyEntity.someMultiLink.someProperty.eq('value')
 * @returns The lambda filter function to be considered in the query
 */
export function any<
  EntityT extends EntityBase,
  DeSerializersT extends DeSerializers,
  LinkedEntityT extends EntityBase
>(
  ...filters: Filterable<EntityT, DeSerializersT, LinkedEntityT>[]
): FilterLambdaExpression<EntityT, DeSerializersT> {
  return new FilterLambdaExpression(and(toFilterableList(filters)), 'any');
}

// eslint-disable-next-line valid-jsdoc
/**
 * Will return the entity if all elements of the one-to-many link relation fulfill the condition.
 * @param filters - A filter condition like MyEntity.someMultiLink.someProperty.eq('value')
 * @returns The lambda filter function to be considered in the query
 */
export function all<
  EntityT extends EntityBase,
  DeSerializersT extends DeSerializers,
  LinkedEntityT extends EntityBase
>(
  ...filters: Filterable<EntityT, DeSerializersT, LinkedEntityT>[]
): FilterLambdaExpression<EntityT, DeSerializersT> {
  return new FilterLambdaExpression(and(toFilterableList(filters)), 'all');
}
