/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export var ActivationResultActivationStatusEnum;
(function (ActivationResultActivationStatusEnum) {
  ActivationResultActivationStatusEnum["Verified"] = "Verified";
  ActivationResultActivationStatusEnum["VerifiedPendingIDPRegistration"] =
    "VerifiedPendingIDPRegistration";
  ActivationResultActivationStatusEnum["ActivationInvalidLicense"] =
    "ActivationInvalidLicense";
  ActivationResultActivationStatusEnum["ActivationFailed"] = "ActivationFailed";
  ActivationResultActivationStatusEnum["AccountAssigned"] = "AccountAssigned";
  ActivationResultActivationStatusEnum["Assigned"] = "Assigned";
  ActivationResultActivationStatusEnum["ActivationLinkExpired"] =
    "ActivationLinkExpired";
  ActivationResultActivationStatusEnum["ShouldFillRegistrationForm"] =
    "ShouldFillRegistrationForm";
  ActivationResultActivationStatusEnum["DeprecatedInvitation"] =
    "DeprecatedInvitation";
  ActivationResultActivationStatusEnum["DeprecatedActivation"] =
    "DeprecatedActivation";
})(
  ActivationResultActivationStatusEnum ||
    (ActivationResultActivationStatusEnum = {}),
);
export var ActivationResultMhsErrorEnum;
(function (ActivationResultMhsErrorEnum) {
  ActivationResultMhsErrorEnum["None"] = "None";
  ActivationResultMhsErrorEnum["GeneralError"] = "GeneralError";
  ActivationResultMhsErrorEnum["InvalidInput"] = "InvalidInput";
  ActivationResultMhsErrorEnum["MissingCapabilities"] = "MissingCapabilities";
  ActivationResultMhsErrorEnum["MHSLicenseGeneralStructureUnrecognized"] =
    "MHSLicenseGeneralStructureUnrecognized";
  ActivationResultMhsErrorEnum["MHSLicenseCertificateInvalid"] =
    "MHSLicenseCertificateInvalid";
  ActivationResultMhsErrorEnum["MHSLicensePasetoSignatureInvalid"] =
    "MHSLicensePasetoSignatureInvalid";
  ActivationResultMhsErrorEnum["MHSLicensePasetoRawPayloadUnrecognized"] =
    "MHSLicensePasetoRawPayloadUnrecognized";
  ActivationResultMhsErrorEnum["MHSLicenseInvalidAs360Fingerprint"] =
    "MHSLicenseInvalidAs360Fingerprint";
  ActivationResultMhsErrorEnum["MHSLicenseDeploymentIdMismatch"] =
    "MHSLicenseDeploymentIdMismatch";
  ActivationResultMhsErrorEnum["MHSLicenseIssuedEarlierThanCurrentlyUsed"] =
    "MHSLicenseIssuedEarlierThanCurrentlyUsed";
  ActivationResultMhsErrorEnum["MHSLicenseHasNoRelevantEntitlements"] =
    "MHSLicenseHasNoRelevantEntitlements";
  ActivationResultMhsErrorEnum["MHSLicenseWasAlreadyUploaded"] =
    "MHSLicenseWasAlreadyUploaded";
  ActivationResultMhsErrorEnum["MHSLicenseOldFeatureIsMissing"] =
    "MHSLicenseOldFeatureIsMissing";
  ActivationResultMhsErrorEnum["MHSLicenseChangingPreviousMhsValue"] =
    "MHSLicenseChangingPreviousMhsValue";
  ActivationResultMhsErrorEnum["MHSLicenseWasIssuedTooLongAgo"] =
    "MHSLicenseWasIssuedTooLongAgo";
  ActivationResultMhsErrorEnum["MHSLicenseInvalidASoCFingerprint"] =
    "MHSLicenseInvalidASoCFingerprint";
})(ActivationResultMhsErrorEnum || (ActivationResultMhsErrorEnum = {}));
export var AddMhsLicenseResultMhsErrorEnum;
(function (AddMhsLicenseResultMhsErrorEnum) {
  AddMhsLicenseResultMhsErrorEnum["None"] = "None";
  AddMhsLicenseResultMhsErrorEnum["GeneralError"] = "GeneralError";
  AddMhsLicenseResultMhsErrorEnum["InvalidInput"] = "InvalidInput";
  AddMhsLicenseResultMhsErrorEnum["MissingCapabilities"] =
    "MissingCapabilities";
  AddMhsLicenseResultMhsErrorEnum["MHSLicenseGeneralStructureUnrecognized"] =
    "MHSLicenseGeneralStructureUnrecognized";
  AddMhsLicenseResultMhsErrorEnum["MHSLicenseCertificateInvalid"] =
    "MHSLicenseCertificateInvalid";
  AddMhsLicenseResultMhsErrorEnum["MHSLicensePasetoSignatureInvalid"] =
    "MHSLicensePasetoSignatureInvalid";
  AddMhsLicenseResultMhsErrorEnum["MHSLicensePasetoRawPayloadUnrecognized"] =
    "MHSLicensePasetoRawPayloadUnrecognized";
  AddMhsLicenseResultMhsErrorEnum["MHSLicenseInvalidAs360Fingerprint"] =
    "MHSLicenseInvalidAs360Fingerprint";
  AddMhsLicenseResultMhsErrorEnum["MHSLicenseDeploymentIdMismatch"] =
    "MHSLicenseDeploymentIdMismatch";
  AddMhsLicenseResultMhsErrorEnum["MHSLicenseIssuedEarlierThanCurrentlyUsed"] =
    "MHSLicenseIssuedEarlierThanCurrentlyUsed";
  AddMhsLicenseResultMhsErrorEnum["MHSLicenseHasNoRelevantEntitlements"] =
    "MHSLicenseHasNoRelevantEntitlements";
  AddMhsLicenseResultMhsErrorEnum["MHSLicenseWasAlreadyUploaded"] =
    "MHSLicenseWasAlreadyUploaded";
  AddMhsLicenseResultMhsErrorEnum["MHSLicenseOldFeatureIsMissing"] =
    "MHSLicenseOldFeatureIsMissing";
  AddMhsLicenseResultMhsErrorEnum["MHSLicenseChangingPreviousMhsValue"] =
    "MHSLicenseChangingPreviousMhsValue";
  AddMhsLicenseResultMhsErrorEnum["MHSLicenseWasIssuedTooLongAgo"] =
    "MHSLicenseWasIssuedTooLongAgo";
  AddMhsLicenseResultMhsErrorEnum["MHSLicenseInvalidASoCFingerprint"] =
    "MHSLicenseInvalidASoCFingerprint";
})(AddMhsLicenseResultMhsErrorEnum || (AddMhsLicenseResultMhsErrorEnum = {}));
export var AllowDomainModelUrlTypeEnum;
(function (AllowDomainModelUrlTypeEnum) {
  AllowDomainModelUrlTypeEnum["Domain"] = "Domain";
  AllowDomainModelUrlTypeEnum["IpAddress"] = "IpAddress";
})(AllowDomainModelUrlTypeEnum || (AllowDomainModelUrlTypeEnum = {}));
export var AllowDomainResultMessageEnum;
(function (AllowDomainResultMessageEnum) {
  AllowDomainResultMessageEnum["NONE"] = "NONE";
  AllowDomainResultMessageEnum["APK_PROCESSED"] = "APK_PROCESSED";
  AllowDomainResultMessageEnum["BLOCK_NEW_SCANS"] = "BLOCK_NEW_SCANS";
  AllowDomainResultMessageEnum["HIGH_SEVERITY"] = "HIGH_SEVERITY";
  AllowDomainResultMessageEnum["INCOMPLETE_SCAN_WITH_ISSUES"] =
    "INCOMPLETE_SCAN_WITH_ISSUES";
  AllowDomainResultMessageEnum["INVALID_INPUT"] = "INVALID_INPUT";
  AllowDomainResultMessageEnum["GENERAL_ERROR"] = "GENERAL_ERROR";
  AllowDomainResultMessageEnum["INVALID_APK_FILE"] = "INVALID_APK_FILE";
  AllowDomainResultMessageEnum["INVALID_IPA_FILE"] = "INVALID_IPA_FILE";
  AllowDomainResultMessageEnum["INVALID_IPAX_FILE"] = "INVALID_IPAX_FILE";
  AllowDomainResultMessageEnum["INVALID_IRX_FILE"] = "INVALID_IRX_FILE";
  AllowDomainResultMessageEnum["WARNING_UTILITIES_VERSION"] =
    "WARNING_UTILITIES_VERSION";
  AllowDomainResultMessageEnum["UNABLE_SCAN_EDITING"] = "UNABLE_SCAN_EDITING";
  AllowDomainResultMessageEnum["INVALID_DAST_SCAN_CONFIGURATION"] =
    "INVALID_DAST_SCAN_CONFIGURATION";
  AllowDomainResultMessageEnum["INVALID_TOTP_CONFIGURATION"] =
    "INVALID_TOTP_CONFIGURATION";
  AllowDomainResultMessageEnum["INVALID_TEST_OPERATION_CONFIGURATION"] =
    "INVALID_TEST_OPERATION_CONFIGURATION";
  AllowDomainResultMessageEnum["INVALID_JOB_IDENTIFIER"] =
    "INVALID_JOB_IDENTIFIER";
  AllowDomainResultMessageEnum["INVALID_SCAN_IDENTIFIER"] =
    "INVALID_SCAN_IDENTIFIER";
  AllowDomainResultMessageEnum["INVALID_REPORT_TYPE"] = "INVALID_REPORT_TYPE";
  AllowDomainResultMessageEnum["INVALID_INCREMENTAL_BASE_JOB_IDENTIFIER"] =
    "INVALID_INCREMENTAL_BASE_JOB_IDENTIFIER";
  AllowDomainResultMessageEnum["INCREMENTAL_BASE_SCAN_NO_TEST_STAGE"] =
    "INCREMENTAL_BASE_SCAN_NO_TEST_STAGE";
  AllowDomainResultMessageEnum[
    "INCREMENTAL_BASE_JOB_NOT_RELATED_TO_CURRENT_SCAN"
  ] = "INCREMENTAL_BASE_JOB_NOT_RELATED_TO_CURRENT_SCAN";
  AllowDomainResultMessageEnum["INCREMENTAL_BASE_SCAN_FILE_WAS_DELETED"] =
    "INCREMENTAL_BASE_SCAN_FILE_WAS_DELETED";
  AllowDomainResultMessageEnum["LOW_SEVERITY"] = "LOW_SEVERITY";
  AllowDomainResultMessageEnum["MEDIUM_SEVERITY"] = "MEDIUM_SEVERITY";
  AllowDomainResultMessageEnum["NOT_ALLOWED_DAST_SCAN_HOST"] =
    "NOT_ALLOWED_DAST_SCAN_HOST";
  AllowDomainResultMessageEnum["NOT_ALLOWED_DAST_SCAN_HOST_ADDITIONAL_DOMAIN"] =
    "NOT_ALLOWED_DAST_SCAN_HOST_ADDITIONAL_DOMAIN";
  AllowDomainResultMessageEnum["ADDITIONAL_DOMAINS_LIMIT_EXCEEDED"] =
    "ADDITIONAL_DOMAINS_LIMIT_EXCEEDED";
  AllowDomainResultMessageEnum["NOT_ASSOCIATED_PRESENCE_TO_APPLICATION"] =
    "NOT_ASSOCIATED_PRESENCE_TO_APPLICATION";
  AllowDomainResultMessageEnum["APPLICATION_PRESENCES_LIMIT_EXCEEDED"] =
    "APPLICATION_PRESENCES_LIMIT_EXCEEDED";
  AllowDomainResultMessageEnum["NO_ISSUES"] = "NO_ISSUES";
  AllowDomainResultMessageEnum["REPORT_PROBLEMS"] = "REPORT_PROBLEMS";
  AllowDomainResultMessageEnum["CLIENT_UTIL_DOWNLOAD_PROBLEMS"] =
    "CLIENT_UTIL_DOWNLOAD_PROBLEMS";
  AllowDomainResultMessageEnum["CLIENT_UTIL_NOT_FOUND"] =
    "CLIENT_UTIL_NOT_FOUND";
  AllowDomainResultMessageEnum["SCAN_ENDED_WITH_ERROR"] =
    "SCAN_ENDED_WITH_ERROR";
  AllowDomainResultMessageEnum["SCAN_FAILURE"] = "SCAN_FAILURE";
  AllowDomainResultMessageEnum["SCAN_LIMIT_EXCEEDED"] = "SCAN_LIMIT_EXCEEDED";
  AllowDomainResultMessageEnum["SCAN_CONCURRENT_AND_QUEUED_EXCEEDED"] =
    "SCAN_CONCURRENT_AND_QUEUED_EXCEEDED";
  AllowDomainResultMessageEnum["SUCCESSFUL_SCAN_MESSAGE"] =
    "SUCCESSFUL_SCAN_MESSAGE";
  AllowDomainResultMessageEnum["UNAUTHORIZED_ACTION"] = "UNAUTHORIZED_ACTION";
  AllowDomainResultMessageEnum["UNSUPPORTED_UPLOAD_REQUEST_TYPE"] =
    "UNSUPPORTED_UPLOAD_REQUEST_TYPE";
  AllowDomainResultMessageEnum["UNSUPPORTED_LOGIN_METHOD"] =
    "UNSUPPORTED_LOGIN_METHOD";
  AllowDomainResultMessageEnum["SCAN_STILL_IN_PROGRESS"] =
    "SCAN_STILL_IN_PROGRESS";
  AllowDomainResultMessageEnum["SCAN_ALREADY_RUNNING_ON_APPLICATION"] =
    "SCAN_ALREADY_RUNNING_ON_APPLICATION";
  AllowDomainResultMessageEnum[
    "FAILED_CANCELLING_SCAN_IN_RESULTS_ANALYSIS_STATE"
  ] = "FAILED_CANCELLING_SCAN_IN_RESULTS_ANALYSIS_STATE";
  AllowDomainResultMessageEnum["FREE_SCAN_IS_NOT_ALLOWED"] =
    "FREE_SCAN_IS_NOT_ALLOWED";
  AllowDomainResultMessageEnum["FREEMIUM_SCAN_NOT_ALLOWED"] =
    "FREEMIUM_SCAN_NOT_ALLOWED";
  AllowDomainResultMessageEnum["INVALID_USER"] = "INVALID_USER";
  AllowDomainResultMessageEnum["NO_RESCAN_WHILE_SCANNING"] =
    "NO_RESCAN_WHILE_SCANNING";
  AllowDomainResultMessageEnum["INVALID_SUBSCRIPTION_FOR_SERVICE"] =
    "INVALID_SUBSCRIPTION_FOR_SERVICE";
  AllowDomainResultMessageEnum["SUBSCRIPTION_EXPIRED_OR_DEACTIVATED"] =
    "SUBSCRIPTION_EXPIRED_OR_DEACTIVATED";
  AllowDomainResultMessageEnum["INVALID_IRX_VERSION"] = "INVALID_IRX_VERSION";
  AllowDomainResultMessageEnum["IRX_ENCRYPTION_MISMATCHED_ASOC"] =
    "IRX_ENCRYPTION_MISMATCHED_ASOC";
  AllowDomainResultMessageEnum["IRX_ENCRYPTION_MISMATCHED_ASOP"] =
    "IRX_ENCRYPTION_MISMATCHED_ASOP";
  AllowDomainResultMessageEnum["FEATURE_AVAILABLE_SOON"] =
    "FEATURE_AVAILABLE_SOON";
  AllowDomainResultMessageEnum["SPECIFY_VALID_OS"] = "SPECIFY_VALID_OS";
  AllowDomainResultMessageEnum["SCAN_IS_DELETED"] = "SCAN_IS_DELETED";
  AllowDomainResultMessageEnum["SCAN_DELETION_NOT_ALLOWED"] =
    "SCAN_DELETION_NOT_ALLOWED";
  AllowDomainResultMessageEnum["KNOWN_USER_SCX_LOGIN_ERROR"] =
    "KNOWN_USER_SCX_LOGIN_ERROR";
  AllowDomainResultMessageEnum["UNKNOWN_USER_SCX_LOGIN_ERROR"] =
    "UNKNOWN_USER_SCX_LOGIN_ERROR";
  AllowDomainResultMessageEnum["GENERAL_LOGIN_ERROR"] = "GENERAL_LOGIN_ERROR";
  AllowDomainResultMessageEnum["UNKNOWN_USER_SCX_LOGIN_ERROR_API"] =
    "UNKNOWN_USER_SCX_LOGIN_ERROR_API";
  AllowDomainResultMessageEnum["GENERAL_LOGIN_ERROR_API"] =
    "GENERAL_LOGIN_ERROR_API";
  AllowDomainResultMessageEnum["LOGIN_BLOCKED"] = "LOGIN_BLOCKED";
  AllowDomainResultMessageEnum["SUBSCRIPTION_SCAN_LIMIT_REACHED"] =
    "SUBSCRIPTION_SCAN_LIMIT_REACHED";
  AllowDomainResultMessageEnum["APPLICATION_REQUIRES_OFFERINGTYPE_SWITCH"] =
    "APPLICATION_REQUIRES_OFFERINGTYPE_SWITCH";
  AllowDomainResultMessageEnum["RESCAN_DISABLED_ON_FIRST_FAILURE"] =
    "RESCAN_DISABLED_ON_FIRST_FAILURE";
  AllowDomainResultMessageEnum["PROMOTE_ON_SCAN_FAILURE"] =
    "PROMOTE_ON_SCAN_FAILURE";
  AllowDomainResultMessageEnum["TRIAL_SCAN_LIMIT_REACHED"] =
    "TRIAL_SCAN_LIMIT_REACHED";
  AllowDomainResultMessageEnum["PRESENCE_NAME_ALREADY_EXISTS"] =
    "PRESENCE_NAME_ALREADY_EXISTS";
  AllowDomainResultMessageEnum["PRESENCE_WAS_DELETED"] = "PRESENCE_WAS_DELETED";
  AllowDomainResultMessageEnum["PRESENCE_IS_INACTIVE"] = "PRESENCE_IS_INACTIVE";
  AllowDomainResultMessageEnum["PSS_NOTSUPPORTED_DURING_TRIAL"] =
    "PSS_NOTSUPPORTED_DURING_TRIAL";
  AllowDomainResultMessageEnum["INVALID_STARTING_URL"] = "INVALID_STARTING_URL";
  AllowDomainResultMessageEnum["INVALID_STARTING_URL_LOCALHOST"] =
    "INVALID_STARTING_URL_LOCALHOST";
  AllowDomainResultMessageEnum["INVALID_STARTING_URL_SCHEME"] =
    "INVALID_STARTING_URL_SCHEME";
  AllowDomainResultMessageEnum["INVALID_LOGIN_SEQUENCE"] =
    "INVALID_LOGIN_SEQUENCE";
  AllowDomainResultMessageEnum["SCAN_NAME_MISSING"] = "SCAN_NAME_MISSING";
  AllowDomainResultMessageEnum["FILE_ID_MISSING"] = "FILE_ID_MISSING";
  AllowDomainResultMessageEnum["UNABLE_TO_LOAD_FILE_FROM_STORAGE"] =
    "UNABLE_TO_LOAD_FILE_FROM_STORAGE";
  AllowDomainResultMessageEnum["FILE_SIZE_LIMIT_EXCEEDED"] =
    "FILE_SIZE_LIMIT_EXCEEDED";
  AllowDomainResultMessageEnum["INPUT_LENGTH_LIMIT_EXCEEDED"] =
    "INPUT_LENGTH_LIMIT_EXCEEDED";
  AllowDomainResultMessageEnum["WRONG_TECHNOLOGY"] = "WRONG_TECHNOLOGY";
  AllowDomainResultMessageEnum["THE_FILE_HAS_ALREADY_DELETED"] =
    "THE_FILE_HAS_ALREADY_DELETED";
  AllowDomainResultMessageEnum["JOB_IS_NOT_READY"] = "JOB_IS_NOT_READY";
  AllowDomainResultMessageEnum["MISSING_FILE_EXTENSION"] =
    "MISSING_FILE_EXTENSION";
  AllowDomainResultMessageEnum["INCORRECT_FILE_EXTENSION"] =
    "INCORRECT_FILE_EXTENSION";
  AllowDomainResultMessageEnum["RESCAN_DISABLED"] = "RESCAN_DISABLED";
  AllowDomainResultMessageEnum["INSUFFICIENT_SUBSCRIPTION_CREDIT"] =
    "INSUFFICIENT_SUBSCRIPTION_CREDIT";
  AllowDomainResultMessageEnum["CONSULTANT_DELETION_NOT_ALLOWED"] =
    "CONSULTANT_DELETION_NOT_ALLOWED";
  AllowDomainResultMessageEnum["INVALID_DAST_FILE"] = "INVALID_DAST_FILE";
  AllowDomainResultMessageEnum["DAST_FILE_REQUIRED"] = "DAST_FILE_REQUIRED";
  AllowDomainResultMessageEnum["INVALID_URL"] = "INVALID_URL";
  AllowDomainResultMessageEnum["INVALID_DAST_FILE_RESCAN"] =
    "INVALID_DAST_FILE_RESCAN";
  AllowDomainResultMessageEnum["REPORT_IS_NOT_AVAILABLE"] =
    "REPORT_IS_NOT_AVAILABLE";
  AllowDomainResultMessageEnum["UPLOAD_DAST_PERMISSION"] =
    "UPLOAD_DAST_PERMISSION";
  AllowDomainResultMessageEnum["IFA_SCAN_LIMIT_REACHED"] =
    "IFA_SCAN_LIMIT_REACHED";
  AllowDomainResultMessageEnum["INVALID_SCANT_MULTISTEP_TESTONLY"] =
    "INVALID_SCANT_MULTISTEP_TESTONLY";
  AllowDomainResultMessageEnum["INVALID_SCAN_MULTISTEP_MANUALEXPL_TESTONLY"] =
    "INVALID_SCAN_MULTISTEP_MANUALEXPL_TESTONLY";
  AllowDomainResultMessageEnum["UNABLE_TO_CHANGE_SCAN_OFFERING_TYPE"] =
    "UNABLE_TO_CHANGE_SCAN_OFFERING_TYPE";
  AllowDomainResultMessageEnum[
    "UNABLE_TO_USE_TRIAL_SUBSCIPTION_IF_PAID_SUBSCRIPTION_EXISTS"
  ] = "UNABLE_TO_USE_TRIAL_SUBSCIPTION_IF_PAID_SUBSCRIPTION_EXISTS";
  AllowDomainResultMessageEnum[
    "SCAN_DOES_NOT_MATCH_APPLICATION_RESTRICTIONS_APPTYPE"
  ] = "SCAN_DOES_NOT_MATCH_APPLICATION_RESTRICTIONS_APPTYPE";
  AllowDomainResultMessageEnum[
    "SCAN_DOES_NOT_MATCH_APPLICATION_RESTRICTIONS_DOMAIN"
  ] = "SCAN_DOES_NOT_MATCH_APPLICATION_RESTRICTIONS_DOMAIN";
  AllowDomainResultMessageEnum[
    "SCAN_DOES_NOT_MATCH_APPLICATION_RESTRICTIONS_PACKAGE"
  ] = "SCAN_DOES_NOT_MATCH_APPLICATION_RESTRICTIONS_PACKAGE";
  AllowDomainResultMessageEnum["INVALID_DAST_CONFIG_FILE"] =
    "INVALID_DAST_CONFIG_FILE";
  AllowDomainResultMessageEnum["INVALID_IAST_CONFIG_FILE"] =
    "INVALID_IAST_CONFIG_FILE";
  AllowDomainResultMessageEnum["APP_CONCURRENT_SCANS_AND_QUEUE_EXCEEDED"] =
    "APP_CONCURRENT_SCANS_AND_QUEUE_EXCEEDED";
  AllowDomainResultMessageEnum["MISSING_OFFERING_TYPE"] =
    "MISSING_OFFERING_TYPE";
  AllowDomainResultMessageEnum["ASSETGROUP_NAME_ALREADY_EXISTS"] =
    "ASSETGROUP_NAME_ALREADY_EXISTS";
  AllowDomainResultMessageEnum["ASSETGROUP_ASSOCIATION_ERROR"] =
    "ASSETGROUP_ASSOCIATION_ERROR";
  AllowDomainResultMessageEnum["ASSETGROUP_CHANGE_DEFAULT_NOTALLOWED"] =
    "ASSETGROUP_CHANGE_DEFAULT_NOTALLOWED";
  AllowDomainResultMessageEnum["ASSETGROUP_INVALID_CONTACT_PERSON"] =
    "ASSETGROUP_INVALID_CONTACT_PERSON";
  AllowDomainResultMessageEnum["ASSETGROUP_OVERRIDE_AUTO_CLOSE_NOTALLOWED"] =
    "ASSETGROUP_OVERRIDE_AUTO_CLOSE_NOTALLOWED";
  AllowDomainResultMessageEnum["ROLE_NAME_ALREADY_EXISTS"] =
    "ROLE_NAME_ALREADY_EXISTS";
  AllowDomainResultMessageEnum["ROLE_NOT_EXISTS"] = "ROLE_NOT_EXISTS";
  AllowDomainResultMessageEnum["ROLE_PREDEFINED_DELETION_NOT_ALLOWED"] =
    "ROLE_PREDEFINED_DELETION_NOT_ALLOWED";
  AllowDomainResultMessageEnum["ROLE_PREDEFINED_EDIT_NOT_ALLOWED"] =
    "ROLE_PREDEFINED_EDIT_NOT_ALLOWED";
  AllowDomainResultMessageEnum["ROLE_DEFAULT_DELETION_NOT_ALLOWED"] =
    "ROLE_DEFAULT_DELETION_NOT_ALLOWED";
  AllowDomainResultMessageEnum["ROLE_UNSET_DEFAULT_NOT_ALLOWED"] =
    "ROLE_UNSET_DEFAULT_NOT_ALLOWED";
  AllowDomainResultMessageEnum["ROLE_ASSOCIATION_ERROR"] =
    "ROLE_ASSOCIATION_ERROR";
  AllowDomainResultMessageEnum["ORGANIZATION_NO_ACCESS"] =
    "ORGANIZATION_NO_ACCESS";
  AllowDomainResultMessageEnum["ORGANIZATION_NOT_FOUND"] =
    "ORGANIZATION_NOT_FOUND";
  AllowDomainResultMessageEnum["ORGANIZATION_CUSTOMIZATIONS_NOT_FOUND"] =
    "ORGANIZATION_CUSTOMIZATIONS_NOT_FOUND";
  AllowDomainResultMessageEnum["UPDATE_ORGANIZATION_LOGO_FAILURE"] =
    "UPDATE_ORGANIZATION_LOGO_FAILURE";
  AllowDomainResultMessageEnum["APPLICATION_NAME_ALREADY_EXISTS"] =
    "APPLICATION_NAME_ALREADY_EXISTS";
  AllowDomainResultMessageEnum["APPLICATION_NO_ACCESS"] =
    "APPLICATION_NO_ACCESS";
  AllowDomainResultMessageEnum["SCAN_NO_ACCESS"] = "SCAN_NO_ACCESS";
  AllowDomainResultMessageEnum["SCAN_EXECUTION_NO_ACCESS"] =
    "SCAN_EXECUTION_NO_ACCESS";
  AllowDomainResultMessageEnum["ISSUE_NO_ACCESS"] = "ISSUE_NO_ACCESS";
  AllowDomainResultMessageEnum["FIXGROUP_NO_ACCESS"] = "FIXGROUP_NO_ACCESS";
  AllowDomainResultMessageEnum["PACKAGE_NO_ACCESS"] = "PACKAGE_NO_ACCESS";
  AllowDomainResultMessageEnum["INVALID_CSV_FILE"] = "INVALID_CSV_FILE";
  AllowDomainResultMessageEnum["ISSUES_INVALID_IDS"] = "ISSUES_INVALID_IDS";
  AllowDomainResultMessageEnum["REPORT_IN_PROGRESS_ERROR"] =
    "REPORT_IN_PROGRESS_ERROR";
  AllowDomainResultMessageEnum["MISSING_APP_ID"] = "MISSING_APP_ID";
  AllowDomainResultMessageEnum["MISSING_CAPABILITIES"] = "MISSING_CAPABILITIES";
  AllowDomainResultMessageEnum["NO_ADMIN_ROLE_ERROR"] = "NO_ADMIN_ROLE_ERROR";
  AllowDomainResultMessageEnum["NOT_SAME_ASSET_GROUPS"] =
    "NOT_SAME_ASSET_GROUPS";
  AllowDomainResultMessageEnum["INVALID_POLICY_ID"] = "INVALID_POLICY_ID";
  AllowDomainResultMessageEnum["INVALID_POLICY_EXPRESSION"] =
    "INVALID_POLICY_EXPRESSION";
  AllowDomainResultMessageEnum["INVALID_POLICY_PARAMETERS"] =
    "INVALID_POLICY_PARAMETERS";
  AllowDomainResultMessageEnum["POLICY_ALREADY_ASSOCIATED_TO_APP"] =
    "POLICY_ALREADY_ASSOCIATED_TO_APP";
  AllowDomainResultMessageEnum["POLICY_NAME_ALREADY_EXISTS"] =
    "POLICY_NAME_ALREADY_EXISTS";
  AllowDomainResultMessageEnum["INVALID_POLICY_IDENTIFIER"] =
    "INVALID_POLICY_IDENTIFIER";
  AllowDomainResultMessageEnum["POLICY_PREDEFINED_DELETION_NOT_ALLOWED"] =
    "POLICY_PREDEFINED_DELETION_NOT_ALLOWED";
  AllowDomainResultMessageEnum["POLICY_PREDEFINED_MODIFICATION_NOT_ALLOWED"] =
    "POLICY_PREDEFINED_MODIFICATION_NOT_ALLOWED";
  AllowDomainResultMessageEnum["POLICY_DELETION_NOT_ALLOWED"] =
    "POLICY_DELETION_NOT_ALLOWED";
  AllowDomainResultMessageEnum["POLICY_INVALID_DATE_FORMAT"] =
    "POLICY_INVALID_DATE_FORMAT";
  AllowDomainResultMessageEnum["POLICY_INVALID_SEVERITY_VALUE"] =
    "POLICY_INVALID_SEVERITY_VALUE";
  AllowDomainResultMessageEnum["POLICY_INVALID_TECHNOLOGY_VALUE"] =
    "POLICY_INVALID_TECHNOLOGY_VALUE";
  AllowDomainResultMessageEnum["POLICY_OPERATION_NOT_ERROR"] =
    "POLICY_OPERATION_NOT_ERROR";
  AllowDomainResultMessageEnum["POLICY_OPERATION_AND_ERROR"] =
    "POLICY_OPERATION_AND_ERROR";
  AllowDomainResultMessageEnum["POLICY_INVALID_EXPRESSION_DEPTH"] =
    "POLICY_INVALID_EXPRESSION_DEPTH";
  AllowDomainResultMessageEnum["INVALID_TEST_POLICY_IDENTIFIER"] =
    "INVALID_TEST_POLICY_IDENTIFIER";
  AllowDomainResultMessageEnum["INVALID_TEST_POLICY_FILE"] =
    "INVALID_TEST_POLICY_FILE";
  AllowDomainResultMessageEnum["INVALID_TEST_POLICY_NAME"] =
    "INVALID_TEST_POLICY_NAME";
  AllowDomainResultMessageEnum["TEST_POLICY_NAME_ALREADY_EXISTS"] =
    "TEST_POLICY_NAME_ALREADY_EXISTS";
  AllowDomainResultMessageEnum["MISSING_TEST_POLICY_FILE"] =
    "MISSING_TEST_POLICY_FILE";
  AllowDomainResultMessageEnum[
    "TEST_POLICY_PREDEFINED_MODIFICATION_NOT_ALLOWED"
  ] = "TEST_POLICY_PREDEFINED_MODIFICATION_NOT_ALLOWED";
  AllowDomainResultMessageEnum["TEST_POLICY_UNSET_DEFAULT_NOT_ALLOWED"] =
    "TEST_POLICY_UNSET_DEFAULT_NOT_ALLOWED";
  AllowDomainResultMessageEnum["SANDBOX_ONLY_PRIVATE_CAN_BE_PROMOTE"] =
    "SANDBOX_ONLY_PRIVATE_CAN_BE_PROMOTE";
  AllowDomainResultMessageEnum["PROMOTE_DISABLED_FOR_SCAN"] =
    "PROMOTE_DISABLED_FOR_SCAN";
  AllowDomainResultMessageEnum["POLICY_INVALID_CWE_FORMAT"] =
    "POLICY_INVALID_CWE_FORMAT";
  AllowDomainResultMessageEnum["POLICY_ASSOCIATION_LIMIT_REACHED"] =
    "POLICY_ASSOCIATION_LIMIT_REACHED";
  AllowDomainResultMessageEnum["APPLICATIONS_MISMATCH"] =
    "APPLICATIONS_MISMATCH";
  AllowDomainResultMessageEnum["PAY_PER_APP_APPLICATION_CANNOT_BE_DELETED"] =
    "PAY_PER_APP_APPLICATION_CANNOT_BE_DELETED";
  AllowDomainResultMessageEnum["PAY_PER_APP_APPLICATION_CANNOT_BE_MODIFIED"] =
    "PAY_PER_APP_APPLICATION_CANNOT_BE_MODIFIED";
  AllowDomainResultMessageEnum["ENVIRONMENT_STATUS_ERROR"] =
    "ENVIRONMENT_STATUS_ERROR";
  AllowDomainResultMessageEnum["INVALID_LICENSE"] = "INVALID_LICENSE";
  AllowDomainResultMessageEnum["USER_ALREADY_SUBSCRIBED"] =
    "USER_ALREADY_SUBSCRIBED";
  AllowDomainResultMessageEnum["REGISTERATION_FAILURE"] =
    "REGISTERATION_FAILURE";
  AllowDomainResultMessageEnum["TRIAL_EXPIRED"] = "TRIAL_EXPIRED";
  AllowDomainResultMessageEnum["LICENSE_REQUIRED"] = "LICENSE_REQUIRED";
  AllowDomainResultMessageEnum["REPORT_FILE_TYPE_IS_NOT_SUPPORTED"] =
    "REPORT_FILE_TYPE_IS_NOT_SUPPORTED";
  AllowDomainResultMessageEnum["ODATA_QUERY_ERROR"] = "ODATA_QUERY_ERROR";
  AllowDomainResultMessageEnum["BLOCKED_EMAIL_DOMAIN"] = "BLOCKED_EMAIL_DOMAIN";
  AllowDomainResultMessageEnum["LOGIN_USING_IBMID_CRED_DEPRECATED"] =
    "LOGIN_USING_IBMID_CRED_DEPRECATED";
  AllowDomainResultMessageEnum["DOWNLOAD_TRIAL_SCAN_NOT_PERMITTED"] =
    "DOWNLOAD_TRIAL_SCAN_NOT_PERMITTED";
  AllowDomainResultMessageEnum["JOB_STATUS_CHANGE_ERROR"] =
    "JOB_STATUS_CHANGE_ERROR";
  AllowDomainResultMessageEnum["INVALID_EMAIL_PATTERN"] =
    "INVALID_EMAIL_PATTERN";
  AllowDomainResultMessageEnum["INVALID_EMAIL_DOMAIN"] = "INVALID_EMAIL_DOMAIN";
  AllowDomainResultMessageEnum["STICKY_STATUS_PERSONAL_SCAN"] =
    "STICKY_STATUS_PERSONAL_SCAN";
  AllowDomainResultMessageEnum["STICKY_STATUS_MISSING_STATUS"] =
    "STICKY_STATUS_MISSING_STATUS";
  AllowDomainResultMessageEnum["ISSUE_STATUS_NEW_DEPRECATED"] =
    "ISSUE_STATUS_NEW_DEPRECATED";
  AllowDomainResultMessageEnum["INVALID_WEBHOOK_IDENTIFIER"] =
    "INVALID_WEBHOOK_IDENTIFIER";
  AllowDomainResultMessageEnum["WEBHOOK_OWNED_BY_ASSET_GROUP_ERROR"] =
    "WEBHOOK_OWNED_BY_ASSET_GROUP_ERROR";
  AllowDomainResultMessageEnum["INVALID_PRESENCE_IDENTIFIER"] =
    "INVALID_PRESENCE_IDENTIFIER";
  AllowDomainResultMessageEnum["INVALID_SCOPE_IDENTIFIER"] =
    "INVALID_SCOPE_IDENTIFIER";
  AllowDomainResultMessageEnum["RESCAN_IAST_FORBIDDEN"] =
    "RESCAN_IAST_FORBIDDEN";
  AllowDomainResultMessageEnum["INVALID_SUBSCRIPTION_FOR_TECHNOLOGY"] =
    "INVALID_SUBSCRIPTION_FOR_TECHNOLOGY";
  AllowDomainResultMessageEnum["SUBSCRIPTION_LIMIT_EXCEEDED"] =
    "SUBSCRIPTION_LIMIT_EXCEEDED";
  AllowDomainResultMessageEnum["USER_QUEUE_LIMIT_EXCEEDED"] =
    "USER_QUEUE_LIMIT_EXCEEDED";
  AllowDomainResultMessageEnum["DOMAIN_NO_ACCESS"] = "DOMAIN_NO_ACCESS";
  AllowDomainResultMessageEnum["DOMAIN_INVALID_VERIFICATION_METHOD"] =
    "DOMAIN_INVALID_VERIFICATION_METHOD";
  AllowDomainResultMessageEnum["DOMAIN_IS_ALREADY_VERIFIED"] =
    "DOMAIN_IS_ALREADY_VERIFIED";
  AllowDomainResultMessageEnum["MOBILE_TECHNOLOGY_NOT_SUPPORTED"] =
    "MOBILE_TECHNOLOGY_NOT_SUPPORTED";
  AllowDomainResultMessageEnum["DASTCONFIG_DOMAIN_MISMATCH"] =
    "DASTCONFIG_DOMAIN_MISMATCH";
  AllowDomainResultMessageEnum["INVALID_ID_OR_MISSING_CAPABILITIES"] =
    "INVALID_ID_OR_MISSING_CAPABILITIES";
  AllowDomainResultMessageEnum["ISSUES_UPDATE_LIMIT_EXCEEDED"] =
    "ISSUES_UPDATE_LIMIT_EXCEEDED";
  AllowDomainResultMessageEnum["ASSETGROUP_NO_ACCESS"] = "ASSETGROUP_NO_ACCESS";
  AllowDomainResultMessageEnum["USER_IS_ASSETGROUP_CONTACT"] =
    "USER_IS_ASSETGROUP_CONTACT";
  AllowDomainResultMessageEnum["PRESENCE_NO_ACCESS"] = "PRESENCE_NO_ACCESS";
  AllowDomainResultMessageEnum["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
  AllowDomainResultMessageEnum["DAST_INVALID_TRAFFIC_FILES"] =
    "DAST_INVALID_TRAFFIC_FILES";
  AllowDomainResultMessageEnum["INVALID_SCANT_MANUALEXPLORE_TESTONLY"] =
    "INVALID_SCANT_MANUALEXPLORE_TESTONLY";
  AllowDomainResultMessageEnum["INVALID_SCAN_WITH_TRAFFIC_CONFIG"] =
    "INVALID_SCAN_WITH_TRAFFIC_CONFIG";
  AllowDomainResultMessageEnum["BUSINESS_UNIT_ALREADY_EXISTS"] =
    "BUSINESS_UNIT_ALREADY_EXISTS";
  AllowDomainResultMessageEnum["BUSINESS_UNIT_DOES_NOT_EXIST"] =
    "BUSINESS_UNIT_DOES_NOT_EXIST";
  AllowDomainResultMessageEnum["BUSINESS_UNIT_IS_ASSOCIATED_WITH_APPS_ERROR"] =
    "BUSINESS_UNIT_IS_ASSOCIATED_WITH_APPS_ERROR";
  AllowDomainResultMessageEnum["BUSINESS_UNIT_UPDATE_APP_ERROR"] =
    "BUSINESS_UNIT_UPDATE_APP_ERROR";
  AllowDomainResultMessageEnum["BUSINESS_UNITS_TO_MERGE_ARE_EQUAL"] =
    "BUSINESS_UNITS_TO_MERGE_ARE_EQUAL";
  AllowDomainResultMessageEnum["INVALID_RECURRENCE"] = "INVALID_RECURRENCE";
  AllowDomainResultMessageEnum["TOO_MANY_ISSUES_FOR_THIS_ACTION"] =
    "TOO_MANY_ISSUES_FOR_THIS_ACTION";
  AllowDomainResultMessageEnum["INVALID_ZIP_FILE"] = "INVALID_ZIP_FILE";
  AllowDomainResultMessageEnum["INVALID_XML_FILE"] = "INVALID_XML_FILE";
  AllowDomainResultMessageEnum["INVALID_IMAGE_FILE"] = "INVALID_IMAGE_FILE";
  AllowDomainResultMessageEnum["AD_LOGIN_DISABLED"] = "AD_LOGIN_DISABLED";
  AllowDomainResultMessageEnum["INVALID_USR_PWD"] = "INVALID_USR_PWD";
  AllowDomainResultMessageEnum["INTERNAL_ADMIN_INACTIVE"] =
    "INTERNAL_ADMIN_INACTIVE";
  AllowDomainResultMessageEnum["USER_NOT_AUTHORIZED"] = "USER_NOT_AUTHORIZED";
  AllowDomainResultMessageEnum["PASSWORD_EXPIRED"] = "PASSWORD_EXPIRED";
  AllowDomainResultMessageEnum["AD_ACCOUNT_LOCKED_OUT"] =
    "AD_ACCOUNT_LOCKED_OUT";
  AllowDomainResultMessageEnum["CHANGE_ROLE_NOT_SUPPORTED"] =
    "CHANGE_ROLE_NOT_SUPPORTED";
  AllowDomainResultMessageEnum["SCAN_EXECUTIONS_SCAN_LIMIT_EXCEEDED"] =
    "SCAN_EXECUTIONS_SCAN_LIMIT_EXCEEDED";
  AllowDomainResultMessageEnum["SCANS_PER_APPLICATION_LIMIT_EXCEEDED"] =
    "SCANS_PER_APPLICATION_LIMIT_EXCEEDED";
  AllowDomainResultMessageEnum["ISSUES_PER_APPLICATION_LIMIT_EXCEEDED"] =
    "ISSUES_PER_APPLICATION_LIMIT_EXCEEDED";
  AllowDomainResultMessageEnum["NO_METAL_SUBSCRIPTION"] =
    "NO_METAL_SUBSCRIPTION";
  AllowDomainResultMessageEnum["TECHNOLOGIES_ALREAY_SET"] =
    "TECHNOLOGIES_ALREAY_SET";
  AllowDomainResultMessageEnum["PROVIDED_LIST_IS_TOO_LONG"] =
    "PROVIDED_LIST_IS_TOO_LONG";
  AllowDomainResultMessageEnum["INVALID_JSON_FILE"] = "INVALID_JSON_FILE";
  AllowDomainResultMessageEnum["WRONG_CREDENTIALS"] = "WRONG_CREDENTIALS";
  AllowDomainResultMessageEnum["INVITATION_REQUIRED"] = "INVITATION_REQUIRED";
  AllowDomainResultMessageEnum["REGISTER_USERS_MANUAL_ONBOARD"] =
    "REGISTER_USERS_MANUAL_ONBOARD";
  AllowDomainResultMessageEnum["RESCAN_SAST_FORBIDDEN"] =
    "RESCAN_SAST_FORBIDDEN";
  AllowDomainResultMessageEnum["SCA_DOESNT_SUPPORT_IFA"] =
    "SCA_DOESNT_SUPPORT_IFA";
  AllowDomainResultMessageEnum["SCA_DOESNT_SUPPORT_OPEN_SOURCE_FILES"] =
    "SCA_DOESNT_SUPPORT_OPEN_SOURCE_FILES";
  AllowDomainResultMessageEnum["ENCRYPTED_DAST_FILE"] = "ENCRYPTED_DAST_FILE";
  AllowDomainResultMessageEnum["DOWNLOADING_FILE_FAILED"] =
    "DOWNLOADING_FILE_FAILED";
  AllowDomainResultMessageEnum["RESOURCE_NOT_FOUND"] = "RESOURCE_NOT_FOUND";
  AllowDomainResultMessageEnum["SOURCE_IP_RESTRICTION_VIOLATION"] =
    "SOURCE_IP_RESTRICTION_VIOLATION";
  AllowDomainResultMessageEnum["SOURCE_IP_MISMATCH"] = "SOURCE_IP_MISMATCH";
  AllowDomainResultMessageEnum["PDF_FORMAT_NOT_SUPPORTED"] =
    "PDF_FORMAT_NOT_SUPPORTED";
  AllowDomainResultMessageEnum["FILE_NOT_FOUND"] = "FILE_NOT_FOUND";
  AllowDomainResultMessageEnum["INVALID_TECHNOLOGIES_FOR_SUBSCRIPTION"] =
    "INVALID_TECHNOLOGIES_FOR_SUBSCRIPTION";
  AllowDomainResultMessageEnum["SBOM_RAW_DATA_NOT_AVAILABLE"] =
    "SBOM_RAW_DATA_NOT_AVAILABLE";
  AllowDomainResultMessageEnum["APP_SCANS_LIMIT_EXCEEDED"] =
    "APP_SCANS_LIMIT_EXCEEDED";
  AllowDomainResultMessageEnum["REPORT_SIGNITURE_UNVERIFIED"] =
    "REPORT_SIGNITURE_UNVERIFIED";
  AllowDomainResultMessageEnum["SIGNATURE_UNVERIFIED"] = "SIGNATURE_UNVERIFIED";
  AllowDomainResultMessageEnum["DOMAIN_NOT_FOUND"] = "DOMAIN_NOT_FOUND";
  AllowDomainResultMessageEnum["PROVIDED_URL_DOMAIN_IS_INVALID"] =
    "PROVIDED_URL_DOMAIN_IS_INVALID";
  AllowDomainResultMessageEnum["PROVIDED_IP_IS_INVALID"] =
    "PROVIDED_IP_IS_INVALID";
  AllowDomainResultMessageEnum[
    "DOMAIN_VERIFICATION_IS_NOT_REQUIRED_IN_YOUR_ORG"
  ] = "DOMAIN_VERIFICATION_IS_NOT_REQUIRED_IN_YOUR_ORG";
  AllowDomainResultMessageEnum["DOMAIN_VERIFICATION_IS_REQUIRED_IN_YOUR_ORG"] =
    "DOMAIN_VERIFICATION_IS_REQUIRED_IN_YOUR_ORG";
  AllowDomainResultMessageEnum["DOMAIN_ALREADY_BLOCKED"] =
    "DOMAIN_ALREADY_BLOCKED";
  AllowDomainResultMessageEnum["PARENT_DOMAIN_IS_ALREADY_BLOCKED"] =
    "PARENT_DOMAIN_IS_ALREADY_BLOCKED";
  AllowDomainResultMessageEnum["DOMAIN_ALREADY_ALLOWED"] =
    "DOMAIN_ALREADY_ALLOWED";
  AllowDomainResultMessageEnum["PARENT_DOMAIN_IS_ALREADY_ALLOWED"] =
    "PARENT_DOMAIN_IS_ALREADY_ALLOWED";
  AllowDomainResultMessageEnum["SUB_DOMAINS_DELETED"] = "SUB_DOMAINS_DELETED";
  AllowDomainResultMessageEnum[
    "THIS_OPERATION_WILL_EFFECT_THESE_DOMAINS_ARE_YOU_SURE_YOU_WANT_TO_BLOCK_IT"
  ] =
    "THIS_OPERATION_WILL_EFFECT_THESE_DOMAINS_ARE_YOU_SURE_YOU_WANT_TO_BLOCK_IT";
  AllowDomainResultMessageEnum[
    "YOUR_ORGANIZATION_DOESNT_ALLOW_ASSOCIATING_DOMAIN_TO_ASSET_GROUPS"
  ] = "YOUR_ORGANIZATION_DOESNT_ALLOW_ASSOCIATING_DOMAIN_TO_ASSET_GROUPS";
  AllowDomainResultMessageEnum["SCA_STATIC_ONLY_ERROR"] =
    "SCA_STATIC_ONLY_ERROR";
  AllowDomainResultMessageEnum["STATIC_SCA_ONLY_ERROR"] =
    "STATIC_SCA_ONLY_ERROR";
  AllowDomainResultMessageEnum["REPO_NO_ACCESS"] = "REPO_NO_ACCESS";
  AllowDomainResultMessageEnum["REPO_SIGNATURE_INVALID"] =
    "REPO_SIGNATURE_INVALID";
  AllowDomainResultMessageEnum["FILE_NOT_ALLOWED"] = "FILE_NOT_ALLOWED";
  AllowDomainResultMessageEnum["SCA_DOESNT_SUPPORT_REPOSITORY"] =
    "SCA_DOESNT_SUPPORT_REPOSITORY";
  AllowDomainResultMessageEnum["SAST_RECURRENCE_NO_GIT"] =
    "SAST_RECURRENCE_NO_GIT";
  AllowDomainResultMessageEnum["DEMO_SCAN_NO_RECURRENCE"] =
    "DEMO_SCAN_NO_RECURRENCE";
  AllowDomainResultMessageEnum[
    "THIS_DOMAIN_IS_FOR_OUR_DEMO_SITE_AND_IS_VERIFIED_BY_DEFAULT"
  ] = "THIS_DOMAIN_IS_FOR_OUR_DEMO_SITE_AND_IS_VERIFIED_BY_DEFAULT";
  AllowDomainResultMessageEnum["INVALID_ASENC_FILE"] = "INVALID_ASENC_FILE";
  AllowDomainResultMessageEnum["INVALID_USER_PERMISSTION"] =
    "INVALID_USER_PERMISSTION";
  AllowDomainResultMessageEnum["INVALID_ASYMETRIC_KEY"] =
    "INVALID_ASYMETRIC_KEY";
  AllowDomainResultMessageEnum["TOO_MANY_USER_PREFERENCES"] =
    "TOO_MANY_USER_PREFERENCES";
  AllowDomainResultMessageEnum["INVALID_OPEN_API_FILE"] =
    "INVALID_OPEN_API_FILE";
  AllowDomainResultMessageEnum["MISSING_OPEN_AI_CREDENTIALS"] =
    "MISSING_OPEN_AI_CREDENTIALS";
  AllowDomainResultMessageEnum["INVALID_OPEN_AI_CREDENTIALS"] =
    "INVALID_OPEN_AI_CREDENTIALS";
  AllowDomainResultMessageEnum["DUPLICATE_OPEN_API_METHOD"] =
    "DUPLICATE_OPEN_API_METHOD";
  AllowDomainResultMessageEnum["INVALID_DAST_SCAN_METHOD"] =
    "INVALID_DAST_SCAN_METHOD";
  AllowDomainResultMessageEnum["MISSING_LOGIN_CREDENTIALS"] =
    "MISSING_LOGIN_CREDENTIALS";
  AllowDomainResultMessageEnum["DUPLICATE_LOGIN_METHOD"] =
    "DUPLICATE_LOGIN_METHOD";
  AllowDomainResultMessageEnum["MISSING_HTTP_AUTH_CREDENTIALS"] =
    "MISSING_HTTP_AUTH_CREDENTIALS";
  AllowDomainResultMessageEnum["INVALID_EXD_FILE"] = "INVALID_EXD_FILE";
  AllowDomainResultMessageEnum[
    "SEQUENCEDOMAINS_DOES_NOT_MATCH_STRATINGURL_DOMAIN"
  ] = "SEQUENCEDOMAINS_DOES_NOT_MATCH_STRATINGURL_DOMAIN";
  AllowDomainResultMessageEnum["SCAN_TEMPLATE_MISSING"] =
    "SCAN_TEMPLATE_MISSING";
  AllowDomainResultMessageEnum["REPORT_ISSUE_COUNT_LIMIT_EXCEEDED"] =
    "REPORT_ISSUE_COUNT_LIMIT_EXCEEDED";
  AllowDomainResultMessageEnum["FRAMEWORK_ISNT_SUPPORTED"] =
    "FRAMEWORK_ISNT_SUPPORTED";
  AllowDomainResultMessageEnum["REPLAY_SCRIPT_GENERATION_FAILED"] =
    "REPLAY_SCRIPT_GENERATION_FAILED";
  AllowDomainResultMessageEnum["MALFORMED_ISSUE_XML"] = "MALFORMED_ISSUE_XML";
  AllowDomainResultMessageEnum[
    "ISSUE_INELIGIBLE_FOR_THE_REQUESTED_REPLAY_SCRIPT"
  ] = "ISSUE_INELIGIBLE_FOR_THE_REQUESTED_REPLAY_SCRIPT";
  AllowDomainResultMessageEnum["CANT_TERMINATE_MACHINE"] =
    "CANT_TERMINATE_MACHINE";
  AllowDomainResultMessageEnum["NO_CUSTOM_FIELDS"] = "NO_CUSTOM_FIELDS";
  AllowDomainResultMessageEnum["COLUMN_NAME_NOT_FOUND"] =
    "COLUMN_NAME_NOT_FOUND";
  AllowDomainResultMessageEnum["MISSING_FIELD"] = "MISSING_FIELD";
  AllowDomainResultMessageEnum["NO_CUSTOM_FIELDS_DEFINED"] =
    "NO_CUSTOM_FIELDS_DEFINED";
  AllowDomainResultMessageEnum["CUSTOMFIELD_REQUIRED"] = "CUSTOMFIELD_REQUIRED";
  AllowDomainResultMessageEnum["CUSTOM_FIELD_ALREADY_EXISTS"] =
    "CUSTOM_FIELD_ALREADY_EXISTS";
  AllowDomainResultMessageEnum["COLUMN_NAME_IS_ALREADY_IN_USE"] =
    "COLUMN_NAME_IS_ALREADY_IN_USE";
  AllowDomainResultMessageEnum["CUSTOM_FIELD_ID_DOES_NOT_EXIST"] =
    "CUSTOM_FIELD_ID_DOES_NOT_EXIST";
  AllowDomainResultMessageEnum["SCA_SBOM_FILE_NOT_PERSONAL"] =
    "SCA_SBOM_FILE_NOT_PERSONAL";
  AllowDomainResultMessageEnum["SBOM_FILE_NOT_SCA"] = "SBOM_FILE_NOT_SCA";
  AllowDomainResultMessageEnum["SBOM_FILE_NOT_PROMOTE"] =
    "SBOM_FILE_NOT_PROMOTE";
  AllowDomainResultMessageEnum["MISSING_PACKAGE_INFORMATION"] =
    "MISSING_PACKAGE_INFORMATION";
  AllowDomainResultMessageEnum["COULD_NOT_RETRIEVE_DATA_ABOUT_THE_PACKAGE"] =
    "COULD_NOT_RETRIEVE_DATA_ABOUT_THE_PACKAGE";
  AllowDomainResultMessageEnum["FEATURE_IS_DISABLED_FOR_YOUR_ORG"] =
    "FEATURE_IS_DISABLED_FOR_YOUR_ORG";
  AllowDomainResultMessageEnum["SCAN_TEMPLATE_NAME_ALREADY_EXISTS"] =
    "SCAN_TEMPLATE_NAME_ALREADY_EXISTS";
  AllowDomainResultMessageEnum["SCAN_TEMPLATE_NOT_FOUND"] =
    "SCAN_TEMPLATE_NOT_FOUND";
  AllowDomainResultMessageEnum["SCAN_TEMPLATE_IS_DISABLED"] =
    "SCAN_TEMPLATE_IS_DISABLED";
  AllowDomainResultMessageEnum[
    "SCAN_TEMPLATE_WAS_NOT_ASSOCIATED_TO_ASSET_GROUP_CORRECTLY"
  ] = "SCAN_TEMPLATE_WAS_NOT_ASSOCIATED_TO_ASSET_GROUP_CORRECTLY";
  AllowDomainResultMessageEnum["INVALID_SCAN_TEMPLATE_CONFIGURATION"] =
    "INVALID_SCAN_TEMPLATE_CONFIGURATION";
  AllowDomainResultMessageEnum["UNABLE_TO_SAVE_SCAN_TEMPLATE_CONFIGURATION"] =
    "UNABLE_TO_SAVE_SCAN_TEMPLATE_CONFIGURATION";
  AllowDomainResultMessageEnum["MISSING_LOGS"] = "MISSING_LOGS";
  AllowDomainResultMessageEnum["SAST_GIT_SCAN_BRANCH_UPDATE_NOT_ALLOWED"] =
    "SAST_GIT_SCAN_BRANCH_UPDATE_NOT_ALLOWED";
  AllowDomainResultMessageEnum["EXTERNAL_IDP_MODE_NOT_SUPPORTED_FOR_OIDC"] =
    "EXTERNAL_IDP_MODE_NOT_SUPPORTED_FOR_OIDC";
  AllowDomainResultMessageEnum["ORG_SETTING_ALREADY_EXISTS"] =
    "ORG_SETTING_ALREADY_EXISTS";
  AllowDomainResultMessageEnum[
    "SCA_SERVICE_URL_NOT_SUPPORTED_IN_THIS_ENVIRONMENT"
  ] = "SCA_SERVICE_URL_NOT_SUPPORTED_IN_THIS_ENVIRONMENT";
  AllowDomainResultMessageEnum["FILE_ENCRYPTION_UNAUTHORIZED_ENVIRONMENT"] =
    "FILE_ENCRYPTION_UNAUTHORIZED_ENVIRONMENT";
  AllowDomainResultMessageEnum["FILE_DECRYPTION_FAILED"] =
    "FILE_DECRYPTION_FAILED";
  AllowDomainResultMessageEnum["SETTINGS_ARE_DEFINED_IN_JSON_FILE"] =
    "SETTINGS_ARE_DEFINED_IN_JSON_FILE";
  AllowDomainResultMessageEnum["COULD_NOT_CONNECT_TO_USER_LDAP_CONFIG"] =
    "COULD_NOT_CONNECT_TO_USER_LDAP_CONFIG";
  AllowDomainResultMessageEnum["COULD_NOT_CONNECT_TO_USER_SSO_CONFIG"] =
    "COULD_NOT_CONNECT_TO_USER_SSO_CONFIG";
  AllowDomainResultMessageEnum["SSO_URL_MUST_USE_HTTPS"] =
    "SSO_URL_MUST_USE_HTTPS";
  AllowDomainResultMessageEnum["FAILED_TO_RESTAT_DEPLOYMENT"] =
    "FAILED_TO_RESTAT_DEPLOYMENT";
  AllowDomainResultMessageEnum["SCAN_PROP_CANNOT_BE_UPDATED"] =
    "SCAN_PROP_CANNOT_BE_UPDATED";
  AllowDomainResultMessageEnum["DEMO_SCAN_MUST_BE_EXECUTED"] =
    "DEMO_SCAN_MUST_BE_EXECUTED";
  AllowDomainResultMessageEnum["DEMO_SCAN_NO_RESCAN"] = "DEMO_SCAN_NO_RESCAN";
  AllowDomainResultMessageEnum[
    "SCAN_EXECUTION_NOT_IN_A_STATE_TO_CREATE_PATCH"
  ] = "SCAN_EXECUTION_NOT_IN_A_STATE_TO_CREATE_PATCH";
  AllowDomainResultMessageEnum["NOT_ALL_ISSUES_HAVE_FIXES_IN_SCAN_EXECUTION"] =
    "NOT_ALL_ISSUES_HAVE_FIXES_IN_SCAN_EXECUTION";
  AllowDomainResultMessageEnum[
    "SCAN_EXECUTION_NOT_IN_A_STATE_FOR_RAPIDFIX_RECOMMANDATION"
  ] = "SCAN_EXECUTION_NOT_IN_A_STATE_FOR_RAPIDFIX_RECOMMANDATION";
  AllowDomainResultMessageEnum["ISSUE_NOT_IN_CONTEXT"] = "ISSUE_NOT_IN_CONTEXT";
  AllowDomainResultMessageEnum["INVALID_PATCH_IDENTIFIER"] =
    "INVALID_PATCH_IDENTIFIER";
  AllowDomainResultMessageEnum["PATCH_ALREADY_COMPLETED"] =
    "PATCH_ALREADY_COMPLETED";
  AllowDomainResultMessageEnum["RAPIDFIX_ANALYSIS_ID_MISMATCH"] =
    "RAPIDFIX_ANALYSIS_ID_MISMATCH";
  AllowDomainResultMessageEnum["URL_SIGNITURE_UNVERIFIED"] =
    "URL_SIGNITURE_UNVERIFIED";
  AllowDomainResultMessageEnum["INVALID_DIFF_FILE"] = "INVALID_DIFF_FILE";
})(AllowDomainResultMessageEnum || (AllowDomainResultMessageEnum = {}));
export var AppCommentModelSourceTypeEnum;
(function (AppCommentModelSourceTypeEnum) {
  AppCommentModelSourceTypeEnum["Issue"] = "Issue";
  AppCommentModelSourceTypeEnum["FixGroup"] = "FixGroup";
})(AppCommentModelSourceTypeEnum || (AppCommentModelSourceTypeEnum = {}));
export var ApplicationCreateModelBusinessImpactEnum;
(function (ApplicationCreateModelBusinessImpactEnum) {
  ApplicationCreateModelBusinessImpactEnum["Unspecified"] = "Unspecified";
  ApplicationCreateModelBusinessImpactEnum["Low"] = "Low";
  ApplicationCreateModelBusinessImpactEnum["Medium"] = "Medium";
  ApplicationCreateModelBusinessImpactEnum["High"] = "High";
  ApplicationCreateModelBusinessImpactEnum["Critical"] = "Critical";
})(
  ApplicationCreateModelBusinessImpactEnum ||
    (ApplicationCreateModelBusinessImpactEnum = {}),
);
export var ApplicationCreateModelTestingStatusEnum;
(function (ApplicationCreateModelTestingStatusEnum) {
  ApplicationCreateModelTestingStatusEnum["NotStarted"] = "NotStarted";
  ApplicationCreateModelTestingStatusEnum["InProgress"] = "InProgress";
  ApplicationCreateModelTestingStatusEnum["Completed"] = "Completed";
})(
  ApplicationCreateModelTestingStatusEnum ||
    (ApplicationCreateModelTestingStatusEnum = {}),
);
export var ApplicationCreateModelCollateralDamagePotentialEnum;
(function (ApplicationCreateModelCollateralDamagePotentialEnum) {
  ApplicationCreateModelCollateralDamagePotentialEnum["NotDefined"] =
    "NotDefined";
  ApplicationCreateModelCollateralDamagePotentialEnum["None"] = "None";
  ApplicationCreateModelCollateralDamagePotentialEnum["Low"] = "Low";
  ApplicationCreateModelCollateralDamagePotentialEnum["LowMedium"] =
    "LowMedium";
  ApplicationCreateModelCollateralDamagePotentialEnum["MediumHigh"] =
    "MediumHigh";
  ApplicationCreateModelCollateralDamagePotentialEnum["High"] = "High";
})(
  ApplicationCreateModelCollateralDamagePotentialEnum ||
    (ApplicationCreateModelCollateralDamagePotentialEnum = {}),
);
export var ApplicationCreateModelTargetDistributionEnum;
(function (ApplicationCreateModelTargetDistributionEnum) {
  ApplicationCreateModelTargetDistributionEnum["NotDefined"] = "NotDefined";
  ApplicationCreateModelTargetDistributionEnum["None"] = "None";
  ApplicationCreateModelTargetDistributionEnum["Low"] = "Low";
  ApplicationCreateModelTargetDistributionEnum["Medium"] = "Medium";
  ApplicationCreateModelTargetDistributionEnum["High"] = "High";
})(
  ApplicationCreateModelTargetDistributionEnum ||
    (ApplicationCreateModelTargetDistributionEnum = {}),
);
export var ApplicationCreateModelConfidentialityRequirementEnum;
(function (ApplicationCreateModelConfidentialityRequirementEnum) {
  ApplicationCreateModelConfidentialityRequirementEnum["NotDefined"] =
    "NotDefined";
  ApplicationCreateModelConfidentialityRequirementEnum["Low"] = "Low";
  ApplicationCreateModelConfidentialityRequirementEnum["Medium"] = "Medium";
  ApplicationCreateModelConfidentialityRequirementEnum["High"] = "High";
})(
  ApplicationCreateModelConfidentialityRequirementEnum ||
    (ApplicationCreateModelConfidentialityRequirementEnum = {}),
);
export var ApplicationCreateModelIntegrityRequirementEnum;
(function (ApplicationCreateModelIntegrityRequirementEnum) {
  ApplicationCreateModelIntegrityRequirementEnum["NotDefined"] = "NotDefined";
  ApplicationCreateModelIntegrityRequirementEnum["Low"] = "Low";
  ApplicationCreateModelIntegrityRequirementEnum["Medium"] = "Medium";
  ApplicationCreateModelIntegrityRequirementEnum["High"] = "High";
})(
  ApplicationCreateModelIntegrityRequirementEnum ||
    (ApplicationCreateModelIntegrityRequirementEnum = {}),
);
export var ApplicationCreateModelAvailabilityRequirementEnum;
(function (ApplicationCreateModelAvailabilityRequirementEnum) {
  ApplicationCreateModelAvailabilityRequirementEnum["NotDefined"] =
    "NotDefined";
  ApplicationCreateModelAvailabilityRequirementEnum["Low"] = "Low";
  ApplicationCreateModelAvailabilityRequirementEnum["Medium"] = "Medium";
  ApplicationCreateModelAvailabilityRequirementEnum["High"] = "High";
})(
  ApplicationCreateModelAvailabilityRequirementEnum ||
    (ApplicationCreateModelAvailabilityRequirementEnum = {}),
);
export var ApplicationCreateModelPreferredOfferingTypeEnum;
(function (ApplicationCreateModelPreferredOfferingTypeEnum) {
  ApplicationCreateModelPreferredOfferingTypeEnum["None"] = "None";
  ApplicationCreateModelPreferredOfferingTypeEnum["ScanExecution"] =
    "ScanExecution";
  ApplicationCreateModelPreferredOfferingTypeEnum["Applications"] =
    "Applications";
})(
  ApplicationCreateModelPreferredOfferingTypeEnum ||
    (ApplicationCreateModelPreferredOfferingTypeEnum = {}),
);
export var ApplicationModelRiskRatingEnum;
(function (ApplicationModelRiskRatingEnum) {
  ApplicationModelRiskRatingEnum["Unknown"] = "Unknown";
  ApplicationModelRiskRatingEnum["Low"] = "Low";
  ApplicationModelRiskRatingEnum["Medium"] = "Medium";
  ApplicationModelRiskRatingEnum["High"] = "High";
  ApplicationModelRiskRatingEnum["Critical"] = "Critical";
})(ApplicationModelRiskRatingEnum || (ApplicationModelRiskRatingEnum = {}));
export var ApplicationModelMaxSeverityEnum;
(function (ApplicationModelMaxSeverityEnum) {
  ApplicationModelMaxSeverityEnum["Undetermined"] = "Undetermined";
  ApplicationModelMaxSeverityEnum["Informational"] = "Informational";
  ApplicationModelMaxSeverityEnum["Low"] = "Low";
  ApplicationModelMaxSeverityEnum["Medium"] = "Medium";
  ApplicationModelMaxSeverityEnum["High"] = "High";
  ApplicationModelMaxSeverityEnum["Critical"] = "Critical";
})(ApplicationModelMaxSeverityEnum || (ApplicationModelMaxSeverityEnum = {}));
export var ApplicationModelCorrelationStateEnum;
(function (ApplicationModelCorrelationStateEnum) {
  ApplicationModelCorrelationStateEnum["None"] = "None";
  ApplicationModelCorrelationStateEnum["Active"] = "Active";
  ApplicationModelCorrelationStateEnum["InProgress"] = "InProgress";
})(
  ApplicationModelCorrelationStateEnum ||
    (ApplicationModelCorrelationStateEnum = {}),
);
export var ApplicationModelBusinessImpactEnum;
(function (ApplicationModelBusinessImpactEnum) {
  ApplicationModelBusinessImpactEnum["Unspecified"] = "Unspecified";
  ApplicationModelBusinessImpactEnum["Low"] = "Low";
  ApplicationModelBusinessImpactEnum["Medium"] = "Medium";
  ApplicationModelBusinessImpactEnum["High"] = "High";
  ApplicationModelBusinessImpactEnum["Critical"] = "Critical";
})(
  ApplicationModelBusinessImpactEnum ||
    (ApplicationModelBusinessImpactEnum = {}),
);
export var ApplicationModelTestingStatusEnum;
(function (ApplicationModelTestingStatusEnum) {
  ApplicationModelTestingStatusEnum["NotStarted"] = "NotStarted";
  ApplicationModelTestingStatusEnum["InProgress"] = "InProgress";
  ApplicationModelTestingStatusEnum["Completed"] = "Completed";
})(
  ApplicationModelTestingStatusEnum || (ApplicationModelTestingStatusEnum = {}),
);
export var ApplicationModelCollateralDamagePotentialEnum;
(function (ApplicationModelCollateralDamagePotentialEnum) {
  ApplicationModelCollateralDamagePotentialEnum["NotDefined"] = "NotDefined";
  ApplicationModelCollateralDamagePotentialEnum["None"] = "None";
  ApplicationModelCollateralDamagePotentialEnum["Low"] = "Low";
  ApplicationModelCollateralDamagePotentialEnum["LowMedium"] = "LowMedium";
  ApplicationModelCollateralDamagePotentialEnum["MediumHigh"] = "MediumHigh";
  ApplicationModelCollateralDamagePotentialEnum["High"] = "High";
})(
  ApplicationModelCollateralDamagePotentialEnum ||
    (ApplicationModelCollateralDamagePotentialEnum = {}),
);
export var ApplicationModelTargetDistributionEnum;
(function (ApplicationModelTargetDistributionEnum) {
  ApplicationModelTargetDistributionEnum["NotDefined"] = "NotDefined";
  ApplicationModelTargetDistributionEnum["None"] = "None";
  ApplicationModelTargetDistributionEnum["Low"] = "Low";
  ApplicationModelTargetDistributionEnum["Medium"] = "Medium";
  ApplicationModelTargetDistributionEnum["High"] = "High";
})(
  ApplicationModelTargetDistributionEnum ||
    (ApplicationModelTargetDistributionEnum = {}),
);
export var ApplicationModelConfidentialityRequirementEnum;
(function (ApplicationModelConfidentialityRequirementEnum) {
  ApplicationModelConfidentialityRequirementEnum["NotDefined"] = "NotDefined";
  ApplicationModelConfidentialityRequirementEnum["Low"] = "Low";
  ApplicationModelConfidentialityRequirementEnum["Medium"] = "Medium";
  ApplicationModelConfidentialityRequirementEnum["High"] = "High";
})(
  ApplicationModelConfidentialityRequirementEnum ||
    (ApplicationModelConfidentialityRequirementEnum = {}),
);
export var ApplicationModelIntegrityRequirementEnum;
(function (ApplicationModelIntegrityRequirementEnum) {
  ApplicationModelIntegrityRequirementEnum["NotDefined"] = "NotDefined";
  ApplicationModelIntegrityRequirementEnum["Low"] = "Low";
  ApplicationModelIntegrityRequirementEnum["Medium"] = "Medium";
  ApplicationModelIntegrityRequirementEnum["High"] = "High";
})(
  ApplicationModelIntegrityRequirementEnum ||
    (ApplicationModelIntegrityRequirementEnum = {}),
);
export var ApplicationModelAvailabilityRequirementEnum;
(function (ApplicationModelAvailabilityRequirementEnum) {
  ApplicationModelAvailabilityRequirementEnum["NotDefined"] = "NotDefined";
  ApplicationModelAvailabilityRequirementEnum["Low"] = "Low";
  ApplicationModelAvailabilityRequirementEnum["Medium"] = "Medium";
  ApplicationModelAvailabilityRequirementEnum["High"] = "High";
})(
  ApplicationModelAvailabilityRequirementEnum ||
    (ApplicationModelAvailabilityRequirementEnum = {}),
);
export var ApplicationModelPreferredOfferingTypeEnum;
(function (ApplicationModelPreferredOfferingTypeEnum) {
  ApplicationModelPreferredOfferingTypeEnum["None"] = "None";
  ApplicationModelPreferredOfferingTypeEnum["ScanExecution"] = "ScanExecution";
  ApplicationModelPreferredOfferingTypeEnum["Applications"] = "Applications";
})(
  ApplicationModelPreferredOfferingTypeEnum ||
    (ApplicationModelPreferredOfferingTypeEnum = {}),
);
export var ApplicationModelScanTechnologiesEnum;
(function (ApplicationModelScanTechnologiesEnum) {
  ApplicationModelScanTechnologiesEnum["NONE"] = "NONE";
  ApplicationModelScanTechnologiesEnum["DAST"] = "DAST";
  ApplicationModelScanTechnologiesEnum["SAST"] = "SAST";
  ApplicationModelScanTechnologiesEnum["IAST"] = "IAST";
  ApplicationModelScanTechnologiesEnum["SCA"] = "SCA";
})(
  ApplicationModelScanTechnologiesEnum ||
    (ApplicationModelScanTechnologiesEnum = {}),
);
export var ApplicationUpdateModelBusinessImpactEnum;
(function (ApplicationUpdateModelBusinessImpactEnum) {
  ApplicationUpdateModelBusinessImpactEnum["Unspecified"] = "Unspecified";
  ApplicationUpdateModelBusinessImpactEnum["Low"] = "Low";
  ApplicationUpdateModelBusinessImpactEnum["Medium"] = "Medium";
  ApplicationUpdateModelBusinessImpactEnum["High"] = "High";
  ApplicationUpdateModelBusinessImpactEnum["Critical"] = "Critical";
})(
  ApplicationUpdateModelBusinessImpactEnum ||
    (ApplicationUpdateModelBusinessImpactEnum = {}),
);
export var ApplicationUpdateModelTestingStatusEnum;
(function (ApplicationUpdateModelTestingStatusEnum) {
  ApplicationUpdateModelTestingStatusEnum["NotStarted"] = "NotStarted";
  ApplicationUpdateModelTestingStatusEnum["InProgress"] = "InProgress";
  ApplicationUpdateModelTestingStatusEnum["Completed"] = "Completed";
})(
  ApplicationUpdateModelTestingStatusEnum ||
    (ApplicationUpdateModelTestingStatusEnum = {}),
);
export var ApplicationUpdateModelCollateralDamagePotentialEnum;
(function (ApplicationUpdateModelCollateralDamagePotentialEnum) {
  ApplicationUpdateModelCollateralDamagePotentialEnum["NotDefined"] =
    "NotDefined";
  ApplicationUpdateModelCollateralDamagePotentialEnum["None"] = "None";
  ApplicationUpdateModelCollateralDamagePotentialEnum["Low"] = "Low";
  ApplicationUpdateModelCollateralDamagePotentialEnum["LowMedium"] =
    "LowMedium";
  ApplicationUpdateModelCollateralDamagePotentialEnum["MediumHigh"] =
    "MediumHigh";
  ApplicationUpdateModelCollateralDamagePotentialEnum["High"] = "High";
})(
  ApplicationUpdateModelCollateralDamagePotentialEnum ||
    (ApplicationUpdateModelCollateralDamagePotentialEnum = {}),
);
export var ApplicationUpdateModelTargetDistributionEnum;
(function (ApplicationUpdateModelTargetDistributionEnum) {
  ApplicationUpdateModelTargetDistributionEnum["NotDefined"] = "NotDefined";
  ApplicationUpdateModelTargetDistributionEnum["None"] = "None";
  ApplicationUpdateModelTargetDistributionEnum["Low"] = "Low";
  ApplicationUpdateModelTargetDistributionEnum["Medium"] = "Medium";
  ApplicationUpdateModelTargetDistributionEnum["High"] = "High";
})(
  ApplicationUpdateModelTargetDistributionEnum ||
    (ApplicationUpdateModelTargetDistributionEnum = {}),
);
export var ApplicationUpdateModelConfidentialityRequirementEnum;
(function (ApplicationUpdateModelConfidentialityRequirementEnum) {
  ApplicationUpdateModelConfidentialityRequirementEnum["NotDefined"] =
    "NotDefined";
  ApplicationUpdateModelConfidentialityRequirementEnum["Low"] = "Low";
  ApplicationUpdateModelConfidentialityRequirementEnum["Medium"] = "Medium";
  ApplicationUpdateModelConfidentialityRequirementEnum["High"] = "High";
})(
  ApplicationUpdateModelConfidentialityRequirementEnum ||
    (ApplicationUpdateModelConfidentialityRequirementEnum = {}),
);
export var ApplicationUpdateModelIntegrityRequirementEnum;
(function (ApplicationUpdateModelIntegrityRequirementEnum) {
  ApplicationUpdateModelIntegrityRequirementEnum["NotDefined"] = "NotDefined";
  ApplicationUpdateModelIntegrityRequirementEnum["Low"] = "Low";
  ApplicationUpdateModelIntegrityRequirementEnum["Medium"] = "Medium";
  ApplicationUpdateModelIntegrityRequirementEnum["High"] = "High";
})(
  ApplicationUpdateModelIntegrityRequirementEnum ||
    (ApplicationUpdateModelIntegrityRequirementEnum = {}),
);
export var ApplicationUpdateModelAvailabilityRequirementEnum;
(function (ApplicationUpdateModelAvailabilityRequirementEnum) {
  ApplicationUpdateModelAvailabilityRequirementEnum["NotDefined"] =
    "NotDefined";
  ApplicationUpdateModelAvailabilityRequirementEnum["Low"] = "Low";
  ApplicationUpdateModelAvailabilityRequirementEnum["Medium"] = "Medium";
  ApplicationUpdateModelAvailabilityRequirementEnum["High"] = "High";
})(
  ApplicationUpdateModelAvailabilityRequirementEnum ||
    (ApplicationUpdateModelAvailabilityRequirementEnum = {}),
);
export var ApplicationUpdateModelPreferredOfferingTypeEnum;
(function (ApplicationUpdateModelPreferredOfferingTypeEnum) {
  ApplicationUpdateModelPreferredOfferingTypeEnum["None"] = "None";
  ApplicationUpdateModelPreferredOfferingTypeEnum["ScanExecution"] =
    "ScanExecution";
  ApplicationUpdateModelPreferredOfferingTypeEnum["Applications"] =
    "Applications";
})(
  ApplicationUpdateModelPreferredOfferingTypeEnum ||
    (ApplicationUpdateModelPreferredOfferingTypeEnum = {}),
);
export var AssetGroupModelIssuesStatusInheritanceEnum;
(function (AssetGroupModelIssuesStatusInheritanceEnum) {
  AssetGroupModelIssuesStatusInheritanceEnum["None"] = "None";
  AssetGroupModelIssuesStatusInheritanceEnum["Noise"] = "Noise";
  AssetGroupModelIssuesStatusInheritanceEnum["Fixed"] = "Fixed";
})(
  AssetGroupModelIssuesStatusInheritanceEnum ||
    (AssetGroupModelIssuesStatusInheritanceEnum = {}),
);
export var AuditEffectedEntityEntityTypeEnum;
(function (AuditEffectedEntityEntityTypeEnum) {
  AuditEffectedEntityEntityTypeEnum["Organization"] = "Organization";
  AuditEffectedEntityEntityTypeEnum["AssetGroup"] = "AssetGroup";
  AuditEffectedEntityEntityTypeEnum["User"] = "User";
  AuditEffectedEntityEntityTypeEnum["UserRole"] = "UserRole";
  AuditEffectedEntityEntityTypeEnum["App"] = "App";
  AuditEffectedEntityEntityTypeEnum["Scan"] = "Scan";
  AuditEffectedEntityEntityTypeEnum["ScanExecution"] = "ScanExecution";
  AuditEffectedEntityEntityTypeEnum["Presence"] = "Presence";
  AuditEffectedEntityEntityTypeEnum["IssueBulk"] = "IssueBulk";
  AuditEffectedEntityEntityTypeEnum["FixGroup"] = "FixGroup";
  AuditEffectedEntityEntityTypeEnum["Policy"] = "Policy";
  AuditEffectedEntityEntityTypeEnum["Session"] = "Session";
  AuditEffectedEntityEntityTypeEnum["BusinessUnit"] = "BusinessUnit";
  AuditEffectedEntityEntityTypeEnum["Domain"] = "Domain";
  AuditEffectedEntityEntityTypeEnum["TestPolicy"] = "TestPolicy";
  AuditEffectedEntityEntityTypeEnum["CustomFields"] = "CustomFields";
  AuditEffectedEntityEntityTypeEnum["ScanTemplate"] = "ScanTemplate";
  AuditEffectedEntityEntityTypeEnum["OrgSetting"] = "OrgSetting";
})(
  AuditEffectedEntityEntityTypeEnum || (AuditEffectedEntityEntityTypeEnum = {}),
);
export var AuditModelActionEnum;
(function (AuditModelActionEnum) {
  AuditModelActionEnum["Login"] = "Login";
  AuditModelActionEnum["Create"] = "Create";
  AuditModelActionEnum["Update"] = "Update";
  AuditModelActionEnum["Delete"] = "Delete";
})(AuditModelActionEnum || (AuditModelActionEnum = {}));
export var AuditModelActivityEnum;
(function (AuditModelActivityEnum) {
  AuditModelActivityEnum["Login"] = "Login";
  AuditModelActivityEnum["Create"] = "Create";
  AuditModelActivityEnum["Update"] = "Update";
  AuditModelActivityEnum["Delete"] = "Delete";
  AuditModelActivityEnum["Reset"] = "Reset";
  AuditModelActivityEnum["Associate"] = "Associate";
  AuditModelActivityEnum["Disassociate"] = "Disassociate";
  AuditModelActivityEnum["CreateReport"] = "CreateReport";
  AuditModelActivityEnum["InviteUser"] = "InviteUser";
  AuditModelActivityEnum["Add"] = "Add";
  AuditModelActivityEnum["Remove"] = "Remove";
  AuditModelActivityEnum["UpdateIssuesBulk"] = "UpdateIssuesBulk";
  AuditModelActivityEnum["DeleteScanExecutions"] = "DeleteScanExecutions";
  AuditModelActivityEnum["BlockDomain"] = "BlockDomain";
  AuditModelActivityEnum["AllowDomain"] = "AllowDomain";
})(AuditModelActivityEnum || (AuditModelActivityEnum = {}));
export var AuditModelEntityTypeEnum;
(function (AuditModelEntityTypeEnum) {
  AuditModelEntityTypeEnum["Organization"] = "Organization";
  AuditModelEntityTypeEnum["AssetGroup"] = "AssetGroup";
  AuditModelEntityTypeEnum["User"] = "User";
  AuditModelEntityTypeEnum["UserRole"] = "UserRole";
  AuditModelEntityTypeEnum["App"] = "App";
  AuditModelEntityTypeEnum["Scan"] = "Scan";
  AuditModelEntityTypeEnum["ScanExecution"] = "ScanExecution";
  AuditModelEntityTypeEnum["Presence"] = "Presence";
  AuditModelEntityTypeEnum["IssueBulk"] = "IssueBulk";
  AuditModelEntityTypeEnum["FixGroup"] = "FixGroup";
  AuditModelEntityTypeEnum["Policy"] = "Policy";
  AuditModelEntityTypeEnum["Session"] = "Session";
  AuditModelEntityTypeEnum["BusinessUnit"] = "BusinessUnit";
  AuditModelEntityTypeEnum["Domain"] = "Domain";
  AuditModelEntityTypeEnum["TestPolicy"] = "TestPolicy";
  AuditModelEntityTypeEnum["CustomFields"] = "CustomFields";
  AuditModelEntityTypeEnum["ScanTemplate"] = "ScanTemplate";
  AuditModelEntityTypeEnum["OrgSetting"] = "OrgSetting";
})(AuditModelEntityTypeEnum || (AuditModelEntityTypeEnum = {}));
export var BlockedDomainModelUrlTypeEnum;
(function (BlockedDomainModelUrlTypeEnum) {
  BlockedDomainModelUrlTypeEnum["Domain"] = "Domain";
  BlockedDomainModelUrlTypeEnum["IpAddress"] = "IpAddress";
})(BlockedDomainModelUrlTypeEnum || (BlockedDomainModelUrlTypeEnum = {}));
export var ChartCreateModelMetricsEnum;
(function (ChartCreateModelMetricsEnum) {
  ChartCreateModelMetricsEnum["RiskRating"] = "RiskRating";
  ChartCreateModelMetricsEnum["TestingStatus"] = "TestingStatus";
  ChartCreateModelMetricsEnum["Issues"] = "Issues";
  ChartCreateModelMetricsEnum["MTTR"] = "MTTR";
  ChartCreateModelMetricsEnum["ScanExecutions"] = "ScanExecutions";
})(ChartCreateModelMetricsEnum || (ChartCreateModelMetricsEnum = {}));
export var ChartFilterModelMinSeverityEnum;
(function (ChartFilterModelMinSeverityEnum) {
  ChartFilterModelMinSeverityEnum["Undetermined"] = "Undetermined";
  ChartFilterModelMinSeverityEnum["Informational"] = "Informational";
  ChartFilterModelMinSeverityEnum["Low"] = "Low";
  ChartFilterModelMinSeverityEnum["Medium"] = "Medium";
  ChartFilterModelMinSeverityEnum["High"] = "High";
  ChartFilterModelMinSeverityEnum["Critical"] = "Critical";
})(ChartFilterModelMinSeverityEnum || (ChartFilterModelMinSeverityEnum = {}));
export var ComplianceStatusCategoryEnum;
(function (ComplianceStatusCategoryEnum) {
  ComplianceStatusCategoryEnum["Custom"] = "Custom";
  ComplianceStatusCategoryEnum["Security"] = "Security";
  ComplianceStatusCategoryEnum["Regulation"] = "Regulation";
  ComplianceStatusCategoryEnum["IndustryStandard"] = "IndustryStandard";
})(ComplianceStatusCategoryEnum || (ComplianceStatusCategoryEnum = {}));
export var CorrelationGroupModelStatusEnum;
(function (CorrelationGroupModelStatusEnum) {
  CorrelationGroupModelStatusEnum["Open"] = "Open";
  CorrelationGroupModelStatusEnum["InProgress"] = "InProgress";
  CorrelationGroupModelStatusEnum["Reopened"] = "Reopened";
  CorrelationGroupModelStatusEnum["Noise"] = "Noise";
  CorrelationGroupModelStatusEnum["Passed"] = "Passed";
  CorrelationGroupModelStatusEnum["Fixed"] = "Fixed";
  CorrelationGroupModelStatusEnum["New"] = "New";
})(CorrelationGroupModelStatusEnum || (CorrelationGroupModelStatusEnum = {}));
export var CorrelationGroupModelSeverityEnum;
(function (CorrelationGroupModelSeverityEnum) {
  CorrelationGroupModelSeverityEnum["Undetermined"] = "Undetermined";
  CorrelationGroupModelSeverityEnum["Informational"] = "Informational";
  CorrelationGroupModelSeverityEnum["Low"] = "Low";
  CorrelationGroupModelSeverityEnum["Medium"] = "Medium";
  CorrelationGroupModelSeverityEnum["High"] = "High";
  CorrelationGroupModelSeverityEnum["Critical"] = "Critical";
})(
  CorrelationGroupModelSeverityEnum || (CorrelationGroupModelSeverityEnum = {}),
);
export var CountPerFinalStatusStatusEnum;
(function (CountPerFinalStatusStatusEnum) {
  CountPerFinalStatusStatusEnum["Completed"] = "Completed";
  CountPerFinalStatusStatusEnum["Failed"] = "Failed";
  CountPerFinalStatusStatusEnum["Other"] = "Other";
})(CountPerFinalStatusStatusEnum || (CountPerFinalStatusStatusEnum = {}));
export var CountPerTechnologiesTechnologiesEnum;
(function (CountPerTechnologiesTechnologiesEnum) {
  CountPerTechnologiesTechnologiesEnum["NONE"] = "NONE";
  CountPerTechnologiesTechnologiesEnum["DAST"] = "DAST";
  CountPerTechnologiesTechnologiesEnum["SAST"] = "SAST";
  CountPerTechnologiesTechnologiesEnum["IAST"] = "IAST";
  CountPerTechnologiesTechnologiesEnum["SCA"] = "SCA";
})(
  CountPerTechnologiesTechnologiesEnum ||
    (CountPerTechnologiesTechnologiesEnum = {}),
);
export var CustomFieldModelValueTypeEnum;
(function (CustomFieldModelValueTypeEnum) {
  CustomFieldModelValueTypeEnum["String"] = "String";
  CustomFieldModelValueTypeEnum["DateTime"] = "DateTime";
})(CustomFieldModelValueTypeEnum || (CustomFieldModelValueTypeEnum = {}));
export var CustomFieldRequestModelValueTypeEnum;
(function (CustomFieldRequestModelValueTypeEnum) {
  CustomFieldRequestModelValueTypeEnum["String"] = "String";
  CustomFieldRequestModelValueTypeEnum["DateTime"] = "DateTime";
})(
  CustomFieldRequestModelValueTypeEnum ||
    (CustomFieldRequestModelValueTypeEnum = {}),
);
export var CustomFieldResponseModelValueTypeEnum;
(function (CustomFieldResponseModelValueTypeEnum) {
  CustomFieldResponseModelValueTypeEnum["String"] = "String";
  CustomFieldResponseModelValueTypeEnum["DateTime"] = "DateTime";
})(
  CustomFieldResponseModelValueTypeEnum ||
    (CustomFieldResponseModelValueTypeEnum = {}),
);
export var DastScanExecutionModelStatusEnum;
(function (DastScanExecutionModelStatusEnum) {
  DastScanExecutionModelStatusEnum["Running"] = "Running";
  DastScanExecutionModelStatusEnum["Stopping"] = "Stopping";
  DastScanExecutionModelStatusEnum["Pausing"] = "Pausing";
  DastScanExecutionModelStatusEnum["InQueue"] = "InQueue";
  DastScanExecutionModelStatusEnum["Paused"] = "Paused";
  DastScanExecutionModelStatusEnum["Ready"] = "Ready";
  DastScanExecutionModelStatusEnum["Failed"] = "Failed";
})(DastScanExecutionModelStatusEnum || (DastScanExecutionModelStatusEnum = {}));
export var DastScanExecutionModelResultEnum;
(function (DastScanExecutionModelResultEnum) {
  DastScanExecutionModelResultEnum["None"] = "None";
  DastScanExecutionModelResultEnum["NoIssues"] = "NoIssues";
  DastScanExecutionModelResultEnum["Informational"] = "Informational";
  DastScanExecutionModelResultEnum["Low"] = "Low";
  DastScanExecutionModelResultEnum["Medium"] = "Medium";
  DastScanExecutionModelResultEnum["High"] = "High";
  DastScanExecutionModelResultEnum["Critical"] = "Critical";
})(DastScanExecutionModelResultEnum || (DastScanExecutionModelResultEnum = {}));
export var DastScanExecutionModelReadStatusEnum;
(function (DastScanExecutionModelReadStatusEnum) {
  DastScanExecutionModelReadStatusEnum["None"] = "None";
  DastScanExecutionModelReadStatusEnum["Unread"] = "Unread";
  DastScanExecutionModelReadStatusEnum["Read"] = "Read";
})(
  DastScanExecutionModelReadStatusEnum ||
    (DastScanExecutionModelReadStatusEnum = {}),
);
export var DastScanExecutionModelAvailableReportsEnum;
(function (DastScanExecutionModelAvailableReportsEnum) {
  DastScanExecutionModelAvailableReportsEnum["Xml"] = "Xml";
  DastScanExecutionModelAvailableReportsEnum["Pdf"] = "Pdf";
  DastScanExecutionModelAvailableReportsEnum["Html"] = "Html";
  DastScanExecutionModelAvailableReportsEnum["CompliancePdf"] = "CompliancePdf";
  DastScanExecutionModelAvailableReportsEnum["OwaspTop10Pdf"] = "OwaspTop10Pdf";
  DastScanExecutionModelAvailableReportsEnum["Sans25Pdf"] = "Sans25Pdf";
  DastScanExecutionModelAvailableReportsEnum["RawXml"] = "RawXml";
  DastScanExecutionModelAvailableReportsEnum["Zip"] = "Zip";
  DastScanExecutionModelAvailableReportsEnum["Json"] = "Json";
})(
  DastScanExecutionModelAvailableReportsEnum ||
    (DastScanExecutionModelAvailableReportsEnum = {}),
);
export var DastScanExecutionModelExecutionProgressEnum;
(function (DastScanExecutionModelExecutionProgressEnum) {
  DastScanExecutionModelExecutionProgressEnum["Pending"] = "Pending";
  DastScanExecutionModelExecutionProgressEnum["Running"] = "Running";
  DastScanExecutionModelExecutionProgressEnum["UnderReview"] = "UnderReview";
  DastScanExecutionModelExecutionProgressEnum["RunningManually"] =
    "RunningManually";
  DastScanExecutionModelExecutionProgressEnum["Paused"] = "Paused";
  DastScanExecutionModelExecutionProgressEnum["Completed"] = "Completed";
})(
  DastScanExecutionModelExecutionProgressEnum ||
    (DastScanExecutionModelExecutionProgressEnum = {}),
);
export var DastScanModelTechnologyEnum;
(function (DastScanModelTechnologyEnum) {
  DastScanModelTechnologyEnum["DynamicAnalyzer"] = "DynamicAnalyzer";
  DastScanModelTechnologyEnum["StaticAnalyzer"] = "StaticAnalyzer";
  DastScanModelTechnologyEnum["IFA"] = "IFA";
  DastScanModelTechnologyEnum["DastAutomation"] = "DastAutomation";
  DastScanModelTechnologyEnum["IASTAnalyzer"] = "IASTAnalyzer";
  DastScanModelTechnologyEnum["ScaAnalyzer"] = "ScaAnalyzer";
})(DastScanModelTechnologyEnum || (DastScanModelTechnologyEnum = {}));
export var DastScanModelIastAgentStatusEnum;
(function (DastScanModelIastAgentStatusEnum) {
  DastScanModelIastAgentStatusEnum["None"] = "None";
  DastScanModelIastAgentStatusEnum["Active"] = "Active";
  DastScanModelIastAgentStatusEnum["KeyNeverUsed"] = "KeyNeverUsed";
  DastScanModelIastAgentStatusEnum["Inactive"] = "Inactive";
})(DastScanModelIastAgentStatusEnum || (DastScanModelIastAgentStatusEnum = {}));
export var DastScanModelIastAgentTypeEnum;
(function (DastScanModelIastAgentTypeEnum) {
  DastScanModelIastAgentTypeEnum["Java"] = "Java";
  DastScanModelIastAgentTypeEnum["DotNet"] = "DotNet";
  DastScanModelIastAgentTypeEnum["NodeJS"] = "NodeJS";
  DastScanModelIastAgentTypeEnum["PhpWindows"] = "PhpWindows";
  DastScanModelIastAgentTypeEnum["PhpRedHat"] = "PhpRedHat";
  DastScanModelIastAgentTypeEnum["PhpUbuntu"] = "PhpUbuntu";
  DastScanModelIastAgentTypeEnum["Kubernetes"] = "Kubernetes";
})(DastScanModelIastAgentTypeEnum || (DastScanModelIastAgentTypeEnum = {}));
export var DastScanModelOfferingTypeEnum;
(function (DastScanModelOfferingTypeEnum) {
  DastScanModelOfferingTypeEnum["None"] = "None";
  DastScanModelOfferingTypeEnum["Trial"] = "Trial";
  DastScanModelOfferingTypeEnum["HTrial"] = "HTrial";
  DastScanModelOfferingTypeEnum["Applications"] = "Applications";
  DastScanModelOfferingTypeEnum["ScanExecution"] = "ScanExecution";
  DastScanModelOfferingTypeEnum["AnalyzerConcurrent"] = "AnalyzerConcurrent";
  DastScanModelOfferingTypeEnum["ConsultantServices"] = "ConsultantServices";
  DastScanModelOfferingTypeEnum["Premium"] = "Premium";
  DastScanModelOfferingTypeEnum["OpenSourcePerApplication"] =
    "OpenSourcePerApplication";
  DastScanModelOfferingTypeEnum["OpenSourcePremium"] = "OpenSourcePremium";
  DastScanModelOfferingTypeEnum["OpenSourceConcurrent"] =
    "OpenSourceConcurrent";
  DastScanModelOfferingTypeEnum["IASTConcurrent"] = "IASTConcurrent";
  DastScanModelOfferingTypeEnum["IASTPayPerApp"] = "IASTPayPerApp";
  DastScanModelOfferingTypeEnum["Promotional"] = "Promotional";
  DastScanModelOfferingTypeEnum["Silver"] = "Silver";
  DastScanModelOfferingTypeEnum["Gold"] = "Gold";
  DastScanModelOfferingTypeEnum["Platinum"] = "Platinum";
  DastScanModelOfferingTypeEnum["SCAPerApplication"] = "SCAPerApplication";
  DastScanModelOfferingTypeEnum["ContributingUser"] = "ContributingUser";
  DastScanModelOfferingTypeEnum["SilverContribUser"] = "SilverContribUser";
  DastScanModelOfferingTypeEnum["GoldContribUser"] = "GoldContribUser";
  DastScanModelOfferingTypeEnum["PlatinumContribUser"] = "PlatinumContribUser";
  DastScanModelOfferingTypeEnum["SilverPerApp"] = "SilverPerApp";
  DastScanModelOfferingTypeEnum["GoldPerApp"] = "GoldPerApp";
  DastScanModelOfferingTypeEnum["PlatinumPerApp"] = "PlatinumPerApp";
})(DastScanModelOfferingTypeEnum || (DastScanModelOfferingTypeEnum = {}));
export var DastScanModelLoginConfigurationTypeEnum;
(function (DastScanModelLoginConfigurationTypeEnum) {
  DastScanModelLoginConfigurationTypeEnum["None"] = "None";
  DastScanModelLoginConfigurationTypeEnum["LoginSequence"] = "LoginSequence";
  DastScanModelLoginConfigurationTypeEnum["LoginFile"] = "LoginFile";
  DastScanModelLoginConfigurationTypeEnum["AutomaticLogin"] = "AutomaticLogin";
  DastScanModelLoginConfigurationTypeEnum["LoginRequests"] = "LoginRequests";
  DastScanModelLoginConfigurationTypeEnum["ApiKeyLogin"] = "ApiKeyLogin";
})(
  DastScanModelLoginConfigurationTypeEnum ||
    (DastScanModelLoginConfigurationTypeEnum = {}),
);
export var DastScanModelTestOperationEnum;
(function (DastScanModelTestOperationEnum) {
  DastScanModelTestOperationEnum["None"] = "None";
  DastScanModelTestOperationEnum["Retest"] = "Retest";
  DastScanModelTestOperationEnum["ContinueTest"] = "ContinueTest";
  DastScanModelTestOperationEnum["ReportOnly"] = "ReportOnly";
})(DastScanModelTestOperationEnum || (DastScanModelTestOperationEnum = {}));
export var DastScanModelScanMethodEnum;
(function (DastScanModelScanMethodEnum) {
  DastScanModelScanMethodEnum["Configured"] = "Configured";
  DastScanModelScanMethodEnum["APIPostman"] = "APIPostman";
  DastScanModelScanMethodEnum["APIOpenAPI"] = "APIOpenAPI";
  DastScanModelScanMethodEnum["APIRecordedTraffic"] = "APIRecordedTraffic";
  DastScanModelScanMethodEnum["Template"] = "Template";
  DastScanModelScanMethodEnum["ScanFile"] = "ScanFile";
})(DastScanModelScanMethodEnum || (DastScanModelScanMethodEnum = {}));
export var DastTemplateConfigurationLoginConfigurationTypeEnum;
(function (DastTemplateConfigurationLoginConfigurationTypeEnum) {
  DastTemplateConfigurationLoginConfigurationTypeEnum["None"] = "None";
  DastTemplateConfigurationLoginConfigurationTypeEnum["LoginSequence"] =
    "LoginSequence";
  DastTemplateConfigurationLoginConfigurationTypeEnum["LoginFile"] =
    "LoginFile";
  DastTemplateConfigurationLoginConfigurationTypeEnum["AutomaticLogin"] =
    "AutomaticLogin";
  DastTemplateConfigurationLoginConfigurationTypeEnum["LoginRequests"] =
    "LoginRequests";
  DastTemplateConfigurationLoginConfigurationTypeEnum["ApiKeyLogin"] =
    "ApiKeyLogin";
})(
  DastTemplateConfigurationLoginConfigurationTypeEnum ||
    (DastTemplateConfigurationLoginConfigurationTypeEnum = {}),
);
export var DastTemplateConfigurationDastScanMethodEnum;
(function (DastTemplateConfigurationDastScanMethodEnum) {
  DastTemplateConfigurationDastScanMethodEnum["Configured"] = "Configured";
  DastTemplateConfigurationDastScanMethodEnum["APIPostman"] = "APIPostman";
  DastTemplateConfigurationDastScanMethodEnum["APIOpenAPI"] = "APIOpenAPI";
  DastTemplateConfigurationDastScanMethodEnum["APIRecordedTraffic"] =
    "APIRecordedTraffic";
  DastTemplateConfigurationDastScanMethodEnum["Template"] = "Template";
  DastTemplateConfigurationDastScanMethodEnum["ScanFile"] = "ScanFile";
})(
  DastTemplateConfigurationDastScanMethodEnum ||
    (DastTemplateConfigurationDastScanMethodEnum = {}),
);
export var DastUserScanConfigurationExtendedOtpHashTypeEnum;
(function (DastUserScanConfigurationExtendedOtpHashTypeEnum) {
  DastUserScanConfigurationExtendedOtpHashTypeEnum["None"] = "None";
  DastUserScanConfigurationExtendedOtpHashTypeEnum["Sha1"] = "Sha1";
  DastUserScanConfigurationExtendedOtpHashTypeEnum["Sha256"] = "Sha256";
  DastUserScanConfigurationExtendedOtpHashTypeEnum["Sha512"] = "Sha512";
})(
  DastUserScanConfigurationExtendedOtpHashTypeEnum ||
    (DastUserScanConfigurationExtendedOtpHashTypeEnum = {}),
);
export var DastUserScanConfigurationExtendedPredefinedTestPolicyEnum;
(function (DastUserScanConfigurationExtendedPredefinedTestPolicyEnum) {
  DastUserScanConfigurationExtendedPredefinedTestPolicyEnum["Complete"] =
    "Complete";
  DastUserScanConfigurationExtendedPredefinedTestPolicyEnum["Default"] =
    "Default";
  DastUserScanConfigurationExtendedPredefinedTestPolicyEnum["OwaspTop10Api"] =
    "OwaspTop10Api";
  DastUserScanConfigurationExtendedPredefinedTestPolicyEnum["OwaspTop10"] =
    "OwaspTop10";
  DastUserScanConfigurationExtendedPredefinedTestPolicyEnum["ProductionSite"] =
    "ProductionSite";
  DastUserScanConfigurationExtendedPredefinedTestPolicyEnum["Custom"] =
    "Custom";
})(
  DastUserScanConfigurationExtendedPredefinedTestPolicyEnum ||
    (DastUserScanConfigurationExtendedPredefinedTestPolicyEnum = {}),
);
export var DastUserScanConfigurationExtendedTestOptimizationLevelEnum;
(function (DastUserScanConfigurationExtendedTestOptimizationLevelEnum) {
  DastUserScanConfigurationExtendedTestOptimizationLevelEnum["NoOptimization"] =
    "NoOptimization";
  DastUserScanConfigurationExtendedTestOptimizationLevelEnum["Fast"] = "Fast";
  DastUserScanConfigurationExtendedTestOptimizationLevelEnum["Faster"] =
    "Faster";
  DastUserScanConfigurationExtendedTestOptimizationLevelEnum["Fastest"] =
    "Fastest";
})(
  DastUserScanConfigurationExtendedTestOptimizationLevelEnum ||
    (DastUserScanConfigurationExtendedTestOptimizationLevelEnum = {}),
);
export var DomainModelUrlTypeEnum;
(function (DomainModelUrlTypeEnum) {
  DomainModelUrlTypeEnum["Domain"] = "Domain";
  DomainModelUrlTypeEnum["IpAddress"] = "IpAddress";
})(DomainModelUrlTypeEnum || (DomainModelUrlTypeEnum = {}));
export var DomainModelTypeEnum;
(function (DomainModelTypeEnum) {
  DomainModelTypeEnum["Support"] = "Support";
  DomainModelTypeEnum["Html"] = "Html";
  DomainModelTypeEnum["Email"] = "Email";
  DomainModelTypeEnum["DnsComparison"] = "DnsComparison";
  DomainModelTypeEnum["Manually"] = "Manually";
})(DomainModelTypeEnum || (DomainModelTypeEnum = {}));
export var DomainModelStatusEnum;
(function (DomainModelStatusEnum) {
  DomainModelStatusEnum["None"] = "None";
  DomainModelStatusEnum["Verified"] = "Verified";
  DomainModelStatusEnum["Pending"] = "Pending";
})(DomainModelStatusEnum || (DomainModelStatusEnum = {}));
export var DomainOwnershipModelMailPrefixEnum;
(function (DomainOwnershipModelMailPrefixEnum) {
  DomainOwnershipModelMailPrefixEnum["Admin"] = "Admin";
  DomainOwnershipModelMailPrefixEnum["Administrator"] = "Administrator";
  DomainOwnershipModelMailPrefixEnum["HostMaster"] = "HostMaster";
  DomainOwnershipModelMailPrefixEnum["Root"] = "Root";
  DomainOwnershipModelMailPrefixEnum["WebMaster"] = "WebMaster";
  DomainOwnershipModelMailPrefixEnum["PostMaster"] = "PostMaster";
})(
  DomainOwnershipModelMailPrefixEnum ||
    (DomainOwnershipModelMailPrefixEnum = {}),
);
export var DomainOwnershipModelVerificationModelMailPrefixEnum;
(function (DomainOwnershipModelVerificationModelMailPrefixEnum) {
  DomainOwnershipModelVerificationModelMailPrefixEnum["Admin"] = "Admin";
  DomainOwnershipModelVerificationModelMailPrefixEnum["Administrator"] =
    "Administrator";
  DomainOwnershipModelVerificationModelMailPrefixEnum["HostMaster"] =
    "HostMaster";
  DomainOwnershipModelVerificationModelMailPrefixEnum["Root"] = "Root";
  DomainOwnershipModelVerificationModelMailPrefixEnum["WebMaster"] =
    "WebMaster";
  DomainOwnershipModelVerificationModelMailPrefixEnum["PostMaster"] =
    "PostMaster";
})(
  DomainOwnershipModelVerificationModelMailPrefixEnum ||
    (DomainOwnershipModelVerificationModelMailPrefixEnum = {}),
);
export var ExcludeExceptionModelTypeEnum;
(function (ExcludeExceptionModelTypeEnum) {
  ExcludeExceptionModelTypeEnum["Exclude"] = "Exclude";
  ExcludeExceptionModelTypeEnum["Exception"] = "Exception";
})(ExcludeExceptionModelTypeEnum || (ExcludeExceptionModelTypeEnum = {}));
export var ExploreItemTrafficTypeEnum;
(function (ExploreItemTrafficTypeEnum) {
  ExploreItemTrafficTypeEnum["Undefined"] = "Undefined";
  ExploreItemTrafficTypeEnum["Manual"] = "Manual";
  ExploreItemTrafficTypeEnum["MultiStep"] = "MultiStep";
  ExploreItemTrafficTypeEnum["Llm"] = "Llm";
})(ExploreItemTrafficTypeEnum || (ExploreItemTrafficTypeEnum = {}));
export var FixGroupFixGroupTypeEnum;
(function (FixGroupFixGroupTypeEnum) {
  FixGroupFixGroupTypeEnum["OpenSourceLib"] = "OpenSourceLib";
  FixGroupFixGroupTypeEnum["FixLocation"] = "FixLocation";
  FixGroupFixGroupTypeEnum["Api"] = "Api";
})(FixGroupFixGroupTypeEnum || (FixGroupFixGroupTypeEnum = {}));
export var FixGroupFixLocationEntityTypeEnum;
(function (FixGroupFixLocationEntityTypeEnum) {
  FixGroupFixLocationEntityTypeEnum["None"] = "None";
  FixGroupFixLocationEntityTypeEnum["ImplementationOf"] = "ImplementationOf";
  FixGroupFixLocationEntityTypeEnum["UsageOf"] = "UsageOf";
})(
  FixGroupFixLocationEntityTypeEnum || (FixGroupFixLocationEntityTypeEnum = {}),
);
export var FixGroupSeverityEnum;
(function (FixGroupSeverityEnum) {
  FixGroupSeverityEnum["Undetermined"] = "Undetermined";
  FixGroupSeverityEnum["Informational"] = "Informational";
  FixGroupSeverityEnum["Low"] = "Low";
  FixGroupSeverityEnum["Medium"] = "Medium";
  FixGroupSeverityEnum["High"] = "High";
  FixGroupSeverityEnum["Critical"] = "Critical";
})(FixGroupSeverityEnum || (FixGroupSeverityEnum = {}));
export var FixGroupStatusEnum;
(function (FixGroupStatusEnum) {
  FixGroupStatusEnum["Open"] = "Open";
  FixGroupStatusEnum["InProgress"] = "InProgress";
  FixGroupStatusEnum["Reopened"] = "Reopened";
  FixGroupStatusEnum["Noise"] = "Noise";
  FixGroupStatusEnum["Passed"] = "Passed";
  FixGroupStatusEnum["Fixed"] = "Fixed";
  FixGroupStatusEnum["New"] = "New";
})(FixGroupStatusEnum || (FixGroupStatusEnum = {}));
export var FixGroupUpdateStatusEnum;
(function (FixGroupUpdateStatusEnum) {
  FixGroupUpdateStatusEnum["Open"] = "Open";
  FixGroupUpdateStatusEnum["InProgress"] = "InProgress";
  FixGroupUpdateStatusEnum["Noise"] = "Noise";
  FixGroupUpdateStatusEnum["Passed"] = "Passed";
  FixGroupUpdateStatusEnum["Fixed"] = "Fixed";
  FixGroupUpdateStatusEnum["New"] = "New";
})(FixGroupUpdateStatusEnum || (FixGroupUpdateStatusEnum = {}));
export var GeneralScanExecutionModelStatusEnum;
(function (GeneralScanExecutionModelStatusEnum) {
  GeneralScanExecutionModelStatusEnum["Running"] = "Running";
  GeneralScanExecutionModelStatusEnum["Stopping"] = "Stopping";
  GeneralScanExecutionModelStatusEnum["Pausing"] = "Pausing";
  GeneralScanExecutionModelStatusEnum["InQueue"] = "InQueue";
  GeneralScanExecutionModelStatusEnum["Paused"] = "Paused";
  GeneralScanExecutionModelStatusEnum["Ready"] = "Ready";
  GeneralScanExecutionModelStatusEnum["Failed"] = "Failed";
})(
  GeneralScanExecutionModelStatusEnum ||
    (GeneralScanExecutionModelStatusEnum = {}),
);
export var GeneralScanExecutionModelResultEnum;
(function (GeneralScanExecutionModelResultEnum) {
  GeneralScanExecutionModelResultEnum["None"] = "None";
  GeneralScanExecutionModelResultEnum["NoIssues"] = "NoIssues";
  GeneralScanExecutionModelResultEnum["Informational"] = "Informational";
  GeneralScanExecutionModelResultEnum["Low"] = "Low";
  GeneralScanExecutionModelResultEnum["Medium"] = "Medium";
  GeneralScanExecutionModelResultEnum["High"] = "High";
  GeneralScanExecutionModelResultEnum["Critical"] = "Critical";
})(
  GeneralScanExecutionModelResultEnum ||
    (GeneralScanExecutionModelResultEnum = {}),
);
export var GeneralScanExecutionModelReadStatusEnum;
(function (GeneralScanExecutionModelReadStatusEnum) {
  GeneralScanExecutionModelReadStatusEnum["None"] = "None";
  GeneralScanExecutionModelReadStatusEnum["Unread"] = "Unread";
  GeneralScanExecutionModelReadStatusEnum["Read"] = "Read";
})(
  GeneralScanExecutionModelReadStatusEnum ||
    (GeneralScanExecutionModelReadStatusEnum = {}),
);
export var GeneralScanExecutionModelAvailableReportsEnum;
(function (GeneralScanExecutionModelAvailableReportsEnum) {
  GeneralScanExecutionModelAvailableReportsEnum["Xml"] = "Xml";
  GeneralScanExecutionModelAvailableReportsEnum["Pdf"] = "Pdf";
  GeneralScanExecutionModelAvailableReportsEnum["Html"] = "Html";
  GeneralScanExecutionModelAvailableReportsEnum["CompliancePdf"] =
    "CompliancePdf";
  GeneralScanExecutionModelAvailableReportsEnum["OwaspTop10Pdf"] =
    "OwaspTop10Pdf";
  GeneralScanExecutionModelAvailableReportsEnum["Sans25Pdf"] = "Sans25Pdf";
  GeneralScanExecutionModelAvailableReportsEnum["RawXml"] = "RawXml";
  GeneralScanExecutionModelAvailableReportsEnum["Zip"] = "Zip";
  GeneralScanExecutionModelAvailableReportsEnum["Json"] = "Json";
})(
  GeneralScanExecutionModelAvailableReportsEnum ||
    (GeneralScanExecutionModelAvailableReportsEnum = {}),
);
export var GeneralScanExecutionModelExecutionProgressEnum;
(function (GeneralScanExecutionModelExecutionProgressEnum) {
  GeneralScanExecutionModelExecutionProgressEnum["Pending"] = "Pending";
  GeneralScanExecutionModelExecutionProgressEnum["Running"] = "Running";
  GeneralScanExecutionModelExecutionProgressEnum["UnderReview"] = "UnderReview";
  GeneralScanExecutionModelExecutionProgressEnum["RunningManually"] =
    "RunningManually";
  GeneralScanExecutionModelExecutionProgressEnum["Paused"] = "Paused";
  GeneralScanExecutionModelExecutionProgressEnum["Completed"] = "Completed";
})(
  GeneralScanExecutionModelExecutionProgressEnum ||
    (GeneralScanExecutionModelExecutionProgressEnum = {}),
);
export var GlobalEnvironmentInfoExternalIdpModeEnum;
(function (GlobalEnvironmentInfoExternalIdpModeEnum) {
  GlobalEnvironmentInfoExternalIdpModeEnum["Disabled"] = "Disabled";
  GlobalEnvironmentInfoExternalIdpModeEnum["AutoOnboard"] = "AutoOnboard";
  GlobalEnvironmentInfoExternalIdpModeEnum["ManualOnboard"] = "ManualOnboard";
  GlobalEnvironmentInfoExternalIdpModeEnum["GroupsAccess"] = "GroupsAccess";
  GlobalEnvironmentInfoExternalIdpModeEnum["MapGroupsToRoles"] =
    "MapGroupsToRoles";
})(
  GlobalEnvironmentInfoExternalIdpModeEnum ||
    (GlobalEnvironmentInfoExternalIdpModeEnum = {}),
);
export var IastScanExecutionModelStatusEnum;
(function (IastScanExecutionModelStatusEnum) {
  IastScanExecutionModelStatusEnum["Running"] = "Running";
  IastScanExecutionModelStatusEnum["Stopping"] = "Stopping";
  IastScanExecutionModelStatusEnum["Pausing"] = "Pausing";
  IastScanExecutionModelStatusEnum["InQueue"] = "InQueue";
  IastScanExecutionModelStatusEnum["Paused"] = "Paused";
  IastScanExecutionModelStatusEnum["Ready"] = "Ready";
  IastScanExecutionModelStatusEnum["Failed"] = "Failed";
})(IastScanExecutionModelStatusEnum || (IastScanExecutionModelStatusEnum = {}));
export var IastScanExecutionModelResultEnum;
(function (IastScanExecutionModelResultEnum) {
  IastScanExecutionModelResultEnum["None"] = "None";
  IastScanExecutionModelResultEnum["NoIssues"] = "NoIssues";
  IastScanExecutionModelResultEnum["Informational"] = "Informational";
  IastScanExecutionModelResultEnum["Low"] = "Low";
  IastScanExecutionModelResultEnum["Medium"] = "Medium";
  IastScanExecutionModelResultEnum["High"] = "High";
  IastScanExecutionModelResultEnum["Critical"] = "Critical";
})(IastScanExecutionModelResultEnum || (IastScanExecutionModelResultEnum = {}));
export var IastScanExecutionModelReadStatusEnum;
(function (IastScanExecutionModelReadStatusEnum) {
  IastScanExecutionModelReadStatusEnum["None"] = "None";
  IastScanExecutionModelReadStatusEnum["Unread"] = "Unread";
  IastScanExecutionModelReadStatusEnum["Read"] = "Read";
})(
  IastScanExecutionModelReadStatusEnum ||
    (IastScanExecutionModelReadStatusEnum = {}),
);
export var IastScanExecutionModelAvailableReportsEnum;
(function (IastScanExecutionModelAvailableReportsEnum) {
  IastScanExecutionModelAvailableReportsEnum["Xml"] = "Xml";
  IastScanExecutionModelAvailableReportsEnum["Pdf"] = "Pdf";
  IastScanExecutionModelAvailableReportsEnum["Html"] = "Html";
  IastScanExecutionModelAvailableReportsEnum["CompliancePdf"] = "CompliancePdf";
  IastScanExecutionModelAvailableReportsEnum["OwaspTop10Pdf"] = "OwaspTop10Pdf";
  IastScanExecutionModelAvailableReportsEnum["Sans25Pdf"] = "Sans25Pdf";
  IastScanExecutionModelAvailableReportsEnum["RawXml"] = "RawXml";
  IastScanExecutionModelAvailableReportsEnum["Zip"] = "Zip";
  IastScanExecutionModelAvailableReportsEnum["Json"] = "Json";
})(
  IastScanExecutionModelAvailableReportsEnum ||
    (IastScanExecutionModelAvailableReportsEnum = {}),
);
export var IastScanExecutionModelExecutionProgressEnum;
(function (IastScanExecutionModelExecutionProgressEnum) {
  IastScanExecutionModelExecutionProgressEnum["Pending"] = "Pending";
  IastScanExecutionModelExecutionProgressEnum["Running"] = "Running";
  IastScanExecutionModelExecutionProgressEnum["UnderReview"] = "UnderReview";
  IastScanExecutionModelExecutionProgressEnum["RunningManually"] =
    "RunningManually";
  IastScanExecutionModelExecutionProgressEnum["Paused"] = "Paused";
  IastScanExecutionModelExecutionProgressEnum["Completed"] = "Completed";
})(
  IastScanExecutionModelExecutionProgressEnum ||
    (IastScanExecutionModelExecutionProgressEnum = {}),
);
export var IastScanModelTechnologyEnum;
(function (IastScanModelTechnologyEnum) {
  IastScanModelTechnologyEnum["DynamicAnalyzer"] = "DynamicAnalyzer";
  IastScanModelTechnologyEnum["StaticAnalyzer"] = "StaticAnalyzer";
  IastScanModelTechnologyEnum["IFA"] = "IFA";
  IastScanModelTechnologyEnum["DastAutomation"] = "DastAutomation";
  IastScanModelTechnologyEnum["IASTAnalyzer"] = "IASTAnalyzer";
  IastScanModelTechnologyEnum["ScaAnalyzer"] = "ScaAnalyzer";
})(IastScanModelTechnologyEnum || (IastScanModelTechnologyEnum = {}));
export var IastScanModelIastAgentStatusEnum;
(function (IastScanModelIastAgentStatusEnum) {
  IastScanModelIastAgentStatusEnum["None"] = "None";
  IastScanModelIastAgentStatusEnum["Active"] = "Active";
  IastScanModelIastAgentStatusEnum["KeyNeverUsed"] = "KeyNeverUsed";
  IastScanModelIastAgentStatusEnum["Inactive"] = "Inactive";
})(IastScanModelIastAgentStatusEnum || (IastScanModelIastAgentStatusEnum = {}));
export var IastScanModelIastAgentTypeEnum;
(function (IastScanModelIastAgentTypeEnum) {
  IastScanModelIastAgentTypeEnum["Java"] = "Java";
  IastScanModelIastAgentTypeEnum["DotNet"] = "DotNet";
  IastScanModelIastAgentTypeEnum["NodeJS"] = "NodeJS";
  IastScanModelIastAgentTypeEnum["PhpWindows"] = "PhpWindows";
  IastScanModelIastAgentTypeEnum["PhpRedHat"] = "PhpRedHat";
  IastScanModelIastAgentTypeEnum["PhpUbuntu"] = "PhpUbuntu";
  IastScanModelIastAgentTypeEnum["Kubernetes"] = "Kubernetes";
})(IastScanModelIastAgentTypeEnum || (IastScanModelIastAgentTypeEnum = {}));
export var IastScanModelOfferingTypeEnum;
(function (IastScanModelOfferingTypeEnum) {
  IastScanModelOfferingTypeEnum["None"] = "None";
  IastScanModelOfferingTypeEnum["Trial"] = "Trial";
  IastScanModelOfferingTypeEnum["HTrial"] = "HTrial";
  IastScanModelOfferingTypeEnum["Applications"] = "Applications";
  IastScanModelOfferingTypeEnum["ScanExecution"] = "ScanExecution";
  IastScanModelOfferingTypeEnum["AnalyzerConcurrent"] = "AnalyzerConcurrent";
  IastScanModelOfferingTypeEnum["ConsultantServices"] = "ConsultantServices";
  IastScanModelOfferingTypeEnum["Premium"] = "Premium";
  IastScanModelOfferingTypeEnum["OpenSourcePerApplication"] =
    "OpenSourcePerApplication";
  IastScanModelOfferingTypeEnum["OpenSourcePremium"] = "OpenSourcePremium";
  IastScanModelOfferingTypeEnum["OpenSourceConcurrent"] =
    "OpenSourceConcurrent";
  IastScanModelOfferingTypeEnum["IASTConcurrent"] = "IASTConcurrent";
  IastScanModelOfferingTypeEnum["IASTPayPerApp"] = "IASTPayPerApp";
  IastScanModelOfferingTypeEnum["Promotional"] = "Promotional";
  IastScanModelOfferingTypeEnum["Silver"] = "Silver";
  IastScanModelOfferingTypeEnum["Gold"] = "Gold";
  IastScanModelOfferingTypeEnum["Platinum"] = "Platinum";
  IastScanModelOfferingTypeEnum["SCAPerApplication"] = "SCAPerApplication";
  IastScanModelOfferingTypeEnum["ContributingUser"] = "ContributingUser";
  IastScanModelOfferingTypeEnum["SilverContribUser"] = "SilverContribUser";
  IastScanModelOfferingTypeEnum["GoldContribUser"] = "GoldContribUser";
  IastScanModelOfferingTypeEnum["PlatinumContribUser"] = "PlatinumContribUser";
  IastScanModelOfferingTypeEnum["SilverPerApp"] = "SilverPerApp";
  IastScanModelOfferingTypeEnum["GoldPerApp"] = "GoldPerApp";
  IastScanModelOfferingTypeEnum["PlatinumPerApp"] = "PlatinumPerApp";
})(IastScanModelOfferingTypeEnum || (IastScanModelOfferingTypeEnum = {}));
export var InviteResultInviteStatusEnum;
(function (InviteResultInviteStatusEnum) {
  InviteResultInviteStatusEnum["Success"] = "Success";
  InviteResultInviteStatusEnum["BlockedEmail"] = "BlockedEmail";
  InviteResultInviteStatusEnum["InvalidEmail"] = "InvalidEmail";
  InviteResultInviteStatusEnum["AlreadyExist"] = "AlreadyExist";
  InviteResultInviteStatusEnum["Failed"] = "Failed";
  InviteResultInviteStatusEnum["EmailSentRecently"] = "EmailSentRecently";
})(InviteResultInviteStatusEnum || (InviteResultInviteStatusEnum = {}));
export var IssueModelSeverityEnum;
(function (IssueModelSeverityEnum) {
  IssueModelSeverityEnum["Undetermined"] = "Undetermined";
  IssueModelSeverityEnum["Informational"] = "Informational";
  IssueModelSeverityEnum["Low"] = "Low";
  IssueModelSeverityEnum["Medium"] = "Medium";
  IssueModelSeverityEnum["High"] = "High";
  IssueModelSeverityEnum["Critical"] = "Critical";
})(IssueModelSeverityEnum || (IssueModelSeverityEnum = {}));
export var IssueModelStatusEnum;
(function (IssueModelStatusEnum) {
  IssueModelStatusEnum["Open"] = "Open";
  IssueModelStatusEnum["InProgress"] = "InProgress";
  IssueModelStatusEnum["Reopened"] = "Reopened";
  IssueModelStatusEnum["Noise"] = "Noise";
  IssueModelStatusEnum["Passed"] = "Passed";
  IssueModelStatusEnum["Fixed"] = "Fixed";
  IssueModelStatusEnum["New"] = "New";
})(IssueModelStatusEnum || (IssueModelStatusEnum = {}));
export var IssueModelAppPkgStatusEnum;
(function (IssueModelAppPkgStatusEnum) {
  IssueModelAppPkgStatusEnum["Discovered"] = "Discovered";
  IssueModelAppPkgStatusEnum["Rediscovered"] = "Rediscovered";
  IssueModelAppPkgStatusEnum["Removed"] = "Removed";
})(IssueModelAppPkgStatusEnum || (IssueModelAppPkgStatusEnum = {}));
export var IssueModelFgStatusEnum;
(function (IssueModelFgStatusEnum) {
  IssueModelFgStatusEnum["Open"] = "Open";
  IssueModelFgStatusEnum["InProgress"] = "InProgress";
  IssueModelFgStatusEnum["Reopened"] = "Reopened";
  IssueModelFgStatusEnum["Noise"] = "Noise";
  IssueModelFgStatusEnum["Passed"] = "Passed";
  IssueModelFgStatusEnum["Fixed"] = "Fixed";
  IssueModelFgStatusEnum["New"] = "New";
})(IssueModelFgStatusEnum || (IssueModelFgStatusEnum = {}));
export var IssueModelCvssVersionEnum;
(function (IssueModelCvssVersionEnum) {
  IssueModelCvssVersionEnum["None"] = "None";
  IssueModelCvssVersionEnum["Cvss20"] = "Cvss20";
  IssueModelCvssVersionEnum["Cvss30"] = "Cvss30";
  IssueModelCvssVersionEnum["Cvss31"] = "Cvss31";
})(IssueModelCvssVersionEnum || (IssueModelCvssVersionEnum = {}));
export var IssueModelDiffResultEnum;
(function (IssueModelDiffResultEnum) {
  IssueModelDiffResultEnum["NoChange"] = "NoChange";
  IssueModelDiffResultEnum["Added"] = "Added";
  IssueModelDiffResultEnum["Removed"] = "Removed";
})(IssueModelDiffResultEnum || (IssueModelDiffResultEnum = {}));
export var IssueModelReplayScriptFrameworksEnum;
(function (IssueModelReplayScriptFrameworksEnum) {
  IssueModelReplayScriptFrameworksEnum["None"] = "None";
  IssueModelReplayScriptFrameworksEnum["Python"] = "Python";
  IssueModelReplayScriptFrameworksEnum["JsConsole"] = "JsConsole";
})(
  IssueModelReplayScriptFrameworksEnum ||
    (IssueModelReplayScriptFrameworksEnum = {}),
);
export var IssuesReportJobApplyPoliciesEnum;
(function (IssuesReportJobApplyPoliciesEnum) {
  IssuesReportJobApplyPoliciesEnum["None"] = "None";
  IssuesReportJobApplyPoliciesEnum["All"] = "All";
  IssuesReportJobApplyPoliciesEnum["Select"] = "Select";
})(IssuesReportJobApplyPoliciesEnum || (IssuesReportJobApplyPoliciesEnum = {}));
export var JobsStatisticsModelScanTechnologyEnum;
(function (JobsStatisticsModelScanTechnologyEnum) {
  JobsStatisticsModelScanTechnologyEnum["DynamicAnalyzer"] = "DynamicAnalyzer";
  JobsStatisticsModelScanTechnologyEnum["StaticAnalyzer"] = "StaticAnalyzer";
  JobsStatisticsModelScanTechnologyEnum["IFA"] = "IFA";
  JobsStatisticsModelScanTechnologyEnum["DastAutomation"] = "DastAutomation";
  JobsStatisticsModelScanTechnologyEnum["IASTAnalyzer"] = "IASTAnalyzer";
  JobsStatisticsModelScanTechnologyEnum["ScaAnalyzer"] = "ScaAnalyzer";
})(
  JobsStatisticsModelScanTechnologyEnum ||
    (JobsStatisticsModelScanTechnologyEnum = {}),
);
export var LibraryModelHighestIssueSeverityEnum;
(function (LibraryModelHighestIssueSeverityEnum) {
  LibraryModelHighestIssueSeverityEnum["Undetermined"] = "Undetermined";
  LibraryModelHighestIssueSeverityEnum["Informational"] = "Informational";
  LibraryModelHighestIssueSeverityEnum["Low"] = "Low";
  LibraryModelHighestIssueSeverityEnum["Medium"] = "Medium";
  LibraryModelHighestIssueSeverityEnum["High"] = "High";
  LibraryModelHighestIssueSeverityEnum["Critical"] = "Critical";
})(
  LibraryModelHighestIssueSeverityEnum ||
    (LibraryModelHighestIssueSeverityEnum = {}),
);
export var LibraryModelStatusEnum;
(function (LibraryModelStatusEnum) {
  LibraryModelStatusEnum["Discovered"] = "Discovered";
  LibraryModelStatusEnum["Rediscovered"] = "Rediscovered";
  LibraryModelStatusEnum["Removed"] = "Removed";
})(LibraryModelStatusEnum || (LibraryModelStatusEnum = {}));
export var LicenseLibraryModelRiskLevelEnum;
(function (LicenseLibraryModelRiskLevelEnum) {
  LicenseLibraryModelRiskLevelEnum["Undefined"] = "Undefined";
  LicenseLibraryModelRiskLevelEnum["Unknown"] = "Unknown";
  LicenseLibraryModelRiskLevelEnum["Low"] = "Low";
  LicenseLibraryModelRiskLevelEnum["Medium"] = "Medium";
  LicenseLibraryModelRiskLevelEnum["High"] = "High";
})(LicenseLibraryModelRiskLevelEnum || (LicenseLibraryModelRiskLevelEnum = {}));
export var LicenseLibraryModelCopyrightRiskScoreEnum;
(function (LicenseLibraryModelCopyrightRiskScoreEnum) {
  LicenseLibraryModelCopyrightRiskScoreEnum["UNDEFINED"] = "UNDEFINED";
  LicenseLibraryModelCopyrightRiskScoreEnum["ONE"] = "ONE";
  LicenseLibraryModelCopyrightRiskScoreEnum["TWO"] = "TWO";
  LicenseLibraryModelCopyrightRiskScoreEnum["THREE"] = "THREE";
  LicenseLibraryModelCopyrightRiskScoreEnum["FOUR"] = "FOUR";
  LicenseLibraryModelCopyrightRiskScoreEnum["FIVE"] = "FIVE";
  LicenseLibraryModelCopyrightRiskScoreEnum["SIX"] = "SIX";
  LicenseLibraryModelCopyrightRiskScoreEnum["SEVEN"] = "SEVEN";
})(
  LicenseLibraryModelCopyrightRiskScoreEnum ||
    (LicenseLibraryModelCopyrightRiskScoreEnum = {}),
);
export var LicenseLibraryModelPatentRiskScoreEnum;
(function (LicenseLibraryModelPatentRiskScoreEnum) {
  LicenseLibraryModelPatentRiskScoreEnum["UNDEFINED"] = "UNDEFINED";
  LicenseLibraryModelPatentRiskScoreEnum["ONE"] = "ONE";
  LicenseLibraryModelPatentRiskScoreEnum["TWO"] = "TWO";
  LicenseLibraryModelPatentRiskScoreEnum["THREE"] = "THREE";
  LicenseLibraryModelPatentRiskScoreEnum["FOUR"] = "FOUR";
})(
  LicenseLibraryModelPatentRiskScoreEnum ||
    (LicenseLibraryModelPatentRiskScoreEnum = {}),
);
export var LicenseLibraryModelLinkingEnum;
(function (LicenseLibraryModelLinkingEnum) {
  LicenseLibraryModelLinkingEnum["Undefined"] = "Undefined";
  LicenseLibraryModelLinkingEnum["Viral"] = "Viral";
  LicenseLibraryModelLinkingEnum["NonViral"] = "Non_Viral";
  LicenseLibraryModelLinkingEnum["Dynamic"] = "Dynamic";
})(LicenseLibraryModelLinkingEnum || (LicenseLibraryModelLinkingEnum = {}));
export var LicenseLibraryModelCopyLeftEnum;
(function (LicenseLibraryModelCopyLeftEnum) {
  LicenseLibraryModelCopyLeftEnum["Undefined"] = "Undefined";
  LicenseLibraryModelCopyLeftEnum["No"] = "No";
  LicenseLibraryModelCopyLeftEnum["Partial"] = "Partial";
  LicenseLibraryModelCopyLeftEnum["Full"] = "Full";
})(LicenseLibraryModelCopyLeftEnum || (LicenseLibraryModelCopyLeftEnum = {}));
export var LicenseLibraryModelRoyaltyFreeEnum;
(function (LicenseLibraryModelRoyaltyFreeEnum) {
  LicenseLibraryModelRoyaltyFreeEnum["Yes"] = "Yes";
  LicenseLibraryModelRoyaltyFreeEnum["Conditional"] = "Conditional";
  LicenseLibraryModelRoyaltyFreeEnum["No"] = "No";
  LicenseLibraryModelRoyaltyFreeEnum["Undefined"] = "Undefined";
})(
  LicenseLibraryModelRoyaltyFreeEnum ||
    (LicenseLibraryModelRoyaltyFreeEnum = {}),
);
export var LicenseLibraryModelStatusEnum;
(function (LicenseLibraryModelStatusEnum) {
  LicenseLibraryModelStatusEnum["Discovered"] = "Discovered";
  LicenseLibraryModelStatusEnum["Rediscovered"] = "Rediscovered";
  LicenseLibraryModelStatusEnum["Removed"] = "Removed";
})(LicenseLibraryModelStatusEnum || (LicenseLibraryModelStatusEnum = {}));
export var LicenseModelRiskLevelEnum;
(function (LicenseModelRiskLevelEnum) {
  LicenseModelRiskLevelEnum["Undefined"] = "Undefined";
  LicenseModelRiskLevelEnum["Unknown"] = "Unknown";
  LicenseModelRiskLevelEnum["Low"] = "Low";
  LicenseModelRiskLevelEnum["Medium"] = "Medium";
  LicenseModelRiskLevelEnum["High"] = "High";
})(LicenseModelRiskLevelEnum || (LicenseModelRiskLevelEnum = {}));
export var LicenseModelCopyrightRiskScoreEnum;
(function (LicenseModelCopyrightRiskScoreEnum) {
  LicenseModelCopyrightRiskScoreEnum["UNDEFINED"] = "UNDEFINED";
  LicenseModelCopyrightRiskScoreEnum["ONE"] = "ONE";
  LicenseModelCopyrightRiskScoreEnum["TWO"] = "TWO";
  LicenseModelCopyrightRiskScoreEnum["THREE"] = "THREE";
  LicenseModelCopyrightRiskScoreEnum["FOUR"] = "FOUR";
  LicenseModelCopyrightRiskScoreEnum["FIVE"] = "FIVE";
  LicenseModelCopyrightRiskScoreEnum["SIX"] = "SIX";
  LicenseModelCopyrightRiskScoreEnum["SEVEN"] = "SEVEN";
})(
  LicenseModelCopyrightRiskScoreEnum ||
    (LicenseModelCopyrightRiskScoreEnum = {}),
);
export var LicenseModelPatentRiskScoreEnum;
(function (LicenseModelPatentRiskScoreEnum) {
  LicenseModelPatentRiskScoreEnum["UNDEFINED"] = "UNDEFINED";
  LicenseModelPatentRiskScoreEnum["ONE"] = "ONE";
  LicenseModelPatentRiskScoreEnum["TWO"] = "TWO";
  LicenseModelPatentRiskScoreEnum["THREE"] = "THREE";
  LicenseModelPatentRiskScoreEnum["FOUR"] = "FOUR";
})(LicenseModelPatentRiskScoreEnum || (LicenseModelPatentRiskScoreEnum = {}));
export var LicenseModelLinkingEnum;
(function (LicenseModelLinkingEnum) {
  LicenseModelLinkingEnum["Undefined"] = "Undefined";
  LicenseModelLinkingEnum["Viral"] = "Viral";
  LicenseModelLinkingEnum["NonViral"] = "Non_Viral";
  LicenseModelLinkingEnum["Dynamic"] = "Dynamic";
})(LicenseModelLinkingEnum || (LicenseModelLinkingEnum = {}));
export var LicenseModelCopyLeftEnum;
(function (LicenseModelCopyLeftEnum) {
  LicenseModelCopyLeftEnum["Undefined"] = "Undefined";
  LicenseModelCopyLeftEnum["No"] = "No";
  LicenseModelCopyLeftEnum["Partial"] = "Partial";
  LicenseModelCopyLeftEnum["Full"] = "Full";
})(LicenseModelCopyLeftEnum || (LicenseModelCopyLeftEnum = {}));
export var LicenseModelRoyaltyFreeEnum;
(function (LicenseModelRoyaltyFreeEnum) {
  LicenseModelRoyaltyFreeEnum["Yes"] = "Yes";
  LicenseModelRoyaltyFreeEnum["Conditional"] = "Conditional";
  LicenseModelRoyaltyFreeEnum["No"] = "No";
  LicenseModelRoyaltyFreeEnum["Undefined"] = "Undefined";
})(LicenseModelRoyaltyFreeEnum || (LicenseModelRoyaltyFreeEnum = {}));
export var LicenseReportOptionsReportFileTypeEnum;
(function (LicenseReportOptionsReportFileTypeEnum) {
  LicenseReportOptionsReportFileTypeEnum["Pdf"] = "Pdf";
  LicenseReportOptionsReportFileTypeEnum["Html"] = "Html";
  LicenseReportOptionsReportFileTypeEnum["Xml"] = "Xml";
  LicenseReportOptionsReportFileTypeEnum["Csv"] = "Csv";
  LicenseReportOptionsReportFileTypeEnum["Sarif"] = "Sarif";
})(
  LicenseReportOptionsReportFileTypeEnum ||
    (LicenseReportOptionsReportFileTypeEnum = {}),
);
export var MhsPayloadAscpSignatureMhsErrorEnum;
(function (MhsPayloadAscpSignatureMhsErrorEnum) {
  MhsPayloadAscpSignatureMhsErrorEnum["None"] = "None";
  MhsPayloadAscpSignatureMhsErrorEnum["GeneralError"] = "GeneralError";
  MhsPayloadAscpSignatureMhsErrorEnum["InvalidInput"] = "InvalidInput";
  MhsPayloadAscpSignatureMhsErrorEnum["MissingCapabilities"] =
    "MissingCapabilities";
  MhsPayloadAscpSignatureMhsErrorEnum[
    "MHSLicenseGeneralStructureUnrecognized"
  ] = "MHSLicenseGeneralStructureUnrecognized";
  MhsPayloadAscpSignatureMhsErrorEnum["MHSLicenseCertificateInvalid"] =
    "MHSLicenseCertificateInvalid";
  MhsPayloadAscpSignatureMhsErrorEnum["MHSLicensePasetoSignatureInvalid"] =
    "MHSLicensePasetoSignatureInvalid";
  MhsPayloadAscpSignatureMhsErrorEnum[
    "MHSLicensePasetoRawPayloadUnrecognized"
  ] = "MHSLicensePasetoRawPayloadUnrecognized";
  MhsPayloadAscpSignatureMhsErrorEnum["MHSLicenseInvalidAs360Fingerprint"] =
    "MHSLicenseInvalidAs360Fingerprint";
  MhsPayloadAscpSignatureMhsErrorEnum["MHSLicenseDeploymentIdMismatch"] =
    "MHSLicenseDeploymentIdMismatch";
  MhsPayloadAscpSignatureMhsErrorEnum[
    "MHSLicenseIssuedEarlierThanCurrentlyUsed"
  ] = "MHSLicenseIssuedEarlierThanCurrentlyUsed";
  MhsPayloadAscpSignatureMhsErrorEnum["MHSLicenseHasNoRelevantEntitlements"] =
    "MHSLicenseHasNoRelevantEntitlements";
  MhsPayloadAscpSignatureMhsErrorEnum["MHSLicenseWasAlreadyUploaded"] =
    "MHSLicenseWasAlreadyUploaded";
  MhsPayloadAscpSignatureMhsErrorEnum["MHSLicenseOldFeatureIsMissing"] =
    "MHSLicenseOldFeatureIsMissing";
  MhsPayloadAscpSignatureMhsErrorEnum["MHSLicenseChangingPreviousMhsValue"] =
    "MHSLicenseChangingPreviousMhsValue";
  MhsPayloadAscpSignatureMhsErrorEnum["MHSLicenseWasIssuedTooLongAgo"] =
    "MHSLicenseWasIssuedTooLongAgo";
  MhsPayloadAscpSignatureMhsErrorEnum["MHSLicenseInvalidASoCFingerprint"] =
    "MHSLicenseInvalidASoCFingerprint";
})(
  MhsPayloadAscpSignatureMhsErrorEnum ||
    (MhsPayloadAscpSignatureMhsErrorEnum = {}),
);
export var MinPresenceDataStatusEnum;
(function (MinPresenceDataStatusEnum) {
  MinPresenceDataStatusEnum["Active"] = "Active";
  MinPresenceDataStatusEnum["NeverUsed"] = "NeverUsed";
  MinPresenceDataStatusEnum["KeyExpired"] = "KeyExpired";
  MinPresenceDataStatusEnum["KeyNeverUsed"] = "KeyNeverUsed";
  MinPresenceDataStatusEnum["Inactive"] = "Inactive";
  MinPresenceDataStatusEnum["Disable"] = "Disable";
})(MinPresenceDataStatusEnum || (MinPresenceDataStatusEnum = {}));
export var MinScanExecutionModelStatusEnum;
(function (MinScanExecutionModelStatusEnum) {
  MinScanExecutionModelStatusEnum["Running"] = "Running";
  MinScanExecutionModelStatusEnum["Stopping"] = "Stopping";
  MinScanExecutionModelStatusEnum["Pausing"] = "Pausing";
  MinScanExecutionModelStatusEnum["InQueue"] = "InQueue";
  MinScanExecutionModelStatusEnum["Paused"] = "Paused";
  MinScanExecutionModelStatusEnum["Ready"] = "Ready";
  MinScanExecutionModelStatusEnum["Failed"] = "Failed";
})(MinScanExecutionModelStatusEnum || (MinScanExecutionModelStatusEnum = {}));
export var MinScanExecutionModelExecutionProgressEnum;
(function (MinScanExecutionModelExecutionProgressEnum) {
  MinScanExecutionModelExecutionProgressEnum["Pending"] = "Pending";
  MinScanExecutionModelExecutionProgressEnum["Running"] = "Running";
  MinScanExecutionModelExecutionProgressEnum["UnderReview"] = "UnderReview";
  MinScanExecutionModelExecutionProgressEnum["RunningManually"] =
    "RunningManually";
  MinScanExecutionModelExecutionProgressEnum["Paused"] = "Paused";
  MinScanExecutionModelExecutionProgressEnum["Completed"] = "Completed";
})(
  MinScanExecutionModelExecutionProgressEnum ||
    (MinScanExecutionModelExecutionProgressEnum = {}),
);
export var MinScanModelTechnologyEnum;
(function (MinScanModelTechnologyEnum) {
  MinScanModelTechnologyEnum["DynamicAnalyzer"] = "DynamicAnalyzer";
  MinScanModelTechnologyEnum["StaticAnalyzer"] = "StaticAnalyzer";
  MinScanModelTechnologyEnum["IFA"] = "IFA";
  MinScanModelTechnologyEnum["DastAutomation"] = "DastAutomation";
  MinScanModelTechnologyEnum["IASTAnalyzer"] = "IASTAnalyzer";
  MinScanModelTechnologyEnum["ScaAnalyzer"] = "ScaAnalyzer";
})(MinScanModelTechnologyEnum || (MinScanModelTechnologyEnum = {}));
export var MinScanModelIastAgentTypeEnum;
(function (MinScanModelIastAgentTypeEnum) {
  MinScanModelIastAgentTypeEnum["Java"] = "Java";
  MinScanModelIastAgentTypeEnum["DotNet"] = "DotNet";
  MinScanModelIastAgentTypeEnum["NodeJS"] = "NodeJS";
  MinScanModelIastAgentTypeEnum["PhpWindows"] = "PhpWindows";
  MinScanModelIastAgentTypeEnum["PhpRedHat"] = "PhpRedHat";
  MinScanModelIastAgentTypeEnum["PhpUbuntu"] = "PhpUbuntu";
  MinScanModelIastAgentTypeEnum["Kubernetes"] = "Kubernetes";
})(MinScanModelIastAgentTypeEnum || (MinScanModelIastAgentTypeEnum = {}));
export var MinScanModelIastAgentStatusEnum;
(function (MinScanModelIastAgentStatusEnum) {
  MinScanModelIastAgentStatusEnum["None"] = "None";
  MinScanModelIastAgentStatusEnum["Active"] = "Active";
  MinScanModelIastAgentStatusEnum["KeyNeverUsed"] = "KeyNeverUsed";
  MinScanModelIastAgentStatusEnum["Inactive"] = "Inactive";
})(MinScanModelIastAgentStatusEnum || (MinScanModelIastAgentStatusEnum = {}));
export var MonitoredServiceModelServiceTypeEnum;
(function (MonitoredServiceModelServiceTypeEnum) {
  MonitoredServiceModelServiceTypeEnum["ASCP"] = "ASCP";
  MonitoredServiceModelServiceTypeEnum["SAST"] = "SAST";
  MonitoredServiceModelServiceTypeEnum["DAST"] = "DAST";
  MonitoredServiceModelServiceTypeEnum["SCA"] = "SCA";
})(
  MonitoredServiceModelServiceTypeEnum ||
    (MonitoredServiceModelServiceTypeEnum = {}),
);
export var MonitoredServiceModelStatusEnum;
(function (MonitoredServiceModelStatusEnum) {
  MonitoredServiceModelStatusEnum["Operational"] = "Operational";
  MonitoredServiceModelStatusEnum["Overloaded"] = "Overloaded";
  MonitoredServiceModelStatusEnum["OutOfService"] = "OutOfService";
  MonitoredServiceModelStatusEnum["OutOfOrder"] = "OutOfOrder";
  MonitoredServiceModelStatusEnum["MonitoringDisabled"] = "MonitoringDisabled";
})(MonitoredServiceModelStatusEnum || (MonitoredServiceModelStatusEnum = {}));
export var NewAssetGroupModelIssuesStatusInheritanceEnum;
(function (NewAssetGroupModelIssuesStatusInheritanceEnum) {
  NewAssetGroupModelIssuesStatusInheritanceEnum["None"] = "None";
  NewAssetGroupModelIssuesStatusInheritanceEnum["Noise"] = "Noise";
  NewAssetGroupModelIssuesStatusInheritanceEnum["Fixed"] = "Fixed";
})(
  NewAssetGroupModelIssuesStatusInheritanceEnum ||
    (NewAssetGroupModelIssuesStatusInheritanceEnum = {}),
);
export var NewChartModelMetricsEnum;
(function (NewChartModelMetricsEnum) {
  NewChartModelMetricsEnum["RiskRating"] = "RiskRating";
  NewChartModelMetricsEnum["TestingStatus"] = "TestingStatus";
  NewChartModelMetricsEnum["Issues"] = "Issues";
  NewChartModelMetricsEnum["MTTR"] = "MTTR";
  NewChartModelMetricsEnum["ScanExecutions"] = "ScanExecutions";
})(NewChartModelMetricsEnum || (NewChartModelMetricsEnum = {}));
export var NewDastScanTestOperationEnum;
(function (NewDastScanTestOperationEnum) {
  NewDastScanTestOperationEnum["None"] = "None";
  NewDastScanTestOperationEnum["Retest"] = "Retest";
  NewDastScanTestOperationEnum["ContinueTest"] = "ContinueTest";
  NewDastScanTestOperationEnum["ReportOnly"] = "ReportOnly";
})(NewDastScanTestOperationEnum || (NewDastScanTestOperationEnum = {}));
export var NewIastScanAgentTypeEnum;
(function (NewIastScanAgentTypeEnum) {
  NewIastScanAgentTypeEnum["Java"] = "Java";
  NewIastScanAgentTypeEnum["DotNet"] = "DotNet";
  NewIastScanAgentTypeEnum["PhpWindows"] = "PhpWindows";
  NewIastScanAgentTypeEnum["PhpRedHat"] = "PhpRedHat";
  NewIastScanAgentTypeEnum["PhpUbuntu"] = "PhpUbuntu";
  NewIastScanAgentTypeEnum["Kubernetes"] = "Kubernetes";
})(NewIastScanAgentTypeEnum || (NewIastScanAgentTypeEnum = {}));
export var NewOrgSettingsModelSettingTypeEnum;
(function (NewOrgSettingsModelSettingTypeEnum) {
  NewOrgSettingsModelSettingTypeEnum["ReportTitle"] = "ReportTitle";
  NewOrgSettingsModelSettingTypeEnum["ReportHeader"] = "ReportHeader";
  NewOrgSettingsModelSettingTypeEnum["ReportFooter"] = "ReportFooter";
  NewOrgSettingsModelSettingTypeEnum["MainLogoFileName"] = "MainLogoFileName";
  NewOrgSettingsModelSettingTypeEnum["AdditionalLogoFileName"] =
    "AdditionalLogoFileName";
})(
  NewOrgSettingsModelSettingTypeEnum ||
    (NewOrgSettingsModelSettingTypeEnum = {}),
);
export var NewWebhookRequestMethodEnum;
(function (NewWebhookRequestMethodEnum) {
  NewWebhookRequestMethodEnum["GET"] = "GET";
  NewWebhookRequestMethodEnum["POST"] = "POST";
  NewWebhookRequestMethodEnum["PUT"] = "PUT";
})(NewWebhookRequestMethodEnum || (NewWebhookRequestMethodEnum = {}));
export var NewWebhookEventEnum;
(function (NewWebhookEventEnum) {
  NewWebhookEventEnum["ScanExecutionCompleted"] = "ScanExecutionCompleted";
  NewWebhookEventEnum["ApplicationUpdated"] = "ApplicationUpdated";
  NewWebhookEventEnum["NewPatchRequest"] = "NewPatchRequest";
})(NewWebhookEventEnum || (NewWebhookEventEnum = {}));
export var OnBoardResultOnBoardStatusEnum;
(function (OnBoardResultOnBoardStatusEnum) {
  OnBoardResultOnBoardStatusEnum["Success"] = "Success";
  OnBoardResultOnBoardStatusEnum["NotFound"] = "NotFound";
  OnBoardResultOnBoardStatusEnum["Ambiguous"] = "Ambiguous";
  OnBoardResultOnBoardStatusEnum["AlreadyExist"] = "AlreadyExist";
  OnBoardResultOnBoardStatusEnum["Failed"] = "Failed";
})(OnBoardResultOnBoardStatusEnum || (OnBoardResultOnBoardStatusEnum = {}));
export var OnBoardUsersModelExternalIdTypeEnum;
(function (OnBoardUsersModelExternalIdTypeEnum) {
  OnBoardUsersModelExternalIdTypeEnum["Username"] = "Username";
  OnBoardUsersModelExternalIdTypeEnum["Email"] = "Email";
})(
  OnBoardUsersModelExternalIdTypeEnum ||
    (OnBoardUsersModelExternalIdTypeEnum = {}),
);
export var OneTimePasswordHashTypeEnum;
(function (OneTimePasswordHashTypeEnum) {
  OneTimePasswordHashTypeEnum["None"] = "None";
  OneTimePasswordHashTypeEnum["Sha1"] = "Sha1";
  OneTimePasswordHashTypeEnum["Sha256"] = "Sha256";
  OneTimePasswordHashTypeEnum["Sha512"] = "Sha512";
})(OneTimePasswordHashTypeEnum || (OneTimePasswordHashTypeEnum = {}));
export var OrgLibraryModelStatusEnum;
(function (OrgLibraryModelStatusEnum) {
  OrgLibraryModelStatusEnum["Discovered"] = "Discovered";
  OrgLibraryModelStatusEnum["Rediscovered"] = "Rediscovered";
  OrgLibraryModelStatusEnum["Removed"] = "Removed";
})(OrgLibraryModelStatusEnum || (OrgLibraryModelStatusEnum = {}));
export var OrgSettingsModelSettingTypeEnum;
(function (OrgSettingsModelSettingTypeEnum) {
  OrgSettingsModelSettingTypeEnum["ReportTitle"] = "ReportTitle";
  OrgSettingsModelSettingTypeEnum["ReportHeader"] = "ReportHeader";
  OrgSettingsModelSettingTypeEnum["ReportFooter"] = "ReportFooter";
  OrgSettingsModelSettingTypeEnum["MainLogoFileName"] = "MainLogoFileName";
  OrgSettingsModelSettingTypeEnum["AdditionalLogoFileName"] =
    "AdditionalLogoFileName";
  OrgSettingsModelSettingTypeEnum["LdapProvider"] = "LdapProvider";
  OrgSettingsModelSettingTypeEnum["LdapDomain"] = "LdapDomain";
  OrgSettingsModelSettingTypeEnum["LdapTargetOU"] = "LdapTargetOU";
  OrgSettingsModelSettingTypeEnum["LdapUsername"] = "LdapUsername";
  OrgSettingsModelSettingTypeEnum["LdapPassword"] = "LdapPassword";
  OrgSettingsModelSettingTypeEnum["LdapEnableSSL"] = "LdapEnableSSL";
  OrgSettingsModelSettingTypeEnum["SsoUrl"] = "SsoUrl";
  OrgSettingsModelSettingTypeEnum["SsoClientId"] = "SsoClientId";
  OrgSettingsModelSettingTypeEnum["SsoClientSecret"] = "SsoClientSecret";
  OrgSettingsModelSettingTypeEnum["OnBoardingMode"] = "OnBoardingMode";
})(OrgSettingsModelSettingTypeEnum || (OrgSettingsModelSettingTypeEnum = {}));
export var PolicyAssociationModelTypeEnum;
(function (PolicyAssociationModelTypeEnum) {
  PolicyAssociationModelTypeEnum["None"] = "None";
  PolicyAssociationModelTypeEnum["OwaspTop102017"] = "OwaspTop10_2017";
  PolicyAssociationModelTypeEnum["Sans25"] = "Sans25";
  PolicyAssociationModelTypeEnum["EuGdpr2016"] = "EuGdpr_2016";
  PolicyAssociationModelTypeEnum["PCI"] = "PCI";
  PolicyAssociationModelTypeEnum["Hipaa"] = "Hipaa";
  PolicyAssociationModelTypeEnum["OwaspTop10Mobile2016"] =
    "OwaspTop10Mobile_2016";
  PolicyAssociationModelTypeEnum["ISO27001"] = "ISO27001";
  PolicyAssociationModelTypeEnum["ISO27002"] = "ISO27002";
  PolicyAssociationModelTypeEnum["Wasc"] = "Wasc";
  PolicyAssociationModelTypeEnum["Nist"] = "Nist";
  PolicyAssociationModelTypeEnum["Sox"] = "Sox";
  PolicyAssociationModelTypeEnum["Fisma"] = "Fisma";
  PolicyAssociationModelTypeEnum["Fippa"] = "Fippa";
  PolicyAssociationModelTypeEnum["Efta"] = "Efta";
  PolicyAssociationModelTypeEnum["DisaStig"] = "DisaStig";
  PolicyAssociationModelTypeEnum["Padss"] = "Padss";
  PolicyAssociationModelTypeEnum["OwaspTop102021"] = "OwaspTop10_2021";
  PolicyAssociationModelTypeEnum["OwaspTop10OpenApi2019"] =
    "OwaspTop10OpenApi_2019";
  PolicyAssociationModelTypeEnum["Ccpa"] = "Ccpa";
  PolicyAssociationModelTypeEnum["FedRamp"] = "FedRamp";
  PolicyAssociationModelTypeEnum["Popia"] = "Popia";
  PolicyAssociationModelTypeEnum["OwaspTop10Api2023"] = "OwaspTop10Api_2023";
  PolicyAssociationModelTypeEnum["Sans252023"] = "Sans25_2023";
  PolicyAssociationModelTypeEnum["OwaspTop10CloudNativeApp"] =
    "OwaspTop10CloudNativeApp";
  PolicyAssociationModelTypeEnum["Nis2"] = "Nis2";
  PolicyAssociationModelTypeEnum["Dora"] = "Dora";
  PolicyAssociationModelTypeEnum["OwaspAsvs"] = "OwaspAsvs";
  PolicyAssociationModelTypeEnum["Sans252024"] = "Sans25_2024";
  PolicyAssociationModelTypeEnum["OwaspTop10Llm2025"] = "OwaspTop10Llm_2025";
  PolicyAssociationModelTypeEnum["Itsg33"] = "Itsg33";
})(PolicyAssociationModelTypeEnum || (PolicyAssociationModelTypeEnum = {}));
export var PolicyAssociationModelCategoryEnum;
(function (PolicyAssociationModelCategoryEnum) {
  PolicyAssociationModelCategoryEnum["Custom"] = "Custom";
  PolicyAssociationModelCategoryEnum["Security"] = "Security";
  PolicyAssociationModelCategoryEnum["Regulation"] = "Regulation";
  PolicyAssociationModelCategoryEnum["IndustryStandard"] = "IndustryStandard";
})(
  PolicyAssociationModelCategoryEnum ||
    (PolicyAssociationModelCategoryEnum = {}),
);
export var PolicyAssociationModelRegionEnum;
(function (PolicyAssociationModelRegionEnum) {
  PolicyAssociationModelRegionEnum["Global"] = "Global";
  PolicyAssociationModelRegionEnum["US"] = "US";
  PolicyAssociationModelRegionEnum["UK"] = "UK";
  PolicyAssociationModelRegionEnum["Canada"] = "Canada";
  PolicyAssociationModelRegionEnum["EU"] = "EU";
  PolicyAssociationModelRegionEnum["Japan"] = "Japan";
  PolicyAssociationModelRegionEnum["AUS"] = "AUS";
  PolicyAssociationModelRegionEnum["SouthAfrica"] = "SouthAfrica";
})(PolicyAssociationModelRegionEnum || (PolicyAssociationModelRegionEnum = {}));
export var PolicyModelTypeEnum;
(function (PolicyModelTypeEnum) {
  PolicyModelTypeEnum["None"] = "None";
  PolicyModelTypeEnum["OwaspTop102017"] = "OwaspTop10_2017";
  PolicyModelTypeEnum["Sans25"] = "Sans25";
  PolicyModelTypeEnum["EuGdpr2016"] = "EuGdpr_2016";
  PolicyModelTypeEnum["PCI"] = "PCI";
  PolicyModelTypeEnum["Hipaa"] = "Hipaa";
  PolicyModelTypeEnum["OwaspTop10Mobile2016"] = "OwaspTop10Mobile_2016";
  PolicyModelTypeEnum["ISO27001"] = "ISO27001";
  PolicyModelTypeEnum["ISO27002"] = "ISO27002";
  PolicyModelTypeEnum["Wasc"] = "Wasc";
  PolicyModelTypeEnum["Nist"] = "Nist";
  PolicyModelTypeEnum["Sox"] = "Sox";
  PolicyModelTypeEnum["Fisma"] = "Fisma";
  PolicyModelTypeEnum["Fippa"] = "Fippa";
  PolicyModelTypeEnum["Efta"] = "Efta";
  PolicyModelTypeEnum["DisaStig"] = "DisaStig";
  PolicyModelTypeEnum["Padss"] = "Padss";
  PolicyModelTypeEnum["OwaspTop102021"] = "OwaspTop10_2021";
  PolicyModelTypeEnum["OwaspTop10OpenApi2019"] = "OwaspTop10OpenApi_2019";
  PolicyModelTypeEnum["Ccpa"] = "Ccpa";
  PolicyModelTypeEnum["FedRamp"] = "FedRamp";
  PolicyModelTypeEnum["Popia"] = "Popia";
  PolicyModelTypeEnum["OwaspTop10Api2023"] = "OwaspTop10Api_2023";
  PolicyModelTypeEnum["Sans252023"] = "Sans25_2023";
  PolicyModelTypeEnum["OwaspTop10CloudNativeApp"] = "OwaspTop10CloudNativeApp";
  PolicyModelTypeEnum["Nis2"] = "Nis2";
  PolicyModelTypeEnum["Dora"] = "Dora";
  PolicyModelTypeEnum["OwaspAsvs"] = "OwaspAsvs";
  PolicyModelTypeEnum["Sans252024"] = "Sans25_2024";
  PolicyModelTypeEnum["OwaspTop10Llm2025"] = "OwaspTop10Llm_2025";
  PolicyModelTypeEnum["Itsg33"] = "Itsg33";
})(PolicyModelTypeEnum || (PolicyModelTypeEnum = {}));
export var PolicyModelCategoryEnum;
(function (PolicyModelCategoryEnum) {
  PolicyModelCategoryEnum["Custom"] = "Custom";
  PolicyModelCategoryEnum["Security"] = "Security";
  PolicyModelCategoryEnum["Regulation"] = "Regulation";
  PolicyModelCategoryEnum["IndustryStandard"] = "IndustryStandard";
})(PolicyModelCategoryEnum || (PolicyModelCategoryEnum = {}));
export var PolicyModelRegionEnum;
(function (PolicyModelRegionEnum) {
  PolicyModelRegionEnum["Global"] = "Global";
  PolicyModelRegionEnum["US"] = "US";
  PolicyModelRegionEnum["UK"] = "UK";
  PolicyModelRegionEnum["Canada"] = "Canada";
  PolicyModelRegionEnum["EU"] = "EU";
  PolicyModelRegionEnum["Japan"] = "Japan";
  PolicyModelRegionEnum["AUS"] = "AUS";
  PolicyModelRegionEnum["SouthAfrica"] = "SouthAfrica";
})(PolicyModelRegionEnum || (PolicyModelRegionEnum = {}));
export var PresenceStatusEnum;
(function (PresenceStatusEnum) {
  PresenceStatusEnum["Active"] = "Active";
  PresenceStatusEnum["NeverUsed"] = "NeverUsed";
  PresenceStatusEnum["KeyExpired"] = "KeyExpired";
  PresenceStatusEnum["KeyNeverUsed"] = "KeyNeverUsed";
  PresenceStatusEnum["Inactive"] = "Inactive";
  PresenceStatusEnum["Disable"] = "Disable";
})(PresenceStatusEnum || (PresenceStatusEnum = {}));
export var PresenceGitPlatformEnum;
(function (PresenceGitPlatformEnum) {
  PresenceGitPlatformEnum["GitHub"] = "GitHub";
})(PresenceGitPlatformEnum || (PresenceGitPlatformEnum = {}));
export var RfAnalysisStatusUpdateModelStatusEnum;
(function (RfAnalysisStatusUpdateModelStatusEnum) {
  RfAnalysisStatusUpdateModelStatusEnum["InProgress"] = "InProgress";
  RfAnalysisStatusUpdateModelStatusEnum["CompleteSuccess"] = "CompleteSuccess";
  RfAnalysisStatusUpdateModelStatusEnum["CompleteFail"] = "CompleteFail";
})(
  RfAnalysisStatusUpdateModelStatusEnum ||
    (RfAnalysisStatusUpdateModelStatusEnum = {}),
);
export var RfNewTriageModelProposedSeverityEnum;
(function (RfNewTriageModelProposedSeverityEnum) {
  RfNewTriageModelProposedSeverityEnum["Undetermined"] = "Undetermined";
  RfNewTriageModelProposedSeverityEnum["Informational"] = "Informational";
  RfNewTriageModelProposedSeverityEnum["Low"] = "Low";
  RfNewTriageModelProposedSeverityEnum["Medium"] = "Medium";
  RfNewTriageModelProposedSeverityEnum["High"] = "High";
  RfNewTriageModelProposedSeverityEnum["Critical"] = "Critical";
})(
  RfNewTriageModelProposedSeverityEnum ||
    (RfNewTriageModelProposedSeverityEnum = {}),
);
export var RfNewTriageModelProposedStatusEnum;
(function (RfNewTriageModelProposedStatusEnum) {
  RfNewTriageModelProposedStatusEnum["Open"] = "Open";
  RfNewTriageModelProposedStatusEnum["InProgress"] = "InProgress";
  RfNewTriageModelProposedStatusEnum["Reopened"] = "Reopened";
  RfNewTriageModelProposedStatusEnum["Noise"] = "Noise";
  RfNewTriageModelProposedStatusEnum["Passed"] = "Passed";
  RfNewTriageModelProposedStatusEnum["Fixed"] = "Fixed";
  RfNewTriageModelProposedStatusEnum["New"] = "New";
})(
  RfNewTriageModelProposedStatusEnum ||
    (RfNewTriageModelProposedStatusEnum = {}),
);
export var RfPatchModelGitRepoPlatformEnum;
(function (RfPatchModelGitRepoPlatformEnum) {
  RfPatchModelGitRepoPlatformEnum["GitHub"] = "GitHub";
})(RfPatchModelGitRepoPlatformEnum || (RfPatchModelGitRepoPlatformEnum = {}));
export var RfPatchModelStatusEnum;
(function (RfPatchModelStatusEnum) {
  RfPatchModelStatusEnum["None"] = "None";
  RfPatchModelStatusEnum["Pending"] = "Pending";
  RfPatchModelStatusEnum["InProgress"] = "InProgress";
  RfPatchModelStatusEnum["CompleteSuccess"] = "CompleteSuccess";
  RfPatchModelStatusEnum["CompleteFail"] = "CompleteFail";
})(RfPatchModelStatusEnum || (RfPatchModelStatusEnum = {}));
export var RfTriageModelProposedSeverityEnum;
(function (RfTriageModelProposedSeverityEnum) {
  RfTriageModelProposedSeverityEnum["Undetermined"] = "Undetermined";
  RfTriageModelProposedSeverityEnum["Informational"] = "Informational";
  RfTriageModelProposedSeverityEnum["Low"] = "Low";
  RfTriageModelProposedSeverityEnum["Medium"] = "Medium";
  RfTriageModelProposedSeverityEnum["High"] = "High";
  RfTriageModelProposedSeverityEnum["Critical"] = "Critical";
})(
  RfTriageModelProposedSeverityEnum || (RfTriageModelProposedSeverityEnum = {}),
);
export var RfTriageModelProposedStatusEnum;
(function (RfTriageModelProposedStatusEnum) {
  RfTriageModelProposedStatusEnum["Open"] = "Open";
  RfTriageModelProposedStatusEnum["InProgress"] = "InProgress";
  RfTriageModelProposedStatusEnum["Reopened"] = "Reopened";
  RfTriageModelProposedStatusEnum["Noise"] = "Noise";
  RfTriageModelProposedStatusEnum["Passed"] = "Passed";
  RfTriageModelProposedStatusEnum["Fixed"] = "Fixed";
  RfTriageModelProposedStatusEnum["New"] = "New";
})(RfTriageModelProposedStatusEnum || (RfTriageModelProposedStatusEnum = {}));
export var RfUpdatePatchModelGitRepoPlatformEnum;
(function (RfUpdatePatchModelGitRepoPlatformEnum) {
  RfUpdatePatchModelGitRepoPlatformEnum["GitHub"] = "GitHub";
})(
  RfUpdatePatchModelGitRepoPlatformEnum ||
    (RfUpdatePatchModelGitRepoPlatformEnum = {}),
);
export var RfUpdatePatchModelStatusEnum;
(function (RfUpdatePatchModelStatusEnum) {
  RfUpdatePatchModelStatusEnum["InProgress"] = "InProgress";
  RfUpdatePatchModelStatusEnum["CompleteSuccess"] = "CompleteSuccess";
  RfUpdatePatchModelStatusEnum["CompleteFail"] = "CompleteFail";
})(RfUpdatePatchModelStatusEnum || (RfUpdatePatchModelStatusEnum = {}));
export var RegistrationResultRegisterResultEnum;
(function (RegistrationResultRegisterResultEnum) {
  RegistrationResultRegisterResultEnum["Success"] = "Success";
  RegistrationResultRegisterResultEnum["VerificationRequired"] =
    "VerificationRequired";
  RegistrationResultRegisterResultEnum["Failed"] = "Failed";
})(
  RegistrationResultRegisterResultEnum ||
    (RegistrationResultRegisterResultEnum = {}),
);
export var RegistrationResultRegisterErrorEnum;
(function (RegistrationResultRegisterErrorEnum) {
  RegistrationResultRegisterErrorEnum["None"] = "None";
  RegistrationResultRegisterErrorEnum["InvalidLicense"] = "InvalidLicense";
  RegistrationResultRegisterErrorEnum["AlreadyUsedTheService"] =
    "AlreadyUsedTheService";
  RegistrationResultRegisterErrorEnum["ShouldFillRegistrationForm"] =
    "ShouldFillRegistrationForm";
})(
  RegistrationResultRegisterErrorEnum ||
    (RegistrationResultRegisterErrorEnum = {}),
);
export var RegistrationResultMhsErrorEnum;
(function (RegistrationResultMhsErrorEnum) {
  RegistrationResultMhsErrorEnum["None"] = "None";
  RegistrationResultMhsErrorEnum["GeneralError"] = "GeneralError";
  RegistrationResultMhsErrorEnum["InvalidInput"] = "InvalidInput";
  RegistrationResultMhsErrorEnum["MissingCapabilities"] = "MissingCapabilities";
  RegistrationResultMhsErrorEnum["MHSLicenseGeneralStructureUnrecognized"] =
    "MHSLicenseGeneralStructureUnrecognized";
  RegistrationResultMhsErrorEnum["MHSLicenseCertificateInvalid"] =
    "MHSLicenseCertificateInvalid";
  RegistrationResultMhsErrorEnum["MHSLicensePasetoSignatureInvalid"] =
    "MHSLicensePasetoSignatureInvalid";
  RegistrationResultMhsErrorEnum["MHSLicensePasetoRawPayloadUnrecognized"] =
    "MHSLicensePasetoRawPayloadUnrecognized";
  RegistrationResultMhsErrorEnum["MHSLicenseInvalidAs360Fingerprint"] =
    "MHSLicenseInvalidAs360Fingerprint";
  RegistrationResultMhsErrorEnum["MHSLicenseDeploymentIdMismatch"] =
    "MHSLicenseDeploymentIdMismatch";
  RegistrationResultMhsErrorEnum["MHSLicenseIssuedEarlierThanCurrentlyUsed"] =
    "MHSLicenseIssuedEarlierThanCurrentlyUsed";
  RegistrationResultMhsErrorEnum["MHSLicenseHasNoRelevantEntitlements"] =
    "MHSLicenseHasNoRelevantEntitlements";
  RegistrationResultMhsErrorEnum["MHSLicenseWasAlreadyUploaded"] =
    "MHSLicenseWasAlreadyUploaded";
  RegistrationResultMhsErrorEnum["MHSLicenseOldFeatureIsMissing"] =
    "MHSLicenseOldFeatureIsMissing";
  RegistrationResultMhsErrorEnum["MHSLicenseChangingPreviousMhsValue"] =
    "MHSLicenseChangingPreviousMhsValue";
  RegistrationResultMhsErrorEnum["MHSLicenseWasIssuedTooLongAgo"] =
    "MHSLicenseWasIssuedTooLongAgo";
  RegistrationResultMhsErrorEnum["MHSLicenseInvalidASoCFingerprint"] =
    "MHSLicenseInvalidASoCFingerprint";
})(RegistrationResultMhsErrorEnum || (RegistrationResultMhsErrorEnum = {}));
export var RegulationReportJobApplyPoliciesEnum;
(function (RegulationReportJobApplyPoliciesEnum) {
  RegulationReportJobApplyPoliciesEnum["None"] = "None";
  RegulationReportJobApplyPoliciesEnum["All"] = "All";
  RegulationReportJobApplyPoliciesEnum["Select"] = "Select";
})(
  RegulationReportJobApplyPoliciesEnum ||
    (RegulationReportJobApplyPoliciesEnum = {}),
);
export var RegulationReportOptionsReportFileTypeEnum;
(function (RegulationReportOptionsReportFileTypeEnum) {
  RegulationReportOptionsReportFileTypeEnum["Pdf"] = "Pdf";
  RegulationReportOptionsReportFileTypeEnum["Html"] = "Html";
  RegulationReportOptionsReportFileTypeEnum["Xml"] = "Xml";
  RegulationReportOptionsReportFileTypeEnum["Csv"] = "Csv";
  RegulationReportOptionsReportFileTypeEnum["Sarif"] = "Sarif";
})(
  RegulationReportOptionsReportFileTypeEnum ||
    (RegulationReportOptionsReportFileTypeEnum = {}),
);
export var RegulationReportOptionsRegulationReportTypeEnum;
(function (RegulationReportOptionsRegulationReportTypeEnum) {
  RegulationReportOptionsRegulationReportTypeEnum["None"] = "None";
  RegulationReportOptionsRegulationReportTypeEnum["OwaspTop102017"] =
    "OwaspTop10_2017";
  RegulationReportOptionsRegulationReportTypeEnum["Sans25"] = "Sans25";
  RegulationReportOptionsRegulationReportTypeEnum["EuGdpr2016"] = "EuGdpr_2016";
  RegulationReportOptionsRegulationReportTypeEnum["PCI"] = "PCI";
  RegulationReportOptionsRegulationReportTypeEnum["Hipaa"] = "Hipaa";
  RegulationReportOptionsRegulationReportTypeEnum["OwaspTop10Mobile2016"] =
    "OwaspTop10Mobile_2016";
  RegulationReportOptionsRegulationReportTypeEnum["ISO27001"] = "ISO27001";
  RegulationReportOptionsRegulationReportTypeEnum["ISO27002"] = "ISO27002";
  RegulationReportOptionsRegulationReportTypeEnum["Wasc"] = "Wasc";
  RegulationReportOptionsRegulationReportTypeEnum["Nist"] = "Nist";
  RegulationReportOptionsRegulationReportTypeEnum["Sox"] = "Sox";
  RegulationReportOptionsRegulationReportTypeEnum["Fisma"] = "Fisma";
  RegulationReportOptionsRegulationReportTypeEnum["Fippa"] = "Fippa";
  RegulationReportOptionsRegulationReportTypeEnum["Efta"] = "Efta";
  RegulationReportOptionsRegulationReportTypeEnum["DisaStig"] = "DisaStig";
  RegulationReportOptionsRegulationReportTypeEnum["Padss"] = "Padss";
  RegulationReportOptionsRegulationReportTypeEnum["OwaspTop102021"] =
    "OwaspTop10_2021";
  RegulationReportOptionsRegulationReportTypeEnum["OwaspTop10OpenApi2019"] =
    "OwaspTop10OpenApi_2019";
  RegulationReportOptionsRegulationReportTypeEnum["Ccpa"] = "Ccpa";
  RegulationReportOptionsRegulationReportTypeEnum["FedRamp"] = "FedRamp";
  RegulationReportOptionsRegulationReportTypeEnum["Popia"] = "Popia";
  RegulationReportOptionsRegulationReportTypeEnum["OwaspTop10Api2023"] =
    "OwaspTop10Api_2023";
  RegulationReportOptionsRegulationReportTypeEnum["Sans252023"] = "Sans25_2023";
  RegulationReportOptionsRegulationReportTypeEnum["OwaspTop10CloudNativeApp"] =
    "OwaspTop10CloudNativeApp";
  RegulationReportOptionsRegulationReportTypeEnum["Nis2"] = "Nis2";
  RegulationReportOptionsRegulationReportTypeEnum["Dora"] = "Dora";
  RegulationReportOptionsRegulationReportTypeEnum["OwaspAsvs"] = "OwaspAsvs";
  RegulationReportOptionsRegulationReportTypeEnum["Sans252024"] = "Sans25_2024";
  RegulationReportOptionsRegulationReportTypeEnum["OwaspTop10Llm2025"] =
    "OwaspTop10Llm_2025";
  RegulationReportOptionsRegulationReportTypeEnum["Itsg33"] = "Itsg33";
})(
  RegulationReportOptionsRegulationReportTypeEnum ||
    (RegulationReportOptionsRegulationReportTypeEnum = {}),
);
export var RepoDetailsPlatformEnum;
(function (RepoDetailsPlatformEnum) {
  RepoDetailsPlatformEnum["GitHub"] = "GitHub";
})(RepoDetailsPlatformEnum || (RepoDetailsPlatformEnum = {}));
export var ReportStatusModelStatusEnum;
(function (ReportStatusModelStatusEnum) {
  ReportStatusModelStatusEnum["Pending"] = "Pending";
  ReportStatusModelStatusEnum["Starting"] = "Starting";
  ReportStatusModelStatusEnum["Running"] = "Running";
  ReportStatusModelStatusEnum["Failed"] = "Failed";
  ReportStatusModelStatusEnum["Ready"] = "Ready";
  ReportStatusModelStatusEnum["Deleted"] = "Deleted";
})(ReportStatusModelStatusEnum || (ReportStatusModelStatusEnum = {}));
export var ScxSubscriptionOfferingTypeEnum;
(function (ScxSubscriptionOfferingTypeEnum) {
  ScxSubscriptionOfferingTypeEnum["None"] = "None";
  ScxSubscriptionOfferingTypeEnum["Trial"] = "Trial";
  ScxSubscriptionOfferingTypeEnum["HTrial"] = "HTrial";
  ScxSubscriptionOfferingTypeEnum["Applications"] = "Applications";
  ScxSubscriptionOfferingTypeEnum["ScanExecution"] = "ScanExecution";
  ScxSubscriptionOfferingTypeEnum["AnalyzerConcurrent"] = "AnalyzerConcurrent";
  ScxSubscriptionOfferingTypeEnum["ConsultantServices"] = "ConsultantServices";
  ScxSubscriptionOfferingTypeEnum["Premium"] = "Premium";
  ScxSubscriptionOfferingTypeEnum["OpenSourcePerApplication"] =
    "OpenSourcePerApplication";
  ScxSubscriptionOfferingTypeEnum["OpenSourcePremium"] = "OpenSourcePremium";
  ScxSubscriptionOfferingTypeEnum["OpenSourceConcurrent"] =
    "OpenSourceConcurrent";
  ScxSubscriptionOfferingTypeEnum["IASTConcurrent"] = "IASTConcurrent";
  ScxSubscriptionOfferingTypeEnum["IASTPayPerApp"] = "IASTPayPerApp";
  ScxSubscriptionOfferingTypeEnum["Promotional"] = "Promotional";
  ScxSubscriptionOfferingTypeEnum["Silver"] = "Silver";
  ScxSubscriptionOfferingTypeEnum["Gold"] = "Gold";
  ScxSubscriptionOfferingTypeEnum["Platinum"] = "Platinum";
  ScxSubscriptionOfferingTypeEnum["SCAPerApplication"] = "SCAPerApplication";
  ScxSubscriptionOfferingTypeEnum["ContributingUser"] = "ContributingUser";
  ScxSubscriptionOfferingTypeEnum["SilverContribUser"] = "SilverContribUser";
  ScxSubscriptionOfferingTypeEnum["GoldContribUser"] = "GoldContribUser";
  ScxSubscriptionOfferingTypeEnum["PlatinumContribUser"] =
    "PlatinumContribUser";
  ScxSubscriptionOfferingTypeEnum["SilverPerApp"] = "SilverPerApp";
  ScxSubscriptionOfferingTypeEnum["GoldPerApp"] = "GoldPerApp";
  ScxSubscriptionOfferingTypeEnum["PlatinumPerApp"] = "PlatinumPerApp";
})(ScxSubscriptionOfferingTypeEnum || (ScxSubscriptionOfferingTypeEnum = {}));
export var SastScanExecutionModelStatusEnum;
(function (SastScanExecutionModelStatusEnum) {
  SastScanExecutionModelStatusEnum["Running"] = "Running";
  SastScanExecutionModelStatusEnum["Stopping"] = "Stopping";
  SastScanExecutionModelStatusEnum["Pausing"] = "Pausing";
  SastScanExecutionModelStatusEnum["InQueue"] = "InQueue";
  SastScanExecutionModelStatusEnum["Paused"] = "Paused";
  SastScanExecutionModelStatusEnum["Ready"] = "Ready";
  SastScanExecutionModelStatusEnum["Failed"] = "Failed";
})(SastScanExecutionModelStatusEnum || (SastScanExecutionModelStatusEnum = {}));
export var SastScanExecutionModelResultEnum;
(function (SastScanExecutionModelResultEnum) {
  SastScanExecutionModelResultEnum["None"] = "None";
  SastScanExecutionModelResultEnum["NoIssues"] = "NoIssues";
  SastScanExecutionModelResultEnum["Informational"] = "Informational";
  SastScanExecutionModelResultEnum["Low"] = "Low";
  SastScanExecutionModelResultEnum["Medium"] = "Medium";
  SastScanExecutionModelResultEnum["High"] = "High";
  SastScanExecutionModelResultEnum["Critical"] = "Critical";
})(SastScanExecutionModelResultEnum || (SastScanExecutionModelResultEnum = {}));
export var SastScanExecutionModelReadStatusEnum;
(function (SastScanExecutionModelReadStatusEnum) {
  SastScanExecutionModelReadStatusEnum["None"] = "None";
  SastScanExecutionModelReadStatusEnum["Unread"] = "Unread";
  SastScanExecutionModelReadStatusEnum["Read"] = "Read";
})(
  SastScanExecutionModelReadStatusEnum ||
    (SastScanExecutionModelReadStatusEnum = {}),
);
export var SastScanExecutionModelAvailableReportsEnum;
(function (SastScanExecutionModelAvailableReportsEnum) {
  SastScanExecutionModelAvailableReportsEnum["Xml"] = "Xml";
  SastScanExecutionModelAvailableReportsEnum["Pdf"] = "Pdf";
  SastScanExecutionModelAvailableReportsEnum["Html"] = "Html";
  SastScanExecutionModelAvailableReportsEnum["CompliancePdf"] = "CompliancePdf";
  SastScanExecutionModelAvailableReportsEnum["OwaspTop10Pdf"] = "OwaspTop10Pdf";
  SastScanExecutionModelAvailableReportsEnum["Sans25Pdf"] = "Sans25Pdf";
  SastScanExecutionModelAvailableReportsEnum["RawXml"] = "RawXml";
  SastScanExecutionModelAvailableReportsEnum["Zip"] = "Zip";
  SastScanExecutionModelAvailableReportsEnum["Json"] = "Json";
})(
  SastScanExecutionModelAvailableReportsEnum ||
    (SastScanExecutionModelAvailableReportsEnum = {}),
);
export var SastScanExecutionModelExecutionProgressEnum;
(function (SastScanExecutionModelExecutionProgressEnum) {
  SastScanExecutionModelExecutionProgressEnum["Pending"] = "Pending";
  SastScanExecutionModelExecutionProgressEnum["Running"] = "Running";
  SastScanExecutionModelExecutionProgressEnum["UnderReview"] = "UnderReview";
  SastScanExecutionModelExecutionProgressEnum["RunningManually"] =
    "RunningManually";
  SastScanExecutionModelExecutionProgressEnum["Paused"] = "Paused";
  SastScanExecutionModelExecutionProgressEnum["Completed"] = "Completed";
})(
  SastScanExecutionModelExecutionProgressEnum ||
    (SastScanExecutionModelExecutionProgressEnum = {}),
);
export var SastScanExecutionModelRapidFixAnalysisStatusEnum;
(function (SastScanExecutionModelRapidFixAnalysisStatusEnum) {
  SastScanExecutionModelRapidFixAnalysisStatusEnum["None"] = "None";
  SastScanExecutionModelRapidFixAnalysisStatusEnum["Pending"] = "Pending";
  SastScanExecutionModelRapidFixAnalysisStatusEnum["InProgress"] = "InProgress";
  SastScanExecutionModelRapidFixAnalysisStatusEnum["CompleteSuccess"] =
    "CompleteSuccess";
  SastScanExecutionModelRapidFixAnalysisStatusEnum["CompleteFail"] =
    "CompleteFail";
})(
  SastScanExecutionModelRapidFixAnalysisStatusEnum ||
    (SastScanExecutionModelRapidFixAnalysisStatusEnum = {}),
);
export var SastScanModelTechnologyEnum;
(function (SastScanModelTechnologyEnum) {
  SastScanModelTechnologyEnum["DynamicAnalyzer"] = "DynamicAnalyzer";
  SastScanModelTechnologyEnum["StaticAnalyzer"] = "StaticAnalyzer";
  SastScanModelTechnologyEnum["IFA"] = "IFA";
  SastScanModelTechnologyEnum["DastAutomation"] = "DastAutomation";
  SastScanModelTechnologyEnum["IASTAnalyzer"] = "IASTAnalyzer";
  SastScanModelTechnologyEnum["ScaAnalyzer"] = "ScaAnalyzer";
})(SastScanModelTechnologyEnum || (SastScanModelTechnologyEnum = {}));
export var SastScanModelIastAgentStatusEnum;
(function (SastScanModelIastAgentStatusEnum) {
  SastScanModelIastAgentStatusEnum["None"] = "None";
  SastScanModelIastAgentStatusEnum["Active"] = "Active";
  SastScanModelIastAgentStatusEnum["KeyNeverUsed"] = "KeyNeverUsed";
  SastScanModelIastAgentStatusEnum["Inactive"] = "Inactive";
})(SastScanModelIastAgentStatusEnum || (SastScanModelIastAgentStatusEnum = {}));
export var SastScanModelIastAgentTypeEnum;
(function (SastScanModelIastAgentTypeEnum) {
  SastScanModelIastAgentTypeEnum["Java"] = "Java";
  SastScanModelIastAgentTypeEnum["DotNet"] = "DotNet";
  SastScanModelIastAgentTypeEnum["NodeJS"] = "NodeJS";
  SastScanModelIastAgentTypeEnum["PhpWindows"] = "PhpWindows";
  SastScanModelIastAgentTypeEnum["PhpRedHat"] = "PhpRedHat";
  SastScanModelIastAgentTypeEnum["PhpUbuntu"] = "PhpUbuntu";
  SastScanModelIastAgentTypeEnum["Kubernetes"] = "Kubernetes";
})(SastScanModelIastAgentTypeEnum || (SastScanModelIastAgentTypeEnum = {}));
export var SastScanModelOfferingTypeEnum;
(function (SastScanModelOfferingTypeEnum) {
  SastScanModelOfferingTypeEnum["None"] = "None";
  SastScanModelOfferingTypeEnum["Trial"] = "Trial";
  SastScanModelOfferingTypeEnum["HTrial"] = "HTrial";
  SastScanModelOfferingTypeEnum["Applications"] = "Applications";
  SastScanModelOfferingTypeEnum["ScanExecution"] = "ScanExecution";
  SastScanModelOfferingTypeEnum["AnalyzerConcurrent"] = "AnalyzerConcurrent";
  SastScanModelOfferingTypeEnum["ConsultantServices"] = "ConsultantServices";
  SastScanModelOfferingTypeEnum["Premium"] = "Premium";
  SastScanModelOfferingTypeEnum["OpenSourcePerApplication"] =
    "OpenSourcePerApplication";
  SastScanModelOfferingTypeEnum["OpenSourcePremium"] = "OpenSourcePremium";
  SastScanModelOfferingTypeEnum["OpenSourceConcurrent"] =
    "OpenSourceConcurrent";
  SastScanModelOfferingTypeEnum["IASTConcurrent"] = "IASTConcurrent";
  SastScanModelOfferingTypeEnum["IASTPayPerApp"] = "IASTPayPerApp";
  SastScanModelOfferingTypeEnum["Promotional"] = "Promotional";
  SastScanModelOfferingTypeEnum["Silver"] = "Silver";
  SastScanModelOfferingTypeEnum["Gold"] = "Gold";
  SastScanModelOfferingTypeEnum["Platinum"] = "Platinum";
  SastScanModelOfferingTypeEnum["SCAPerApplication"] = "SCAPerApplication";
  SastScanModelOfferingTypeEnum["ContributingUser"] = "ContributingUser";
  SastScanModelOfferingTypeEnum["SilverContribUser"] = "SilverContribUser";
  SastScanModelOfferingTypeEnum["GoldContribUser"] = "GoldContribUser";
  SastScanModelOfferingTypeEnum["PlatinumContribUser"] = "PlatinumContribUser";
  SastScanModelOfferingTypeEnum["SilverPerApp"] = "SilverPerApp";
  SastScanModelOfferingTypeEnum["GoldPerApp"] = "GoldPerApp";
  SastScanModelOfferingTypeEnum["PlatinumPerApp"] = "PlatinumPerApp";
})(SastScanModelOfferingTypeEnum || (SastScanModelOfferingTypeEnum = {}));
export var SastScanModelGitRepoPlatformEnum;
(function (SastScanModelGitRepoPlatformEnum) {
  SastScanModelGitRepoPlatformEnum["GitHub"] = "GitHub";
})(SastScanModelGitRepoPlatformEnum || (SastScanModelGitRepoPlatformEnum = {}));
export var SbomReportOptionsSbomFormatEnum;
(function (SbomReportOptionsSbomFormatEnum) {
  SbomReportOptionsSbomFormatEnum["SPDXJson"] = "SPDX_Json";
  SbomReportOptionsSbomFormatEnum["SPDXText"] = "SPDX_Text";
})(SbomReportOptionsSbomFormatEnum || (SbomReportOptionsSbomFormatEnum = {}));
export var ScaScanExecutionModelStatusEnum;
(function (ScaScanExecutionModelStatusEnum) {
  ScaScanExecutionModelStatusEnum["Running"] = "Running";
  ScaScanExecutionModelStatusEnum["Stopping"] = "Stopping";
  ScaScanExecutionModelStatusEnum["Pausing"] = "Pausing";
  ScaScanExecutionModelStatusEnum["InQueue"] = "InQueue";
  ScaScanExecutionModelStatusEnum["Paused"] = "Paused";
  ScaScanExecutionModelStatusEnum["Ready"] = "Ready";
  ScaScanExecutionModelStatusEnum["Failed"] = "Failed";
})(ScaScanExecutionModelStatusEnum || (ScaScanExecutionModelStatusEnum = {}));
export var ScaScanExecutionModelResultEnum;
(function (ScaScanExecutionModelResultEnum) {
  ScaScanExecutionModelResultEnum["None"] = "None";
  ScaScanExecutionModelResultEnum["NoIssues"] = "NoIssues";
  ScaScanExecutionModelResultEnum["Informational"] = "Informational";
  ScaScanExecutionModelResultEnum["Low"] = "Low";
  ScaScanExecutionModelResultEnum["Medium"] = "Medium";
  ScaScanExecutionModelResultEnum["High"] = "High";
  ScaScanExecutionModelResultEnum["Critical"] = "Critical";
})(ScaScanExecutionModelResultEnum || (ScaScanExecutionModelResultEnum = {}));
export var ScaScanExecutionModelReadStatusEnum;
(function (ScaScanExecutionModelReadStatusEnum) {
  ScaScanExecutionModelReadStatusEnum["None"] = "None";
  ScaScanExecutionModelReadStatusEnum["Unread"] = "Unread";
  ScaScanExecutionModelReadStatusEnum["Read"] = "Read";
})(
  ScaScanExecutionModelReadStatusEnum ||
    (ScaScanExecutionModelReadStatusEnum = {}),
);
export var ScaScanExecutionModelAvailableReportsEnum;
(function (ScaScanExecutionModelAvailableReportsEnum) {
  ScaScanExecutionModelAvailableReportsEnum["Xml"] = "Xml";
  ScaScanExecutionModelAvailableReportsEnum["Pdf"] = "Pdf";
  ScaScanExecutionModelAvailableReportsEnum["Html"] = "Html";
  ScaScanExecutionModelAvailableReportsEnum["CompliancePdf"] = "CompliancePdf";
  ScaScanExecutionModelAvailableReportsEnum["OwaspTop10Pdf"] = "OwaspTop10Pdf";
  ScaScanExecutionModelAvailableReportsEnum["Sans25Pdf"] = "Sans25Pdf";
  ScaScanExecutionModelAvailableReportsEnum["RawXml"] = "RawXml";
  ScaScanExecutionModelAvailableReportsEnum["Zip"] = "Zip";
  ScaScanExecutionModelAvailableReportsEnum["Json"] = "Json";
})(
  ScaScanExecutionModelAvailableReportsEnum ||
    (ScaScanExecutionModelAvailableReportsEnum = {}),
);
export var ScaScanExecutionModelExecutionProgressEnum;
(function (ScaScanExecutionModelExecutionProgressEnum) {
  ScaScanExecutionModelExecutionProgressEnum["Pending"] = "Pending";
  ScaScanExecutionModelExecutionProgressEnum["Running"] = "Running";
  ScaScanExecutionModelExecutionProgressEnum["UnderReview"] = "UnderReview";
  ScaScanExecutionModelExecutionProgressEnum["RunningManually"] =
    "RunningManually";
  ScaScanExecutionModelExecutionProgressEnum["Paused"] = "Paused";
  ScaScanExecutionModelExecutionProgressEnum["Completed"] = "Completed";
})(
  ScaScanExecutionModelExecutionProgressEnum ||
    (ScaScanExecutionModelExecutionProgressEnum = {}),
);
export var ScaScanExecutionModelScanMethodEnum;
(function (ScaScanExecutionModelScanMethodEnum) {
  ScaScanExecutionModelScanMethodEnum["None"] = "None";
  ScaScanExecutionModelScanMethodEnum["Hash"] = "Hash";
  ScaScanExecutionModelScanMethodEnum["Config"] = "Config";
  ScaScanExecutionModelScanMethodEnum["SBOM"] = "SBOM";
})(
  ScaScanExecutionModelScanMethodEnum ||
    (ScaScanExecutionModelScanMethodEnum = {}),
);
export var ScaScanModelTechnologyEnum;
(function (ScaScanModelTechnologyEnum) {
  ScaScanModelTechnologyEnum["DynamicAnalyzer"] = "DynamicAnalyzer";
  ScaScanModelTechnologyEnum["StaticAnalyzer"] = "StaticAnalyzer";
  ScaScanModelTechnologyEnum["IFA"] = "IFA";
  ScaScanModelTechnologyEnum["DastAutomation"] = "DastAutomation";
  ScaScanModelTechnologyEnum["IASTAnalyzer"] = "IASTAnalyzer";
  ScaScanModelTechnologyEnum["ScaAnalyzer"] = "ScaAnalyzer";
})(ScaScanModelTechnologyEnum || (ScaScanModelTechnologyEnum = {}));
export var ScaScanModelIastAgentStatusEnum;
(function (ScaScanModelIastAgentStatusEnum) {
  ScaScanModelIastAgentStatusEnum["None"] = "None";
  ScaScanModelIastAgentStatusEnum["Active"] = "Active";
  ScaScanModelIastAgentStatusEnum["KeyNeverUsed"] = "KeyNeverUsed";
  ScaScanModelIastAgentStatusEnum["Inactive"] = "Inactive";
})(ScaScanModelIastAgentStatusEnum || (ScaScanModelIastAgentStatusEnum = {}));
export var ScaScanModelIastAgentTypeEnum;
(function (ScaScanModelIastAgentTypeEnum) {
  ScaScanModelIastAgentTypeEnum["Java"] = "Java";
  ScaScanModelIastAgentTypeEnum["DotNet"] = "DotNet";
  ScaScanModelIastAgentTypeEnum["NodeJS"] = "NodeJS";
  ScaScanModelIastAgentTypeEnum["PhpWindows"] = "PhpWindows";
  ScaScanModelIastAgentTypeEnum["PhpRedHat"] = "PhpRedHat";
  ScaScanModelIastAgentTypeEnum["PhpUbuntu"] = "PhpUbuntu";
  ScaScanModelIastAgentTypeEnum["Kubernetes"] = "Kubernetes";
})(ScaScanModelIastAgentTypeEnum || (ScaScanModelIastAgentTypeEnum = {}));
export var ScaScanModelOfferingTypeEnum;
(function (ScaScanModelOfferingTypeEnum) {
  ScaScanModelOfferingTypeEnum["None"] = "None";
  ScaScanModelOfferingTypeEnum["Trial"] = "Trial";
  ScaScanModelOfferingTypeEnum["HTrial"] = "HTrial";
  ScaScanModelOfferingTypeEnum["Applications"] = "Applications";
  ScaScanModelOfferingTypeEnum["ScanExecution"] = "ScanExecution";
  ScaScanModelOfferingTypeEnum["AnalyzerConcurrent"] = "AnalyzerConcurrent";
  ScaScanModelOfferingTypeEnum["ConsultantServices"] = "ConsultantServices";
  ScaScanModelOfferingTypeEnum["Premium"] = "Premium";
  ScaScanModelOfferingTypeEnum["OpenSourcePerApplication"] =
    "OpenSourcePerApplication";
  ScaScanModelOfferingTypeEnum["OpenSourcePremium"] = "OpenSourcePremium";
  ScaScanModelOfferingTypeEnum["OpenSourceConcurrent"] = "OpenSourceConcurrent";
  ScaScanModelOfferingTypeEnum["IASTConcurrent"] = "IASTConcurrent";
  ScaScanModelOfferingTypeEnum["IASTPayPerApp"] = "IASTPayPerApp";
  ScaScanModelOfferingTypeEnum["Promotional"] = "Promotional";
  ScaScanModelOfferingTypeEnum["Silver"] = "Silver";
  ScaScanModelOfferingTypeEnum["Gold"] = "Gold";
  ScaScanModelOfferingTypeEnum["Platinum"] = "Platinum";
  ScaScanModelOfferingTypeEnum["SCAPerApplication"] = "SCAPerApplication";
  ScaScanModelOfferingTypeEnum["ContributingUser"] = "ContributingUser";
  ScaScanModelOfferingTypeEnum["SilverContribUser"] = "SilverContribUser";
  ScaScanModelOfferingTypeEnum["GoldContribUser"] = "GoldContribUser";
  ScaScanModelOfferingTypeEnum["PlatinumContribUser"] = "PlatinumContribUser";
  ScaScanModelOfferingTypeEnum["SilverPerApp"] = "SilverPerApp";
  ScaScanModelOfferingTypeEnum["GoldPerApp"] = "GoldPerApp";
  ScaScanModelOfferingTypeEnum["PlatinumPerApp"] = "PlatinumPerApp";
})(ScaScanModelOfferingTypeEnum || (ScaScanModelOfferingTypeEnum = {}));
export var ScaScanModelGitRepoPlatformEnum;
(function (ScaScanModelGitRepoPlatformEnum) {
  ScaScanModelGitRepoPlatformEnum["GitHub"] = "GitHub";
})(ScaScanModelGitRepoPlatformEnum || (ScaScanModelGitRepoPlatformEnum = {}));
export var ScanExecutionModelStatusEnum;
(function (ScanExecutionModelStatusEnum) {
  ScanExecutionModelStatusEnum["Running"] = "Running";
  ScanExecutionModelStatusEnum["Stopping"] = "Stopping";
  ScanExecutionModelStatusEnum["Pausing"] = "Pausing";
  ScanExecutionModelStatusEnum["InQueue"] = "InQueue";
  ScanExecutionModelStatusEnum["Paused"] = "Paused";
  ScanExecutionModelStatusEnum["Ready"] = "Ready";
  ScanExecutionModelStatusEnum["Failed"] = "Failed";
})(ScanExecutionModelStatusEnum || (ScanExecutionModelStatusEnum = {}));
export var ScanExecutionModelResultEnum;
(function (ScanExecutionModelResultEnum) {
  ScanExecutionModelResultEnum["None"] = "None";
  ScanExecutionModelResultEnum["NoIssues"] = "NoIssues";
  ScanExecutionModelResultEnum["Informational"] = "Informational";
  ScanExecutionModelResultEnum["Low"] = "Low";
  ScanExecutionModelResultEnum["Medium"] = "Medium";
  ScanExecutionModelResultEnum["High"] = "High";
  ScanExecutionModelResultEnum["Critical"] = "Critical";
})(ScanExecutionModelResultEnum || (ScanExecutionModelResultEnum = {}));
export var ScanExecutionModelReadStatusEnum;
(function (ScanExecutionModelReadStatusEnum) {
  ScanExecutionModelReadStatusEnum["None"] = "None";
  ScanExecutionModelReadStatusEnum["Unread"] = "Unread";
  ScanExecutionModelReadStatusEnum["Read"] = "Read";
})(ScanExecutionModelReadStatusEnum || (ScanExecutionModelReadStatusEnum = {}));
export var ScanExecutionModelAvailableReportsEnum;
(function (ScanExecutionModelAvailableReportsEnum) {
  ScanExecutionModelAvailableReportsEnum["Xml"] = "Xml";
  ScanExecutionModelAvailableReportsEnum["Pdf"] = "Pdf";
  ScanExecutionModelAvailableReportsEnum["Html"] = "Html";
  ScanExecutionModelAvailableReportsEnum["CompliancePdf"] = "CompliancePdf";
  ScanExecutionModelAvailableReportsEnum["OwaspTop10Pdf"] = "OwaspTop10Pdf";
  ScanExecutionModelAvailableReportsEnum["Sans25Pdf"] = "Sans25Pdf";
  ScanExecutionModelAvailableReportsEnum["RawXml"] = "RawXml";
  ScanExecutionModelAvailableReportsEnum["Zip"] = "Zip";
  ScanExecutionModelAvailableReportsEnum["Json"] = "Json";
})(
  ScanExecutionModelAvailableReportsEnum ||
    (ScanExecutionModelAvailableReportsEnum = {}),
);
export var ScanExecutionModelExecutionProgressEnum;
(function (ScanExecutionModelExecutionProgressEnum) {
  ScanExecutionModelExecutionProgressEnum["Pending"] = "Pending";
  ScanExecutionModelExecutionProgressEnum["Running"] = "Running";
  ScanExecutionModelExecutionProgressEnum["UnderReview"] = "UnderReview";
  ScanExecutionModelExecutionProgressEnum["RunningManually"] =
    "RunningManually";
  ScanExecutionModelExecutionProgressEnum["Paused"] = "Paused";
  ScanExecutionModelExecutionProgressEnum["Completed"] = "Completed";
})(
  ScanExecutionModelExecutionProgressEnum ||
    (ScanExecutionModelExecutionProgressEnum = {}),
);
export var ScanFileModelFileTypeEnum;
(function (ScanFileModelFileTypeEnum) {
  ScanFileModelFileTypeEnum["DastScan"] = "DastScan";
  ScanFileModelFileTypeEnum["DastScanTemplate"] = "DastScanTemplate";
  ScanFileModelFileTypeEnum["DastLoginSequence"] = "DastLoginSequence";
  ScanFileModelFileTypeEnum["DastManualExplore"] = "DastManualExplore";
  ScanFileModelFileTypeEnum["DastMultiStep"] = "DastMultiStep";
  ScanFileModelFileTypeEnum["DastOpenAPI"] = "DastOpenAPI";
  ScanFileModelFileTypeEnum["DastLlmExplore"] = "DastLlmExplore";
})(ScanFileModelFileTypeEnum || (ScanFileModelFileTypeEnum = {}));
export var SecurityReportJobApplyPoliciesEnum;
(function (SecurityReportJobApplyPoliciesEnum) {
  SecurityReportJobApplyPoliciesEnum["None"] = "None";
  SecurityReportJobApplyPoliciesEnum["All"] = "All";
  SecurityReportJobApplyPoliciesEnum["Select"] = "Select";
})(
  SecurityReportJobApplyPoliciesEnum ||
    (SecurityReportJobApplyPoliciesEnum = {}),
);
export var SecurityReportOptionsReportFileTypeEnum;
(function (SecurityReportOptionsReportFileTypeEnum) {
  SecurityReportOptionsReportFileTypeEnum["Pdf"] = "Pdf";
  SecurityReportOptionsReportFileTypeEnum["Html"] = "Html";
  SecurityReportOptionsReportFileTypeEnum["Xml"] = "Xml";
  SecurityReportOptionsReportFileTypeEnum["Csv"] = "Csv";
  SecurityReportOptionsReportFileTypeEnum["Sarif"] = "Sarif";
})(
  SecurityReportOptionsReportFileTypeEnum ||
    (SecurityReportOptionsReportFileTypeEnum = {}),
);
export var SubscriptionInfoModelOfferingTypeEnum;
(function (SubscriptionInfoModelOfferingTypeEnum) {
  SubscriptionInfoModelOfferingTypeEnum["None"] = "None";
  SubscriptionInfoModelOfferingTypeEnum["Trial"] = "Trial";
  SubscriptionInfoModelOfferingTypeEnum["Metered"] = "Metered";
  SubscriptionInfoModelOfferingTypeEnum["PayPerApplication"] =
    "PayPerApplication";
  SubscriptionInfoModelOfferingTypeEnum["HTrial"] = "HTrial";
  SubscriptionInfoModelOfferingTypeEnum["PayPerScanExec"] = "PayPerScanExec";
  SubscriptionInfoModelOfferingTypeEnum["Premium"] = "Premium";
  SubscriptionInfoModelOfferingTypeEnum["AnalyzerConcurrent"] =
    "AnalyzerConcurrent";
  SubscriptionInfoModelOfferingTypeEnum["OpenSourcePerApplication"] =
    "OpenSourcePerApplication";
  SubscriptionInfoModelOfferingTypeEnum["OpenSourcePremium"] =
    "OpenSourcePremium";
  SubscriptionInfoModelOfferingTypeEnum["OpenSourceConcurrent"] =
    "OpenSourceConcurrent";
  SubscriptionInfoModelOfferingTypeEnum["IASTConcurrent"] = "IASTConcurrent";
  SubscriptionInfoModelOfferingTypeEnum["IASTPayPerApp"] = "IASTPayPerApp";
  SubscriptionInfoModelOfferingTypeEnum["Promotional"] = "Promotional";
  SubscriptionInfoModelOfferingTypeEnum["Silver"] = "Silver";
  SubscriptionInfoModelOfferingTypeEnum["Gold"] = "Gold";
  SubscriptionInfoModelOfferingTypeEnum["Platinum"] = "Platinum";
  SubscriptionInfoModelOfferingTypeEnum["SCAPerApplication"] =
    "SCAPerApplication";
  SubscriptionInfoModelOfferingTypeEnum["ContributingUser"] =
    "ContributingUser";
  SubscriptionInfoModelOfferingTypeEnum["SilverContribUser"] =
    "SilverContribUser";
  SubscriptionInfoModelOfferingTypeEnum["GoldContribUser"] = "GoldContribUser";
  SubscriptionInfoModelOfferingTypeEnum["PlatinumContribUser"] =
    "PlatinumContribUser";
  SubscriptionInfoModelOfferingTypeEnum["SilverPerApp"] = "SilverPerApp";
  SubscriptionInfoModelOfferingTypeEnum["GoldPerApp"] = "GoldPerApp";
  SubscriptionInfoModelOfferingTypeEnum["PlatinumPerApp"] = "PlatinumPerApp";
  SubscriptionInfoModelOfferingTypeEnum["ConsultantServices"] =
    "ConsultantServices";
})(
  SubscriptionInfoModelOfferingTypeEnum ||
    (SubscriptionInfoModelOfferingTypeEnum = {}),
);
export var TenantInfoIssuesStatusInheritanceEnum;
(function (TenantInfoIssuesStatusInheritanceEnum) {
  TenantInfoIssuesStatusInheritanceEnum["None"] = "None";
  TenantInfoIssuesStatusInheritanceEnum["Noise"] = "Noise";
  TenantInfoIssuesStatusInheritanceEnum["Fixed"] = "Fixed";
})(
  TenantInfoIssuesStatusInheritanceEnum ||
    (TenantInfoIssuesStatusInheritanceEnum = {}),
);
export var TenantInfoSubscriptionTechnologiesEnum;
(function (TenantInfoSubscriptionTechnologiesEnum) {
  TenantInfoSubscriptionTechnologiesEnum["None"] = "None";
  TenantInfoSubscriptionTechnologiesEnum["DynamicAnalyzer"] = "DynamicAnalyzer";
  TenantInfoSubscriptionTechnologiesEnum["StaticAnalyzer"] = "StaticAnalyzer";
  TenantInfoSubscriptionTechnologiesEnum["IASTAnalyzer"] = "IASTAnalyzer";
  TenantInfoSubscriptionTechnologiesEnum["ScaAnalyzer"] = "ScaAnalyzer";
})(
  TenantInfoSubscriptionTechnologiesEnum ||
    (TenantInfoSubscriptionTechnologiesEnum = {}),
);
export var TenantInfoActiveTechnologiesEnum;
(function (TenantInfoActiveTechnologiesEnum) {
  TenantInfoActiveTechnologiesEnum["None"] = "None";
  TenantInfoActiveTechnologiesEnum["DynamicAnalyzer"] = "DynamicAnalyzer";
  TenantInfoActiveTechnologiesEnum["StaticAnalyzer"] = "StaticAnalyzer";
  TenantInfoActiveTechnologiesEnum["IASTAnalyzer"] = "IASTAnalyzer";
  TenantInfoActiveTechnologiesEnum["ScaAnalyzer"] = "ScaAnalyzer";
})(TenantInfoActiveTechnologiesEnum || (TenantInfoActiveTechnologiesEnum = {}));
export var TenantInfoModelSubscriptionTechnologiesEnum;
(function (TenantInfoModelSubscriptionTechnologiesEnum) {
  TenantInfoModelSubscriptionTechnologiesEnum["None"] = "None";
  TenantInfoModelSubscriptionTechnologiesEnum["DynamicAnalyzer"] =
    "DynamicAnalyzer";
  TenantInfoModelSubscriptionTechnologiesEnum["StaticAnalyzer"] =
    "StaticAnalyzer";
  TenantInfoModelSubscriptionTechnologiesEnum["IASTAnalyzer"] = "IASTAnalyzer";
  TenantInfoModelSubscriptionTechnologiesEnum["ScaAnalyzer"] = "ScaAnalyzer";
})(
  TenantInfoModelSubscriptionTechnologiesEnum ||
    (TenantInfoModelSubscriptionTechnologiesEnum = {}),
);
export var TestsSettingsTestOptimizationLevelEnum;
(function (TestsSettingsTestOptimizationLevelEnum) {
  TestsSettingsTestOptimizationLevelEnum["NoOptimization"] = "NoOptimization";
  TestsSettingsTestOptimizationLevelEnum["Fast"] = "Fast";
  TestsSettingsTestOptimizationLevelEnum["Faster"] = "Faster";
  TestsSettingsTestOptimizationLevelEnum["Fastest"] = "Fastest";
})(
  TestsSettingsTestOptimizationLevelEnum ||
    (TestsSettingsTestOptimizationLevelEnum = {}),
);
export var TimeFrameIntervalEnum;
(function (TimeFrameIntervalEnum) {
  TimeFrameIntervalEnum["Day"] = "Day";
  TimeFrameIntervalEnum["Week"] = "Week";
  TimeFrameIntervalEnum["Month"] = "Month";
  TimeFrameIntervalEnum["Quarter"] = "Quarter";
  TimeFrameIntervalEnum["Year"] = "Year";
})(TimeFrameIntervalEnum || (TimeFrameIntervalEnum = {}));
export var UpdateAssetGroupModelIssuesStatusInheritanceEnum;
(function (UpdateAssetGroupModelIssuesStatusInheritanceEnum) {
  UpdateAssetGroupModelIssuesStatusInheritanceEnum["None"] = "None";
  UpdateAssetGroupModelIssuesStatusInheritanceEnum["Noise"] = "Noise";
  UpdateAssetGroupModelIssuesStatusInheritanceEnum["Fixed"] = "Fixed";
})(
  UpdateAssetGroupModelIssuesStatusInheritanceEnum ||
    (UpdateAssetGroupModelIssuesStatusInheritanceEnum = {}),
);
export var UpdateFullDastScanTestOperationEnum;
(function (UpdateFullDastScanTestOperationEnum) {
  UpdateFullDastScanTestOperationEnum["None"] = "None";
  UpdateFullDastScanTestOperationEnum["Retest"] = "Retest";
  UpdateFullDastScanTestOperationEnum["ContinueTest"] = "ContinueTest";
  UpdateFullDastScanTestOperationEnum["ReportOnly"] = "ReportOnly";
})(
  UpdateFullDastScanTestOperationEnum ||
    (UpdateFullDastScanTestOperationEnum = {}),
);
export var UpdateIssueStatusEnum;
(function (UpdateIssueStatusEnum) {
  UpdateIssueStatusEnum["Open"] = "Open";
  UpdateIssueStatusEnum["InProgress"] = "InProgress";
  UpdateIssueStatusEnum["Reopened"] = "Reopened";
  UpdateIssueStatusEnum["Noise"] = "Noise";
  UpdateIssueStatusEnum["Passed"] = "Passed";
  UpdateIssueStatusEnum["Fixed"] = "Fixed";
  UpdateIssueStatusEnum["New"] = "New";
})(UpdateIssueStatusEnum || (UpdateIssueStatusEnum = {}));
export var UpdateIssuesByIdStatusEnum;
(function (UpdateIssuesByIdStatusEnum) {
  UpdateIssuesByIdStatusEnum["Open"] = "Open";
  UpdateIssuesByIdStatusEnum["InProgress"] = "InProgress";
  UpdateIssuesByIdStatusEnum["Reopened"] = "Reopened";
  UpdateIssuesByIdStatusEnum["Noise"] = "Noise";
  UpdateIssuesByIdStatusEnum["Passed"] = "Passed";
  UpdateIssuesByIdStatusEnum["Fixed"] = "Fixed";
  UpdateIssuesByIdStatusEnum["New"] = "New";
})(UpdateIssuesByIdStatusEnum || (UpdateIssuesByIdStatusEnum = {}));
export var UpdateOneTimePasswordHashTypeEnum;
(function (UpdateOneTimePasswordHashTypeEnum) {
  UpdateOneTimePasswordHashTypeEnum["None"] = "None";
  UpdateOneTimePasswordHashTypeEnum["Sha1"] = "Sha1";
  UpdateOneTimePasswordHashTypeEnum["Sha256"] = "Sha256";
  UpdateOneTimePasswordHashTypeEnum["Sha512"] = "Sha512";
})(
  UpdateOneTimePasswordHashTypeEnum || (UpdateOneTimePasswordHashTypeEnum = {}),
);
export var UpdateTestsSettingsTestOptimizationLevelEnum;
(function (UpdateTestsSettingsTestOptimizationLevelEnum) {
  UpdateTestsSettingsTestOptimizationLevelEnum["NoOptimization"] =
    "NoOptimization";
  UpdateTestsSettingsTestOptimizationLevelEnum["Fast"] = "Fast";
  UpdateTestsSettingsTestOptimizationLevelEnum["Faster"] = "Faster";
  UpdateTestsSettingsTestOptimizationLevelEnum["Fastest"] = "Fastest";
})(
  UpdateTestsSettingsTestOptimizationLevelEnum ||
    (UpdateTestsSettingsTestOptimizationLevelEnum = {}),
);
export var UpdateWebhookRequestMethodEnum;
(function (UpdateWebhookRequestMethodEnum) {
  UpdateWebhookRequestMethodEnum["GET"] = "GET";
  UpdateWebhookRequestMethodEnum["POST"] = "POST";
  UpdateWebhookRequestMethodEnum["PUT"] = "PUT";
})(UpdateWebhookRequestMethodEnum || (UpdateWebhookRequestMethodEnum = {}));
export var UserInfoReasonForNotEligibleToTrialEnum;
(function (UserInfoReasonForNotEligibleToTrialEnum) {
  UserInfoReasonForNotEligibleToTrialEnum["None"] = "None";
  UserInfoReasonForNotEligibleToTrialEnum["AlreadyUsedTheService"] =
    "AlreadyUsedTheService";
  UserInfoReasonForNotEligibleToTrialEnum["ShouldFillRegistrationForm"] =
    "ShouldFillRegistrationForm";
})(
  UserInfoReasonForNotEligibleToTrialEnum ||
    (UserInfoReasonForNotEligibleToTrialEnum = {}),
);
export var UserModelStatusEnum;
(function (UserModelStatusEnum) {
  UserModelStatusEnum["Active"] = "Active";
  UserModelStatusEnum["BlockNewScans"] = "BlockNewScans";
  UserModelStatusEnum["BlockAccess"] = "BlockAccess";
  UserModelStatusEnum["PendingActivation"] = "PendingActivation";
  UserModelStatusEnum["BlockAccessFromAPI"] = "BlockAccessFromAPI";
  UserModelStatusEnum["Archived"] = "Archived";
  UserModelStatusEnum["InvitationExpired"] = "InvitationExpired";
})(UserModelStatusEnum || (UserModelStatusEnum = {}));
export var UserOrgRoleStatusEnum;
(function (UserOrgRoleStatusEnum) {
  UserOrgRoleStatusEnum["Active"] = "Active";
  UserOrgRoleStatusEnum["BlockNewScans"] = "BlockNewScans";
  UserOrgRoleStatusEnum["BlockAccess"] = "BlockAccess";
  UserOrgRoleStatusEnum["PendingActivation"] = "PendingActivation";
  UserOrgRoleStatusEnum["BlockAccessFromAPI"] = "BlockAccessFromAPI";
  UserOrgRoleStatusEnum["Archived"] = "Archived";
  UserOrgRoleStatusEnum["InvitationExpired"] = "InvitationExpired";
})(UserOrgRoleStatusEnum || (UserOrgRoleStatusEnum = {}));
export var WebhookAssociationScopeEnum;
(function (WebhookAssociationScopeEnum) {
  WebhookAssociationScopeEnum["AssetGroup"] = "AssetGroup";
  WebhookAssociationScopeEnum["Application"] = "Application";
})(WebhookAssociationScopeEnum || (WebhookAssociationScopeEnum = {}));
export var WebhookModelRequestMethodEnum;
(function (WebhookModelRequestMethodEnum) {
  WebhookModelRequestMethodEnum["GET"] = "GET";
  WebhookModelRequestMethodEnum["POST"] = "POST";
  WebhookModelRequestMethodEnum["PUT"] = "PUT";
})(WebhookModelRequestMethodEnum || (WebhookModelRequestMethodEnum = {}));
export var WebhookModelEventEnum;
(function (WebhookModelEventEnum) {
  WebhookModelEventEnum["ScanExecutionCompleted"] = "ScanExecutionCompleted";
  WebhookModelEventEnum["ApplicationUpdated"] = "ApplicationUpdated";
  WebhookModelEventEnum["NewPatchRequest"] = "NewPatchRequest";
})(WebhookModelEventEnum || (WebhookModelEventEnum = {}));
/**
 * Determine which policies will be applied for filtering in non compliant issues
 * @default "None"
 */
export var AppsGetAppCorrelationGroupsParamsApplyPoliciesEnum;
(function (AppsGetAppCorrelationGroupsParamsApplyPoliciesEnum) {
  AppsGetAppCorrelationGroupsParamsApplyPoliciesEnum["None"] = "None";
  AppsGetAppCorrelationGroupsParamsApplyPoliciesEnum["All"] = "All";
  AppsGetAppCorrelationGroupsParamsApplyPoliciesEnum["Select"] = "Select";
})(
  AppsGetAppCorrelationGroupsParamsApplyPoliciesEnum ||
    (AppsGetAppCorrelationGroupsParamsApplyPoliciesEnum = {}),
);
/** mail prefix */
export var DomainsResendMailParamsMailPrefixEnum;
(function (DomainsResendMailParamsMailPrefixEnum) {
  DomainsResendMailParamsMailPrefixEnum["Admin"] = "Admin";
  DomainsResendMailParamsMailPrefixEnum["Administrator"] = "Administrator";
  DomainsResendMailParamsMailPrefixEnum["HostMaster"] = "HostMaster";
  DomainsResendMailParamsMailPrefixEnum["Root"] = "Root";
  DomainsResendMailParamsMailPrefixEnum["WebMaster"] = "WebMaster";
  DomainsResendMailParamsMailPrefixEnum["PostMaster"] = "PostMaster";
})(
  DomainsResendMailParamsMailPrefixEnum ||
    (DomainsResendMailParamsMailPrefixEnum = {}),
);
export var DomainsRegisterParamsRegistrationTypeEnum;
(function (DomainsRegisterParamsRegistrationTypeEnum) {
  DomainsRegisterParamsRegistrationTypeEnum["Email"] = "Email";
  DomainsRegisterParamsRegistrationTypeEnum["Html"] = "Html";
})(
  DomainsRegisterParamsRegistrationTypeEnum ||
    (DomainsRegisterParamsRegistrationTypeEnum = {}),
);
export var DomainsRegisterParamsEnum;
(function (DomainsRegisterParamsEnum) {
  DomainsRegisterParamsEnum["Email"] = "Email";
  DomainsRegisterParamsEnum["Html"] = "Html";
})(DomainsRegisterParamsEnum || (DomainsRegisterParamsEnum = {}));
/** Uploaded File type (required for zip files only) */
export var FileUploadPostParamsFileTypeEnum;
(function (FileUploadPostParamsFileTypeEnum) {
  FileUploadPostParamsFileTypeEnum["ZippedXmlDast"] = "ZippedXmlDast";
  FileUploadPostParamsFileTypeEnum["SourceCodeArchive"] = "SourceCodeArchive";
  FileUploadPostParamsFileTypeEnum["DastPostmanCollectionJson"] =
    "DastPostmanCollectionJson";
  FileUploadPostParamsFileTypeEnum["DastPostmanCollectionZip"] =
    "DastPostmanCollectionZip";
  FileUploadPostParamsFileTypeEnum["AsencEncryptionArchive"] =
    "AsencEncryptionArchive";
  FileUploadPostParamsFileTypeEnum["DastOpenAPIFile"] = "DastOpenAPIFile";
  FileUploadPostParamsFileTypeEnum["SbomSpdx"] = "SbomSpdx";
})(FileUploadPostParamsFileTypeEnum || (FileUploadPostParamsFileTypeEnum = {}));
/**
 * Determine which policies will be applied for filtering in non compliant issues
 * @default "None"
 */
export var FixGroupsGetParamsApplyPoliciesEnum;
(function (FixGroupsGetParamsApplyPoliciesEnum) {
  FixGroupsGetParamsApplyPoliciesEnum["None"] = "None";
  FixGroupsGetParamsApplyPoliciesEnum["All"] = "All";
  FixGroupsGetParamsApplyPoliciesEnum["Select"] = "Select";
})(
  FixGroupsGetParamsApplyPoliciesEnum ||
    (FixGroupsGetParamsApplyPoliciesEnum = {}),
);
/** The Scope of the fix group */
export var FixGroupsGetParamsScopeEnum;
(function (FixGroupsGetParamsScopeEnum) {
  FixGroupsGetParamsScopeEnum["Application"] = "Application";
  FixGroupsGetParamsScopeEnum["Scan"] = "Scan";
  FixGroupsGetParamsScopeEnum["ScanExecution"] = "ScanExecution";
})(FixGroupsGetParamsScopeEnum || (FixGroupsGetParamsScopeEnum = {}));
export var FixGroupsGetParamsEnum;
(function (FixGroupsGetParamsEnum) {
  FixGroupsGetParamsEnum["Application"] = "Application";
  FixGroupsGetParamsEnum["Scan"] = "Scan";
  FixGroupsGetParamsEnum["ScanExecution"] = "ScanExecution";
})(FixGroupsGetParamsEnum || (FixGroupsGetParamsEnum = {}));
/**
 * Determine which policies will be applied for filtering in non compliant issues
 * @default "None"
 */
export var FixGroupsUpdateParamsApplyPoliciesEnum;
(function (FixGroupsUpdateParamsApplyPoliciesEnum) {
  FixGroupsUpdateParamsApplyPoliciesEnum["None"] = "None";
  FixGroupsUpdateParamsApplyPoliciesEnum["All"] = "All";
  FixGroupsUpdateParamsApplyPoliciesEnum["Select"] = "Select";
})(
  FixGroupsUpdateParamsApplyPoliciesEnum ||
    (FixGroupsUpdateParamsApplyPoliciesEnum = {}),
);
/** The Scope of the fix group */
export var FixGroupsUpdateParamsScopeEnum;
(function (FixGroupsUpdateParamsScopeEnum) {
  FixGroupsUpdateParamsScopeEnum["Application"] = "Application";
  FixGroupsUpdateParamsScopeEnum["Scan"] = "Scan";
  FixGroupsUpdateParamsScopeEnum["ScanExecution"] = "ScanExecution";
})(FixGroupsUpdateParamsScopeEnum || (FixGroupsUpdateParamsScopeEnum = {}));
export var FixGroupsUpdateParamsEnum;
(function (FixGroupsUpdateParamsEnum) {
  FixGroupsUpdateParamsEnum["Application"] = "Application";
  FixGroupsUpdateParamsEnum["Scan"] = "Scan";
  FixGroupsUpdateParamsEnum["ScanExecution"] = "ScanExecution";
})(FixGroupsUpdateParamsEnum || (FixGroupsUpdateParamsEnum = {}));
/**
 * Determine which policies will be applied for filtering in non compliant issues
 * @default "None"
 */
export var IssuesGetParamsApplyPoliciesEnum;
(function (IssuesGetParamsApplyPoliciesEnum) {
  IssuesGetParamsApplyPoliciesEnum["None"] = "None";
  IssuesGetParamsApplyPoliciesEnum["All"] = "All";
  IssuesGetParamsApplyPoliciesEnum["Select"] = "Select";
})(IssuesGetParamsApplyPoliciesEnum || (IssuesGetParamsApplyPoliciesEnum = {}));
/** The Scope of the issues */
export var IssuesGetParamsScopeEnum;
(function (IssuesGetParamsScopeEnum) {
  IssuesGetParamsScopeEnum["Application"] = "Application";
  IssuesGetParamsScopeEnum["Scan"] = "Scan";
  IssuesGetParamsScopeEnum["ScanExecution"] = "ScanExecution";
})(IssuesGetParamsScopeEnum || (IssuesGetParamsScopeEnum = {}));
export var IssuesGetParamsEnum;
(function (IssuesGetParamsEnum) {
  IssuesGetParamsEnum["Application"] = "Application";
  IssuesGetParamsEnum["Scan"] = "Scan";
  IssuesGetParamsEnum["ScanExecution"] = "ScanExecution";
})(IssuesGetParamsEnum || (IssuesGetParamsEnum = {}));
/**
 * Determine which policies will be applied for filtering in non compliant issues
 * @default "None"
 */
export var IssuesUpdateFilteredIssuesParamsApplyPoliciesEnum;
(function (IssuesUpdateFilteredIssuesParamsApplyPoliciesEnum) {
  IssuesUpdateFilteredIssuesParamsApplyPoliciesEnum["None"] = "None";
  IssuesUpdateFilteredIssuesParamsApplyPoliciesEnum["All"] = "All";
  IssuesUpdateFilteredIssuesParamsApplyPoliciesEnum["Select"] = "Select";
})(
  IssuesUpdateFilteredIssuesParamsApplyPoliciesEnum ||
    (IssuesUpdateFilteredIssuesParamsApplyPoliciesEnum = {}),
);
/** The Scope of the issues */
export var IssuesUpdateFilteredIssuesParamsScopeEnum;
(function (IssuesUpdateFilteredIssuesParamsScopeEnum) {
  IssuesUpdateFilteredIssuesParamsScopeEnum["Application"] = "Application";
  IssuesUpdateFilteredIssuesParamsScopeEnum["Scan"] = "Scan";
  IssuesUpdateFilteredIssuesParamsScopeEnum["ScanExecution"] = "ScanExecution";
})(
  IssuesUpdateFilteredIssuesParamsScopeEnum ||
    (IssuesUpdateFilteredIssuesParamsScopeEnum = {}),
);
export var IssuesUpdateFilteredIssuesParamsEnum;
(function (IssuesUpdateFilteredIssuesParamsEnum) {
  IssuesUpdateFilteredIssuesParamsEnum["Application"] = "Application";
  IssuesUpdateFilteredIssuesParamsEnum["Scan"] = "Scan";
  IssuesUpdateFilteredIssuesParamsEnum["ScanExecution"] = "ScanExecution";
})(
  IssuesUpdateFilteredIssuesParamsEnum ||
    (IssuesUpdateFilteredIssuesParamsEnum = {}),
);
/** script framework */
export var IssuesReplayScriptParamsFrameworkEnum;
(function (IssuesReplayScriptParamsFrameworkEnum) {
  IssuesReplayScriptParamsFrameworkEnum["Python"] = "Python";
  IssuesReplayScriptParamsFrameworkEnum["JsConsole"] = "JsConsole";
})(
  IssuesReplayScriptParamsFrameworkEnum ||
    (IssuesReplayScriptParamsFrameworkEnum = {}),
);
/** Presence platform */
export var PresencesDownloadPresenceWithKeyParamsPlatformEnum;
(function (PresencesDownloadPresenceWithKeyParamsPlatformEnum) {
  PresencesDownloadPresenceWithKeyParamsPlatformEnum["WinX64"] = "win_x64";
  PresencesDownloadPresenceWithKeyParamsPlatformEnum["LinuxX64"] = "linux_x64";
  PresencesDownloadPresenceWithKeyParamsPlatformEnum["OsxX64"] = "osx_x64";
})(
  PresencesDownloadPresenceWithKeyParamsPlatformEnum ||
    (PresencesDownloadPresenceWithKeyParamsPlatformEnum = {}),
);
export var PresencesDownloadPresenceWithKeyParamsEnum;
(function (PresencesDownloadPresenceWithKeyParamsEnum) {
  PresencesDownloadPresenceWithKeyParamsEnum["WinX64"] = "win_x64";
  PresencesDownloadPresenceWithKeyParamsEnum["LinuxX64"] = "linux_x64";
  PresencesDownloadPresenceWithKeyParamsEnum["OsxX64"] = "osx_x64";
})(
  PresencesDownloadPresenceWithKeyParamsEnum ||
    (PresencesDownloadPresenceWithKeyParamsEnum = {}),
);
export var ReportsCreateIssuesReportParamsScopeEnum;
(function (ReportsCreateIssuesReportParamsScopeEnum) {
  ReportsCreateIssuesReportParamsScopeEnum["Application"] = "Application";
  ReportsCreateIssuesReportParamsScopeEnum["Scan"] = "Scan";
  ReportsCreateIssuesReportParamsScopeEnum["ScanExecution"] = "ScanExecution";
})(
  ReportsCreateIssuesReportParamsScopeEnum ||
    (ReportsCreateIssuesReportParamsScopeEnum = {}),
);
export var ReportsCreateIssuesReportParamsEnum;
(function (ReportsCreateIssuesReportParamsEnum) {
  ReportsCreateIssuesReportParamsEnum["Application"] = "Application";
  ReportsCreateIssuesReportParamsEnum["Scan"] = "Scan";
  ReportsCreateIssuesReportParamsEnum["ScanExecution"] = "ScanExecution";
})(
  ReportsCreateIssuesReportParamsEnum ||
    (ReportsCreateIssuesReportParamsEnum = {}),
);
export var ReportsCreateSecurityReportParamsScopeEnum;
(function (ReportsCreateSecurityReportParamsScopeEnum) {
  ReportsCreateSecurityReportParamsScopeEnum["Application"] = "Application";
  ReportsCreateSecurityReportParamsScopeEnum["Scan"] = "Scan";
  ReportsCreateSecurityReportParamsScopeEnum["ScanExecution"] = "ScanExecution";
})(
  ReportsCreateSecurityReportParamsScopeEnum ||
    (ReportsCreateSecurityReportParamsScopeEnum = {}),
);
export var ReportsCreateSecurityReportParamsEnum;
(function (ReportsCreateSecurityReportParamsEnum) {
  ReportsCreateSecurityReportParamsEnum["Application"] = "Application";
  ReportsCreateSecurityReportParamsEnum["Scan"] = "Scan";
  ReportsCreateSecurityReportParamsEnum["ScanExecution"] = "ScanExecution";
})(
  ReportsCreateSecurityReportParamsEnum ||
    (ReportsCreateSecurityReportParamsEnum = {}),
);
export var ReportsCreateRegulationReportParamsScopeEnum;
(function (ReportsCreateRegulationReportParamsScopeEnum) {
  ReportsCreateRegulationReportParamsScopeEnum["Application"] = "Application";
  ReportsCreateRegulationReportParamsScopeEnum["Scan"] = "Scan";
  ReportsCreateRegulationReportParamsScopeEnum["ScanExecution"] =
    "ScanExecution";
})(
  ReportsCreateRegulationReportParamsScopeEnum ||
    (ReportsCreateRegulationReportParamsScopeEnum = {}),
);
export var ReportsCreateRegulationReportParamsEnum;
(function (ReportsCreateRegulationReportParamsEnum) {
  ReportsCreateRegulationReportParamsEnum["Application"] = "Application";
  ReportsCreateRegulationReportParamsEnum["Scan"] = "Scan";
  ReportsCreateRegulationReportParamsEnum["ScanExecution"] = "ScanExecution";
})(
  ReportsCreateRegulationReportParamsEnum ||
    (ReportsCreateRegulationReportParamsEnum = {}),
);
export var ReportsCreateLicenseReportParamsScopeEnum;
(function (ReportsCreateLicenseReportParamsScopeEnum) {
  ReportsCreateLicenseReportParamsScopeEnum["Application"] = "Application";
  ReportsCreateLicenseReportParamsScopeEnum["Scan"] = "Scan";
  ReportsCreateLicenseReportParamsScopeEnum["ScanExecution"] = "ScanExecution";
})(
  ReportsCreateLicenseReportParamsScopeEnum ||
    (ReportsCreateLicenseReportParamsScopeEnum = {}),
);
export var ReportsCreateLicenseReportParamsEnum;
(function (ReportsCreateLicenseReportParamsEnum) {
  ReportsCreateLicenseReportParamsEnum["Application"] = "Application";
  ReportsCreateLicenseReportParamsEnum["Scan"] = "Scan";
  ReportsCreateLicenseReportParamsEnum["ScanExecution"] = "ScanExecution";
})(
  ReportsCreateLicenseReportParamsEnum ||
    (ReportsCreateLicenseReportParamsEnum = {}),
);
export var ReportsGetArticleParamsModeEnum;
(function (ReportsGetArticleParamsModeEnum) {
  ReportsGetArticleParamsModeEnum["Light"] = "light";
  ReportsGetArticleParamsModeEnum["Dark"] = "dark";
})(ReportsGetArticleParamsModeEnum || (ReportsGetArticleParamsModeEnum = {}));
/** Operation */
export var ScansExecutionActionParamsOperationEnum;
(function (ScansExecutionActionParamsOperationEnum) {
  ScansExecutionActionParamsOperationEnum["Pause"] = "Pause";
  ScansExecutionActionParamsOperationEnum["Resume"] = "Resume";
  ScansExecutionActionParamsOperationEnum["Stop"] = "Stop";
})(
  ScansExecutionActionParamsOperationEnum ||
    (ScansExecutionActionParamsOperationEnum = {}),
);
export var ScansExecutionActionParamsEnum;
(function (ScansExecutionActionParamsEnum) {
  ScansExecutionActionParamsEnum["Pause"] = "Pause";
  ScansExecutionActionParamsEnum["Resume"] = "Resume";
  ScansExecutionActionParamsEnum["Stop"] = "Stop";
})(ScansExecutionActionParamsEnum || (ScansExecutionActionParamsEnum = {}));
export var ReposGetRepoSignatureParamsPlatformEnum;
(function (ReposGetRepoSignatureParamsPlatformEnum) {
  ReposGetRepoSignatureParamsPlatformEnum["GitHub"] = "GitHub";
})(
  ReposGetRepoSignatureParamsPlatformEnum ||
    (ReposGetRepoSignatureParamsPlatformEnum = {}),
);
export var ReposGetRepoSignatureParamsEnum;
(function (ReposGetRepoSignatureParamsEnum) {
  ReposGetRepoSignatureParamsEnum["GitHub"] = "GitHub";
})(ReposGetRepoSignatureParamsEnum || (ReposGetRepoSignatureParamsEnum = {}));
/** Platform - osx_x64 is not yet supported !! */
export var ToolsGetPresenceV2ParamsPlatformEnum;
(function (ToolsGetPresenceV2ParamsPlatformEnum) {
  ToolsGetPresenceV2ParamsPlatformEnum["WinX64"] = "win_x64";
  ToolsGetPresenceV2ParamsPlatformEnum["LinuxX64"] = "linux_x64";
  ToolsGetPresenceV2ParamsPlatformEnum["OsxX64"] = "osx_x64";
})(
  ToolsGetPresenceV2ParamsPlatformEnum ||
    (ToolsGetPresenceV2ParamsPlatformEnum = {}),
);
/** Platform */
export var ToolsGetTrafficRecorderParamsPlatformEnum;
(function (ToolsGetTrafficRecorderParamsPlatformEnum) {
  ToolsGetTrafficRecorderParamsPlatformEnum["WinX64"] = "win_x64";
  ToolsGetTrafficRecorderParamsPlatformEnum["LinuxX64"] = "linux_x64";
})(
  ToolsGetTrafficRecorderParamsPlatformEnum ||
    (ToolsGetTrafficRecorderParamsPlatformEnum = {}),
);
export var ToolsGetTrafficRecorderParamsEnum;
(function (ToolsGetTrafficRecorderParamsEnum) {
  ToolsGetTrafficRecorderParamsEnum["WinX64"] = "win_x64";
  ToolsGetTrafficRecorderParamsEnum["LinuxX64"] = "linux_x64";
})(
  ToolsGetTrafficRecorderParamsEnum || (ToolsGetTrafficRecorderParamsEnum = {}),
);
/** Platform */
export var ToolsGetTrafficRecorderVersionParamsPlatformEnum;
(function (ToolsGetTrafficRecorderVersionParamsPlatformEnum) {
  ToolsGetTrafficRecorderVersionParamsPlatformEnum["WinX64"] = "win_x64";
  ToolsGetTrafficRecorderVersionParamsPlatformEnum["LinuxX64"] = "linux_x64";
})(
  ToolsGetTrafficRecorderVersionParamsPlatformEnum ||
    (ToolsGetTrafficRecorderVersionParamsPlatformEnum = {}),
);
export var ToolsGetTrafficRecorderVersionParamsEnum;
(function (ToolsGetTrafficRecorderVersionParamsEnum) {
  ToolsGetTrafficRecorderVersionParamsEnum["WinX64"] = "win_x64";
  ToolsGetTrafficRecorderVersionParamsEnum["LinuxX64"] = "linux_x64";
})(
  ToolsGetTrafficRecorderVersionParamsEnum ||
    (ToolsGetTrafficRecorderVersionParamsEnum = {}),
);
/**
 * Agent type (Java or DotNet)
 * @default "Java"
 */
export var ToolsDownloadIastAgentParamsTypeEnum;
(function (ToolsDownloadIastAgentParamsTypeEnum) {
  ToolsDownloadIastAgentParamsTypeEnum["Java"] = "Java";
  ToolsDownloadIastAgentParamsTypeEnum["DotNet"] = "DotNet";
  ToolsDownloadIastAgentParamsTypeEnum["PhpWindows"] = "PhpWindows";
  ToolsDownloadIastAgentParamsTypeEnum["PhpRedHat"] = "PhpRedHat";
  ToolsDownloadIastAgentParamsTypeEnum["PhpUbuntu"] = "PhpUbuntu";
  ToolsDownloadIastAgentParamsTypeEnum["Kubernetes"] = "Kubernetes";
})(
  ToolsDownloadIastAgentParamsTypeEnum ||
    (ToolsDownloadIastAgentParamsTypeEnum = {}),
);
export var ToolsSaClientUtilByTypeParamsToolTypeEnum;
(function (ToolsSaClientUtilByTypeParamsToolTypeEnum) {
  ToolsSaClientUtilByTypeParamsToolTypeEnum["Win"] = "Win";
  ToolsSaClientUtilByTypeParamsToolTypeEnum["Linux"] = "Linux";
  ToolsSaClientUtilByTypeParamsToolTypeEnum["Mac"] = "Mac";
  ToolsSaClientUtilByTypeParamsToolTypeEnum["WinGui"] = "WinGui";
  ToolsSaClientUtilByTypeParamsToolTypeEnum["LinuxGui"] = "LinuxGui";
  ToolsSaClientUtilByTypeParamsToolTypeEnum["MacGui"] = "MacGui";
})(
  ToolsSaClientUtilByTypeParamsToolTypeEnum ||
    (ToolsSaClientUtilByTypeParamsToolTypeEnum = {}),
);
/** Scope of the association to delete */
export var WebhooksDeleteAssociationParamsScopeEnum;
(function (WebhooksDeleteAssociationParamsScopeEnum) {
  WebhooksDeleteAssociationParamsScopeEnum["AssetGroup"] = "AssetGroup";
  WebhooksDeleteAssociationParamsScopeEnum["Application"] = "Application";
})(
  WebhooksDeleteAssociationParamsScopeEnum ||
    (WebhooksDeleteAssociationParamsScopeEnum = {}),
);
import axios from "axios";
export var ContentType;
(function (ContentType) {
  ContentType["Json"] = "application/json";
  ContentType["JsonApi"] = "application/vnd.api+json";
  ContentType["FormData"] = "multipart/form-data";
  ContentType["UrlEncoded"] = "application/x-www-form-urlencoded";
  ContentType["Text"] = "text/plain";
})(ContentType || (ContentType = {}));
export class HttpClient {
  instance;
  securityData = null;
  securityWorker;
  secure;
  format;
  constructor({ securityWorker, secure, format, ...axiosConfig } = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }
  setSecurityData = (data) => {
    this.securityData = data;
  };
  mergeRequestParams(params1, params2) {
    const method = params1.method || (params2 && params2.method);
    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase()]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }
  stringifyFormItem(formItem) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }
  createFormData(input) {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent = property instanceof Array ? property : [property];
      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }
      return formData;
    }, new FormData());
  }
  request = async ({ secure, path, type, query, format, body, ...params }) => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;
    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body);
    }
    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }
    return this.instance
      .request({
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type ? { "Content-Type": type } : {}),
        },
        params: query,
        responseType: responseFormat,
        data: body,
        url: path,
      })
      .then((response) => response.data);
  };
}
/**
 * @title AppScan Rest API
 * @version v4
 * @license License Agreement (https://www.hcltechsw.com/resources/license-agreements)
 * @contact HCL Software Customer Support portal (https://support.hcl-software.com/csm)
 *
 * This API allows you to interact with the service. The API allows you to perform many of the operations available in the UI and more.For authentication, use the relevant APIs in the Account section. A successful authentication response includes a bearer token for use in subsequent API calls. Pasting this token in the 'Access token' field above will automatically add the authorization header to any API call that requires a valid session.
 */
export class Api {
  http;
  constructor(http) {
    this.http = http;
  }
  v4 = {
    /**
     * No description
     *
     * @tags Account
     * @name AccountLogout
     * @summary Check if the provided access token is valid
     * @request GET:/api/v4/Account/Logout
     * @secure
     * @response `200` `void` OK
     * @response `401` `void` Unauthorized
     */
    Account_Logout: (params = {}) =>
      this.http.request({
        path: `/api/v4/Account/Logout`,
        method: "GET",
        secure: true,
        ...params,
      }),
    /**
     * @description Used only if you have an active subscription to the service. Login using this action is allowed only for a user associated with a valid service subscription. This action returns an access token that can be used as "Bearer Token" for accessing the API.
     *
     * @tags Account
     * @name AccountApiKeyLogin
     * @summary Users login with API Key
     * @request POST:/api/v4/Account/ApiKeyLogin
     * @secure
     * @response `200` `AccessTokenData` OK
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     */
    Account_ApiKeyLogin: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/Account/ApiKeyLogin`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * @description If an API key already exist, this action will delete the old key.
     *
     * @tags Account
     * @name AccountCreateApiKey
     * @summary Generate a new API Key for the current user.
     * @request POST:/api/v4/Account/ApiKey
     * @secure
     * @response `201` `ApiKeyInfo` Created
     * @response `401` `void` Unauthorized
     */
    Account_CreateApiKey: (params = {}) =>
      this.http.request({
        path: `/api/v4/Account/ApiKey`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description Return information about the current user and the Tenant (Organization). Including information about the available subscriptions.
     *
     * @tags Account
     * @name AccountGetTenantInfo
     * @summary Get information about the Tenant
     * @request GET:/api/v4/Account/TenantInfo
     * @secure
     * @response `200` `TenantInfo` OK
     * @response `401` `void` Unauthorized
     * @response `403` `ProblemDetails` Forbidden
     */
    Account_GetTenantInfo: (params = {}) =>
      this.http.request({
        path: `/api/v4/Account/TenantInfo`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Account
     * @name AccountUpdateTenantInfo
     * @summary Update TenantInfo
     * @request PUT:/api/v4/Account/TenantInfo
     * @secure
     * @response `200` `TenantInfoModel` OK
     * @response `400` `ProblemDetails` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ProblemDetails` Forbidden
     */
    Account_UpdateTenantInfo: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/Account/TenantInfo`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * @description Up to 100 users per call. Connect users with up to 10 AssetGroups
     *
     * @tags Account
     * @name AccountInviteUsers
     * @summary Invite User to the current organization
     * @request POST:/api/v4/Account/InviteUsers
     * @secure
     * @response `200` `(InviteResult)[]` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Account_InviteUsers: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/Account/InviteUsers`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * @description This API endpoint allows you to retrieve data using the <a target='_blank' href='https://www.odata.org/documentation/'>OData V4</a> interface. The response will contain the requested data in a paginated format.<br><br>Note: If the response is expected to contain many large records, it is recommended to use `$top` to limit the number of records returned or to use the `$select` to select only the required fields.
     *
     * @tags Apps
     * @name AppsGet
     * @summary Get applications
     * @request GET:/api/v4/Apps
     * @secure
     * @response `200` `ApplicationModelPageResultModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Apps_Get: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/Apps`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Apps
     * @name AppsPost
     * @summary Create an application
     * @request POST:/api/v4/Apps
     * @secure
     * @response `201` `ApplicationModel` Created
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Apps_Post: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/Apps`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Apps
     * @name AppsDelete
     * @summary Delete application
     * @request DELETE:/api/v4/Apps/{id}
     * @secure
     * @response `204` `void` No Content
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Apps_Delete: (id, params = {}) =>
      this.http.request({
        path: `/api/v4/Apps/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
    /**
     * No description
     *
     * @tags Apps
     * @name AppsUpdate
     * @summary Update application
     * @request PUT:/api/v4/Apps/{id}
     * @secure
     * @response `200` `ApplicationModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Apps_Update: (id, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Apps/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * @description Reset options (set in the request body): <b>DeleteIssues:</b>  Delete all the Application’s issues. <b>DeleteScans:</b>  Delete all the Application’s scans. <b>DeleteChartsData:</b> Delete all the data related to the application from the Dashboard charts. (This will affect charts from previous dates too. The application will be removed from all graphs that contain application counts.)
     *
     * @tags Apps
     * @name AppsReset
     * @summary Reset application
     * @request POST:/api/v4/Apps/Reset/{id}
     * @secure
     * @response `204` `void` No Content
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Apps_Reset: (id, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Apps/Reset/${id}`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
    /**
     * @description This API endpoint allows you to retrieve data using the <a target='_blank' href='https://www.odata.org/documentation/'>OData V4</a> interface. The response will contain the requested data in a paginated format.<br><br>Note: If the response is expected to contain many large records, it is recommended to use `$top` to limit the number of records returned or to use the `$select` to select only the required fields.
     *
     * @tags Apps
     * @name AppsGetAppCorrelationGroups
     * @summary Get Correlation Groups for an application
     * @request GET:/api/v4/Apps/{id}/CorrelationGroups
     * @secure
     * @response `200` `CorrelationGroupModelPageResultModel` OK
     * @response `404` `ErrorMessage` Not Found
     */
    Apps_GetAppCorrelationGroups: (id, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Apps/${id}/CorrelationGroups`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description Import Apps from uploaded file to application specified with id. Includes file format validation. The expected Content-Type of the request is multipart/form-data. The request should contain a single file parameter named "fileToUpload".
     *
     * @tags Apps
     * @name AppsImportFile
     * @summary Import Apps
     * @request POST:/api/v4/Apps/ImportFile
     * @secure
     * @response `200` `ImportAppResultModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Apps_ImportFile: (data, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Apps/ImportFile`,
        method: "POST",
        query: query,
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
    /**
     * @description This API endpoint allows you to retrieve data using the <a target='_blank' href='https://www.odata.org/documentation/'>OData V4</a> interface. The response will contain the requested data in a paginated format.<br><br>Note: If the response is expected to contain many large records, it is recommended to use `$top` to limit the number of records returned or to use the `$select` to select only the required fields.
     *
     * @tags Apps
     * @name AppsGetAppPolicies
     * @summary Get policies associated with this application
     * @request GET:/api/v4/Apps/{appId}/Policy
     * @secure
     * @response `200` `PolicyAssociationModelPageResultModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Apps_GetAppPolicies: (appId, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Apps/${appId}/Policy`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Apps
     * @name AppsAttachPolicy
     * @summary Associate a policy with an application or update association parameters
     * @request POST:/api/v4/Apps/{appId}/Policy/{policyId}
     * @secure
     * @response `200` `PolicyAssociationModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Apps_AttachPolicy: (appId, policyId, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Apps/${appId}/Policy/${policyId}`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Apps
     * @name AppsUpdatePolicy
     * @summary Update the policy parameters for this application
     * @request PUT:/api/v4/Apps/{appId}/Policy/{policyId}
     * @secure
     * @response `200` `PolicyAssociationModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Apps_UpdatePolicy: (appId, policyId, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Apps/${appId}/Policy/${policyId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Apps
     * @name AppsDeletePolicyAssociation
     * @summary Disassociate a policy from an application
     * @request DELETE:/api/v4/Apps/{appId}/Policy/{policyId}
     * @secure
     * @response `204` `void` No Content
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Apps_DeletePolicyAssociation: (appId, policyId, params = {}) =>
      this.http.request({
        path: `/api/v4/Apps/${appId}/Policy/${policyId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
    /**
     * @description This API endpoint allows you to retrieve data using the <a target='_blank' href='https://www.odata.org/documentation/'>OData V4</a> interface. The response will contain the requested data in a paginated format.<br><br>Note: If the response is expected to contain many large records, it is recommended to use `$top` to limit the number of records returned or to use the `$select` to select only the required fields.
     *
     * @tags AssetGroups
     * @name AssetGroupsGet
     * @summary Get Asset Groups
     * @request GET:/api/v4/AssetGroups
     * @secure
     * @response `200` `AssetGroupModelPageResultModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    AssetGroups_Get: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/AssetGroups`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags AssetGroups
     * @name AssetGroupsPost
     * @summary Create a new asset group
     * @request POST:/api/v4/AssetGroups
     * @secure
     * @response `201` `AssetGroupModel` Created
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    AssetGroups_Post: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/AssetGroups`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags AssetGroups
     * @name AssetGroupsDelete
     * @summary Delete asset group by ID
     * @request DELETE:/api/v4/AssetGroups/{id}
     * @secure
     * @response `204` `void` No Content
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    AssetGroups_Delete: (id, query, params = {}) =>
      this.http.request({
        path: `/api/v4/AssetGroups/${id}`,
        method: "DELETE",
        query: query,
        secure: true,
        ...params,
      }),
    /**
     * No description
     *
     * @tags AssetGroups
     * @name AssetGroupsPut
     * @summary Update an asset group
     * @request PUT:/api/v4/AssetGroups/{id}
     * @secure
     * @response `200` `AssetGroupModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    AssetGroups_Put: (id, data, params = {}) =>
      this.http.request({
        path: `/api/v4/AssetGroups/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags AssetGroups
     * @name AssetGroupsMove
     * @summary Move an asset group
     * @request POST:/api/v4/AssetGroups/MoveAssetGroupResources/{sourceId}/{destId}
     * @secure
     * @response `200` `AssetGroupModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    AssetGroups_Move: (sourceId, destId, data, params = {}) =>
      this.http.request({
        path: `/api/v4/AssetGroups/MoveAssetGroupResources/${sourceId}/${destId}`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * @description This API endpoint allows you to retrieve data using the <a target='_blank' href='https://www.odata.org/documentation/'>OData V4</a> interface. The response will contain the requested data in a paginated format.<br><br>Note: If the response is expected to contain many large records, it is recommended to use `$top` to limit the number of records returned or to use the `$select` to select only the required fields.
     *
     * @tags Audits
     * @name AuditsGet
     * @summary Get all the audits in the current context
     * @request GET:/api/v4/Audits
     * @secure
     * @response `200` `AuditModelPageResultModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Audits_Get: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/Audits`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Audits
     * @name AuditsGetAdditionalData
     * @summary Get audit additional data
     * @request GET:/api/v4/Audits/AdditionalData/{auditId}
     * @secure
     * @response `200` `(AuditAdditionalData)[]` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Audits_GetAdditionalData: (auditId, params = {}) =>
      this.http.request({
        path: `/api/v4/Audits/AdditionalData/${auditId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description This action returns all the organization's BusinessUnits
     *
     * @tags BusinessUnits
     * @name BusinessUnitsGet
     * @summary Get all BusinessUnits
     * @request GET:/api/v4/BusinessUnits
     * @secure
     * @response `200` `BusinessUnitModelPageResultModel` OK
     */
    BusinessUnits_Get: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/BusinessUnits`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags BusinessUnits
     * @name BusinessUnitsCreate
     * @summary Create a new BusinessUnit
     * @request POST:/api/v4/BusinessUnits
     * @secure
     * @response `200` `BusinessUnitModel` OK
     * @response `201` `void` Created
     * @response `400` `ErrorMessage` Bad Request
     * @response `403` `ErrorMessage` Forbidden
     * @response `409` `ErrorMessage` Conflict
     */
    BusinessUnits_Create: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/BusinessUnits`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags BusinessUnits
     * @name BusinessUnitsMerge
     * @summary Merge Business Units
     * @request POST:/api/v4/BusinessUnits/Merge/{idToKeep}/{idToMerge}
     * @secure
     * @response `200` `void` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `403` `ErrorMessage` Forbidden
     */
    BusinessUnits_Merge: (idToKeep, idToMerge, params = {}) =>
      this.http.request({
        path: `/api/v4/BusinessUnits/Merge/${idToKeep}/${idToMerge}`,
        method: "POST",
        secure: true,
        ...params,
      }),
    /**
     * No description
     *
     * @tags BusinessUnits
     * @name BusinessUnitsDelete
     * @summary Delete BusinessUnit
     * @request DELETE:/api/v4/BusinessUnits/{id}
     * @secure
     * @response `204` `void` BusinessUnit was deleted successfully
     * @response `400` `ErrorMessage` Bad Request
     * @response `403` `ErrorMessage` Forbidden
     */
    BusinessUnits_Delete: (id, params = {}) =>
      this.http.request({
        path: `/api/v4/BusinessUnits/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
    /**
     * No description
     *
     * @tags BusinessUnits
     * @name BusinessUnitsUpdate
     * @summary Update BusinessUnit
     * @request PUT:/api/v4/BusinessUnits/{id}
     * @secure
     * @response `200` `BusinessUnitModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `403` `ErrorMessage` Forbidden
     * @response `409` `ErrorMessage` Conflict
     */
    BusinessUnits_Update: (id, data, params = {}) =>
      this.http.request({
        path: `/api/v4/BusinessUnits/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags CustomFields
     * @name ApiV4CustomFields
     * @summary Adds a new custom field for the organization.
     * @request POST:/api/v4/CustomFields
     * @secure
     * @response `201` `CustomFieldResponseModel` Created
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `409` `ErrorMessage` Conflict
     * @response `500` `ErrorMessage` Internal Server Error
     */
    "/api/v4/CustomFields": (data, params = {}) =>
      this.http.request({
        path: `/api/v4/CustomFields`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags CustomFields
     * @name ApiV4CustomFields2
     * @summary Get all custom fields for a specific organization
     * @request GET:/api/v4/CustomFields
     * @originalName /api/v4/CustomFields
     * @duplicate
     * @secure
     * @response `200` `void` Returns the list of custom fields
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Organization not found or no custom fields defined
     * @response `500` `ErrorMessage` Internal Server Error
     */
    "/api/v4/CustomFields2": (params = {}) =>
      this.http.request({
        path: `/api/v4/CustomFields`,
        method: "GET",
        secure: true,
        ...params,
      }),
    /**
     * No description
     *
     * @tags CustomFields
     * @name ApiV4CustomFieldsId
     * @summary Updates either the `HelpText` or `Name` of a custom field identified by `Id`.
     * @request PUT:/api/v4/CustomFields/{id}
     * @secure
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `409` `ErrorMessage` Conflict
     * @response `500` `ErrorMessage` Internal Server Error
     */
    "/api/v4/CustomFields/{id}": (id, data, params = {}) =>
      this.http.request({
        path: `/api/v4/CustomFields/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
    /**
     * No description
     *
     * @tags CustomFields
     * @name ApiV4CustomFieldsId2
     * @summary Deletes a custom field from the organization by its Id.
     * @request DELETE:/api/v4/CustomFields/{id}
     * @originalName /api/v4/CustomFields/{id}
     * @duplicate
     * @secure
     * @response `200` `void` Custom field deleted successfully.
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Organization or custom field not found.
     * @response `500` `ErrorMessage` Internal Server Error.
     */
    "/api/v4/CustomFields/{id}2": (id, params = {}) =>
      this.http.request({
        path: `/api/v4/CustomFields/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
    /**
     * @description **Example Request:** ```http DELETE /api/orgcustomfields/deleteByOrgId/ ``` **Example Response:** ```json { "message": "Successfully deleted all custom fields for organization." } ```
     *
     * @tags CustomFields
     * @name ApiV4CustomFieldsDeleteAllCustomFields
     * @summary Deletes all OrgCustomFields and their associated AppCustomFields for the organization.
     * @request DELETE:/api/v4/CustomFields/DeleteAllCustomFields
     * @secure
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    "/api/v4/CustomFields/DeleteAllCustomFields": (params = {}) =>
      this.http.request({
        path: `/api/v4/CustomFields/DeleteAllCustomFields`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
    /**
     * @description This API endpoint allows you to retrieve data using the <a target='_blank' href='https://www.odata.org/documentation/'>OData V4</a> interface. The response will contain the requested data in a paginated format.<br><br>Note: If the response is expected to contain many large records, it is recommended to use `$top` to limit the number of records returned or to use the `$select` to select only the required fields.
     *
     * @tags Domains
     * @name DomainsGet
     * @summary Get domains
     * @request GET:/api/v4/Domains
     * @secure
     * @response `200` `DomainModelPageResultModel` OK
     */
    Domains_Get: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/Domains`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Domains
     * @name DomainsUpdate
     * @summary Update domain
     * @request PUT:/api/v4/Domains/{id}
     * @secure
     * @response `200` `DomainModel` OK
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Domains_Update: (id, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Domains/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Domains
     * @name DomainsMultipleDelete
     * @summary Delete domains
     * @request DELETE:/api/v4/Domains/DeleteDomains
     * @secure
     * @response `200` `DeleteDomainsResult` OK
     * @response `204` `void` Domain was deleted successfully
     * @response `207` `DeleteDomainsResult` Multi-Status
     * @response `403` `DeleteDomainsResult` Forbidden
     * @response `404` `DeleteDomainsResult` Not Found
     * @response `500` `DeleteDomainsResult` Internal Server Error
     */
    Domains_Multiple_Delete: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/Domains/DeleteDomains`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Domains
     * @name DomainsResendMail
     * @summary Resend domain verification mail
     * @request GET:/api/v4/Domains/ResendMail/{id}
     * @secure
     * @response `200` `void` Success, mail was sent
     * @response `401` `ProblemDetails` Unauthorized
     * @response `403` `ErrorMessage` Invalid operation
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Domains_ResendMail: (id, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Domains/ResendMail/${id}`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
    /**
     * No description
     *
     * @tags Domains
     * @name DomainsDownloadFile
     * @summary Download domain verification HTML
     * @request POST:/api/v4/Domains/DownloadFile/{id}
     * @secure
     * @response `200` `void` Success
     * @response `401` `ProblemDetails` Unauthorized
     * @response `403` `ErrorMessage` Invalid operation
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Domains_DownloadFile: (id, params = {}) =>
      this.http.request({
        path: `/api/v4/Domains/DownloadFile/${id}`,
        method: "POST",
        secure: true,
        ...params,
      }),
    /**
     * No description
     *
     * @tags Domains
     * @name DomainsVerify
     * @summary Performs domain ownership verification
     * @request POST:/api/v4/Domains/Verify
     * @secure
     * @response `200` `boolean` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `ProblemDetails` Unauthorized
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Domains_Verify: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/Domains/Verify`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Domains
     * @name DomainsConfirm
     * @summary Confirm domain ownership by domain id
     * @request GET:/api/v4/Domains/Confirm/{verificationKey}
     * @secure
     * @response `200` `void` OK
     */
    Domains_Confirm: (verificationKey, params = {}) =>
      this.http.request({
        path: `/api/v4/Domains/Confirm/${verificationKey}`,
        method: "GET",
        secure: true,
        ...params,
      }),
    /**
     * No description
     *
     * @tags Domains
     * @name DomainsRegister
     * @summary Create domain ownership verification either by Mail or HTML
     * @request POST:/api/v4/Domains/Register/{registrationType}
     * @secure
     * @response `200` `void` OK
     */
    Domains_Register: (registrationType, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Domains/Register/${registrationType}`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
    /**
     * No description
     *
     * @tags Domains
     * @name DomainsAllow
     * @summary Allow domain
     * @request POST:/api/v4/Domains/Allow
     * @secure
     * @response `200` `AllowDomainResult` OK
     * @response `400` `void` Bad Request
     * @response `403` `void` Forbidden
     */
    Domains_Allow: (data, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Domains/Allow`,
        method: "POST",
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Domains
     * @name DomainsBlock
     * @summary block domains
     * @request POST:/api/v4/Domains/Block
     * @secure
     * @response `200` `DomainModel` OK
     * @response `400` `void` Bad Request
     * @response `403` `void` Forbidden
     * @response `404` `void` Not Found
     */
    Domains_Block: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/Domains/Block`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * @description Upload a file to use in actions that require files (such as Create Scan and Execute Scan). Supported file formats: APK, CONFIG, CSV, IPA, IRX, SCAN, SCANT and ZIP. If ZIP file is uploaded 'fileType' parameter is required, and it must contain only DAST XML. Returns an ID for use as input for the other actions. Includes file format validation. The expected Content-Type of the request is multipart/form-data. The request should contain a single file parameter named "uploadedFile". The uploaded file will be available for use for 30 minutes. After this period, the file will be deleted from the server
     *
     * @tags FileUpload
     * @name FileUploadPost
     * @summary Upload file
     * @request POST:/api/v4/FileUpload
     * @secure
     * @response `200` `UploadViewModel` OK
     * @response `201` `void` Created
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `413` `ErrorMessage` Content Too Large
     * @response `500` `ErrorMessage` Internal Server Error
     */
    FileUpload_Post: (data, query, params = {}) =>
      this.http.request({
        path: `/api/v4/FileUpload`,
        method: "POST",
        query: query,
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
    /**
     * @description This API endpoint allows you to retrieve data using the <a target='_blank' href='https://www.odata.org/documentation/'>OData V4</a> interface. The response will contain the requested data in a paginated format.<br><br>Note: If the response is expected to contain many large records, it is recommended to use `$top` to limit the number of records returned or to use the `$select` to select only the required fields.
     *
     * @tags FixGroups
     * @name FixGroupsGet
     * @summary Get fix groups in scope
     * @request GET:/api/v4/FixGroups/{scope}/{scopeId}
     * @secure
     * @response `200` `FixGroupPageResultModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    FixGroups_Get: (scope, scopeId, query, params = {}) =>
      this.http.request({
        path: `/api/v4/FixGroups/${scope}/${scopeId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description The StickyStatus parameter determines how the new Status affects issues in the FixGroup. If StickyStatus is False, the Status you set affects only issues in the FixGroup that are filtered-in by the scope and policy. If StickyStatus is True, the Status is applied to all issues in the FixGroup (scope and policy are ignored), including new issues that become associated with it later.
     *
     * @tags FixGroups
     * @name FixGroupsUpdate
     * @summary Update a fix group according to a given scope
     * @request PUT:/api/v4/FixGroups/{scope}/{scopeId}/{fixGroupId}
     * @secure
     * @response `200` `TriageResult` OK
     * @response `400` `ErrorMessage` Invalid request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    FixGroups_Update: (scope, scopeId, fixGroupId, data, query, params = {}) =>
      this.http.request({
        path: `/api/v4/FixGroups/${scope}/${scopeId}/${fixGroupId}`,
        method: "PUT",
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * @description This API endpoint allows you to retrieve data using the <a target='_blank' href='https://www.odata.org/documentation/'>OData V4</a> interface. The response will contain the requested data in a paginated format.<br><br>Note: If the response is expected to contain many large records, it is recommended to use `$top` to limit the number of records returned or to use the `$select` to select only the required fields.
     *
     * @tags FixGroups
     * @name FixGroupsGetComments
     * @summary Get all fixGroup's comments
     * @request GET:/api/v4/FixGroups/{fixGroupId}/Comments
     * @secure
     * @response `200` `CommentModelResponsePageResultModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    FixGroups_GetComments: (fixGroupId, query, params = {}) =>
      this.http.request({
        path: `/api/v4/FixGroups/${fixGroupId}/Comments`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description This API endpoint allows you to retrieve data using the <a target='_blank' href='https://www.odata.org/documentation/'>OData V4</a> interface. The response will contain the requested data in a paginated format.<br><br>Note: If the response is expected to contain many large records, it is recommended to use `$top` to limit the number of records returned or to use the `$select` to select only the required fields.
     *
     * @tags Issues
     * @name IssuesGet
     * @summary Get filtered issues
     * @request GET:/api/v4/Issues/{scope}/{scopeId}
     * @secure
     * @response `200` `IssueModelPageResultModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Issues_Get: (scope, scopeId, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Issues/${scope}/${scopeId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description The NUpdatedIssues value in the response counts only issues whose the status was updated.
     *
     * @tags Issues
     * @name IssuesUpdateFilteredIssues
     * @summary Update filtered issues
     * @request PUT:/api/v4/Issues/{scope}/{scopeId}
     * @secure
     * @response `200` `TriageResult` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Issues_UpdateFilteredIssues: (scope, scopeId, data, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Issues/${scope}/${scopeId}`,
        method: "PUT",
        query: query,
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Issues
     * @name IssuesGetIssue
     * @summary Get a single issue
     * @request GET:/api/v4/Issues/{issueId}
     * @secure
     * @response `200` `IssueModel` OK
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Issues_GetIssue: (issueId, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Issues/${issueId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description This API endpoint allows you to retrieve data using the <a target='_blank' href='https://www.odata.org/documentation/'>OData V4</a> interface. The response will contain the requested data in a paginated format.<br><br>Note: If the response is expected to contain many large records, it is recommended to use `$top` to limit the number of records returned or to use the `$select` to select only the required fields.
     *
     * @tags Issues
     * @name IssuesGetIssueComments
     * @summary Get all fixGroup's comments
     * @request GET:/api/v4/Issues/{issueId}/Comments
     * @secure
     * @response `200` `CommentModelResponsePageResultModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Issues_GetIssueComments: (issueId, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Issues/${issueId}/Comments`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Issues
     * @name IssuesIssueDetails
     * @summary Get the issue details in html or xml format.
     * @request GET:/api/v4/Issues/{issueId}/Details
     * @secure
     * @response `200` `File` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Issues_IssueDetails: (issueId, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Issues/${issueId}/Details`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Issues
     * @name IssuesGetIssueHistory
     * @summary Get issue history
     * @request GET:/api/v4/Issues/{issueId}/History
     * @secure
     * @response `200` `(IssueChangeSet)[]` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` User is not allowed to access the issue or issue does not exist
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Issues_GetIssueHistory: (issueId, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Issues/${issueId}/History`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Issues
     * @name IssuesImportIssues
     * @summary Import issues from uploaded file to application specified with id
     * @request POST:/api/v4/Issues/ImportIssues
     * @secure
     * @response `200` `ImportIssueStatusModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Issues_ImportIssues: (query, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Issues/ImportIssues`,
        method: "POST",
        query: query,
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Issues
     * @name IssuesReplayScript
     * @summary Get the replay script in file.
     * @request GET:/api/v4/Issues/{issueId}/ReplayScript
     * @secure
     * @response `200` `File` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `402` `ErrorMessage` Payment Required
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Issues_ReplayScript: (issueId, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Issues/${issueId}/ReplayScript`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags OrgSettings
     * @name OrgSettingsGetReportCustomization
     * @summary Get Report Customization
     * @request GET:/api/v4/OrgSettings/ReportCustomization
     * @secure
     * @response `200` `ReportCustomizationModel` OK
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    OrgSettings_GetReportCustomization: (params = {}) =>
      this.http.request({
        path: `/api/v4/OrgSettings/ReportCustomization`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags OrgSettings
     * @name OrgSettingsUpdateReportCustomization
     * @summary Report Customization
     * @request PUT:/api/v4/OrgSettings/ReportCustomization
     * @secure
     * @response `200` `ReportCustomizationModel` OK
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    OrgSettings_UpdateReportCustomization: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/OrgSettings/ReportCustomization`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
       * @description This API endpoint allows you to retrieve data using the <a target='_blank' href='https://www.odata.org/documentation/'>OData V4</a> interface. The response will contain the requested data in a paginated format.<br><br>Note: If the response is expected to contain many large records, it is recommended to use `$top` to limit the number of records returned or to use the `$select` to select only the required fields.
       *
       * @tags Policies
       * @name PoliciesGet
       * @summary Get all policies.
      The API returns both predefined and custom policies.
       * @request GET:/api/v4/Policies
       * @secure
       * @response `200` `PolicyModelPageResultModel` OK
       * @response `400` `ErrorMessage` Bad Request
       * @response `401` `void` Unauthorized
       * @response `500` `ErrorMessage` Internal Server Error
       */
    Policies_Get: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/Policies`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Policies
     * @name PoliciesPost
     * @summary Create a new custom policy
     * @request POST:/api/v4/Policies
     * @secure
     * @response `200` `PolicyModel` OK
     * @response `201` `void` Policy was created successfully
     * @response `400` `ErrorMessage` Bad request
     * @response `403` `ErrorMessage` User is not authorized
     * @response `409` `ErrorMessage` Policy name already exist
     */
    Policies_Post: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/Policies`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Policies
     * @name PoliciesUpdate
     * @summary Update custom policy
     * @request PUT:/api/v4/Policies/{id}
     * @secure
     * @response `200` `PolicyModel` Policy was successfully updated
     * @response `403` `ErrorMessage` Invalid policy ID
     */
    Policies_Update: (id, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Policies/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Policies
     * @name PoliciesDelete
     * @summary Delete custom policy
     * @request DELETE:/api/v4/Policies/{id}
     * @secure
     * @response `204` `void` Policy was successfully deleted
     * @response `403` `ErrorMessage` Invalid policy ID
     */
    Policies_Delete: (id, params = {}) =>
      this.http.request({
        path: `/api/v4/Policies/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
    /**
     * @description This action returns all the presences that can be accessed using the provided access token
     *
     * @tags Presences
     * @name PresencesGet
     * @summary Get all the Presences in the current context
     * @request GET:/api/v4/Presences
     * @secure
     * @response `200` `PresencePageResultModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Presences_Get: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/Presences`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Presences
     * @name PresencesPost
     * @summary Create a new Presence
     * @request POST:/api/v4/Presences
     * @secure
     * @response `200` `Presence` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Presences_Post: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/Presences`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Presences
     * @name PresencesDelete
     * @summary Delete Presence
     * @request DELETE:/api/v4/Presences/{presenceId}
     * @secure
     * @response `204` `void` No Content
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Presences_Delete: (presenceId, params = {}) =>
      this.http.request({
        path: `/api/v4/Presences/${presenceId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
    /**
     * No description
     *
     * @tags Presences
     * @name PresencesUpdate
     * @summary Update Presence
     * @request PUT:/api/v4/Presences/{presenceId}
     * @secure
     * @response `204` `void` No Content
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Presences_Update: (presenceId, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Presences/${presenceId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
    /**
     * @description This action invalidates the previous key.
     *
     * @tags Presences
     * @name PresencesGenerateNewKey
     * @summary Generate a new key for the given presence and return it.
     * @request GET:/api/v4/Presences/{presenceId}/NewKey
     * @secure
     * @response `200` `File` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Presences_GenerateNewKey: (presenceId, params = {}) =>
      this.http.request({
        path: `/api/v4/Presences/${presenceId}/NewKey`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Presences
     * @name PresencesDownloadPresenceWithKey
     * @summary Download the AppScan Presence tool. Tool includes a new generated presence key
     * @request GET:/api/v4/Presences/{presenceId}/Download/{platform}
     * @secure
     * @response `200` `File` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Presences_DownloadPresenceWithKey: (presenceId, platform, params = {}) =>
      this.http.request({
        path: `/api/v4/Presences/${presenceId}/Download/${platform}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description This API endpoint allows you to retrieve data using the <a target='_blank' href='https://www.odata.org/documentation/'>OData V4</a> interface. The response will contain the requested data in a paginated format.<br><br>Note: If the response is expected to contain many large records, it is recommended to use `$top` to limit the number of records returned or to use the `$select` to select only the required fields.
     *
     * @tags Reports
     * @name ReportsGet
     * @summary Get report jobs
     * @request GET:/api/v4/Reports
     * @secure
     * @response `200` `ReportStatusModelPageResultModel` OK
     * @response `401` `void` Unauthorized
     */
    Reports_Get: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/Reports`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Reports
     * @name ReportsDownload
     * @summary Download a report
     * @request GET:/api/v4/Reports/{id}/Download
     * @secure
     * @response `200` `File` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Reports_Download: (id, params = {}) =>
      this.http.request({
        path: `/api/v4/Reports/${id}/Download`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description Created in JSON format. Full details of all issues in scope. Policies and OData filters can be applied. If policies are applied, the report will contain only issues that are not compliant with these policies.
     *
     * @tags Reports
     * @name ReportsCreateIssuesReport
     * @summary Create issues report for selected issues
     * @request POST:/api/v4/Reports/Issues/{scope}/{id}
     * @secure
     * @response `200` `ReportStatusModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Reports_CreateIssuesReport: (scope, id, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Reports/Issues/${scope}/${id}`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * @description PDF, HTML, XML, CSV or SARIF format. Policies and OData filters can be applied. If policies are applied, the report will contain only issues that are not compliant with these policies.
     *
     * @tags Reports
     * @name ReportsCreateSecurityReport
     * @summary Create security report for selected issues
     * @request POST:/api/v4/Reports/Security/{scope}/{id}
     * @secure
     * @response `200` `ReportStatusModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Reports_CreateSecurityReport: (scope, id, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Reports/Security/${scope}/${id}`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * @description Supports only PDF or HTML format. Policies and OData filters can be applied. If policies are applied, the report will contain only issues that are not compliant with these policies. RegulationType must be on of: OwaspTop10_2017, Sans25, EuGdpr_2016, PCI, Hipaa, OwaspTop10Mobile_2016, ISO27001, ISO27002, Wasc, Nist, Sox, Fisma, Fippa, Efta, DisaStig, Padss, OwaspTop10_2021, OwaspTop10OpenApi_2019, Ccpa, FedRamp, Popia, OwaspTop10Api_2023, Sans25_2023, OwaspTop10CloudNativeApp, Nis2
     *
     * @tags Reports
     * @name ReportsCreateRegulationReport
     * @summary Create regulation report for selected issues
     * @request POST:/api/v4/Reports/Regulation/{scope}/{id}
     * @secure
     * @response `200` `ReportStatusModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Reports_CreateRegulationReport: (scope, id, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Reports/Regulation/${scope}/${id}`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * @description Supports only PDF or HTML format. OData filters can be applied.
     *
     * @tags Reports
     * @name ReportsCreateLicenseReport
     * @summary Create open source licenses report
     * @request POST:/api/v4/Reports/License/{scope}/{id}
     * @secure
     * @response `200` `ReportStatusModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Reports_CreateLicenseReport: (scope, id, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Reports/License/${scope}/${id}`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Reports
     * @name ReportsCreateSbomReport
     * @summary Create SBOM report for a scan execution
     * @request POST:/api/v4/Reports/Sbom/{scanExecutionId}
     * @secure
     * @response `200` `ReportStatusModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Reports_CreateSbomReport: (scanExecutionId, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Reports/Sbom/${scanExecutionId}`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Reports
     * @name ReportsDelete
     * @summary Delete a report
     * @request DELETE:/api/v4/Reports/{id}
     * @secure
     * @response `204` `void` Report was deleted successfully
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Reports_Delete: (id, params = {}) =>
      this.http.request({
        path: `/api/v4/Reports/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
    /**
     * No description
     *
     * @tags Reports
     * @name ReportsGetArticle
     * @summary Get Article according to embedded Omnia link format, using Issue type ID or Article ID.
     * @request GET:/api/v4/Reports/Article
     * @secure
     * @response `200` `void` OK
     * @response `404` `ErrorMessage` Not Found
     */
    Reports_GetArticle: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/Reports/Article`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
    /**
     * @description This action returns all the organization's roles
     *
     * @tags Roles
     * @name RolesGet
     * @summary Get all tenant roles
     * @request GET:/api/v4/Roles
     * @secure
     * @response `200` `RoleModelPageResultModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Roles_Get: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/Roles`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Roles
     * @name RolesCreate
     * @summary Create a new role
     * @request POST:/api/v4/Roles
     * @secure
     * @response `200` `RoleModel` OK
     * @response `201` `void` Created
     * @response `400` `ErrorMessage` Bad Request
     * @response `403` `ErrorMessage` Forbidden
     * @response `409` `ErrorMessage` Conflict
     */
    Roles_Create: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/Roles`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Roles
     * @name RolesDelete
     * @summary Delete Role
     * @request DELETE:/api/v4/Roles/{id}
     * @secure
     * @response `204` `void` Role was deleted successfully
     * @response `400` `ErrorMessage` Bad Request
     * @response `403` `ErrorMessage` Forbidden
     * @response `409` `ErrorMessage` Conflict
     */
    Roles_Delete: (id, params = {}) =>
      this.http.request({
        path: `/api/v4/Roles/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
    /**
     * No description
     *
     * @tags Roles
     * @name RolesUpdate
     * @summary Update Role
     * @request PUT:/api/v4/Roles/{id}
     * @secure
     * @response `200` `RoleModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `403` `ErrorMessage` Forbidden
     * @response `409` `ErrorMessage` Conflict
     */
    Roles_Update: (id, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Roles/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * @description This API endpoint allows you to retrieve data using the <a target='_blank' href='https://www.odata.org/documentation/'>OData V4</a> interface. The response will contain the requested data in a paginated format.<br><br>Note: If the response is expected to contain many large records, it is recommended to use `$top` to limit the number of records returned or to use the `$select` to select only the required fields.
     *
     * @tags Scans
     * @name ScansGet
     * @summary Get scans page
     * @request GET:/api/v4/Scans
     * @secure
     * @response `200` `MinScanModelPageResultModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Scans_Get: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansUpdate
     * @summary Modify scan data
     * @request PUT:/api/v4/Scans/{scanId}
     * @secure
     * @response `204` `void` No Content
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Scans_Update: (scanId, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/${scanId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
    /**
     * @description Note that all ScanExecutions associated with this scan will be deleted too.
     *
     * @tags Scans
     * @name ScansDelete
     * @summary Delete the scan
     * @request DELETE:/api/v4/Scans/{scanId}
     * @secure
     * @response `204` `void` No Content
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Scans_Delete: (scanId, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/${scanId}`,
        method: "DELETE",
        query: query,
        secure: true,
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansUpdateDastScan
     * @summary Update full DAST scan
     * @request PUT:/api/v4/Scans/Dast/{scanId}
     * @secure
     * @response `200` `DastScanModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Scans_UpdateDastScan: (scanId, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/Dast/${scanId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansGetDastScan
     * @summary Get detailed description of a Dynamic scan
     * @request GET:/api/v4/Scans/Dast/{scanId}
     * @secure
     * @response `200` `DastScanModel` OK
     */
    Scans_GetDastScan: (scanId, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/Dast/${scanId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansPromoteIssues
     * @summary Promote personal scan's issues to the application level
     * @request POST:/api/v4/Scans/{scanId}/PromoteIssues
     * @secure
     * @response `200` `IssueMergeModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Scans_PromoteIssues: (scanId, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/${scanId}/PromoteIssues`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansDeleteScanExecutions
     * @summary Delete all scan executions
     * @request DELETE:/api/v4/Scans/{scanId}/Executions
     * @secure
     * @response `204` `void` No Content
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Scans_DeleteScanExecutions: (scanId, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/${scanId}/Executions`,
        method: "DELETE",
        query: query,
        secure: true,
        ...params,
      }),
    /**
     * @description Execute the scan specified by ID. If the execution requires a new file (Sca Analyzer or Static Analyzer), the file must first be uploaded (using <a href="#!/FileUpload/FileUpload_DefaultAction" target="_blank">/api/v2/FileUpload</a>). Then use the ID that is returned from the upload in the ```FileId``` parameter.
     *
     * @tags Scans
     * @name ScansExecute
     * @summary Execute a scan
     * @request POST:/api/v4/Scans/{scanId}/Executions
     * @secure
     * @response `201` `ScanExecutionModel` New Scan was created successfully
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Scans_Execute: (scanId, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/${scanId}/Executions`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * @description This API endpoint allows you to retrieve data using the <a target='_blank' href='https://www.odata.org/documentation/'>OData V4</a> interface. The response will contain the requested data in a paginated format.<br><br>Note: If the response is expected to contain many large records, it is recommended to use `$top` to limit the number of records returned or to use the `$select` to select only the required fields.
     *
     * @tags Scans
     * @name ScansGetExecutions
     * @summary Get basic details of all the executions of a scan
     * @request GET:/api/v4/Scans/{scanId}/Executions
     * @secure
     * @response `200` `(GeneralScanExecutionModel)[]` OK
     * @response `403` `ProblemDetails` Forbidden
     */
    Scans_GetExecutions: (scanId, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/${scanId}/Executions`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description Scan can be performed in one of the following options: 1. Generate an IRX file using the IRX tool, and upload it (using /api/v4/FileUpload). Use the ID that is returned from the upload in the ```ApplicationFileId``` parameter. 2. Scanning a git repository - provide the repository details in the ```RepositoryDetails```. You should use one of the options, not both. Note that when scanning a git repository, you can provide ```Recurrence``` to set a scheduled scan executions.
     *
     * @tags Scans
     * @name ScansCreateSastScan
     * @summary Create and execute a new Static Analyzer scan
     * @request POST:/api/v4/Scans/Sast
     * @secure
     * @response `201` `SastScanModel` Created
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Scans_CreateSastScan: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/Sast`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * @description Before creating a new scan, generate an IRX file using the <a href="#/Tools/Tools_SAClientUtil" target="_blank">IRX tool</a>, and upload it (using <a href="#/FileUpload/FileUpload_Post" target="_blank">/api/v4/FileUpload</a>). Use the ID that is returned from the upload in the ```ApplicationFileId``` parameter.
     *
     * @tags Scans
     * @name ScansCreateScaScan
     * @summary Create and execute a new SCA scan
     * @request POST:/api/v4/Scans/Sca
     * @secure
     * @response `201` `ScaScanModel` New Scan was created successfully1
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Scans_CreateScaScan: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/Sca`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansCreateIastScan
     * @summary Create and execute a new IAST Analyzer scan
     * @request POST:/api/v4/Scans/Iast
     * @secure
     * @response `201` `IastScanModel` Created
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Scans_CreateIastScan: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/Iast`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * @description Create a new Dast Scan <ul><li>Some of the properties accept file ids - for using these properties, you have to upload the file using /api/v4/FileUpload before using this function. When uploading a file, a file id is returned.</li><li>If a Presence is not being used, all the scanned domains must be verified before creating the scan.</li><li>If a scan or scan template file is provided (in ScanOrTemplateFileId), the scan configuration is taken from there and ScanConfiguration and ScanTemplateId cannot be provided.</li><li>If ScanTemplateId provided then, the scan configuration is taken from there (and optionally from ScanConfiguration) and ScanOrTemplateFileId cannot be provided.</li></ul>
     *
     * @tags Scans
     * @name ScansCreateDastScan
     * @summary Create and execute a new Dynamic Analyzer scan
     * @request POST:/api/v4/Scans/Dast
     * @secure
     * @response `201` `DastScanModel` Created
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Scans_CreateDastScan: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/Dast`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansGetExecutionRawResults
     * @summary Download raw engine results
     * @request GET:/api/v4/Scans/ExecutionRawResults/{executionId}
     * @secure
     * @response `200` `File` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Scans_GetExecutionRawResults: (executionId, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/ExecutionRawResults/${executionId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansGetExploreDataCounters
     * @summary Get Explore Data Counters
     * @request GET:/api/v4/Scans/DastExploreDataCounters/{executionId}
     * @secure
     * @response `200` `ExploreDataCounters` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Scans_GetExploreDataCounters: (executionId, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/DastExploreDataCounters/${executionId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description Currently available for Dynamic/Static scans only. TrafficLog is available only for Dast scans.
     *
     * @tags Scans
     * @name ScansGetScanLogs
     * @summary Download scan's log
     * @request GET:/api/v4/Scans/ScanLogs/{scanId}
     * @secure
     * @response `200` `File` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Scans_GetScanLogs: (scanId, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/ScanLogs/${scanId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description Available for 360 DAST scans only.
     *
     * @tags Scans
     * @name ScansGetLiveLog
     * @summary Download scan execution's live log
     * @request GET:/api/v4/Scans/LiveLog/{executionId}
     * @secure
     * @response `200` `File` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Scans_GetLiveLog: (executionId, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/LiveLog/${executionId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description Available for 360 DAST scans only.
     *
     * @tags Scans
     * @name ScansGetLiveLogTail
     * @summary Download scan execution's live log tail according to the requested tail size
     * @request GET:/api/v4/Scans/LiveLogTail/{executionId}
     * @secure
     * @response `200` `File` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Scans_GetLiveLogTail: (executionId, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/LiveLogTail/${executionId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansGetDastScanFile
     * @summary Get scan file
     * @request GET:/api/v4/Scans/DastScanFile/{executionId}
     * @secure
     * @response `200` `File` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Scans_GetDastScanFile: (executionId, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/DastScanFile/${executionId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description Use: GET /api/v4/Scans/SastExecution/{executionId}
     *
     * @tags Scans
     * @name ScansGetStaticScanExecution
     * @summary Get details of a Static scan execution
     * @request GET:/api/v4/Scans/StaticExecution/{executionId}
     * @deprecated
     * @secure
     * @response `200` `SastScanExecutionModel` OK
     */
    Scans_GetStaticScanExecution: (executionId, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/StaticExecution/${executionId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansGetSastScanExecution
     * @summary Get details of a Static scan execution
     * @request GET:/api/v4/Scans/SastExecution/{executionId}
     * @secure
     * @response `200` `SastScanExecutionModel` OK
     */
    Scans_GetSastScanExecution: (executionId, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/SastExecution/${executionId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansUpdateSastScanExecution
     * @summary Updates the git branch name of a scan execution
     * @request PUT:/api/v4/Scans/SastExecution/{executionId}
     * @secure
     * @response `204` `void` No Content
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Scans_UpdateSastScanExecution: (executionId, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/SastExecution/${executionId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
    /**
     * @description Use: GET /api/v4/Scans/DastExecution/{executionId}
     *
     * @tags Scans
     * @name ScansGetDynamicScanExecution
     * @summary Get details of a Dynamic scan execution
     * @request GET:/api/v4/Scans/DynamicExecution/{executionId}
     * @deprecated
     * @secure
     * @response `200` `DastScanExecutionModel` OK
     */
    Scans_GetDynamicScanExecution: (executionId, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/DynamicExecution/${executionId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansGetDastExecution
     * @summary Get details of a Dynamic scan execution
     * @request GET:/api/v4/Scans/DastExecution/{executionId}
     * @secure
     * @response `200` `DastScanExecutionModel` OK
     */
    Scans_GetDastExecution: (executionId, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/DastExecution/${executionId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansGetScaScanExecution
     * @summary Get details of a Sca scan execution
     * @request GET:/api/v4/Scans/ScaExecution/{executionId}
     * @secure
     * @response `200` `ScaScanExecutionModel` OK
     */
    Scans_GetScaScanExecution: (executionId, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/ScaExecution/${executionId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description Please use: GET /api/v4/Scans/Dast/{scanId}
     *
     * @tags Scans
     * @name ScansGetDynamicScan
     * @summary Get detailed description of a Dynamic scan
     * @request GET:/api/v4/Scans/Dynamic/{scanId}
     * @deprecated
     * @secure
     * @response `200` `DastScanModel` OK
     */
    Scans_GetDynamicScan: (scanId, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/Dynamic/${scanId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description Please use: GET /api/v4/Scans/Sast/{scanId}
     *
     * @tags Scans
     * @name ScansGetStaticScan
     * @summary Get detailed description of a Static scan
     * @request GET:/api/v4/Scans/Static/{scanId}
     * @deprecated
     * @secure
     * @response `200` `SastScanModel` OK
     */
    Scans_GetStaticScan: (scanId, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/Static/${scanId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansGetSastScan
     * @summary Get detailed description of a Static scan
     * @request GET:/api/v4/Scans/Sast/{scanId}
     * @secure
     * @response `200` `SastScanModel` OK
     */
    Scans_GetSastScan: (scanId, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/Sast/${scanId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansUpdateSastScan
     * @summary Modify SAST scan data
     * @request PUT:/api/v4/Scans/Sast/{scanId}
     * @secure
     * @response `204` `void` The update was completed successfully
     * @response `400` `ErrorMessage` Invalid scan Id
     * @response `404` `ErrorMessage` Not Found
     */
    Scans_UpdateSastScan: (scanId, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/Sast/${scanId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansGetScaScan
     * @summary Get detailed description of a Sca scan
     * @request GET:/api/v4/Scans/Sca/{scanId}
     * @secure
     * @response `200` `ScaScanModel` OK
     */
    Scans_GetScaScan: (scanId, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/Sca/${scanId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansUpdateScaScan
     * @summary Modify SCA scan data
     * @request PUT:/api/v4/Scans/Sca/{scanId}
     * @secure
     * @response `204` `void` The update was completed successfully
     * @response `400` `ErrorMessage` Invalid scan Id
     * @response `404` `ErrorMessage` Not Found
     */
    Scans_UpdateScaScan: (scanId, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/Sca/${scanId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansUpdateIastScan
     * @summary Modify IAST scan data
     * @request PUT:/api/v4/Scans/Iast/{scanId}
     * @secure
     * @response `204` `void` The update was completed successfully
     * @response `400` `ErrorMessage` Invalid scan Id
     * @response `404` `ErrorMessage` Not Found
     */
    Scans_UpdateIastScan: (scanId, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/Iast/${scanId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansUpdateIastScanOld
     * @summary Modify IAST scan data
     * @request PUT:/api/v4/Scans/UpdateIastScan/{scanId}
     * @deprecated
     * @secure
     * @response `204` `void` The update was completed successfully
     * @response `400` `ErrorMessage` Invalid scan Id
     * @response `404` `ErrorMessage` Not Found
     */
    Scans_UpdateIastScan_old: (scanId, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/UpdateIastScan/${scanId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansGenerateNewIastKey
     * @summary Generate new key for the IAST agent
     * @request POST:/api/v4/Scans/NewIastKey/{scanId}
     * @secure
     * @response `201` `NewIASTKey` New key was created
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Invalid input
     */
    Scans_GenerateNewIastKey: (scanId, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/NewIastKey/${scanId}`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansDownloadIastConfig
     * @summary Download IAST cofiguration
     * @request GET:/api/v4/Scans/DownloadIastConfig/{scanId}
     * @secure
     * @response `200` `File` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `403` `ErrorMessage` Forbidden
     */
    Scans_DownloadIastConfig: (scanId, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/DownloadIastConfig/${scanId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansDeleteExecution
     * @summary Delete scan execution
     * @request DELETE:/api/v4/Scans/Execution/{executionId}
     * @secure
     * @response `204` `void` Scan Execution was deleted successfully
     * @response `403` `ErrorMessage` Forbidden
     */
    Scans_DeleteExecution: (executionId, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/Execution/${executionId}`,
        method: "DELETE",
        query: query,
        secure: true,
        ...params,
      }),
    /**
     * No description
     *
     * @tags Scans
     * @name ScansGetExecution
     * @summary Get basic details of a scan execution
     * @request GET:/api/v4/Scans/Execution/{executionId}
     * @secure
     * @response `200` `GeneralScanExecutionModel` OK
     * @response `204` `void` No Content
     * @response `403` `ErrorMessage` Forbidden
     */
    Scans_GetExecution: (executionId, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/Execution/${executionId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description Operations are available for certain technologies only: <b>Pause</b> - Pause a Dynamic scan <b>Resume</b> - Resume a Dynamic scan <b>Stop</b> - Stop an IAST scan
     *
     * @tags Scans
     * @name ScansExecutionAction
     * @summary Perform operations on a scan execution
     * @request PUT:/api/v4/Scans/Execution/{executionId}/{operation}
     * @secure
     * @response `200` `void` OK
     */
    Scans_ExecutionAction: (executionId, operation, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/Execution/${executionId}/${operation}`,
        method: "PUT",
        secure: true,
        ...params,
      }),
    /**
       * No description
       *
       * @tags Scans
       * @name ReposGetRepoSignature
       * @summary Get a signature for a given repository.
      This function verifies that the user actually has access to the repository.
      It does this by calling the GitHub API with the provided access token.
       * @request POST:/api/v4/Scans/RepoSignature/{platform}
       * @secure
       * @response `200` `RepoSignature` OK
       * @response `401` `void` Unauthorized
       * @response `404` `ErrorMessage` Not Found
       * @response `500` `ErrorMessage` Internal Server Error
       */
    Repos_GetRepoSignature: (platform, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Scans/RepoSignature/${platform}`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * @description This API endpoint allows you to retrieve data using the <a target='_blank' href='https://www.odata.org/documentation/'>OData V4</a> interface. The response will contain the requested data in a paginated format.<br><br>Note: If the response is expected to contain many large records, it is recommended to use `$top` to limit the number of records returned or to use the `$select` to select only the required fields.
     *
     * @tags ScanTemplates
     * @name ScanTemplatesGet
     * @summary Get scan templates
     * @request GET:/api/v4/ScanTemplates
     * @secure
     * @response `200` `ScanTemplateModelPageResultModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    ScanTemplates_Get: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/ScanTemplates`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags ScanTemplates
     * @name ScanTemplatesCreate
     * @summary Create scan template
     * @request POST:/api/v4/ScanTemplates
     * @secure
     * @response `200` `ScanTemplateModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    ScanTemplates_Create: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/ScanTemplates`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags ScanTemplates
     * @name ScanTemplatesGetScanTemplate
     * @summary Get a scan template
     * @request GET:/api/v4/ScanTemplates/{scanTemplateId}
     * @secure
     * @response `200` `ScanTemplateModel` OK
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    ScanTemplates_GetScanTemplate: (scanTemplateId, params = {}) =>
      this.http.request({
        path: `/api/v4/ScanTemplates/${scanTemplateId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags ScanTemplates
     * @name ScanTemplatesUpdate
     * @summary Update scan template
     * @request PUT:/api/v4/ScanTemplates/{scanTemplateId}
     * @secure
     * @response `200` `ScanTemplateModel` OK
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    ScanTemplates_Update: (scanTemplateId, data, params = {}) =>
      this.http.request({
        path: `/api/v4/ScanTemplates/${scanTemplateId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags ScanTemplates
     * @name ScanTemplatesDelete
     * @summary Delete scan template
     * @request DELETE:/api/v4/ScanTemplates/{scanTemplateId}
     * @secure
     * @response `204` `void` scan template was deleted successfully
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    ScanTemplates_Delete: (scanTemplateId, params = {}) =>
      this.http.request({
        path: `/api/v4/ScanTemplates/${scanTemplateId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
    /**
     * No description
     *
     * @tags ScanTemplates
     * @name ScanTemplatesDownloadTemplateFile
     * @summary Download scan template file
     * @request GET:/api/v4/ScanTemplates/DownloadTemplateFile/{scanTemplateId}
     * @secure
     * @response `200` `File` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    ScanTemplates_DownloadTemplateFile: (scanTemplateId, params = {}) =>
      this.http.request({
        path: `/api/v4/ScanTemplates/DownloadTemplateFile/${scanTemplateId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags ScanTemplates
     * @name ScanTemplatesGetDastConfiguration
     * @summary Get DAST configuration object
     * @request GET:/api/v4/ScanTemplates/GetDastConfiguration/{uploadedFileId}
     * @secure
     * @response `200` `DastTemplateConfiguration` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    ScanTemplates_GetDastConfiguration: (uploadedFileId, params = {}) =>
      this.http.request({
        path: `/api/v4/ScanTemplates/GetDastConfiguration/${uploadedFileId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
       * @description This API endpoint allows you to retrieve data using the <a target='_blank' href='https://www.odata.org/documentation/'>OData V4</a> interface. The response will contain the requested data in a paginated format.<br><br>Note: If the response is expected to contain many large records, it is recommended to use `$top` to limit the number of records returned or to use the `$select` to select only the required fields.
       *
       * @tags TestPolicies
       * @name TestPoliciesGet
       * @summary Get all org's test policies.
      The API returns both predefined and custom test policies.
       * @request GET:/api/v4/TestPolicies
       * @secure
       * @response `200` `TestPolicyModelPageResultModel` OK
       * @response `400` `ErrorMessage` Bad Request
       * @response `401` `void` Unauthorized
       * @response `500` `ErrorMessage` Internal Server Error
       */
    TestPolicies_Get: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/TestPolicies`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags TestPolicies
     * @name TestPoliciesPost
     * @summary Create a new custom test policy
     * @request POST:/api/v4/TestPolicies
     * @secure
     * @response `200` `TestPolicyModel` OK
     * @response `201` `void` Test Policy was created successfully
     * @response `400` `ErrorMessage` Bad request
     * @response `403` `ErrorMessage` User is not authorized
     * @response `409` `ErrorMessage` Test policy name already exist
     */
    TestPolicies_Post: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/TestPolicies`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags TestPolicies
     * @name TestPoliciesUpdate
     * @summary Update a custom test policy
     * @request PUT:/api/v4/TestPolicies/{id}
     * @secure
     * @response `200` `TestPolicyModel` Test policy updated successfully
     * @response `403` `ErrorMessage` Invalid test policy ID
     */
    TestPolicies_Update: (id, data, params = {}) =>
      this.http.request({
        path: `/api/v4/TestPolicies/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags TestPolicies
     * @name TestPoliciesDelete
     * @summary Delete a custom test policy
     * @request DELETE:/api/v4/TestPolicies/{id}
     * @secure
     * @response `204` `void` Test policy deleted successfully
     * @response `403` `ErrorMessage` Invalid test policy ID
     */
    TestPolicies_Delete: (id, params = {}) =>
      this.http.request({
        path: `/api/v4/TestPolicies/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
    /**
     * No description
     *
     * @tags TestPolicies
     * @name TestPoliciesSetDefault
     * @summary Set default test policy for org
     * @request POST:/api/v4/TestPolicies/SetDefault/{id}
     * @secure
     * @response `200` `TestPolicyModel` Test policy set as default successfully
     * @response `403` `ErrorMessage` Invalid test policy ID
     */
    TestPolicies_SetDefault: (id, params = {}) =>
      this.http.request({
        path: `/api/v4/TestPolicies/SetDefault/${id}`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags TestPolicies
     * @name TestPoliciesDownload
     * @summary Download a custom test policy for org
     * @request GET:/api/v4/TestPolicies/Download/{id}
     * @secure
     * @response `200` `File` Test policy set as default successfully
     * @response `400` `ErrorMessage` Bad request
     * @response `403` `ErrorMessage` Invalid test policy ID
     */
    TestPolicies_Download: (id, params = {}) =>
      this.http.request({
        path: `/api/v4/TestPolicies/Download/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Tools
     * @name ToolsGetPresenceV2
     * @summary Download Presence V2 package
     * @request GET:/api/v4/Tools/PresenceV2
     * @secure
     * @response `200` `File` OK
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Tools_GetPresenceV2: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/Tools/PresenceV2`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Tools
     * @name ToolsGetTrafficRecorder
     * @summary Download a Standalone Traffic Recorder - used for recording traffic for dast scans.
     * @request GET:/api/v4/Tools/TrafficRecorder/{platform}
     * @secure
     * @response `200` `File` OK
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Tools_GetTrafficRecorder: (platform, params = {}) =>
      this.http.request({
        path: `/api/v4/Tools/TrafficRecorder/${platform}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Tools
     * @name ToolsGetTrafficRecorderVersion
     * @summary Get Traffic Recorder version
     * @request GET:/api/v4/Tools/TrafficRecorderVersion/{platform}
     * @secure
     * @response `200` `HttpContent` OK
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Tools_GetTrafficRecorderVersion: (platform, params = {}) =>
      this.http.request({
        path: `/api/v4/Tools/TrafficRecorderVersion/${platform}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Tools
     * @name ToolsDownloadIastAgent
     * @summary Download IAST Agent
     * @request GET:/api/v4/Tools/IastAgent
     * @secure
     * @response `200` `File` OK
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Tools_DownloadIASTAgent: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/Tools/IastAgent`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description Note: This operation invalidates the previous key.
     *
     * @tags Tools
     * @name ToolsDownloadIastAgentWithKey
     * @summary Download IAST agent with access key.
     * @request GET:/api/v4/Tools/IastAgentWithKey
     * @secure
     * @response `200` `File` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `403` `ErrorMessage` Forbidden
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Tools_DownloadIASTAgentWithKey: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/Tools/IastAgentWithKey`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Tools
     * @name ToolsSaClientUtilByType
     * @summary Download latest Client Utilities.
     * @request GET:/api/v4/Tools/SAClientUtilByType
     * @secure
     * @response `200` `File` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Tools_SAClientUtilByType: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/Tools/SAClientUtilByType`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description This API endpoint allows you to retrieve data using the <a target='_blank' href='https://www.odata.org/documentation/'>OData V4</a> interface. The response will contain the requested data in a paginated format.<br><br>Note: If the response is expected to contain many large records, it is recommended to use `$top` to limit the number of records returned or to use the `$select` to select only the required fields.
     *
     * @tags User
     * @name UsersGet
     * @request GET:/api/v4/User
     * @secure
     * @response `200` `UserModelPageResultModel` OK
     * @response `400` `ErrorMessage` Bad Request
     * @response `401` `void` Unauthorized
     * @response `404` `ErrorMessage` Not Found
     * @response `500` `ErrorMessage` Internal Server Error
     */
    Users_Get: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/User`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags User
     * @name UsersUpdate
     * @summary Update user
     * @request PUT:/api/v4/User/{id}
     * @secure
     * @response `200` `UserModel` OK
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     */
    Users_Update: (id, data, params = {}) =>
      this.http.request({
        path: `/api/v4/User/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags User
     * @name UsersDelete
     * @summary Remove user from the current organization
     * @request DELETE:/api/v4/User/{id}
     * @secure
     * @response `204` `void` No Content
     * @response `401` `void` Unauthorized
     * @response `403` `ErrorMessage` Forbidden
     * @response `404` `ErrorMessage` Not Found
     */
    Users_Delete: (id, params = {}) =>
      this.http.request({
        path: `/api/v4/User/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
    /**
     * @description This action returns all the web hooks that can be accessed usingthe provided access token
     *
     * @tags Webhooks
     * @name WebhooksGet
     * @summary Get all Webhooks
     * @request GET:/api/v4/Webhooks
     * @secure
     * @response `200` `WebhookModelPageResultModel` OK
     */
    Webhooks_Get: (query, params = {}) =>
      this.http.request({
        path: `/api/v4/Webhooks`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description In order to create a Webhook for the entire Organization (does not belong to a specific AssetGroup), you should have the capability to access cross asset groups resources If the Webhook is not Global, you will have to associate it to a resource (AssetGroup or Application) after creation.
     *
     * @tags Webhooks
     * @name WebhooksCreate
     * @summary Create new Webhook
     * @request POST:/api/v4/Webhooks
     * @secure
     * @response `200` `WebhookModel` OK
     * @response `201` `void` New Webhook was created successfully
     * @response `400` `ErrorMessage` Bad Request
     * @response `403` `ErrorMessage` Forbidden
     */
    Webhooks_Create: (data, params = {}) =>
      this.http.request({
        path: `/api/v4/Webhooks`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * @description If a webhook is set to Global, it will affect all the relevant items that belong to the AssetGroup or to the Organization if the Webhook is defined in the organization level
     *
     * @tags Webhooks
     * @name WebhooksUpdate
     * @summary Update specified Webhook
     * @request PUT:/api/v4/Webhooks/{id}
     * @secure
     * @response `200` `WebhookModel` Webhook was updated successfully
     * @response `400` `ErrorMessage` Bad Request
     * @response `403` `ErrorMessage` Forbidden
     */
    Webhooks_Update: (id, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Webhooks/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * No description
     *
     * @tags Webhooks
     * @name WebhooksDelete
     * @summary Delete specified Webhook
     * @request DELETE:/api/v4/Webhooks/{id}
     * @secure
     * @response `204` `void` Webhook was deleted successfully
     * @response `400` `ErrorMessage` Bad Request
     * @response `403` `ErrorMessage` Not authorized
     */
    Webhooks_Delete: (id, params = {}) =>
      this.http.request({
        path: `/api/v4/Webhooks/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
    /**
     * @description A global Webhook is associated to the organization and therefore cannot have other associations.
     *
     * @tags Webhooks
     * @name WebhooksGetAssociations
     * @summary Get associations of a Webhook
     * @request GET:/api/v4/Webhooks/Associations/{id}
     * @secure
     * @response `200` `(WebhookAssociation)[]` OK
     * @response `400` `ErrorMessage` Bad Request
     */
    Webhooks_GetAssociations: (id, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Webhooks/Associations/${id}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description A global Webhook is associated to the organization and therefore cannot have other associations. In order to associate a Webhook to an Application or Assetgroup, you should have access to it
     *
     * @tags Webhooks
     * @name WebhooksCreateAssociation
     * @summary Create a new association to the specified Webhook
     * @request POST:/api/v4/Webhooks/Associations/{id}
     * @secure
     * @response `200` `WebhookAssociation` OK
     * @response `201` `void` New Webhook association was created successfully
     * @response `400` `ErrorMessage` Bad request
     * @response `403` `ErrorMessage` Not authorized
     */
    Webhooks_CreateAssociation: (id, data, params = {}) =>
      this.http.request({
        path: `/api/v4/Webhooks/Associations/${id}`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
    /**
     * @description In order to remove association you should have access to Scope object (Application or AssetGroup)
     *
     * @tags Webhooks
     * @name WebhooksDeleteAssociation
     * @summary Delete an association from the specified Webhook
     * @request DELETE:/api/v4/Webhooks/Associations/{id}
     * @secure
     * @response `201` `void` New Webhook association was created successfully
     * @response `204` `void` No Content
     * @response `400` `ErrorMessage` Bad request
     * @response `403` `ErrorMessage` Not authorized
     */
    Webhooks_DeleteAssociation: (id, query, params = {}) =>
      this.http.request({
        path: `/api/v4/Webhooks/Associations/${id}`,
        method: "DELETE",
        query: query,
        secure: true,
        ...params,
      }),
  };
}
