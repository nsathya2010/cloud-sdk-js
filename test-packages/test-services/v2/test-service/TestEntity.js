'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.TestEntity = void 0;
/*
 * Copyright (c) 2021 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
const TestEntityRequestBuilder_1 = require('./TestEntityRequestBuilder');
const TestComplexType_1 = require('./TestComplexType');
const odata_v2_1 = require('@sap-cloud-sdk/odata-v2');
const internal_1 = require('@sap-cloud-sdk/odata-common/internal');
/**
 * This class represents the entity "A_TestEntity" of service "API_TEST_SRV".
 */
class TestEntity extends odata_v2_1.Entity {
  /**
   * Returns an entity builder to construct instances of `TestEntity`.
   * @returns A builder that constructs instances of entity type `TestEntity`.
   */
  static builder() {
    return odata_v2_1.Entity.entityBuilder(TestEntity);
  }
  /**
   * Returns a request builder to construct requests for operations on the `TestEntity` entity type.
   * @returns A `TestEntity` request builder.
   */
  static requestBuilder() {
    return new TestEntityRequestBuilder_1.TestEntityRequestBuilder();
  }
  /**
   * Returns a selectable object that allows the selection of custom field in a get request for the entity `TestEntity`.
   * @param fieldName Name of the custom field to select
   * @returns A builder that constructs instances of entity type `TestEntity`.
   */
  static customField(fieldName) {
    return odata_v2_1.Entity.customFieldSelector(fieldName, TestEntity);
  }
  /**
   * Overwrites the default toJSON method so that all instance variables as well as all custom fields of the entity are returned.
   * @returns An object containing all instance variables + custom fields.
   */
  toJSON() {
    return { ...this, ...this._customFields };
  }
}
exports.TestEntity = TestEntity;
/**
 * Technical entity name for TestEntity.
 */
TestEntity._entityName = 'A_TestEntity';
/**
 * Default url path for the according service.
 */
TestEntity._defaultServicePath = '/sap/opu/odata/sap/API_TEST_SRV';
const TestEntityMultiLink_1 = require('./TestEntityMultiLink');
const TestEntityOtherMultiLink_1 = require('./TestEntityOtherMultiLink');
const TestEntitySingleLink_1 = require('./TestEntitySingleLink');
(function (TestEntity) {
  const _fieldBuilder = new internal_1.FieldBuilder(TestEntity);
  /**
   * Static representation of the [[keyPropertyGuid]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.KEY_PROPERTY_GUID = _fieldBuilder.buildEdmTypeField(
    'KeyPropertyGuid',
    'Edm.Guid',
    false
  );
  /**
   * Static representation of the [[keyPropertyString]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.KEY_PROPERTY_STRING = _fieldBuilder.buildEdmTypeField(
    'KeyPropertyString',
    'Edm.String',
    false
  );
  /**
   * Static representation of the [[stringProperty]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.STRING_PROPERTY = _fieldBuilder.buildEdmTypeField(
    'StringProperty',
    'Edm.String',
    true
  );
  /**
   * Static representation of the [[booleanProperty]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.BOOLEAN_PROPERTY = _fieldBuilder.buildEdmTypeField(
    'BooleanProperty',
    'Edm.Boolean',
    true
  );
  /**
   * Static representation of the [[guidProperty]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.GUID_PROPERTY = _fieldBuilder.buildEdmTypeField(
    'GuidProperty',
    'Edm.Guid',
    true
  );
  /**
   * Static representation of the [[int16Property]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.INT_16_PROPERTY = _fieldBuilder.buildEdmTypeField(
    'Int16Property',
    'Edm.Int16',
    true
  );
  /**
   * Static representation of the [[int32Property]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.INT_32_PROPERTY = _fieldBuilder.buildEdmTypeField(
    'Int32Property',
    'Edm.Int32',
    true
  );
  /**
   * Static representation of the [[int64Property]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.INT_64_PROPERTY = _fieldBuilder.buildEdmTypeField(
    'Int64Property',
    'Edm.Int64',
    true
  );
  /**
   * Static representation of the [[decimalProperty]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.DECIMAL_PROPERTY = _fieldBuilder.buildEdmTypeField(
    'DecimalProperty',
    'Edm.Decimal',
    true
  );
  /**
   * Static representation of the [[singleProperty]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.SINGLE_PROPERTY = _fieldBuilder.buildEdmTypeField(
    'SingleProperty',
    'Edm.Single',
    true
  );
  /**
   * Static representation of the [[doubleProperty]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.DOUBLE_PROPERTY = _fieldBuilder.buildEdmTypeField(
    'DoubleProperty',
    'Edm.Double',
    true
  );
  /**
   * Static representation of the [[floatProperty]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.FLOAT_PROPERTY = _fieldBuilder.buildEdmTypeField(
    'FloatProperty',
    'Edm.Float',
    true
  );
  /**
   * Static representation of the [[timeProperty]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.TIME_PROPERTY = _fieldBuilder.buildEdmTypeField(
    'TimeProperty',
    'Edm.Time',
    true
  );
  /**
   * Static representation of the [[dateTimeProperty]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.DATE_TIME_PROPERTY = _fieldBuilder.buildEdmTypeField(
    'DateTimeProperty',
    'Edm.DateTime',
    true
  );
  /**
   * Static representation of the [[dateTimeOffSetProperty]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.DATE_TIME_OFF_SET_PROPERTY = _fieldBuilder.buildEdmTypeField(
    'DateTimeOffSetProperty',
    'Edm.DateTimeOffset',
    true
  );
  /**
   * Static representation of the [[byteProperty]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.BYTE_PROPERTY = _fieldBuilder.buildEdmTypeField(
    'ByteProperty',
    'Edm.Byte',
    true
  );
  /**
   * Static representation of the [[sByteProperty]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.S_BYTE_PROPERTY = _fieldBuilder.buildEdmTypeField(
    'SByteProperty',
    'Edm.SByte',
    true
  );
  /**
   * Static representation of the [[somethingTheSdkDoesNotSupport]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.SOMETHING_THE_SDK_DOES_NOT_SUPPORT =
    _fieldBuilder.buildEdmTypeField(
      'SomethingTheSDKDoesNotSupport',
      'Edm.Any',
      true
    );
  /**
   * Static representation of the [[complexTypeProperty]] property for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.COMPLEX_TYPE_PROPERTY = _fieldBuilder.buildComplexTypeField(
    'ComplexTypeProperty',
    TestComplexType_1.TestComplexTypeField,
    true
  );
  /**
   * Static representation of the one-to-many navigation property [[toMultiLink]] for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.TO_MULTI_LINK = new internal_1.Link(
    'to_MultiLink',
    TestEntity,
    TestEntityMultiLink_1.TestEntityMultiLink
  );
  /**
   * Static representation of the one-to-many navigation property [[toOtherMultiLink]] for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.TO_OTHER_MULTI_LINK = new internal_1.Link(
    'to_OtherMultiLink',
    TestEntity,
    TestEntityOtherMultiLink_1.TestEntityOtherMultiLink
  );
  /**
   * Static representation of the one-to-one navigation property [[toSingleLink]] for query construction.
   * Use to reference this property in query operations such as 'select' in the fluent request API.
   */
  TestEntity.TO_SINGLE_LINK = new internal_1.OneToOneLink(
    'to_SingleLink',
    TestEntity,
    TestEntitySingleLink_1.TestEntitySingleLink
  );
  /**
   * All fields of the TestEntity entity.
   */
  TestEntity._allFields = [
    TestEntity.KEY_PROPERTY_GUID,
    TestEntity.KEY_PROPERTY_STRING,
    TestEntity.STRING_PROPERTY,
    TestEntity.BOOLEAN_PROPERTY,
    TestEntity.GUID_PROPERTY,
    TestEntity.INT_16_PROPERTY,
    TestEntity.INT_32_PROPERTY,
    TestEntity.INT_64_PROPERTY,
    TestEntity.DECIMAL_PROPERTY,
    TestEntity.SINGLE_PROPERTY,
    TestEntity.DOUBLE_PROPERTY,
    TestEntity.FLOAT_PROPERTY,
    TestEntity.TIME_PROPERTY,
    TestEntity.DATE_TIME_PROPERTY,
    TestEntity.DATE_TIME_OFF_SET_PROPERTY,
    TestEntity.BYTE_PROPERTY,
    TestEntity.S_BYTE_PROPERTY,
    TestEntity.SOMETHING_THE_SDK_DOES_NOT_SUPPORT,
    TestEntity.COMPLEX_TYPE_PROPERTY,
    TestEntity.TO_MULTI_LINK,
    TestEntity.TO_OTHER_MULTI_LINK,
    TestEntity.TO_SINGLE_LINK
  ];
  /**
   * All fields selector.
   */
  TestEntity.ALL_FIELDS = new internal_1.AllFields('*', TestEntity);
  /**
   * All key fields of the TestEntity entity.
   */
  TestEntity._keyFields = [
    TestEntity.KEY_PROPERTY_GUID,
    TestEntity.KEY_PROPERTY_STRING
  ];
  /**
   * Mapping of all key field names to the respective static field property TestEntity.
   */
  TestEntity._keys = TestEntity._keyFields.reduce((acc, field) => {
    acc[field._fieldName] = field;
    return acc;
  }, {});
})((TestEntity = exports.TestEntity || (exports.TestEntity = {})));
//# sourceMappingURL=TestEntity.js.map
