"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestEntityEndsWithSomethingElse = void 0;
/*
 * Copyright (c) 2023 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
const odata_v4_1 = require("@sap-cloud-sdk/odata-v4");
/**
 * See https://api.sap.com/api/path for more information.
 */
class TestEntityEndsWithSomethingElse extends odata_v4_1.Entity {
    constructor(_entityApi) {
        super(_entityApi);
        this._entityApi = _entityApi;
    }
}
/**
 * Technical entity name for TestEntityEndsWithSomethingElse.
 */
TestEntityEndsWithSomethingElse._entityName = 'A_TestEntityEndsWithSomethingElse';
/**
 * Default url path for the according service.
 */
TestEntityEndsWithSomethingElse._defaultBasePath = '/sap/opu/odata/sap/API_TEST_SRV';
/**
 * All key fields of the TestEntityEndsWithSomethingElse entity
 */
TestEntityEndsWithSomethingElse._keys = ['KeyProperty'];
exports.TestEntityEndsWithSomethingElse = TestEntityEndsWithSomethingElse;
//# sourceMappingURL=TestEntityEndsWithSomethingElse.js.map