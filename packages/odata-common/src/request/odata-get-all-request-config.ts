import { EntityBase, Constructable } from '../entity-base';
import { Selectable } from '../selectable/selectable';
import { Filterable } from '../filter/filterable';
import { Expandable } from '../expandable';
import { Orderable } from '../order/orderable';
import { ODataUri } from '../uri-conversion/odata-uri';
import { ODataRequestConfig } from './odata-request-config';
import { WithGetAllRestrictions } from './odata-request-traits';

/**
 * OData getAll request configuration for an entity type.
 * @typeparam EntityT - Type of the entity to setup a request for
 * @internal
 */
export class ODataGetAllRequestConfig<EntityT extends EntityBase>
  extends ODataRequestConfig
  implements WithGetAllRestrictions<EntityT>
{
  top: number;
  skip: number;
  filter: Filterable<EntityT>;
  orderBy: Orderable<EntityT>[];
  selects: Selectable<EntityT>[];
  expands: Expandable<EntityT>[];

  /**
   * Creates an instance of ODataGetAllRequestConfig.
   * @param entityConstructor - Constructor type of the entity to create a configuration for
   */
  constructor(
    readonly entityConstructor: Constructable<EntityT>,
    private oDataUri: ODataUri
  ) {
    super('get', entityConstructor._defaultServicePath);
  }

  resourcePath(): string {
    return this.entityConstructor._entityName;
  }

  queryParameters(): Record<string, any> {
    const params: Record<string, any> = {
      format: 'json',
      ...this.oDataUri.getSelect(this.selects),
      ...this.oDataUri.getExpand(
        this.selects,
        this.expands,
        this.entityConstructor
      ),
      ...this.oDataUri.getFilter(this.filter, this.entityConstructor),
      ...this.oDataUri.getOrderBy(this.orderBy)
    };
    if (typeof this.top !== 'undefined') {
      params.top = this.top;
    }
    if (typeof this.skip !== 'undefined') {
      params.skip = this.skip;
    }
    return this.prependDollarToQueryParameters(params);
  }
}
