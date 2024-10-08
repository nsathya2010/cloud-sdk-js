import {
  directoryToServiceName,
  directoryToSpeakingModuleName,
  getOptionsPerService,
  getRelPathWithPosixSeparator
} from '@sap-cloud-sdk/generator-common/internal';
import { ParsedGeneratorOptions } from './options';
import {
  readEdmxAndSwaggerFile,
  ServiceMetadata
} from './edmx-parser/edmx-file-reader';
import { apiBusinessHubMetadata } from './swagger-parser/swagger-util';
import { VdmServiceMetadata, VdmServicePackageMetaData } from './vdm-types';
import { isV2Metadata } from './edmx-to-vdm/edmx-to-vdm-util';
import { getServiceEntitiesV2 } from './edmx-to-vdm/v2';
import { getServiceEntitiesV4 } from './edmx-to-vdm/v4';
import { getBasePath } from './service-base-path';

class ServiceGenerator {
  constructor(readonly options: ParsedGeneratorOptions) {}

  public async generateAllServices(): Promise<VdmServiceMetadata[]> {
    return Promise.all(
      this.options.input.map(serviceSpecPath =>
        this.generateService(serviceSpecPath)
      )
    );
  }

  public async generateService(
    edmxServiceSpecPath: string
  ): Promise<VdmServiceMetadata> {
    const optionsPerService = await getOptionsPerService(
      this.options.input,
      this.options
    );
    const serviceOptions =
      optionsPerService[getRelPathWithPosixSeparator(edmxServiceSpecPath)];

    if (!serviceOptions) {
      throw new Error(
        `Options per service not found for key ${getRelPathWithPosixSeparator(
          edmxServiceSpecPath
        )}. Service options are ${JSON.stringify(optionsPerService, null, 2)}`
      );
    }
    const serviceMetadata = readEdmxAndSwaggerFile(edmxServiceSpecPath);

    const vdmServicePackageMetaData = this.getServicePackageMetaData(
      serviceMetadata,
      serviceOptions.directoryName,
      edmxServiceSpecPath
    );

    const vdmServiceEntities = isV2Metadata(serviceMetadata.edmx)
      ? getServiceEntitiesV2(
          serviceMetadata,
          vdmServicePackageMetaData.className,
          this.options.skipValidation
        )
      : getServiceEntitiesV4(
          serviceMetadata,
          vdmServicePackageMetaData.className,
          this.options.skipValidation
        );

    const commonEntities = (selectedEntities =>
      vdmServiceEntities.entities.filter(entity =>
        selectedEntities.includes(entity.entitySetName)
      ))(this.options.selectedEntities ?? []);

    if (commonEntities.length > 0) {
      vdmServiceEntities.entities = commonEntities;
    }

    return {
      ...vdmServicePackageMetaData,
      ...vdmServiceEntities,
      serviceOptions: {
        ...serviceOptions,
        basePath: getBasePath(serviceMetadata, serviceOptions)
      }
    };
  }

  private getServicePackageMetaData(
    serviceMetadata: ServiceMetadata,
    directoryName: string,
    edmxServiceSpecPath: string
  ): VdmServicePackageMetaData {
    return {
      oDataVersion: serviceMetadata.edmx.oDataVersion,
      namespaces: serviceMetadata.edmx.namespaces,
      originalFileName: serviceMetadata.edmx.fileName,
      speakingModuleName: directoryToSpeakingModuleName(directoryName),
      className: directoryToServiceName(directoryName),
      edmxPath: edmxServiceSpecPath,
      apiBusinessHubMetadata: apiBusinessHubMetadata(serviceMetadata.swagger)
    };
  }
}

/**
 * @param options - Generator options
 * @returns the parsed services
 * @internal
 */
export async function parseAllServices(
  options: ParsedGeneratorOptions
): Promise<VdmServiceMetadata[]> {
  return new ServiceGenerator(options).generateAllServices();
}

/**
 * @param serviceDefinitionPaths - Path to the service definition
 * @param options - Generator options
 * @param mappings - mappings for VDM service names to desired name
 * @param globalNameFormatter - Instance of global name formatter to be used for the parsing process
 * @returns the parsed service
 * @internal
 */
export async function parseService(
  edmxServiceSpecPath: string,
  options: ParsedGeneratorOptions
): Promise<VdmServiceMetadata> {
  return new ServiceGenerator(options).generateService(edmxServiceSpecPath);
}

/**
 * @internal
 */
export function getServiceName(service: VdmServiceMetadata): string {
  return service.namespaces.length === 1
    ? service.namespaces[0]
    : service.originalFileName;
}
