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

var apiWrapperUtil = function () {
    var module = {};
    var tokenUtil = require("/modules/util.js").util;
    module.refreshToken = function () {
        var tokenPair = session.get("accessTokenPair");
        var clientData = tokenUtil.getDyanmicCredentials();
        var clientData = {};
        new Log().info(tokenPair);
        tokenPair = tokenUtil.refreshToken(tokenPair, clientData.clientId, clientData.clientSecret);
        session.put("accessTokenPair", tokenPair);
        var tokenCookie = {'name': 'accessToken', 'value': tokenPair.accessToken, 'maxAge' : -1,'path' : "/mdm/"};
        response.addCookie(tokenCookie);
        return tokenCookie;
    };
    module.setupAccessTokenPair = function (type, properties) {
        var tokenPair;
        var clientData = tokenUtil.getDyanmicCredentials();
        var clientData = {};
        if (type == "password") {
            tokenPair = tokenUtil.getTokenWithPasswordGrantType(properties.username, properties.password, clientData.clientId, clientData.clientSecret);
        } else if (type == "saml") {

        }
        session.put("accessTokenPair", tokenPair);
        var tokenCookie = {'name': 'accessToken', 'value': tokenPair.accessToken, 'maxAge' : -1,'path' : "/mdm/"};
        response.addCookie(tokenCookie);
    };
    return module;
}();