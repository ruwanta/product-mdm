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

package org.wso2.carbon.mdm.api;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.device.mgt.common.Device;
import org.wso2.carbon.device.mgt.common.DeviceManagementException;
import org.wso2.carbon.device.mgt.core.service.DeviceManagementProviderService;
import org.wso2.carbon.mdm.api.common.MDMAPIException;
import org.wso2.carbon.mdm.api.util.MDMAPIUtils;
import org.wso2.carbon.user.api.UserStoreException;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.Arrays;
import java.util.List;

public class User {
    private static Log log = LogFactory.getLog(MobileDevice.class);

    /**
     * Get a list of devices based on the username.
     *
     * @param username Username of the device owner.
     * @return A list of devices.
     * @throws org.wso2.carbon.mdm.api.common.MDMAPIException
     *
     */
    @GET
    @Produces({MediaType.APPLICATION_JSON})
    @Path("/{tenantDomain}/{username}/devices")
    public List<Device> getAllDeviceOfUser(@PathParam("username") String username,
                                           @PathParam("tenantDomain") String tenantDomain) throws MDMAPIException {
        DeviceManagementProviderService dmService;
        try {
            dmService = MDMAPIUtils.getDeviceManagementService(tenantDomain);
            return dmService.getDevicesOfUser(username);
        } catch (DeviceManagementException e) {
            String errorMsg = "Device management error";
            log.error(errorMsg, e);
            throw new MDMAPIException(errorMsg, e);
        }
    }

    @GET
    public List<String> getAllUsers() throws MDMAPIException {
        try {
            String[] users = MDMAPIUtils.getUserStoreManager().listUsers("", -1);
            return Arrays.asList(users);
        } catch (UserStoreException e) {
            String msg = "Error occurred while retrieving the list of users";
            log.error(msg, e);
            throw new MDMAPIException(msg, e);
        }
    }

    @GET
    @Path("{type}/{id}")
    public List<String> getUserRoles() throws MDMAPIException {
        try {
            String[] roles = MDMAPIUtils.getUserStoreManager().getRoleNames();
            return Arrays.asList(roles);
        } catch (UserStoreException e) {
            throw new MDMAPIException("Error occurred while retrieving list of roles created within the current " +
                    "tenant", e);
        }
    }

    //TODO : Refactor the users/count API to remove tenant-domain parameter
    @GET
    @Path("count/{tenantDomain}")
    public int getUserCount(@PathParam("tenantDomain") String tenantDomain) throws MDMAPIException {
        try {
            String[] users = MDMAPIUtils.getUserStoreManager().listUsers("", -1);
            if (users == null) {
                return 0;
            }
            return users.length;
        } catch (UserStoreException e) {
            String msg = "Error occurred while retrieving the list of users that exist within the current tenant";
            log.error(msg, e);
            throw new MDMAPIException(msg, e);
        }
    }

}
