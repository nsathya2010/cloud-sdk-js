/*
 * Copyright (c) 2021 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { OpenApiRequestBuilder } from '@sap-cloud-sdk/core';

export const ExtensionApi = {
  niceGetFunction: () =>
    new OpenApiRequestBuilder<any>('get', '/test-cases/extension'),
  nicePostFunction: () =>
    new OpenApiRequestBuilder<any>('post', '/test-cases/extension')
};
