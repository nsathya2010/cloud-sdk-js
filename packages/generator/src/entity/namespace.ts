import { unixEOL, unique } from '@sap-cloud-sdk/util';
import {
  ModuleDeclarationStructure,
  StructureKind,
  VariableDeclarationKind,
  VariableStatementStructure,
  OptionalKind,
  VariableDeclarationStructure
} from 'ts-morph';
import { getGenericParameters, linkClass } from '../generator-utils';
import { prependPrefix } from '../internal-prefix';
import {
  getStaticNavPropertyDescription,
  getStaticPropertyDescription,
  addLeadingNewline
} from '../typedoc';
import {
  VdmEntity,
  VdmNavigationProperty,
  VdmProperty,
  VdmServiceMetadata
} from '../vdm-types';

// eslint-disable-next-line valid-jsdoc
/**
 * @internal
 */
export function entityNamespace(
  entity: VdmEntity,
  service: VdmServiceMetadata
): ModuleDeclarationStructure {
  return {
    kind: StructureKind.Module,
    name: entity.className,
    isExported: true,
    statements: [
      fieldBuilderInitializer(entity),
      ...properties(entity),
      ...navigationProperties(entity, service),
      allFields(entity, service),
      allFieldSelector(entity),
      keyFields(entity),
      keys(entity)
    ]
  };
}

function fieldBuilderInitializer(
  entity: VdmEntity
): VariableStatementStructure {
  return {
    kind: StructureKind.VariableStatement,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: '_fieldBuilder',
        type: `FieldBuilder<Constructable<${entity.className}>>`,
        initializer: `new FieldBuilder(${entity.className})`
      }
    ],
    isExported: false
  };
}

function properties(entity: VdmEntity): VariableStatementStructure[] {
  return entity.properties.map(prop => property(prop));
}

function getFieldInitializer(
  prop: VdmProperty
): OptionalKind<VariableDeclarationStructure> {
  return {
    name: prop.staticPropertyName,
    initializer: createPropertyFieldInitializer(prop)
  };
}

function createPropertyFieldInitializer(prop: VdmProperty): string {
  if (prop.isCollection) {
    if (prop.isComplex) {
      return `_fieldBuilder.buildCollectionField('${prop.originalName}', ${prop.jsType}, ${prop.nullable})`;
    }
    if (prop.isEnum) {
      return `_fieldBuilder.buildCollectionField('${prop.originalName}', ${prop.jsType}, ${prop.nullable})`;
    }
    return `_fieldBuilder.buildCollectionField('${prop.originalName}', '${prop.edmType}', ${prop.nullable})`;
  }

  if (prop.isComplex) {
    return `_fieldBuilder.buildComplexTypeField('${prop.originalName}', ${prop.fieldType}, ${prop.nullable})`;
  }

  if (prop.isEnum) {
    return `_fieldBuilder.buildEnumField('${prop.originalName}', ${prop.jsType}, ${prop.nullable})`;
  }

  return `_fieldBuilder.buildEdmTypeField('${prop.originalName}', '${prop.edmType}', ${prop.nullable})`;
}

function property(prop: VdmProperty): VariableStatementStructure {
  return {
    kind: StructureKind.VariableStatement,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [getFieldInitializer(prop)],
    docs: [getStaticPropertyDescription(prop)],
    isExported: true
  };
}

function navigationProperties(
  entity: VdmEntity,
  service: VdmServiceMetadata
): VariableStatementStructure[] {
  return entity.navigationProperties.map(navProp =>
    navigationProperty(navProp, entity, service)
  );
}

function navigationProperty(
  navProp: VdmNavigationProperty,
  entity: VdmEntity,
  service: VdmServiceMetadata
): VariableStatementStructure {
  const matchedEntity = service.entities.find(
    e => e.entitySetName === navProp.to
  );
  if (!matchedEntity) {
    throw Error(
      `Failed to find the entity from the service: ${JSON.stringify(
        service
      )} for nav property ${navProp}`
    );
  }

  const toEntity = matchedEntity.className;

  return {
    kind: StructureKind.VariableStatement,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: navProp.staticPropertyName,
        type: `${linkClass(navProp, service.oDataVersion)}<${
          entity.className
        },${toEntity}>`,
        initializer: `new ${linkClass(navProp, service.oDataVersion)}('${
          navProp.originalName
        }', ${entity.className}, ${toEntity})`
      }
    ],
    docs: [getStaticNavPropertyDescription(navProp)],
    isExported: true
  };
}

function allFields(
  entity: VdmEntity,
  service: VdmServiceMetadata
): VariableStatementStructure {
  const fieldTypes = unique([
    ...entity.properties.map(
      p => `${p.fieldType}<${getGenericParameters(entity.className, p, true)}>`
    ),
    ...entity.navigationProperties.map(
      p =>
        `${linkClass(p, service.oDataVersion)}<${entity.className},${
          p.toEntityClassName
        }>`
    )
  ]);
  return {
    kind: StructureKind.VariableStatement,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: prependPrefix('allFields'),
        type: `Array<${fieldTypes.join(' | ')}>`,
        initializer: `[
          ${entity.properties
            .map(prop => prop.staticPropertyName)
            .concat(
              entity.navigationProperties.map(
                navProp => navProp.staticPropertyName
              )
            )
            .map(name => `${entity.className}.${name}`)
            .join(`, ${unixEOL}`)}
          ]`
      }
    ],
    docs: [addLeadingNewline(`All fields of the ${entity.className} entity.`)],
    isExported: true
  };
}

function allFieldSelector(entity: VdmEntity): VariableStatementStructure {
  return {
    kind: StructureKind.VariableStatement,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: 'ALL_FIELDS',
        type: `AllFields<${entity.className}>`,
        initializer: `new AllFields('*', ${entity.className})`
      }
    ],
    docs: [addLeadingNewline('All fields selector.')],
    isExported: true
  };
}

function keyFields(entity: VdmEntity): VariableStatementStructure {
  return {
    kind: StructureKind.VariableStatement,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: prependPrefix('keyFields'),
        type: `Array<Field<${entity.className}, boolean, boolean>>`,
        initializer:
          '[' +
          entity.keys
            .map(key => `${entity.className}.${key.staticPropertyName}`)
            .join(', ') +
          ']'
      }
    ],
    docs: [
      addLeadingNewline(`All key fields of the ${entity.className} entity.`)
    ],
    isExported: true
  };
}

function keys(entity: VdmEntity): VariableStatementStructure {
  return {
    kind: StructureKind.VariableStatement,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: prependPrefix('keys'),
        type: `{[keys: string]: Field<${entity.className}, boolean, boolean>}`,
        initializer: `${entity.className}.${prependPrefix(
          'keyFields'
        )}.reduce((acc: {[keys: string]: Field<${
          entity.className
        }, boolean, boolean>}, field: Field<${
          entity.className
        }, boolean, boolean>) => {
          acc[field._fieldName] = field;
          return acc;
        }, {})`
      }
    ],
    docs: [
      addLeadingNewline(
        `Mapping of all key field names to the respective static field property ${entity.className}.`
      )
    ],
    isExported: true
  };
}
