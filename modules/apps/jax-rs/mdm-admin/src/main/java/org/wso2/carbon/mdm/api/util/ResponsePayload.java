/*
 * Copyright (c) 2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package org.wso2.carbon.mdm.api.util;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class ResponsePayload {

    private int statusCode;
    private String messageFromServer;
    private Object responseContent;

    @XmlElement
    public int getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }

    @XmlElement
    public String getMessageFromServer() {
        return messageFromServer;
    }

    public void setMessageFromServer(String messageFromServer) {
        this.messageFromServer = messageFromServer;
    }

    @XmlElement
    public Object getResponseContent() {
        return responseContent;
    }

    public void setResponseContent(Object responseContent) {
        this.responseContent = responseContent;
    }

}
