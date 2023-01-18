/*
 * Copyright (c) 2023 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  Entity,
  DefaultDeSerializers,
  DeSerializers,
  DeserializedType
} from '@sap-cloud-sdk/odata-v2';
import type { TestEntityEndsWithSomethingElseApi } from './TestEntityEndsWithSomethingElseApi';
/**
 * This class represents the entity "A_TestEntityEndsWithSomethingElse" of service "API_TEST_SRV".
 */
export declare class TestEntityEndsWithSomethingElse<
    T extends DeSerializers = DefaultDeSerializers
  >
  extends Entity
  implements TestEntityEndsWithSomethingElseType<T>
{
  readonly _entityApi: TestEntityEndsWithSomethingElseApi<T>;
  /**
   * Technical entity name for TestEntityEndsWithSomethingElse.
   */
  static _entityName: string;
  /**
   * Default url path for the according service.
   */
  static _defaultServicePath: string;
  /**
   * All key fields of the TestEntityEndsWithSomethingElse entity
   */
  static _keys: string[];
  /**
   * Key Property.
   */
  keyProperty: DeserializedType<T, 'Edm.String'>;
  constructor(_entityApi: TestEntityEndsWithSomethingElseApi<T>);
}
export interface TestEntityEndsWithSomethingElseType<
  T extends DeSerializers = DefaultDeSerializers
> {
  keyProperty: DeserializedType<T, 'Edm.String'>;
}
