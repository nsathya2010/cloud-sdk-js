/*
 * Copyright (c) 2021 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BigNumber } from 'bignumber.js';
import { RequestBuilder } from '@sap-cloud-sdk/odata-common/internal';
import {
  GetAllRequestBuilder,
  GetByKeyRequestBuilder,
  CreateRequestBuilder,
  UpdateRequestBuilder,
  DeleteRequestBuilder
} from '@sap-cloud-sdk/odata-v4';
import { Photos } from './Photos';

/**
 * Request builder class for operations supported on the [[Photos]] entity.
 */
export class PhotosRequestBuilder extends RequestBuilder<Photos> {
  /**
   * Returns a request builder for retrieving one `Photos` entity based on its keys.
   * @param id Key property. See [[Photos.id]].
   * @returns A request builder for creating requests to retrieve one `Photos` entity based on its keys.
   */
  getByKey(id: BigNumber): GetByKeyRequestBuilder<Photos> {
    return new GetByKeyRequestBuilder(Photos, { Id: id });
  }

  /**
   * Returns a request builder for querying all `Photos` entities.
   * @returns A request builder for creating requests to retrieve all `Photos` entities.
   */
  getAll(): GetAllRequestBuilder<Photos> {
    return new GetAllRequestBuilder(Photos);
  }

  /**
   * Returns a request builder for creating a `Photos` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `Photos`.
   */
  create(entity: Photos): CreateRequestBuilder<Photos> {
    return new CreateRequestBuilder(Photos, entity);
  }

  /**
   * Returns a request builder for updating an entity of type `Photos`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `Photos`.
   */
  update(entity: Photos): UpdateRequestBuilder<Photos> {
    return new UpdateRequestBuilder(Photos, entity);
  }

  /**
   * Returns a request builder for deleting an entity of type `Photos`.
   * @param id Key property. See [[Photos.id]].
   * @returns A request builder for creating requests that delete an entity of type `Photos`.
   */
  delete(id: BigNumber): DeleteRequestBuilder<Photos>;
  /**
   * Returns a request builder for deleting an entity of type `Photos`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `Photos` by taking the entity as a parameter.
   */
  delete(entity: Photos): DeleteRequestBuilder<Photos>;
  delete(idOrEntity: any): DeleteRequestBuilder<Photos> {
    return new DeleteRequestBuilder(
      Photos,
      idOrEntity instanceof Photos ? idOrEntity : { Id: idOrEntity! }
    );
  }
}
