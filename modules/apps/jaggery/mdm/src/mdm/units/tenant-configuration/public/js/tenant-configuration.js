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

/**
 * Checks if provided input is valid against RegEx input.
 *
 * @param regExp Regular expression
 * @param inputString Input string to check
 * @returns {boolean} Returns true if input matches RegEx
 */
function inputIsValid(regExp, inputString) {
    return regExp.test(inputString);
}

/**
 * Checks if an email address has the valid format or not.
 *
 * @param email Email address
 * @returns {boolean} true if email has the valid format, otherwise false.
 */
function emailIsValid(email) {
    var regExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regExp.test(email);
}

var notifierTypeConstants = {
    "LOCAL": "1",
    "GCM": "2"
};
// Constants to define platform types available
var platformTypeConstants = {
    "ANDROID": "android",
    "IOS": "ios"
};

var responseCodes = {
    "CREATED": "Created",
    "SUCCESS": "201",
    "INTERNAL_SERVER_ERROR": "Internal Server Error"
};

var configParams = {
    "NOTIFIER_TYPE": "notifierType",
    "NOTIFIER_FREQUENCY": "notifierFrequency",
    "GCM_API_KEY": "gcmAPIKey",
    "GCM_SENDER_ID": "gcmSenderId",
    "CONFIG_EMAIL": "configEmail",
    "CONFIG_COUNTRY": "configCountry",
    "CONFIG_STATE": "configState",
    "CONFIG_LOCALITY": "configLocality",
    "CONFIG_ORGANIZATION": "configOrganization",
    "CONFIG_ORGANIZATION_UNIT": "configOrganizationUnit",
    "MDM_CERT_PASSWORD": "MDMCertPassword",
    "MDM_CERT_TOPIC_ID": "MDMCertTopicID",
    "APNS_CERT_PASSWORD": "APNSCertPassword",
    "MDM_CERT": "MDMCert",
    "APNS_CERT": "APNSCert",
    "GENERAL_EMAIL_HOST": "emailHost",
    "GENERAL_EMAIL_PORT": "emailPort",
    "GENERAL_EMAIL_USERNAME": "emailUsername",
    "GENERAL_EMAIL_PASSWORD": "emailPassword",
    "GENERAL_EMAIL_SENDER_ADDRESS": "emailSender",
    "GENERAL_EMAIL_TEMPLATE": "emailTemplate"
};

$(document).ready(function () {
    $("#gcm-inputs").hide();
    var getAndroidConfigAPI = "/mdm-android-agent/configuration";
    var getGeneralConfigAPI = "/mdm-admin/configuration";

    /**
     * Following requests would execute
     * on page load event of tenant configuration page in WSO2 EMM Console.
     * Upon receiving the response, the parameters will be set to the fields,
     * in case those configurations are already set.
     */
    invokerUtil.get(
        getAndroidConfigAPI,

        function (data) {

            if (data != null && data.configuration != null) {
                for (var i = 0; i < data.configuration.length; i++) {
                    var config = data.configuration[i];
                    if(config.name == configParams["NOTIFIER_TYPE"]){
                        $("#android-config-notifier").val(config.value);
                        if(config.value != notifierTypeConstants["GCM"] ) {
                            $("#gcm-inputs").hide();
                        }else{
                            $("#gcm-inputs").show();
                        }
                    } else if(config.name == configParams["NOTIFIER_FREQUENCY"]){
                        $("input#android-config-notifier-frequency").val(config.value);
                    } else if(config.name == configParams["GCM_API_KEY"]){
                        $("input#android-config-gcm-api-key").val(config.value);
                    } else if(config.name == configParams["GCM_SENDER_ID"]){
                        $("input#android-config-gcm-sender-id").val(config.value);
                    }
                }
            }

        }, function () {

        }
    );

    invokerUtil.get(
        getGeneralConfigAPI,

        function (data) {

            if (data != null && data.configuration != null) {
                for (var i = 0; i < data.configuration.length; i++) {
                    var config = data.configuration[i];
                    if(config.name == configParams["GENERAL_EMAIL_HOST"]){
                        $("input#email-config-host").val(config.value);
                    } else if(config.name == configParams["GENERAL_EMAIL_PORT"]){
                        $("input#email-config-port").val(config.value);
                    } else if(config.name == configParams["GENERAL_EMAIL_USERNAME"]){
                        $("input#email-config-username").val(config.value);
                    } else if(config.name == configParams["GENERAL_EMAIL_PASSWORD"]){
                        $("input#email-config-password").val(config.value);
                    } else if(config.name == configParams["GENERAL_EMAIL_SENDER_ADDRESS"]){
                        $("input#email-config-sender-email").val(config.value);
                    } else if(config.name == configParams["GENERAL_EMAIL_TEMPLATE"]){
                        $("input#email-config-template").val(config.value);
                    }
                }
            }

        }, function () {

        }
    );

    $("select.select2[multiple=multiple]").select2({
        tags : true
    });

    $("#android-config-notifier").change(function() {
        var notifierType = $("#android-config-notifier").find("option:selected").attr("value");
        if(notifierType  != notifierTypeConstants["GCM"] ) {
            $("#gcm-inputs").hide();
        }else{
            $("#gcm-inputs").show();
        }
    });
    /**
     * Following click function would execute
     * when a user clicks on "Save" button
     * on Android tenant configuration page in WSO2 EMM Console.
     */
    $("button#save-android-btn").click(function() {
        var notifierType = $("#android-config-notifier").find("option:selected").attr("value");
        var notifierFrequency = $("input#android-config-notifier-frequency").val();
        var gcmAPIKey = $("input#android-config-gcm-api-key").val();
        var gcmSenderId = $("input#android-config-gcm-sender-id").val();

        var errorMsgWrapper = "#android-config-error-msg";
        var errorMsg = "#android-config-error-msg span";
        if (!notifierFrequency) {
            $(errorMsg).text("Notifier frequency is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (!$.isNumeric(notifierFrequency)) {
            $(errorMsg).text("Provided notifier frequency is invalid. Please check.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (notifierType == notifierTypeConstants["GCM"] && !gcmAPIKey) {
            $(errorMsg).text("GCM API Key is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (notifierType == notifierTypeConstants["GCM"] && !gcmSenderId) {
            $(errorMsg).text("GCM Sender ID is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        } else {

            var addConfigFormData = {};
            var configList = new Array();

            var type = {
                "name": configParams["NOTIFIER_TYPE"],
                "value": notifierType,
                "contentType": "text"
            };

            var frequency = {
                "name": configParams["NOTIFIER_FREQUENCY"],
                "value": notifierFrequency,
                "contentType": "text"
            };

            var gcmKey = {
                "name": configParams["GCM_API_KEY"],
                "value": gcmAPIKey,
                "contentType": "text"
            };

            var gcmId = {
                "name": configParams["GCM_SENDER_ID"],
                "value": gcmSenderId,
                "contentType": "text"
            };

            configList.push(type);
            configList.push(frequency);
            if (notifierType == notifierTypeConstants["GCM"]) {
                configList.push(gcmKey);
                configList.push(gcmId);
            }

            addConfigFormData.type = platformTypeConstants["ANDROID"];
            addConfigFormData.configuration = configList;

            var addConfigAPI = "/mdm-android-agent/configuration";

            invokerUtil.post(
                addConfigAPI,
                addConfigFormData,
                function (data) {
                    if (data.responseCode == responseCodes["CREATED"]) {
                        $("#config-save-form").addClass("hidden");
                        $("#record-created-msg").removeClass("hidden");
                    } else if (data == 500) {
                        $(errorMsg).text("Exception occurred at backend.");
                    } else if (data == 403) {
                        $(errorMsg).text("Action was not permitted.");
                    }

                    $(errorMsgWrapper).removeClass("hidden");
                }, function () {
                    $(errorMsg).text("An unexpected error occurred.");
                    $(errorMsgWrapper).removeClass("hidden");
                }
            );
        }
    });

    /**
     * Following click function would execute
     * when a user clicks on "Save" button
     * on General tenant configuration page in WSO2 EMM Console.
     */
    $("button#save-general-btn").click(function() {
        var emailHost = $("input#email-config-host").val();
        var emailPort = $("input#email-config-port").val();
        var emailUsername = $("input#email-config-username").val();
        var emailPassword = $("input#email-config-password").val();
        var emailSenderAddress = $("input#email-config-sender-email").val();
        var emailTemplate = $("input#email-config-template").val();

        var errorMsgWrapper = "#email-config-error-msg";
        var errorMsg = "#email-config-error-msg span";
        if (!emailHost) {
            $(errorMsg).text("Email Host is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (!emailPort) {
            $(errorMsg).text("Email Port is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (!emailUsername) {
            $(errorMsg).text("Username is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (!emailPassword) {
            $(errorMsg).text("Password is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (!emailSenderAddress) {
            $(errorMsg).text("Sender Email Address is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (!emailIsValid(emailSenderAddress)) {
            $(errorMsg).text("Provided sender email is invalid. Please check.");
            $(errorMsgWrapper).removeClass("hidden");
        } else {

            var addConfigFormData = {};
            var configList = new Array();

            var host = {
                "name": configParams["GENERAL_EMAIL_HOST"],
                "value": emailHost,
                "contentType": "text"
            };

            var port = {
                "name": configParams["GENERAL_EMAIL_PORT"],
                "value": emailPort,
                "contentType": "text"
            };

            var username = {
                "name": configParams["GENERAL_EMAIL_USERNAME"],
                "value": emailUsername,
                "contentType": "text"
            };

            var password = {
                "name": configParams["GENERAL_EMAIL_PASSWORD"],
                "value": emailPassword,
                "contentType": "text"
            };

            var sender = {
                "name": configParams["GENERAL_EMAIL_SENDER_ADDRESS"],
                "value": emailSenderAddress,
                "contentType": "text"
            };

            var template = {
                "name": configParams["GENERAL_EMAIL_TEMPLATE"],
                "value": emailTemplate,
                "contentType": "text"
            };

            configList.push(host);
            configList.push(port);
            configList.push(username);
            configList.push(password);
            configList.push(sender);
            configList.push(template);

            addConfigFormData.configuration = configList;

            var addConfigAPI = "/mdm-admin/configuration";

            invokerUtil.post(
                addConfigAPI,
                addConfigFormData,
                function (data) {
                    if (data.responseCode == responseCodes["SUCCESS"]) {
                        $("#config-save-form").addClass("hidden");
                        $("#record-created-msg").removeClass("hidden");
                    } else if (data == 500) {
                        $(errorMsg).text("Exception occurred at backend.");
                    } else if (data == 403) {
                        $(errorMsg).text("Action was not permitted.");
                    }

                    $(errorMsgWrapper).removeClass("hidden");
                }, function () {
                    $(errorMsg).text("An unexpected error occurred.");
                    $(errorMsgWrapper).removeClass("hidden");
                }
            );
        }
    });

    var errorMsgWrapper = "#ios-config-error-msg";
    var errorMsg = "#ios-config-error-msg span";
    var fileTypes = ['pfx'];
    var notSupportedError = false;

    var base64MDMCert = "";
    var fileInputMDMCert = $('#ios-config-mdm-certificate');
    var invalidFormatMDMCert = false;

    var base64APNSCert = "";
    var fileInputAPNSCert = $('#ios-config-mdm-certificate');
    var invalidFormatAPNSCert = false;

    $( fileInputMDMCert).change(function() {

        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            $(errorMsg).text("The File APIs are not fully supported in this browser.");
            $(errorMsgWrapper).removeClass("hidden");
            notSupportedError = true;
            return;
        }

        var file = fileInputMDMCert[0].files[0];
        var extension = file.name.split('.').pop().toLowerCase(),
            isSuccess = fileTypes.indexOf(extension) > -1;

        if (isSuccess) {
            var fileReader = new FileReader();
            fileReader.onload = function(event) {
                base64MDMCert = event.target.result;
            };
            fileReader.readAsDataURL(file);
            invalidFormatMDMCert = false;
        } else {
            base64MDMCert = "";
            invalidFormatMDMCert = true;
        }
    });

    $( fileInputAPNSCert).change(function() {

        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            $(errorMsg).text("The File APIs are not fully supported in this browser.");
            $(errorMsgWrapper).removeClass("hidden");
            notSupportedError = true;
            return;
        }

        var file = fileInputAPNSCert[0].files[0];
        var extension = file.name.split('.').pop().toLowerCase(),
            isSuccess = fileTypes.indexOf(extension) > -1;

        if (isSuccess) {
            var fileReader = new FileReader();
            fileReader.onload = function(event) {
                base64APNSCert = event.target.result;
            };
            fileReader.readAsDataURL(file);
            invalidFormatAPNSCert = false;
        } else {
            base64MDMCert = "";
            invalidFormatAPNSCert = true;
        }
    });

    $("button#save-ios-btn").click(function() {

        var configEmail = $("#ios-config-email").val();
        var configCountry = $("#ios-config-country").val();
        var configState = $("#ios-config-state").val();
        var configLocality = $("#ios-config-locality").val();
        var configOrganization = $("#ios-config-organization").val();
        var configOrganizationUnit = $("#ios-config-organization-unit").val();
        var MDMCertPassword = $("#ios-config-mdm-certificate-password").val();
        var MDMCertTopicID = $("#ios-config-mdm-certificate-topic-id").val();
        var APNSCertPassword = $("#ios-config-apns-certificate-password").val();

        if (!configEmail) {
            $(errorMsg).text("SCEP email is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (!configCountry) {
            $(errorMsg).text("SCEP country is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (!configState) {
            $(errorMsg).text("SCEP state is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (!configLocality) {
            $(errorMsg).text("SCEP locality is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (!configOrganization) {
            $(errorMsg).text("SCEP organization is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (!configOrganizationUnit) {
            $(errorMsg).text("SCEP organization unit is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (!MDMCertPassword) {
            $(errorMsg).text("MDM certificate password is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (!MDMCertTopicID) {
            $(errorMsg).text("MDM certificate topic ID is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (!APNSCertPassword) {
            $(errorMsg).text("APNS certificate password is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if(notSupportedError) {
            $(errorMsg).text("The File APIs are not fully supported in this browser.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (invalidFormatMDMCert) {
            $(errorMsg).text("MDM certificate needs to be in pfx format.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (base64MDMCert == '') {
            $(errorMsg).text("MDM certificate is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (invalidFormatAPNSCert) {
            $(errorMsg).text("APNS certificate needs to be in pfx format.");
            $(errorMsgWrapper).removeClass("hidden");
        } else if (base64APNSCert == '') {
            $(errorMsg).text("APNS certificate is a required field. It cannot be empty.");
            $(errorMsgWrapper).removeClass("hidden");
        }

        var addConfigFormData = {};
        var configList = new Array();

        var configEmail = {
            "name": configParams["CONFIG_EMAIL"],
            "value": configEmail,
            "contentType": "text"
        };

        var configCountry = {
            "name": configParams["CONFIG_COUNTRY"],
            "value": configCountry,
            "contentType": "text"
        };

        var configState = {
            "name": configParams["CONFIG_STATE"],
            "value": configState,
            "contentType": "text"
        };

        var configLocality = {
            "name": configParams["CONFIG_LOCALITY"],
            "value": configLocality,
            "contentType": "text"
        };

        var configOrganization = {
            "name": configParams["CONFIG_ORGANIZATION"],
            "value": configOrganization,
            "contentType": "text"
        };

        var configOrganizationUnit = {
            "name": configParams["CONFIG_ORGANIZATION_UNIT"],
            "value": configOrganizationUnit,
            "contentType": "text"
        };

        var MDMCertPassword = {
            "name": configParams["MDM_CERT_PASSWORD"],
            "value": MDMCertPassword,
            "contentType": "text"
        };

        var MDMCertTopicID = {
            "name": configParams["MDM_CERT_TOPIC_ID"],
            "value": MDMCertTopicID,
            "contentType": "text"
        };

        var APNSCertPassword = {
            "name": configParams["APNS_CERT_PASSWORD"],
            "value": APNSCertPassword,
            "contentType": "text"
        };

        var paramBase64MDMCert = {
            "name": configParams["MDM_CERT"],
            "value": base64MDMCert,
            "contentType": "text"
        };

        var paramBase64APNSCert = {
            "name": configParams["APNS_CERT"],
            "value": base64APNSCert,
            "contentType": "text"
        };

        configList.push(configEmail);
        configList.push(configCountry);
        configList.push(configState);
        configList.push(configLocality);
        configList.push(configOrganization);
        configList.push(configOrganizationUnit);
        configList.push(MDMCertPassword);
        configList.push(MDMCertTopicID);
        configList.push(APNSCertPassword);
        configList.push(paramBase64MDMCert);
        configList.push(paramBase64APNSCert);

        addConfigFormData.type = platformTypeConstants["IOS"];
        addConfigFormData.configuration = configList;

        var addConfigAPI = "/ios/configuration";

        invokerUtil.post(
            addConfigAPI,
            addConfigFormData,
            function (data) {
                if (data.responseCode == responseCodes["CREATED"]) {
                    $("#config-save-form").addClass("hidden");
                    $("#record-created-msg").removeClass("hidden");
                } else if (data == 500) {
                    $(errorMsg).text("Exception occurred at backend.");
                } else if (data == 400) {
                    $(errorMsg).text("Configurations cannot be empty.");
                }

                $(errorMsgWrapper).removeClass("hidden");
            }, function () {
                $(errorMsg).text("An unexpected error occurred.");
                $(errorMsgWrapper).removeClass("hidden");
            }
        );

    });
});

// Start of HTML embedded invoke methods
var showAdvanceOperation = function (operation, button) {
    $(button).addClass('selected');
    $(button).siblings().removeClass('selected');
    var hiddenOperation = ".wr-hidden-operations-content > div";
    $(hiddenOperation + '[data-operation="' + operation + '"]').show();
    $(hiddenOperation + '[data-operation="' + operation + '"]').siblings().hide();
};
