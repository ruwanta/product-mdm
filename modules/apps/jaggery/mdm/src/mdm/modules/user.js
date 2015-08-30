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

/*
 * This module contains user and roles related functionality
 */
var userModule = function () {
    var log = new Log("modules/user.js");

    var constants = require("/modules/constants.js");
    var dataConfig = require("/config/mdm-props.js").config();
    var utility = require("/modules/utility.js").utility;

    /* Initializing user manager */
    var carbon = require('carbon');
    var tenantId = carbon.server.tenantId();
    var url = carbon.server.address('https') + "/admin/services";
    var server = new carbon.server.Server(url);
    var userManager = new carbon.user.UserManager(server, tenantId);

    var deviceManagementService = utility.getDeviceManagementService();
    var EmailMessageProperties = Packages.org.wso2.carbon.device.mgt.common.EmailMessageProperties;

    var publicMethods = {};
    var privateMethods = {};

    /**
     * Authenticate a user when he or she attempts to login to MDM.
     *
     * @param username Username of the user
     * @param password Password of the user
     * @param successCallback Function to be called at the event of successful authentication
     * @param failureCallback Function to be called at the event of failed authentication
     */
    publicMethods.login = function (username, password, successCallback, failureCallback) {
        var carbonModule = require("carbon");
        var carbonServer = application.get("carbonServer");
        try {
            // check if the user is an authenticated user.
            var isAuthenticated = carbonServer.authenticate(username, password);
            if (isAuthenticated) {
                var tenantUser = carbonModule.server.tenantUser(username);
                session.put(constants.USER_SESSION_KEY, tenantUser);
                successCallback(tenantUser);
            } else {
                failureCallback();
            }
        } catch (e) {
            throw e;
        }
    };

    /**
     * Add user to mdm-user-store.
     *
     * @param username Username of the user
     * @param firstname First name of the user
     * @param lastname Last name of the user
     * @param emailAddress Email address of the user
     * @param userRoles Roles assigned to the user
     *
     * @returns {number} HTTP Status code 201 if succeeded, 409 if user already exists
     */
    publicMethods.addUser = function (username, firstname, lastname, emailAddress, userRoles) {
        var statusCode, carbon = require('carbon');
        var carbonUser = session.get(constants.USER_SESSION_KEY);
        var utility = require('/modules/utility.js').utility;
        if (!carbonUser) {
            log.error("User object was not found in the session");
            throw constants.ERRORS.USER_NOT_FOUND;
        }
        try {
            utility.startTenantFlow(carbonUser);
            var tenantId = carbon.server.tenantId();
            var userManager = new carbon.user.UserManager(server, tenantId);
            if (userManager.userExists(username)) {
                if (log.isDebugEnabled()) {
                    log.debug("A user with name '" + username + "' already exists.");
                }
                // http status code 409 refers to - conflict.
                statusCode = 409;
            } else {
                var initialUserPassword = privateMethods.generateInitialUserPassword();
                var defaultUserClaims = privateMethods.buildDefaultUserClaims(firstname, lastname, emailAddress);

                userManager.addUser(username, initialUserPassword, userRoles, defaultUserClaims, "default");
                privateMethods.inviteUserToEnroll(username, initialUserPassword);
                if (log.isDebugEnabled()) {
                    log.debug("A new user with name '" + username + "' was created.");
                }
                // http status code 201 refers to - created.
                statusCode = 201;
            }
            return statusCode;
        } catch (e) {
            throw e;
        } finally{
            utility.endTenantFlow();
        }
    };

    /**
     * Remove an existing user from mdm-user-store.
     *
     * @param username Username of the user
     * @returns {number} HTTP Status code 200 if succeeded, 409 if the user does not exist
     */
    publicMethods.removeUser = function (username) {
        var statusCode, carbon = require('carbon');
        var carbonUser = session.get(constants.USER_SESSION_KEY);
        var utility = require('/modules/utility.js').utility;
        if (!carbonUser) {
            log.error("User object was not found in the session");
            throw constants.ERRORS.USER_NOT_FOUND;
        }
        try {
            utility.startTenantFlow(carbonUser);
            var tenantId = carbon.server.tenantId();
            var userManager = new carbon.user.UserManager(server, tenantId);
            if (userManager.userExists(username)) {
                userManager.removeUser(username);
                if (log.isDebugEnabled()) {
                    log.debug("An existing user with name '" + username + "' was removed.");
                }
                // http status code 200 refers to - success.
                statusCode = 200;
            } else {
                if (log.isDebugEnabled()) {
                    log.debug("A user with name '" + username + "' does not exist to remove.");
                }
                // http status code 409 refers to - conflict.
                statusCode = 409;
            }
            return statusCode;
        } catch (e) {
            throw e;
        } finally {
            utility.endTenantFlow();
        }
    };

    /**
     * Private method to be used by addUser() to
     * generate an initial user password for a user.
     * This will be the password used by a user for his initial login to the system.
     *
     * @returns {string} Initial User Password
     */
    privateMethods.generateInitialUserPassword = function () {
        var passwordLength = 6;
        //defining the pool of characters to be used for initial password generation
        var lowerCaseCharset = "abcdefghijklmnopqrstuvwxyz";
        var upperCaseCharset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var numericCharset = "0123456789";

        var totalCharset = lowerCaseCharset + upperCaseCharset + numericCharset;
        var totalCharsetLength = totalCharset.length;

        var initialUserPassword = "";
        for (var i = 0; i < passwordLength; ++i) {
            initialUserPassword += totalCharset.charAt(Math.floor(Math.random() * totalCharsetLength));
        }
        if (log.isDebugEnabled()) {
            log.debug("Initial password created for new user : " + initialUserPassword);
        }
        return String(initialUserPassword);
    };

    /**
     * Build default user claims.
     *
     * @param firstname First name of the user
     * @param lastname Last name of the user
     * @param emailAddress Email address of the user
     *
     * @returns {Object} Default user claims to be provided
     */
    privateMethods.buildDefaultUserClaims = function (firstname, lastname, emailAddress) {
        var defaultUserClaims = {
            "http://wso2.org/claims/givenname": firstname,
            "http://wso2.org/claims/lastname": lastname,
            "http://wso2.org/claims/emailaddress": emailAddress
        };
        if (log.isDebugEnabled()) {
            log.debug("ClaimMap created for new user : " + stringify(defaultUserClaims));
        }
        return defaultUserClaims;
    };

    /**
     * Send an initial invitation email to a user with username/password attached
     * for the very-first enrollment with WSO2 MDM.
     *
     * @param username Username of the user
     * @param password Password of the user
     */
    privateMethods.inviteUserToEnroll = function (username, password) {
        var carbon = require('carbon');
        var enrollmentURL = dataConfig.httpsURL + dataConfig.appContext + "download-agent";
        var carbonUser = session.get(constants.USER_SESSION_KEY);
        var utility = require('/modules/utility.js').utility;
        if (!carbonUser) {
            log.error("User object was not found in the session");
            throw constants.ERRORS.USER_NOT_FOUND;
        }
        //var user = userManagementService.getUser(username, carbonUser.tenantId);
        try {
            utility.startTenantFlow(carbonUser);
            var tenantId = carbon.server.tenantId();
            var userManager = new carbon.user.UserManager(server, tenantId);
            var emailTo = [];
            var user = userManager.getUser(username);
            emailTo[0] = privateMethods.getEmail(username, userManager);
            var emailMessageProperties = new EmailMessageProperties();
            emailMessageProperties.setMailTo(emailTo);
            emailMessageProperties.setFirstName(privateMethods.getFirstName(username, userManager));
            emailMessageProperties.setUserName(username);
            emailMessageProperties.setPassword(password);
            emailMessageProperties.setEnrolmentUrl(enrollmentURL);
            deviceManagementService.sendRegistrationEmail(emailMessageProperties);
        } catch (e) {
            throw e;
        } finally {
            utility.endTenantFlow();
        }
    };

    privateMethods.getEmail = function(username, userManager) {
        return userManager.getClaim(username, "http://wso2.org/claims/emailaddress", null)
    };

    privateMethods.getFirstName = function(username, userManager) {
        return userManager.getClaim(username, "http://wso2.org/claims/givenname", null)
    };

    privateMethods.getLastName = function(username, userManager) {
        return userManager.getClaim(username, "http://wso2.org/claims/lastname", null)
    };

    publicMethods.addPermissions = function (permissionList, path, init) {
        var registry,carbon = require("carbon");
        var carbonServer = application.get("carbonServer");
        var utility = require('/modules/utility.js').utility;
        var options = {system: true};
        if (init == "login") {
            try {
                var carbonUser = session.get(constants.USER_SESSION_KEY);
                if (!carbonUser) {
                    log.error("User object was not found in the session");
                    throw constants.ERRORS.USER_NOT_FOUND;
                }
                utility.startTenantFlow(carbonUser);
                var tenantId = carbon.server.tenantId();
                if (carbonUser) {
                    options.tenantId = tenantId;
                }
                registry = new carbon.registry.Registry(carbonServer, options);
                var i, permission, resource;
                for (i = 0; i < permissionList.length; i++) {
                    permission = permissionList[i];
                    resource = {
                        collection : true,
                        name : permission.name,
                        properties : {
                            name : permission.name
                        }
                    };
                    if(path != ""){
                        registry.put("/_system/governance/permission/admin/" + path + "/" + permission.key, resource);
                    } else {
                        registry.put("/_system/governance/permission/admin/" + permission.key, resource);
                    }
                }
            } catch (e) {
                throw e;
            } finally {
                utility.endTenantFlow();
            }
        } else {
            registry = new carbon.registry.Registry(carbonServer, options);
            var i, permission, resource;
            for (i = 0; i < permissionList.length; i++) {
                permission = permissionList[i];
                resource = {
                    collection : true,
                    name : permission.name,
                    properties : {
                        name : permission.name
                    }
                };
                if(path != ""){
                    registry.put("/_system/governance/permission/admin/" + path + "/" + permission.key, resource);
                } else {
                    registry.put("/_system/governance/permission/admin/" + permission.key, resource);
                }
            }
        }
    };

    publicMethods.inviteUser = function (username) {
        var carbonUser = session.get(constants.USER_SESSION_KEY);
        var utility = require('/modules/utility.js').utility;
        if (!carbonUser) {
            log.error("User object was not found in the session");
            throw constants.ERRORS.USER_NOT_FOUND;
        }
        var enrollmentURL = dataConfig.httpsURL + dataConfig.appContext + "download-agent";

        try {
            utility.startTenantFlow(carbonUser);
            var tenantId = carbon.server.tenantId();
            var userManager = new carbon.user.UserManager(server, tenantId);
            var user = userManager.getUser(username);
            var emailProperties = new EmailMessageProperties();
            var emailTo = [];
            emailTo[0] = privateMethods.getEmail(username, userManager);
            emailProperties.setMailTo(emailTo);
            //emailProperties.setFirstName(user.getFirstName());
            emailProperties.setFirstName(privateMethods.getFirstName(username, userManager));
            emailProperties.setEnrolmentUrl(enrollmentURL);
            deviceManagementService.sendEnrolmentInvitation(emailProperties);
        } catch (e) {
            throw e;
        } finally {
            utility.endTenantFlow();
        }
    };

    publicMethods.getUsers = function () {
        var users = [];
        var carbonUser = session.get(constants.USER_SESSION_KEY);
        var utility = require('/modules/utility.js').utility;
        var userInfo = require("/modules/user-info.js");
        if (!carbonUser) {
            log.error("User object was not found in the session");
            throw constants.ERRORS.USER_NOT_FOUND;
        }

        var carbon = require('carbon');
        try{
            utility.startTenantFlow(carbonUser);
            var tenantId = carbon.server.tenantId();
            var userManager = new carbon.user.UserManager(server, tenantId);
            var userList = userManager.listUsers("");
            for (var i = 0; i < userList.length; i++) {
                var username = userList[i];
                var email = privateMethods.getEmail(username, userManager);
                var firstName = privateMethods.getFirstName(username, userManager);
                var lastName = privateMethods.getLastName(username, userManager);
                var userInfoObj = new userInfo.UserInfo(username, firstName, lastName, email);
                users.push(userInfoObj);
            }
            return users;
        }catch (e) {
            throw e;
        } finally {
            utility.endTenantFlow();
        }
    };

    publicMethods.isAuthorized = function (permission) {
        var carbon = require("carbon");
        var carbonServer = application.get("carbonServer");
        var carbonUser = session.get(constants.USER_SESSION_KEY);
        var utility = require('/modules/utility.js').utility;
        if (!carbonUser) {
            log.error("User object was not found in the session");
            response.sendError(401, constants.ERRORS.USER_NOT_FOUND);
            exit();
        }

        try {
            utility.startTenantFlow(carbonUser);
            var tenantId = carbon.server.tenantId();
            var userManager = new carbon.user.UserManager(server, tenantId);
            var user = new carbon.user.User(userManager, carbonUser.username);
            return user.isAuthorized(permission, "ui.execute");
        } catch (e) {
            throw e;
        } finally {
            utility.endTenantFlow();
        }
        return true;
    };

    publicMethods.logout = function (successCallback) {
        session.invalidate();
        successCallback();
    };

    publicMethods.getUIPermissions = function(){
        var permissions = {};
        if (publicMethods.isAuthorized("/permission/admin/device-mgt/emm-admin/devices/list") ||
                        publicMethods.isAuthorized("/permission/admin/device-mgt/user/devices/list")) {
            permissions["LIST_DEVICES"] = true;
        }
        if (publicMethods.isAuthorized("/permission/admin/device-mgt/emm-admin/users/list")) {
            permissions["LIST_USERS"] = true;
        }
        if (publicMethods.isAuthorized("/permission/admin/device-mgt/emm-admin/policies/list")) {
            permissions["LIST_POLICIES"] = true;
        }
        if (publicMethods.isAuthorized("/permission/admin/device-mgt/emm-admin/users/add")) {
            permissions["ADD_USER"] = true;
        }
        if (publicMethods.isAuthorized("/permission/admin/device-mgt/emm-admin/policies/add")) {
            permissions["ADD_POLICY"] = true;
        }
        if (publicMethods.isAuthorized("/permission/admin/device-mgt/emm-admin/dashboard/view")) {
            permissions["VIEW_DASHBOARD"] = true;
        }
        return permissions;
    };

    /**
     * Get User Roles from user store.
     * If "Internal/Everyone" role is required - true param needs to be passed.
     * @param enableInternalEveryone boolean value true/false to enable Internal/Everyone role
     */
    publicMethods.getRoles = function (enableInternalEveryone) {
        var carbon = require("carbon");
        var carbonServer = application.get("carbonServer");
        var carbonUser = session.get(constants.USER_SESSION_KEY);
        var utility = require('/modules/utility.js').utility;
        if (!carbonUser) {
            log.error("User object was not found in the session");
            throw constants.ERRORS.USER_NOT_FOUND;
        }
        try {
            utility.startTenantFlow(carbonUser);
            var tenantId = carbon.server.tenantId();
            var userManager = new carbon.user.UserManager(server, tenantId);
            var allRoles = userManager.allRoles();
            var filteredRoles = [];
            var i;
            for (i = 0; i < allRoles.length; i++) {
                if (enableInternalEveryone && allRoles[i] == "Internal/everyone") {
                    filteredRoles.push(allRoles[i]);
                }
                if (allRoles[i].indexOf("Internal/") != 0) {
                    filteredRoles.push(allRoles[i]);
                }
            }
            return filteredRoles;
        } catch (e) {
            throw e;
        } finally {
            utility.endTenantFlow();
        }

    };

    return publicMethods;
}();


