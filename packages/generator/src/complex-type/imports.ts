import { ImportDeclarationStructure } from 'ts-morph';
import { ODataVersion } from '@sap-cloud-sdk/util';
import {
  complexTypeImportDeclarations,
  odataImportDeclaration,
  propertyFieldTypeImportNames,
  propertyTypeImportNames,
  enumTypeImportDeclarations,
  externalImportDeclarations,
  odataCommonImportDeclaration
} from '../imports';
import { VdmComplexType } from '../vdm-types';

export function importDeclarations(
  complexType: VdmComplexType,
  oDataVersion: ODataVersion
): ImportDeclarationStructure[] {
  return [
    ...externalImportDeclarations(complexType.properties),
    ...complexTypeImportDeclarations(complexType.properties),
    ...enumTypeImportDeclarations(complexType.properties),
    odataImportDeclaration(['deserializeComplexType', 'Entity'], oDataVersion),
    odataCommonImportDeclaration(
      [
        ...propertyTypeImportNames(complexType.properties),
        ...propertyFieldTypeImportNames(complexType.properties),
        'ComplexTypeField',
        'ConstructorOrField',

        'FieldBuilder',
        'FieldType',
        'FieldOptions',
        'PropertyMetadata'
      ].sort()
    )
  ];
}
