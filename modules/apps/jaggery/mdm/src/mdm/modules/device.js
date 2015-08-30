/*
 * Copyright (c) 2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var deviceModule;
deviceModule = function () {
    //var log = new Log("modules/device.js");

    var utility = require('/modules/utility.js').utility;
    var constants = require('/modules/constants.js');

    var ArrayList = Packages.java.util.ArrayList;
    var Properties = Packages.java.util.Properties;
    var DeviceIdentifier = Packages.org.wso2.carbon.device.mgt.common.DeviceIdentifier;
    var DeviceManagerUtil = Packages.org.wso2.carbon.device.mgt.core.util.DeviceManagerUtil;
    var SimpleOperation = Packages.org.wso2.carbon.device.mgt.core.operation.mgt.SimpleOperation;
    var ConfigOperation = Packages.org.wso2.carbon.device.mgt.core.operation.mgt.ConfigOperation;
    var CommandOperation = Packages.org.wso2.carbon.device.mgt.core.operation.mgt.CommandOperation;

    var deviceManagementService = utility.getDeviceManagementService();

    var publicMethods = {};
    var privateMethods = {};

    privateMethods.validateAndReturn = function (value) {
        return (value == undefined || value == null) ? constants.UNSPECIFIED : value;
    };

    /*
     @Deprecated
     */
    publicMethods.listDevices = function () {
        var carbonUser = session.get(constants.USER_SESSION_KEY);
        var utility = require('/modules/utility.js').utility;
        if (!carbonUser) {
            log.error("User object was not found in the session");
            throw constants.ERRORS.USER_NOT_FOUND;
        }
        try {
            utility.startTenantFlow(carbonUser);
            var deviceManagementService = utility.getDeviceManagementService();
            var devices = deviceManagementService.getAllDevices();
            var deviceList = [];
            var i, device, propertiesList, deviceObject;
            for (i = 0; i < devices.size(); i++) {
                device = devices.get(i);
                propertiesList = DeviceManagerUtil.convertDevicePropertiesToMap(device.getProperties());

                deviceObject = {};
                deviceObject[constants.DEVICE_IDENTIFIER] =
                    privateMethods.validateAndReturn(device.getDeviceIdentifier());
                deviceObject[constants.DEVICE_NAME] =
                    privateMethods.validateAndReturn(device.getName());
                deviceObject[constants.DEVICE_OWNERSHIP] =
                    privateMethods.validateAndReturn(device.getEnrolmentInfo().getOwnership());
                deviceObject[constants.DEVICE_OWNER] =
                    privateMethods.validateAndReturn(device.getEnrolmentInfo().getOwner());
                deviceObject[constants.DEVICE_TYPE] =
                    privateMethods.validateAndReturn(device.getType());
                deviceObject[constants.DEVICE_PROPERTIES] = {};
                if (device.getType() == constants.PLATFORM_IOS) {
                    deviceObject[constants.DEVICE_PROPERTIES][constants.DEVICE_MODEL] =
                        privateMethods.validateAndReturn(propertiesList.get(constants.DEVICE_PRODUCT));
                    deviceObject[constants.DEVICE_PROPERTIES][constants.DEVICE_VENDOR] = constants.VENDOR_APPLE;
                } else {
                    deviceObject[constants.DEVICE_PROPERTIES][constants.DEVICE_MODEL] =
                        privateMethods.validateAndReturn(propertiesList.get(constants.DEVICE_MODEL));
                    deviceObject[constants.DEVICE_PROPERTIES][constants.DEVICE_VENDOR] =
                        privateMethods.validateAndReturn(propertiesList.get(constants.DEVICE_VENDOR));
                }
                deviceObject[constants.DEVICE_PROPERTIES][constants.DEVICE_OS_VERSION] =
                    privateMethods.validateAndReturn(propertiesList.get(constants.DEVICE_OS_VERSION));

                deviceList.push(deviceObject);
            }
            return deviceList;
        } catch (e) {
            throw e;
        } finally {
            utility.endTenantFlow();
        }
    };

    publicMethods.listDevicesForUser = function (username) {
        var carbonUser = session.get(constants.USER_SESSION_KEY);
        var utility = require('/modules/utility.js').utility;
        if (!carbonUser) {
            log.error("User object was not found in the session");
            throw constants.ERRORS.USER_NOT_FOUND;
        }
        try{
            utility.startTenantFlow(carbonUser);
            var deviceManagementService = utility.getDeviceManagementService();
            var devices = deviceManagementService.getDeviceListOfUser(username);
            var deviceList = [];
            var i, device, propertiesList, deviceObject;
            for (i = 0; i < devices.size(); i++) {
                device = devices.get(i);
                propertiesList = DeviceManagerUtil.convertDevicePropertiesToMap(device.getProperties());

                deviceObject = {};
                deviceObject[constants.DEVICE_IDENTIFIER] =
                    privateMethods.validateAndReturn(device.getDeviceIdentifier());
                deviceObject[constants.DEVICE_NAME] =
                    privateMethods.validateAndReturn(device.getName());
                deviceObject[constants.DEVICE_OWNERSHIP] =
                    privateMethods.validateAndReturn(device.getEnrolmentInfo().getOwnership());
                deviceObject[constants.DEVICE_OWNER] =
                    privateMethods.validateAndReturn(device.getEnrolmentInfo().getOwner());
                deviceObject[constants.DEVICE_TYPE] =
                    privateMethods.validateAndReturn(device.getType());
                deviceObject[constants.DEVICE_PROPERTIES] = {};
                if (device.getType() == constants.PLATFORM_IOS) {
                    deviceObject[constants.DEVICE_PROPERTIES][constants.DEVICE_MODEL] =
                        privateMethods.validateAndReturn(propertiesList.get(constants.DEVICE_PRODUCT));
                    deviceObject[constants.DEVICE_PROPERTIES][constants.DEVICE_VENDOR] = constants.VENDOR_APPLE;
                } else {
                    deviceObject[constants.DEVICE_PROPERTIES][constants.DEVICE_MODEL] =
                        privateMethods.validateAndReturn(propertiesList.get(constants.DEVICE_MODEL));
                    deviceObject[constants.DEVICE_PROPERTIES][constants.DEVICE_VENDOR] =
                        privateMethods.validateAndReturn(propertiesList.get(constants.DEVICE_VENDOR));
                }
                deviceObject[constants.DEVICE_PROPERTIES][constants.DEVICE_OS_VERSION] =
                    privateMethods.validateAndReturn(propertiesList.get(constants.DEVICE_OS_VERSION));

                deviceList.push(deviceObject);
            }
            return deviceList;
        }catch (e) {
            throw e;
        } finally {
            utility.endTenantFlow();
        }
    };

    /*
     @Deprecated
     */
    /*
     Get the supported features by the device type
     */
    publicMethods.getFeatures = function (deviceType) {
        var carbonUser = session.get(constants.USER_SESSION_KEY);
        var utility = require('/modules/utility.js').utility;
        if (!carbonUser) {
            log.error("User object was not found in the session");
            throw constants.ERRORS.USER_NOT_FOUND;
        }
        try{
            utility.startTenantFlow(carbonUser);
            var deviceManagementService = utility.getDeviceManagementService();
            var features = deviceManagementService.getFeatureManager(deviceType).getFeatures();
            var featuresConverted = {};
            if (features) {
                var i, feature, featureObject;
                for (i = 0; i < features.size(); i++) {
                    feature = features.get(i);
                    featureObject = {};
                    featureObject[constants.FEATURE_NAME] = feature.getName();
                    featureObject[constants.FEATURE_DESCRIPTION] = feature.getDescription();
                    featuresConverted[feature.getName()] = featureObject;
                }
            }
            return featuresConverted;
        }catch (e) {
            throw e;
        } finally {
            utility.endTenantFlow();
        }
    };

    /*
     @Deprecated
     */
    publicMethods.performOperation = function (devices, operation) {
        var carbonUser = session.get(constants.USER_SESSION_KEY);
        var utility = require('/modules/utility.js').utility;
        if (!carbonUser) {
            log.error("User object was not found in the session");
            throw constants.ERRORS.USER_NOT_FOUND;
        }
        try{
            utility.startTenantFlow(carbonUser);
            var deviceManagementService = utility.getDeviceManagementService();
            var operationInstance;
            if (operation.type == "COMMAND") {
                operationInstance = new CommandOperation();
            } else if (operation.type == "CONFIG") {
                operationInstance = new ConfigOperation();
            } else {
                operationInstance = new SimpleOperation();
            }
            operationInstance.setCode(operation.featureName);
            var props = new Properties();
            var i, object;
            for (i = 0; i < operation.properties.length; i++) {
                object = properties[i];
                props.setProperty(object.key, object.value);
            }
            operationInstance.setProperties(props);
            var deviceList = new ArrayList();
            var j, device, deviceIdentifier;
            for (j = 0; j < devices.length; i++) {
                device = devices[j];
                deviceIdentifier = new DeviceIdentifier();
                deviceIdentifier.setId(device.id);
                deviceIdentifier.setType(device.type);
                deviceList.add(deviceIdentifier);
            }
            deviceManagementService.addOperation(operationInstance, deviceList);
        }catch (e) {
            throw e;
        } finally {
            utility.endTenantFlow();
        }
    };

    /*
     @Deprecated
     */
    privateMethods.getDevice = function (type, deviceId) {
        var carbonUser = session.get(constants.USER_SESSION_KEY);
        var utility = require('/modules/utility.js').utility;
        if (!carbonUser) {
            log.error("User object was not found in the session");
            throw constants.ERRORS.USER_NOT_FOUND;
        }
        try{
            utility.startTenantFlow(carbonUser);
            var deviceManagementService = utility.getDeviceManagementService();
            var deviceIdentifier = new DeviceIdentifier();
            deviceIdentifier.setType(type);
            deviceIdentifier.setId(deviceId);
            return deviceManagementService.getDevice(deviceIdentifier);
        }catch (e) {
            throw e;
        } finally {
            utility.endTenantFlow();
        }
    };

    publicMethods.viewDevice = function (type, deviceId) {
        try {
            var device = privateMethods.getDevice(type, deviceId);
            if (device) {
                var propertiesList = DeviceManagerUtil.convertDevicePropertiesToMap(device.getProperties());
                var entries = propertiesList.entrySet();
                var iterator = entries.iterator();
                var properties = {};
                var entry, key, value;

                while (iterator.hasNext()) {
                    entry = iterator.next();
                    key = entry.getKey();
                    value = entry.getValue();
                    properties[key] = privateMethods.validateAndReturn(value);
                }

                var deviceObject = {};
                deviceObject[constants.DEVICE_IDENTIFIER] = device.getDeviceIdentifier();
                deviceObject[constants.DEVICE_NAME] = privateMethods.validateAndReturn(device.getName());
                deviceObject[constants.DEVICE_OWNERSHIP] = privateMethods.validateAndReturn(device.getEnrolmentInfo().getOwnership());
                deviceObject[constants.DEVICE_OWNER] = device.getEnrolmentInfo().getOwner();
                deviceObject[constants.DEVICE_TYPE] = device.getType();
                if (device.getType() == constants.PLATFORM_IOS) {
                    properties[constants.DEVICE_MODEL] = properties[constants.DEVICE_PRODUCT];
                    delete properties[constants.DEVICE_PRODUCT];
                    properties[constants.DEVICE_VENDOR] = constants.VENDOR_APPLE;
                }
                deviceObject[constants.DEVICE_PROPERTIES] = properties;

                return deviceObject;
            }
        } catch (e) {
            throw e;
        }
    };

    publicMethods.getLicense = function () {

        var deviceManagementService = utility.getDeviceManagementService();
        return deviceManagementService.getLicense(constants.PLATFORM_IOS, constants.LANGUAGE_US);

    };

    return publicMethods;
}();
