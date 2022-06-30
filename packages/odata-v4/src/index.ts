/**
 * [[include:odata-v4/README.md]]
 * @packageDocumentation
 * @module @sap-cloud-sdk/odata-v4
 */

export { filterFunction } from './filter-function';

export {
  filterFunctions,
  now,
  hasSubset,
  hasSubsequence,
  fractionalSeconds,
  totalOffsetMinutes,
  maxDateTime,
  minDateTime,
  matchesPattern,
  contains
} from './filter-functions';

export {
  transformReturnValueForComplexType,
  transformReturnValueForComplexTypeList,
  transformReturnValueForEdmType,
  transformReturnValueForEdmTypeList,
  transformReturnValueForEntity,
  transformReturnValueForEntityList,
  transformReturnValueForUndefined
} from './request-builder/response-transformers';

export {
  ActionImportRequestBuilder,
  CountRequestBuilder,
  CreateRequestBuilder,
  DeleteRequestBuilder,
  FunctionImportRequestBuilder,
  GetAllRequestBuilder,
  GetByKeyRequestBuilder,
  UpdateRequestBuilder
} from './request-builder';
export { ODataBatchRequestBuilder } from './request-builder';
export { ActionImportParameter } from './request';

export { Entity } from './entity';
export { CustomField } from './selectable';
export { all, any } from './filter';

export {
  defaultDeSerializers,
  edmToTs,
  entityDeserializer,
  mergeDefaultDeSerializersWith,
  DeSerializers
} from './de-serializers';

export type {
  CustomDeSerializers,
  DefaultDeSerializers,
  CustomOrDefaultType
} from './de-serializers';
export * from './common';
