/* eslint-disable max-classes-per-file */
import { AxiosResponse } from 'axios';
import { Destination, DestinationNameAndJwt } from '../connectivity';
import { executeHttpRequest, HttpResponse, Method } from '../http-client';

/**
 * Request builder for OpenAPI requests.
 * @typeParam ResponseT Type of the response for the request.
 */
export class OpenApiRequestBuilder<ResponseT = any> {
  private static isPlaceholder(pathPart: string): boolean {
    return /^\{.+\}$/.test(pathPart);
  }

  private customHeaders: Record<string, string> = {};

  /**
   * Create an instance of `OpenApiRequestBuilder`.
   * @param method HTTP method of the request to be built.
   * @param pathPattern Path for the request containing path parameter references as in the OpenAPI specification.
   * @param parameters Query parameters and or body to pass to the request.
   */
  constructor(
    public method: Method,
    private pathPattern: string,
    private parameters?: OpenApiRequestParameters
  ) {}

  /**
   * Add custom headers to the request. If a header field with the given name already exists it is overwritten.
   * @param headers Key-value pairs denoting additional custom headers.
   * @returns The request builder itself, to facilitate method chaining.
   */
  addCustomHeaders(headers: Record<string, string>): this {
    Object.entries(headers).forEach(([key, value]) => {
      this.customHeaders[key.toLowerCase()] = value;
    });
    return this;
  }

  /**
   * Execute request and get a raw HttpResponse, including all information about the HTTP response.
   * This especially comes in handy, when you need to access the headers or status code of the response.
   * @param destination Destination to execute the request against.
   * @returns A promise resolving to an HttpResponse.
   */
  async executeRaw(
    destination: Destination | DestinationNameAndJwt
  ): Promise<HttpResponse> {
    return executeHttpRequest(destination, {
      method: this.method,
      url: this.getPath(),
      headers: this.customHeaders,
      params: this.parameters?.queryParameters,
      data: this.parameters?.body
    });
  }

  /**
   * Execute request and get the response data. Use this to conveniently access the data of a service without technical information about the response.
   * @param destination Destination to execute the request against.
   * @returns A promise resolving to the requested return type.
   */
  async execute(
    destination: Destination | DestinationNameAndJwt
  ): Promise<ResponseT> {
    const response = await this.executeRaw(destination);
    if (isAxiosResponse(response)) {
      return response.data;
    }
    throw new Error(
      'Could not access response data. Response was not an axios response.'
    );
  }

  private getPath(): string {
    const pathParameters = this.parameters?.pathParameters || {};

    const pathParts = this.pathPattern.split('/');
    return pathParts
      .map(part => {
        if (OpenApiRequestBuilder.isPlaceholder(part)) {
          const paramName = part.slice(1, -1);
          const paramValue = pathParameters[paramName];
          if (!paramValue) {
            throw new Error(
              `Cannot execute request, no path parameter provided for '${paramName}'.`
            );
          }
          return encodeURIComponent(paramValue);
        }
        return part;
      })
      .join('/');
  }
}

// TODO: Tighten types
interface OpenApiRequestParameters {
  pathParameters?: Record<string, any>;
  queryParameters?: Record<string, any>;
  body?: any;
}

function isAxiosResponse(val: any): val is AxiosResponse {
  return 'data' in val;
}
