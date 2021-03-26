import { BigNumber } from 'bignumber.js';
import {
  RequestBuilder,
  GetAllRequestBuilderV4,
  GetByKeyRequestBuilderV4,
  CreateRequestBuilderV4,
  UpdateRequestBuilderV4,
  DeleteRequestBuilderV4
} from '@sap-cloud-sdk/core';
import { Photos } from './Photos';
/**
 * Request builder class for operations supported on the [[Photos]] entity.
 */
export declare class PhotosRequestBuilder extends RequestBuilder<Photos> {
  /**
   * Returns a request builder for retrieving one `Photos` entity based on its keys.
   * @param id Key property. See [[Photos.id]].
   * @returns A request builder for creating requests to retrieve one `Photos` entity based on its keys.
   */
  getByKey(id: BigNumber): GetByKeyRequestBuilderV4<Photos>;
  /**
   * Returns a request builder for querying all `Photos` entities.
   * @returns A request builder for creating requests to retrieve all `Photos` entities.
   */
  getAll(): GetAllRequestBuilderV4<Photos>;
  /**
   * Returns a request builder for creating a `Photos` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `Photos`.
   */
  create(entity: Photos): CreateRequestBuilderV4<Photos>;
  /**
   * Returns a request builder for updating an entity of type `Photos`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `Photos`.
   */
  update(entity: Photos): UpdateRequestBuilderV4<Photos>;
  /**
   * Returns a request builder for deleting an entity of type `Photos`.
   * @param id Key property. See [[Photos.id]].
   * @returns A request builder for creating requests that delete an entity of type `Photos`.
   */
  delete(id: BigNumber): DeleteRequestBuilderV4<Photos>;
  /**
   * Returns a request builder for deleting an entity of type `Photos`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `Photos` by taking the entity as a parameter.
   */
  delete(entity: Photos): DeleteRequestBuilderV4<Photos>;
}
//# sourceMappingURL=PhotosRequestBuilder.d.ts.map
