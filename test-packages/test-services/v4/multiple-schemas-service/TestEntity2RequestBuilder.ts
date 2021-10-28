/*
 * Copyright (c) 2021 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { RequestBuilder } from '@sap-cloud-sdk/odata-common';
import {
  GetAllRequestBuilder,
  GetByKeyRequestBuilder,
  CreateRequestBuilder,
  UpdateRequestBuilder,
  DeleteRequestBuilder
} from '@sap-cloud-sdk/odata-v4';
import { TestEntity2 } from './TestEntity2';

/**
 * Request builder class for operations supported on the [[TestEntity2]] entity.
 */
export class TestEntity2RequestBuilder extends RequestBuilder<TestEntity2> {
  /**
   * Returns a request builder for retrieving one `TestEntity2` entity based on its keys.
   * @param keyPropertyString Key property. See [[TestEntity2.keyPropertyString]].
   * @returns A request builder for creating requests to retrieve one `TestEntity2` entity based on its keys.
   */
  getByKey(keyPropertyString: string): GetByKeyRequestBuilder<TestEntity2> {
    return new GetByKeyRequestBuilder(TestEntity2, {
      KeyPropertyString: keyPropertyString
    });
  }

  /**
   * Returns a request builder for querying all `TestEntity2` entities.
   * @returns A request builder for creating requests to retrieve all `TestEntity2` entities.
   */
  getAll(): GetAllRequestBuilder<TestEntity2> {
    return new GetAllRequestBuilder(TestEntity2);
  }

  /**
   * Returns a request builder for creating a `TestEntity2` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `TestEntity2`.
   */
  create(entity: TestEntity2): CreateRequestBuilder<TestEntity2> {
    return new CreateRequestBuilder(TestEntity2, entity);
  }

  /**
   * Returns a request builder for updating an entity of type `TestEntity2`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `TestEntity2`.
   */
  update(entity: TestEntity2): UpdateRequestBuilder<TestEntity2> {
    return new UpdateRequestBuilder(TestEntity2, entity);
  }

  /**
   * Returns a request builder for deleting an entity of type `TestEntity2`.
   * @param keyPropertyString Key property. See [[TestEntity2.keyPropertyString]].
   * @returns A request builder for creating requests that delete an entity of type `TestEntity2`.
   */
  delete(keyPropertyString: string): DeleteRequestBuilder<TestEntity2>;
  /**
   * Returns a request builder for deleting an entity of type `TestEntity2`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `TestEntity2` by taking the entity as a parameter.
   */
  delete(entity: TestEntity2): DeleteRequestBuilder<TestEntity2>;
  delete(keyPropertyStringOrEntity: any): DeleteRequestBuilder<TestEntity2> {
    return new DeleteRequestBuilder(
      TestEntity2,
      keyPropertyStringOrEntity instanceof TestEntity2
        ? keyPropertyStringOrEntity
        : { KeyPropertyString: keyPropertyStringOrEntity! }
    );
  }
}
