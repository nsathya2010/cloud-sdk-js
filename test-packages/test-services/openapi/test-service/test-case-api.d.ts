import { OpenApiRequestBuilder } from '@sap-cloud-sdk/core';
import type {
  SimpleTestEntity,
  ComplexTestEntity,
  SimpleTestEntityWITHSymbols
} from './schema';
/**
 * Representation of the 'TestCaseApi'.
 * This API is part of the 'TestService' service.
 */
export declare const TestCaseApi: {
  /**
   * Create a request builder for execution of get requests to the '/test-cases/parameters/required-parameters/{requiredPathItemPathParam}' endpoint.
   * @param requiredPathItemPathParam Path parameter.
   * @param body Request body.
   * @param queryParameters Object containing the following keys: requiredPathItemQueryParam, optionalQueryParam, requiredQueryParam, optionalPathItemQueryParam.
   * @returns OpenApiRequestBuilder Use the execute() method to trigger the request.
   */
  testCaseGetRequiredParameters: (
    requiredPathItemPathParam: string,
    body: SimpleTestEntity | undefined,
    queryParameters: {
      requiredPathItemQueryParam: string;
      optionalQueryParam?: string;
      requiredQueryParam: string;
      optionalPathItemQueryParam?: string;
    }
  ) => OpenApiRequestBuilder<any>;
  /**
   * Create a request builder for execution of post requests to the '/test-cases/parameters/required-parameters/{requiredPathItemPathParam}' endpoint.
   * @param requiredPathItemPathParam Path parameter.
   * @param body Request body.
   * @param queryParameters Object containing the following keys: optionalPathItemQueryParam, requiredPathItemQueryParam, optionalQueryParam, requiredQueryParam.
   * @returns OpenApiRequestBuilder Use the execute() method to trigger the request.
   */
  testCasePostRequiredParameters: (
    requiredPathItemPathParam: string,
    body: SimpleTestEntity,
    queryParameters: {
      optionalPathItemQueryParam?: string;
      requiredPathItemQueryParam: string;
      optionalQueryParam?: string;
      requiredQueryParam: string;
    }
  ) => OpenApiRequestBuilder<any>;
  /**
   * Create a request builder for execution of get requests to the '/test-cases/parameters/{duplicateParam}' endpoint.
   * @param duplicateParam Path parameter.
   * @param queryParameters Object containing the following keys: duplicateParam.
   * @returns OpenApiRequestBuilder Use the execute() method to trigger the request.
   */
  testCaseGetDuplicateParameters: (
    duplicateParam: string,
    queryParameters: {
      duplicateParam: string;
    }
  ) => OpenApiRequestBuilder<any>;
  /**
   * Create a request builder for execution of get requests to the '/test-cases/duplicate-operation-ids' endpoint.
   * @returns OpenApiRequestBuilder Use the execute() method to trigger the request.
   */
  duplicateOperationId: () => OpenApiRequestBuilder<any>;
  /**
   * Create a request builder for execution of put requests to the '/test-cases/duplicate-operation-ids' endpoint.
   * @returns OpenApiRequestBuilder Use the execute() method to trigger the request.
   */
  duplicateOperationId2: () => OpenApiRequestBuilder<any>;
  /**
   * Create a request builder for execution of post requests to the '/test-cases/duplicate-operation-ids' endpoint.
   * @returns OpenApiRequestBuilder Use the execute() method to trigger the request.
   */
  duplicateOperationId3: () => OpenApiRequestBuilder<any>;
  /**
   * Create a request builder for execution of patch requests to the '/test-cases/duplicate-operation-ids' endpoint.
   * @returns OpenApiRequestBuilder Use the execute() method to trigger the request.
   */
  duplicateOperationId1: () => OpenApiRequestBuilder<any>;
  /**
   * Create a request builder for execution of get requests to the '/test-cases/reserved-keywords/{const1}' endpoint.
   * @param const1 Path parameter.
   * @param queryParameters Object containing the following keys: const.
   * @returns OpenApiRequestBuilder Use the execute() method to trigger the request.
   */
  export: (
    const1: string,
    queryParameters: {
      const: string;
    }
  ) => OpenApiRequestBuilder<any>;
  /**
   * Create a request builder for execution of get requests to the '/test-cases/complex-schemas' endpoint.
   * @param body Request body.
   * @returns OpenApiRequestBuilder Use the execute() method to trigger the request.
   */
  complexSchemas: (
    body: ComplexTestEntity | undefined
  ) => OpenApiRequestBuilder<any>;
  /**
   * Create a request builder for execution of post requests to the '/test-cases/complex-schemas' endpoint.
   * @param body Request body.
   * @returns OpenApiRequestBuilder Use the execute() method to trigger the request.
   */
  useNameWithSymbols: (
    body: SimpleTestEntityWITHSymbols | undefined
  ) => OpenApiRequestBuilder<any>;
  /**
   * Create a request builder for execution of get requests to the '/test-cases/no-operation-id' endpoint.
   * @returns OpenApiRequestBuilder Use the execute() method to trigger the request.
   */
  getTestCasesNoOperationId: () => OpenApiRequestBuilder<any>;
};
//# sourceMappingURL=test-case-api.d.ts.map
