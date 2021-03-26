import {
  RequestBuilder,
  GetAllRequestBuilderV2,
  GetByKeyRequestBuilderV2,
  CreateRequestBuilderV2,
  UpdateRequestBuilderV2,
  DeleteRequestBuilderV2
} from '@sap-cloud-sdk/core';
import { TestEntityOtherMultiLink } from './TestEntityOtherMultiLink';
/**
 * Request builder class for operations supported on the [[TestEntityOtherMultiLink]] entity.
 */
export declare class TestEntityOtherMultiLinkRequestBuilder extends RequestBuilder<TestEntityOtherMultiLink> {
  /**
   * Returns a request builder for retrieving one `TestEntityOtherMultiLink` entity based on its keys.
   * @param keyProperty Key property. See [[TestEntityOtherMultiLink.keyProperty]].
   * @returns A request builder for creating requests to retrieve one `TestEntityOtherMultiLink` entity based on its keys.
   */
  getByKey(
    keyProperty: string
  ): GetByKeyRequestBuilderV2<TestEntityOtherMultiLink>;
  /**
   * Returns a request builder for querying all `TestEntityOtherMultiLink` entities.
   * @returns A request builder for creating requests to retrieve all `TestEntityOtherMultiLink` entities.
   */
  getAll(): GetAllRequestBuilderV2<TestEntityOtherMultiLink>;
  /**
   * Returns a request builder for creating a `TestEntityOtherMultiLink` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `TestEntityOtherMultiLink`.
   */
  create(
    entity: TestEntityOtherMultiLink
  ): CreateRequestBuilderV2<TestEntityOtherMultiLink>;
  /**
   * Returns a request builder for updating an entity of type `TestEntityOtherMultiLink`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `TestEntityOtherMultiLink`.
   */
  update(
    entity: TestEntityOtherMultiLink
  ): UpdateRequestBuilderV2<TestEntityOtherMultiLink>;
  /**
   * Returns a request builder for deleting an entity of type `TestEntityOtherMultiLink`.
   * @param keyProperty Key property. See [[TestEntityOtherMultiLink.keyProperty]].
   * @returns A request builder for creating requests that delete an entity of type `TestEntityOtherMultiLink`.
   */
  delete(keyProperty: string): DeleteRequestBuilderV2<TestEntityOtherMultiLink>;
  /**
   * Returns a request builder for deleting an entity of type `TestEntityOtherMultiLink`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `TestEntityOtherMultiLink` by taking the entity as a parameter.
   */
  delete(
    entity: TestEntityOtherMultiLink
  ): DeleteRequestBuilderV2<TestEntityOtherMultiLink>;
}
//# sourceMappingURL=TestEntityOtherMultiLinkRequestBuilder.d.ts.map
