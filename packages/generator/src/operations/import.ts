import { ImportDeclarationStructure, StructureKind } from 'ts-morph';
import voca from 'voca';
import {
  VdmOperationReturnType,
  VdmOperation,
  VdmServiceMetadata
} from '../vdm-types';
import {
  odataImportDeclarationTsMorph,
  propertyTypeImportNames,
  externalImportDeclarationsTsMorph,
  mergeImportDeclarations
} from '../imports';
import { cannotDeserialize } from '../edmx-to-vdm/common';
import { responseTransformerFunctionName } from './response-transformer-function';

function complexTypeRelatedImports(returnTypes: VdmOperationReturnType[]) {
  return returnTypes.some(
    returnType => returnType.returnTypeCategory === 'complex-type'
  )
    ? ['entityDeserializer']
    : [];
}

function edmRelatedImports(returnTypes: VdmOperationReturnType[]) {
  return returnTypes.some(
    returnType => returnType.returnTypeCategory === 'edm-type'
  )
    ? ['edmToTs']
    : [];
}

function responseTransformerImports(returnTypes: VdmOperationReturnType[]) {
  return returnTypes.map(returnType =>
    cannotDeserialize(returnType)
      ? 'throwErrorWhenReturnTypeIsUnionType'
      : responseTransformerFunctionName(returnType)
  );
}

function returnTypeImports(
  returnTypes: VdmOperationReturnType[]
): ImportDeclarationStructure[] {
  return mergeImportDeclarations(
    returnTypes
      .filter(
        returnType =>
          returnType.returnTypeCategory !== 'edm-type' &&
          returnType.returnTypeCategory !== 'void' &&
          returnType.returnTypeCategory !== 'never'
      )
      .reduce(
        (imports, returnType) => [...imports, ...returnTypeImport(returnType)],
        []
      )
  );
}

function returnTypeImport(
  returnType: VdmOperationReturnType
): ImportDeclarationStructure[] {
  const typeImports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      namedImports: [returnType.returnType],
      moduleSpecifier: `./${returnType.returnType}`
    }
  ];
  if (returnType.returnTypeCategory === 'entity') {
    return [
      ...typeImports,
      {
        kind: StructureKind.ImportDeclaration,
        namedImports: [`${returnType.returnType}Api`],
        moduleSpecifier: `./${returnType.returnType}Api`
      }
    ];
  }
  return typeImports;
}

/**
 * @internal
 */
export function operationImportDeclarations(
  { oDataVersion, className }: VdmServiceMetadata,
  type: 'function' | 'action',
  operations: VdmOperation[] = []
): ImportDeclarationStructure[] {
  if (!operations.length) {
    return [];
  }

  const parameters = operations.flatMap(({ parameters: params }) => params);
  const returnTypes = operations.map(({ returnType }) => returnType);

  const includesBound = !!operations.filter(operation => operation.isBound)
    .length;
  const includesUnbound = !!operations.filter(operation => !operation.isBound)
    .length;

  const hasOperationWithParameters = !!operations.filter(
    operation => operation.parameters.length > 0 && operation.type === type
  ).length;
  if (includesUnbound && includesBound) {
    throw new Error(
      'Bound and unbound operations found in generation - this should not happen.'
    );
  }
  const serviceImport: ImportDeclarationStructure[] = includesBound
    ? []
    : [
        {
          kind: StructureKind.ImportDeclaration,
          namedImports: [voca.decapitalize(className)],
          moduleSpecifier: './service'
        }
      ];

  return [
    ...externalImportDeclarationsTsMorph(parameters),
    odataImportDeclarationTsMorph(
      [
        ...edmRelatedImports(returnTypes),
        ...complexTypeRelatedImports(returnTypes),
        ...responseTransformerImports(returnTypes),
        'DeSerializers',
        'DefaultDeSerializers',
        'defaultDeSerializers',
        ...propertyTypeImportNames(parameters),
        ...(hasOperationWithParameters
          ? [`${voca.capitalize(type)}ImportParameter`]
          : []),
        ...(includesUnbound
          ? [`${voca.capitalize(type)}ImportRequestBuilder`]
          : []),
        ...(includesBound
          ? [`Bound${voca.capitalize(type)}ImportRequestBuilder`]
          : [])
      ],
      oDataVersion
    ),
    ...serviceImport,
    ...returnTypeImports(returnTypes)
  ];
}
