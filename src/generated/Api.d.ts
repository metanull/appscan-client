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

export interface AccessTokenData {
  Token?: string | null;
  /** @format date-time */
  Expire?: string;
}
export interface ActivationResult {
  /** @format uuid */
  TenantId?: string;
  OrgName?: string | null;
  ActivationStatus?: ActivationResultActivationStatusEnum;
  MHSError?: ActivationResultMhsErrorEnum;
  UserName?: string | null;
  SignedUsername?: string | null;
}
export interface AddMHSLicenseResult {
  MHSError?: AddMhsLicenseResultMhsErrorEnum;
}
export interface AllowDomainModel {
  /** @maxLength 256 */
  Description?: string | null;
  DomainUrl?: string | null;
  UrlType?: AllowDomainModelUrlTypeEnum;
  IsAccessLimitedForAssetGroups?: boolean;
  AssetGroupIds?: string[] | null;
}
export interface AllowDomainResult {
  Domain?: DomainModel;
  Message?: AllowDomainResultMessageEnum;
}
export interface ApiKey {
  /** @minLength 1 */
  KeyId: string;
  /**
   * @minLength 5
   * @maxLength 100
   */
  KeySecret: string;
}
export interface ApiKeyInfo {
  KeyId?: string | null;
  KeySecret?: string | null;
  /** @format date-time */
  CreatedAt?: string;
}
export interface AppCommentModel {
  SourceType?: AppCommentModelSourceTypeEnum;
  /** @format uuid */
  SourceId?: string;
  SourceName?: string | null;
  Comment?: string | null;
  /** @format date-time */
  DateCreated?: string;
  CreatedBy?: BasicUserInfo;
}
export interface AppCommentModelPageResultModel {
  Items?: AppCommentModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface AppCustomFieldModel {
  Value?: string | null;
  /** @format uuid */
  Id?: string;
}
export interface AppWithIssuesModel {
  Name?: string | null;
  /** @format uuid */
  Id?: string;
  /** @format int32 */
  IssuesCount?: number;
}
export interface ApplicationCreateModel {
  BusinessImpact?: ApplicationCreateModelBusinessImpactEnum;
  Url?: string | null;
  Description?: string | null;
  /** @format uuid */
  BusinessUnitId?: string | null;
  Type?: string | null;
  Technology?: string | null;
  TestingStatus?: ApplicationCreateModelTestingStatusEnum;
  Hosts?: string | null;
  CollateralDamagePotential?: ApplicationCreateModelCollateralDamagePotentialEnum;
  TargetDistribution?: ApplicationCreateModelTargetDistributionEnum;
  ConfidentialityRequirement?: ApplicationCreateModelConfidentialityRequirementEnum;
  IntegrityRequirement?: ApplicationCreateModelIntegrityRequirementEnum;
  AvailabilityRequirement?: ApplicationCreateModelAvailabilityRequirementEnum;
  Tester?: string | null;
  BusinessOwner?: string | null;
  DevelopmentContact?: string | null;
  PreferredOfferingType?: ApplicationCreateModelPreferredOfferingTypeEnum;
  AutoDeleteExceededScans?: boolean;
  PresencesIds?: string[] | null;
  UseOnlyAppPresences?: boolean;
  AddedToAssetGroupBy?: BasicUserInfo;
  /** @format date-time */
  AddedToAssetGroupAt?: string | null;
  AppCustomFields?: AppCustomFieldModel[] | null;
  /**
   * @minLength 0
   * @maxLength 64
   */
  Name: string;
  /** @format uuid */
  AssetGroupId: string;
}
export interface ApplicationElementsSettings {
  EnableAutomaticFormFill?: boolean | null;
}
export interface ApplicationModel {
  /** @format uuid */
  Id?: string;
  /**
   * @minLength 0
   * @maxLength 64
   */
  Name?: string | null;
  RiskRating?: ApplicationModelRiskRatingEnum;
  CustomFields?: CustomFieldModel[] | null;
  /** @format int32 */
  CriticalIssues?: number;
  /** @format int32 */
  HighIssues?: number;
  /** @format int32 */
  MediumIssues?: number;
  /** @format int32 */
  LowIssues?: number;
  /** @format int32 */
  InformationalIssues?: number;
  /** @format int32 */
  IssuesInProgress?: number;
  MaxSeverity?: ApplicationModelMaxSeverityEnum;
  CorrelationState?: ApplicationModelCorrelationStateEnum;
  /** @format int32 */
  RR_MaxSeverity?: number;
  /** @format uuid */
  AssetGroupId?: string;
  BusinessImpact?: ApplicationModelBusinessImpactEnum;
  Url?: string | null;
  Description?: string | null;
  BusinessUnit?: string | null;
  /** @format uuid */
  BusinessUnitId?: string | null;
  Type?: string | null;
  Technology?: string | null;
  TestingStatus?: ApplicationModelTestingStatusEnum;
  Hosts?: string | null;
  CollateralDamagePotential?: ApplicationModelCollateralDamagePotentialEnum;
  TargetDistribution?: ApplicationModelTargetDistributionEnum;
  ConfidentialityRequirement?: ApplicationModelConfidentialityRequirementEnum;
  IntegrityRequirement?: ApplicationModelIntegrityRequirementEnum;
  AvailabilityRequirement?: ApplicationModelAvailabilityRequirementEnum;
  Tester?: string | null;
  BusinessOwner?: string | null;
  DevelopmentContact?: string | null;
  PreferredOfferingType?: ApplicationModelPreferredOfferingTypeEnum;
  AssetGroupName?: string | null;
  /** @format date-time */
  DateCreated?: string;
  /** @format date-time */
  LastUpdated?: string;
  /** @format date-time */
  LastComment?: string | null;
  CreatedBy?: string | null;
  /** @format int32 */
  NewIssues?: number;
  /** @format int32 */
  OpenIssues?: number;
  /** @format int32 */
  TotalIssues?: number;
  OverallCompliance?: boolean | null;
  ComplianceStatuses?: ComplianceStatus[] | null;
  CanBeDeleted?: boolean;
  LockedToSubscription?: boolean;
  /** @format int32 */
  TotalScans?: number;
  /** @format int32 */
  NScanExecutions?: number;
  HasExceedingIssuesNumber?: boolean;
  HasExceedingScansNumber?: boolean;
  AutoDeleteExceededScans?: boolean;
  Presences?: Presence[] | null;
  UseOnlyAppPresences?: boolean;
  AddedToAssetGroupBy?: BasicUserInfo;
  /** @format date-time */
  AddedToAssetGroupAt?: string | null;
  ScanTechnologies?: ApplicationModelScanTechnologiesEnum;
}
export interface ApplicationModelPageResultModel {
  Items?: ApplicationModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface ApplicationResetModel {
  /** @default true */
  DeleteIssues?: boolean;
  /** @default false */
  DeleteScans?: boolean;
  /** @default false */
  DeleteChartsData?: boolean;
  /** @default false */
  ResetCustomFields?: boolean;
}
export interface ApplicationUpdateModel {
  /**
   * @minLength 0
   * @maxLength 64
   */
  Name?: string | null;
  /** @format uuid */
  AssetGroupId?: string;
  BusinessImpact?: ApplicationUpdateModelBusinessImpactEnum;
  Url?: string | null;
  Description?: string | null;
  /** @format uuid */
  BusinessUnitId?: string | null;
  Type?: string | null;
  Technology?: string | null;
  TestingStatus?: ApplicationUpdateModelTestingStatusEnum;
  Hosts?: string | null;
  CollateralDamagePotential?: ApplicationUpdateModelCollateralDamagePotentialEnum;
  TargetDistribution?: ApplicationUpdateModelTargetDistributionEnum;
  ConfidentialityRequirement?: ApplicationUpdateModelConfidentialityRequirementEnum;
  IntegrityRequirement?: ApplicationUpdateModelIntegrityRequirementEnum;
  AvailabilityRequirement?: ApplicationUpdateModelAvailabilityRequirementEnum;
  Tester?: string | null;
  BusinessOwner?: string | null;
  DevelopmentContact?: string | null;
  PreferredOfferingType?: ApplicationUpdateModelPreferredOfferingTypeEnum;
  AutoDeleteExceededScans?: boolean;
  PresencesIds?: string[] | null;
  UseOnlyAppPresences?: boolean;
  AddedToAssetGroupBy?: BasicUserInfo;
  /** @format date-time */
  AddedToAssetGroupAt?: string | null;
  AppCustomFields?: AppCustomFieldModel[] | null;
}
export interface AssetGroupModel {
  /** @format uuid */
  Id?: string;
  /**
   * @minLength 0
   * @maxLength 120
   */
  Name?: string | null;
  /** @format int32 */
  AppsCount?: number;
  /** @format int32 */
  UsersCount?: number;
  Description?: string | null;
  IsDefault?: boolean;
  ContactPerson?: BasicUserInfo;
  CreatedBy?: BasicUserInfo;
  /** @format date-time */
  CreatedAt?: string | null;
  IssuesStatusInheritance?: AssetGroupModelIssuesStatusInheritanceEnum;
  EnableIssuesAutoClose?: boolean | null;
  /** @format int32 */
  DomainsCount?: number;
  /** @format int32 */
  ScanTemplatesCount?: number;
}
export interface AssetGroupModelPageResultModel {
  Items?: AssetGroupModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface AssetGroupMoveModel {
  /** @default true */
  MoveUsers?: boolean;
  /** @default false */
  DeleteSourceAssetGroup?: boolean;
  /** @default false */
  MoveScanTemplates?: boolean;
}
export interface AssetGroupShortModel {
  /** @format uuid */
  Id?: string;
  /**
   * @minLength 0
   * @maxLength 120
   */
  Name?: string | null;
}
export interface AuditAdditionalData {
  Name?: string | null;
  OldValue?: string | null;
  NewValue?: string | null;
}
export interface AuditEffectedEntity {
  /** @format uuid */
  Id?: string;
  Name?: string | null;
  EntityType?: AuditEffectedEntityEntityTypeEnum;
}
export interface AuditModel {
  /** @format uuid */
  Id?: string;
  /** @format uuid */
  OrgId?: string;
  UserName?: string | null;
  UserEmail?: string | null;
  UserId?: string | null;
  /** @format date-time */
  ChangeTime?: string;
  Action?: AuditModelActionEnum;
  Activity?: AuditModelActivityEnum;
  EntityType?: AuditModelEntityTypeEnum;
  /** @format uuid */
  EntityId?: string | null;
  EntityName?: string | null;
  AffectedEntity1?: AuditEffectedEntity;
  AffectedEntity2?: AuditEffectedEntity;
}
export interface AuditModelPageResultModel {
  Items?: AuditModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface BasicCommentModel {
  Comment?: string | null;
  /** @format date-time */
  DateCreated?: string;
}
export interface BasicLicenseInfo {
  /** @format int64 */
  Id?: number;
  Name?: string | null;
}
export interface BasicRoleInfo {
  /** @format uuid */
  RoleId?: string | null;
  RoleName?: string | null;
  Capabilities?: Record<string, boolean>;
}
export interface BasicUserInfo {
  Id?: string | null;
  FirstName?: string | null;
  LastName?: string | null;
  UserName?: string | null;
  Email?: string | null;
}
export interface BlockDomainRequestModel {
  DomainModel?: BlockedDomainModel;
  Force?: boolean;
}
export interface BlockedDomainModel {
  /** @maxLength 256 */
  Description?: string | null;
  DomainUrl?: string | null;
  UrlType?: BlockedDomainModelUrlTypeEnum;
  IncludeSubDomains?: boolean;
}
export interface BusinessUnitModel {
  /** @format uuid */
  Id?: string;
  /**
   * @minLength 0
   * @maxLength 256
   */
  Name?: string | null;
  /** @format int32 */
  NumApplications?: number;
}
export interface BusinessUnitModelPageResultModel {
  Items?: BusinessUnitModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface CategoriesChartData {
  data?: CategoryData[] | null;
  pallette?: PalleteItem[] | null;
}
export interface CategoryData {
  category?: string | null;
  dataPoints?: DataPoint[] | null;
}
export interface Change {
  Property?: string | null;
  OldValue?: string | null;
  NewValue?: string | null;
}
export interface ChangeSetAndScanInfo {
  Changes?: Change[] | null;
  /** @format date-time */
  ChangedAt?: string;
  ChangedBy?: BasicUserInfo;
  ScanExecution?: ScanExecutionInfo;
}
export interface ChartAppsFilterAndTimeFrame {
  AppsFilter?: ChartAppsFilterModel;
  ChartTimeFrame?: TimeFrame;
}
export interface ChartAppsFilterModel {
  /** @maxItems 100 */
  AssetGroups?: string[] | null;
  /** @maxItems 100 */
  BusinessUnits?: string[] | null;
  /** @maxItems 100 */
  AppIds?: string[] | null;
}
export interface ChartCreateModel {
  Filter?: ChartFilterModel;
  ChartTimeFrame?: TimeFrame;
  Metrics?: ChartCreateModelMetricsEnum;
}
export interface ChartData {
  data?: MetricInterval[] | null;
  pallette?: PalleteItem[] | null;
}
export interface ChartFilterModel {
  AppsFilter?: ChartAppsFilterModel;
  MinSeverity?: ChartFilterModelMinSeverityEnum;
}
export interface CommentModelResponse {
  Comment?: string | null;
  /** @format date-time */
  DateCreated?: string;
  CreatedBy?: BasicUserInfo;
}
export interface CommentModelResponsePageResultModel {
  Items?: CommentModelResponse[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface CommunicationSettings {
  /**
   * Number of threads
   * @format int32
   * @default 10
   */
  ThreadNum?: number | null;
  /**
   * Timeout in seconds
   * @format int32
   * @default 10
   */
  ConnectionTimeout?: number | null;
  /**
   * Adjust communication timeout automatically during the scan
   * @default false
   */
  UseAutomaticTimeout?: boolean | null;
  /**
   * @format int32
   * @default 1
   */
  MaxRequestsIn?: number | null;
  /**
   * @format int32
   * @default 10
   */
  MaxRequestsTimeFrame?: number | null;
}
export interface ComplianceStatus {
  /** @format uuid */
  PolicyId?: string;
  Enabled?: boolean;
  /**
   * @minLength 0
   * @maxLength 128
   */
  Name?: string | null;
  AssocitedBy?: string | null;
  Compliant?: boolean;
  Category?: ComplianceStatusCategoryEnum;
  Parameters?: string | null;
}
export interface CorrelationGroupModel {
  /** @format uuid */
  Id?: string;
  /** @format uuid */
  ApplicationId?: string;
  Status?: CorrelationGroupModelStatusEnum;
  LibraryName?: string | null;
  Severity?: CorrelationGroupModelSeverityEnum;
  /** @format date-time */
  CreatedAt?: string;
  /** @format date-time */
  LastUpdated?: string;
  /** @format date-time */
  LastFound?: string | null;
  Api?: string | null;
  /** @format int32 */
  IssuesCount?: number;
  IssueTypeId?: string | null;
  IssueType?: string | null;
  IncludeDast?: boolean;
  IncludeSast?: boolean;
  IncludeIast?: boolean;
  IncludeSca?: boolean;
}
export interface CorrelationGroupModelPageResultModel {
  Items?: CorrelationGroupModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface CountPerFinalStatus {
  /** @format int32 */
  Count?: number;
  Status?: CountPerFinalStatusStatusEnum;
}
export interface CountPerTechnologies {
  /** @format int32 */
  Count?: number;
  Technologies?: CountPerTechnologiesTechnologiesEnum;
}
export interface CustomFieldModel {
  /** @format uuid */
  Id?: string | null;
  Name?: string | null;
  Value?: string | null;
  ValueType?: CustomFieldModelValueTypeEnum;
  CreatedBy?: string | null;
}
export interface CustomFieldRequestModel {
  /**
   * @minLength 0
   * @maxLength 100
   */
  Name: string;
  ValueType: CustomFieldRequestModelValueTypeEnum;
  /**
   * @minLength 0
   * @maxLength 150
   */
  HelpText?: string | null;
}
export interface CustomFieldResponseModel {
  /** @format uuid */
  Id?: string;
  /** @format uuid */
  OrgId?: string;
  ColumnName?: string | null;
  ValueType?: CustomFieldResponseModelValueTypeEnum;
  /** @format date-time */
  CreatedDate?: string;
  CreatedBy?: string | null;
  HelpText?: string | null;
}
export interface DastScanExecutionModel {
  /** @format uuid */
  Id?: string;
  /** @format uuid */
  ScanId?: string;
  /** @format date-time */
  CreatedAt?: string;
  /** @format date-time */
  ExecutedAt?: string | null;
  /** @format date-time */
  ScanEndTime?: string | null;
  /** @format int32 */
  ExecutionDurationSec?: number;
  UserMessage?: string | null;
  PredefinedMessageKey?: string | null;
  Status?: DastScanExecutionModelStatusEnum;
  /** @format int32 */
  NIssuesFound?: number;
  Result?: DastScanExecutionModelResultEnum;
  ReadStatus?: DastScanExecutionModelReadStatusEnum;
  /** @format int32 */
  Progress?: number;
  /** @format int32 */
  NCriticalIssues?: number;
  /** @format int32 */
  NHighIssues?: number;
  /** @format int32 */
  NMediumIssues?: number;
  /** @format int32 */
  NLowIssues?: number;
  /** @format int32 */
  NInfoIssues?: number;
  /** @format int32 */
  NOpenSourceLicenses?: number;
  /** @format int32 */
  NOpenSourcePackages?: number;
  /** @format int32 */
  NNewAppIssues?: number;
  /** @format int32 */
  NNewAppCriticalIssues?: number;
  /** @format int32 */
  NNewAppHighIssues?: number;
  /** @format int32 */
  NNewAppMediumIssues?: number;
  /** @format int32 */
  NNewAppLowIssues?: number;
  /** @format int32 */
  NNewAppInfoIssues?: number;
  AvailableReports?: DastScanExecutionModelAvailableReportsEnum[] | null;
  ExecutionProgress?: DastScanExecutionModelExecutionProgressEnum;
  IncludeCustomUserMessage?: boolean;
  HasLogs?: boolean;
  FileName?: string | null;
  CreatedBy?: BasicUserInfo;
  IsScanFileAvailable?: boolean;
  Comment?: string | null;
  EnablementMessage?: string | null;
  HandledByScanEnabler?: boolean;
  IsPartial?: boolean;
  /** @format int32 */
  QueuedDurationSec?: number;
  IsValidForIncremental?: boolean;
  SupportModeEnabled?: boolean;
  CanResume?: boolean;
  StartingUrl?: string | null;
  LoginUser?: string | null;
  /** @format int32 */
  NVisitedPages?: number;
  /** @format int32 */
  NUnvisitedPages?: number;
  /** @format int32 */
  NTestedEntities?: number;
  /** @format int32 */
  NEntities?: number;
  /** @format int64 */
  NRequestsSent?: number;
  /** @format uuid */
  IncrementalBaseJobId?: string | null;
  IsIncrementalRetest?: boolean | null;
  ScanLogUrl?: string | null;
}
export interface DastScanModel {
  /** @format uuid */
  Id?: string;
  Name?: string | null;
  FullyAutomatic?: boolean;
  /** @format date-time */
  CreatedAt?: string;
  /** @format date-time */
  LastModified?: string;
  RecurrenceRule?: string | null;
  /** @format date-time */
  NextScheduledRun?: string | null;
  /** @format date-time */
  RecurrenceEndDate?: string | null;
  AppId?: string | null;
  AppName?: string | null;
  Technology?: DastScanModelTechnologyEnum;
  LatestExecution?: DastScanExecutionModel;
  EnableMailNotification?: boolean;
  /** @format int32 */
  NExecutions?: number;
  DeletedAllowed?: boolean;
  OfferingTriggered?: boolean;
  IsPrivate?: boolean;
  IsPersonal?: boolean;
  EnablePromote?: boolean;
  IsCompleted?: boolean;
  Url?: string | null;
  RescanAllowed?: boolean;
  Presence?: Presence;
  IastAgentStatus?: DastScanModelIastAgentStatusEnum;
  IastAgentType?: DastScanModelIastAgentTypeEnum;
  /** @format int32 */
  IastConnLostStopTimer?: number | null;
  OfferingType?: DastScanModelOfferingTypeEnum;
  IsUploadedFile?: boolean;
  ParsedFromUploadedFile?: boolean;
  CreatedBy?: BasicUserInfo;
  UseTestOptimizer?: boolean;
  IsDemoScan?: boolean;
  /** @format date-time */
  ExpirationTime?: string | null;
  ScanConfiguration?: DastUserScanConfigurationExtended;
  LoginConfigurationType?: DastScanModelLoginConfigurationTypeEnum;
  TestOnly?: boolean;
  TestOperation?: DastScanModelTestOperationEnum;
  IsHttpAuth?: boolean;
  ScanFiles?: ScanFileModel[] | null;
  ScanMethod?: DastScanModelScanMethodEnum;
  EnableEditing?: boolean;
}
export interface DastTemplateConfiguration {
  DastUserScanConfiguration?: DastUserScanConfigurationExtended;
  LoginConfigurationType?: DastTemplateConfigurationLoginConfigurationTypeEnum;
  DastScanMethod?: DastTemplateConfigurationDastScanMethodEnum;
}
export interface DastUserScanConfigurationExtended {
  StartingUrl?: string | null;
  LoginUser?: string | null;
  LoginPassword?: string | null;
  ExtraField?: string | null;
  HttpAuthUserName?: string | null;
  HttpAuthPassword?: string | null;
  HttpAuthDomain?: string | null;
  OtpSecretKey?: string | null;
  /** @format int32 */
  OtpLength?: number | null;
  OtpHashType?: DastUserScanConfigurationExtendedOtpHashTypeEnum;
  /** @format int32 */
  OtpTimeStep?: number | null;
  OtpHttpParameters?: string | null;
  /** @format int32 */
  ThreadNum?: number | null;
  /** @format int32 */
  ConnectionTimeout?: number | null;
  UseAutomaticTimeout?: boolean | null;
  /** @format int32 */
  MaxRequestsIn?: number | null;
  /** @format int32 */
  MaxRequestsTimeFrame?: number | null;
  TestPolicy?: string | null;
  PredefinedTestPolicy?: DastUserScanConfigurationExtendedPredefinedTestPolicyEnum;
  /** @format uuid */
  CustomTestPolicyId?: string | null;
  CustomTestPolicyName?: string | null;
  TestOptimizationLevel?: DastUserScanConfigurationExtendedTestOptimizationLevelEnum;
  AllowedDomains?: string[] | null;
  ShouldScanBelowThisDirectory?: boolean | null;
  UseCaseSensitivePaths?: boolean | null;
  TestLoginPages?: boolean | null;
  TestLoginPagesWithoutSessionIds?: boolean | null;
  TestLogoutPages?: boolean | null;
  DetectVulnerableComponents?: boolean | null;
  EnableAutomaticFormFill?: boolean;
  ExclusionList?: ExcludeExceptionModel[] | null;
  /** @format uuid */
  ScanTemplateId?: string | null;
  OpenAPIBaseUrl?: string | null;
  OpenAPIUrl?: string | null;
  /** @format uuid */
  OpenAPIFileId?: string | null;
  FormFillParams?: OpenApiLoginKey[] | null;
  OpenAIConfiguration?: OpenAIConfiguration;
  LlmLoginRequired?: boolean;
  LlmDbTableName?: string | null;
  Comment?: string | null;
  EnablementMessage?: string | null;
  PostmanCollectionJsonFileName?: string | null;
  PostmanEnvironmentJsonFileName?: string | null;
  PostmanGlobalJsonFileName?: string | null;
  PostmanAdditionalZipFileName?: string | null;
}
export interface DataPoint {
  name?: string | null;
  /** @format int32 */
  value?: number;
}
export interface DateValues {
  /** @format date-time */
  Date?: string;
  Values?: number[] | null;
}
export interface DeleteDomainResult {
  /** @format int32 */
  DomainId?: number;
  Message?: string | null;
}
export interface DeleteDomainsResult {
  Failed?: DeleteDomainResult[] | null;
  Deleted?: DeleteDomainResult[] | null;
}
export interface DomainModel {
  /** @format int32 */
  Id?: number;
  /** @minLength 1 */
  Domain: string;
  UrlType?: DomainModelUrlTypeEnum;
  IncludeSubDomains?: boolean;
  ReversedUrl?: string | null;
  /** @maxLength 256 */
  Description?: string | null;
  IsAccessLimitedForAssetGroups?: boolean;
  IsBlocked?: boolean;
  Enabled?: boolean | null;
  Type?: DomainModelTypeEnum;
  Status?: DomainModelStatusEnum;
  Key?: string | null;
  AddedBy?: string | null;
  /** @format date-time */
  CreatedAt?: string;
  /** @format date-time */
  LastScanned?: string | null;
  AssetGroups?: MinAssetGroupModel[] | null;
}
export interface DomainModelPageResultModel {
  Items?: DomainModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface DomainOwnershipModel {
  STP?: string | null;
  MailPrefix?: DomainOwnershipModelMailPrefixEnum;
  Domain?: string | null;
}
export interface DomainOwnershipModelVerificationModel {
  STP?: string | null;
  MailPrefix?: DomainOwnershipModelVerificationModelMailPrefixEnum;
  Domain?: string | null;
  /** @format uuid */
  AppId?: string | null;
}
export interface EditPolicyModel {
  /**
   * @minLength 0
   * @maxLength 256
   */
  Name?: string | null;
  /**
   * @minLength 0
   * @maxLength 256
   */
  Description?: string | null;
  Expression?: any;
}
export interface EditTestPolicyModel {
  /**
   * @minLength 0
   * @maxLength 256
   */
  Description?: string | null;
  IsDefault?: boolean;
  /**
   * @minLength 0
   * @maxLength 256
   */
  Name?: string | null;
  /** @format uuid */
  TestPolicyFileId?: string | null;
}
export interface ErrorMessage {
  Key?: string | null;
  Message?: string | null;
  FormatParams?: string[] | null;
}
export interface ExcludeExceptionModel {
  Type?: ExcludeExceptionModelTypeEnum;
  IsRegEx?: boolean;
  Pattern?: string | null;
  Description?: string | null;
}
export interface ExploreDataCounters {
  /** @format int32 */
  Requests?: number;
  /** @format int32 */
  FailedRequests?: number;
  /** @format int32 */
  Parameters?: number;
  /** @format int32 */
  Cookies?: number;
  /** @format int32 */
  Headers?: number;
  /** @format int32 */
  Pages?: number;
}
export interface ExploreItem {
  /** @format uuid */
  FileId: string;
  /** @default false */
  MultiStep?: boolean;
  TrafficType?: ExploreItemTrafficTypeEnum;
}
export interface FixGroup {
  /** @format uuid */
  Id: string;
  /** @format uuid */
  AppId: string;
  FixGroupType: FixGroupFixGroupTypeEnum;
  /** @minLength 1 */
  Subject: string;
  FixLocationEntityType: FixGroupFixLocationEntityTypeEnum;
  Severity?: FixGroupSeverityEnum;
  /** @format int32 */
  SeverityValue?: number;
  /** @format int32 */
  NIssues: number;
  /** @format int32 */
  NOpenIssues: number;
  /** @minLength 1 */
  IssueTypeId: string;
  /** @minLength 1 */
  IssueType: string;
  /** @format date-time */
  DateCreated: string;
  /** @format date-time */
  LastUpdated?: string | null;
  /** @format date-time */
  LastFound?: string | null;
  Status?: FixGroupStatusEnum;
  StickyStatus: boolean;
  File?: string | null;
  /** @format int32 */
  Line?: number;
  /** @format int32 */
  HashVersion: number;
  /** @minLength 1 */
  Hash: string;
  LibraryName?: string | null;
  LastComment?: BasicCommentModel;
  Language?: string | null;
}
export interface FixGroupPageResultModel {
  Items?: FixGroup[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface FixGroupUpdate {
  Status?: FixGroupUpdateStatusEnum;
  StickyStatus?: boolean | null;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  Comment?: string | null;
}
export interface GeneralScanExecutionModel {
  /** @format uuid */
  Id?: string;
  /** @format uuid */
  ScanId?: string;
  /** @format date-time */
  CreatedAt?: string;
  /** @format date-time */
  ExecutedAt?: string | null;
  /** @format date-time */
  ScanEndTime?: string | null;
  /** @format int32 */
  ExecutionDurationSec?: number;
  UserMessage?: string | null;
  PredefinedMessageKey?: string | null;
  Status?: GeneralScanExecutionModelStatusEnum;
  /** @format int32 */
  NIssuesFound?: number;
  Result?: GeneralScanExecutionModelResultEnum;
  ReadStatus?: GeneralScanExecutionModelReadStatusEnum;
  /** @format int32 */
  Progress?: number;
  /** @format int32 */
  NCriticalIssues?: number;
  /** @format int32 */
  NHighIssues?: number;
  /** @format int32 */
  NMediumIssues?: number;
  /** @format int32 */
  NLowIssues?: number;
  /** @format int32 */
  NInfoIssues?: number;
  /** @format int32 */
  NOpenSourceLicenses?: number;
  /** @format int32 */
  NOpenSourcePackages?: number;
  /** @format int32 */
  NNewAppIssues?: number;
  /** @format int32 */
  NNewAppCriticalIssues?: number;
  /** @format int32 */
  NNewAppHighIssues?: number;
  /** @format int32 */
  NNewAppMediumIssues?: number;
  /** @format int32 */
  NNewAppLowIssues?: number;
  /** @format int32 */
  NNewAppInfoIssues?: number;
  AvailableReports?: GeneralScanExecutionModelAvailableReportsEnum[] | null;
  ExecutionProgress?: GeneralScanExecutionModelExecutionProgressEnum;
  IncludeCustomUserMessage?: boolean;
  HasLogs?: boolean;
  FileName?: string | null;
  CreatedBy?: BasicUserInfo;
  IsScanFileAvailable?: boolean;
  Comment?: string | null;
  EnablementMessage?: string | null;
  HandledByScanEnabler?: boolean;
  IsPartial?: boolean;
  /** @format int32 */
  QueuedDurationSec?: number;
  IsValidForIncremental?: boolean;
  SupportModeEnabled?: boolean;
  CanResume?: boolean;
}
export interface GenericChartData {
  Columns?: string[] | null;
  DataPoints?: TimedDataPoints[] | null;
}
export interface GlobalEnvironmentInfo {
  SiteUrl?: string | null;
  ScanServiceUrl?: string | null;
  Version?: string | null;
  Region?: string | null;
  ExternalIDPMode?: GlobalEnvironmentInfoExternalIdpModeEnum;
  GitHubAppUrl?: string | null;
  IsSsoConfigured?: boolean;
}
export interface HealthStatusModel {
  HasDBAccess?: boolean;
  HasStorageAccess?: boolean;
  HasSMTPAccess?: boolean;
  HasLDAPAccess?: boolean;
  HasLicenseServerAccess?: boolean | null;
}
export interface HttpAuthSettings {
  UserName?: string | null;
  Password?: string | null;
  Domain?: string | null;
}
export interface HttpContent {
  Headers?: StringStringIEnumerableKeyValuePair[] | null;
}
export interface IastScanExecutionModel {
  /** @format uuid */
  Id?: string;
  /** @format uuid */
  ScanId?: string;
  /** @format date-time */
  CreatedAt?: string;
  /** @format date-time */
  ExecutedAt?: string | null;
  /** @format date-time */
  ScanEndTime?: string | null;
  /** @format int32 */
  ExecutionDurationSec?: number;
  UserMessage?: string | null;
  PredefinedMessageKey?: string | null;
  Status?: IastScanExecutionModelStatusEnum;
  /** @format int32 */
  NIssuesFound?: number;
  Result?: IastScanExecutionModelResultEnum;
  ReadStatus?: IastScanExecutionModelReadStatusEnum;
  /** @format int32 */
  Progress?: number;
  /** @format int32 */
  NCriticalIssues?: number;
  /** @format int32 */
  NHighIssues?: number;
  /** @format int32 */
  NMediumIssues?: number;
  /** @format int32 */
  NLowIssues?: number;
  /** @format int32 */
  NInfoIssues?: number;
  /** @format int32 */
  NOpenSourceLicenses?: number;
  /** @format int32 */
  NOpenSourcePackages?: number;
  /** @format int32 */
  NNewAppIssues?: number;
  /** @format int32 */
  NNewAppCriticalIssues?: number;
  /** @format int32 */
  NNewAppHighIssues?: number;
  /** @format int32 */
  NNewAppMediumIssues?: number;
  /** @format int32 */
  NNewAppLowIssues?: number;
  /** @format int32 */
  NNewAppInfoIssues?: number;
  AvailableReports?: IastScanExecutionModelAvailableReportsEnum[] | null;
  ExecutionProgress?: IastScanExecutionModelExecutionProgressEnum;
  IncludeCustomUserMessage?: boolean;
  HasLogs?: boolean;
  FileName?: string | null;
  CreatedBy?: BasicUserInfo;
  IsScanFileAvailable?: boolean;
  Comment?: string | null;
  EnablementMessage?: string | null;
  HandledByScanEnabler?: boolean;
  IsPartial?: boolean;
  /** @format int32 */
  QueuedDurationSec?: number;
  IsValidForIncremental?: boolean;
  SupportModeEnabled?: boolean;
  CanResume?: boolean;
}
export interface IastScanModel {
  /** @format uuid */
  Id?: string;
  Name?: string | null;
  FullyAutomatic?: boolean;
  /** @format date-time */
  CreatedAt?: string;
  /** @format date-time */
  LastModified?: string;
  RecurrenceRule?: string | null;
  /** @format date-time */
  NextScheduledRun?: string | null;
  /** @format date-time */
  RecurrenceEndDate?: string | null;
  AppId?: string | null;
  AppName?: string | null;
  Technology?: IastScanModelTechnologyEnum;
  LatestExecution?: IastScanExecutionModel;
  EnableMailNotification?: boolean;
  /** @format int32 */
  NExecutions?: number;
  DeletedAllowed?: boolean;
  OfferingTriggered?: boolean;
  IsPrivate?: boolean;
  IsPersonal?: boolean;
  EnablePromote?: boolean;
  IsCompleted?: boolean;
  Url?: string | null;
  RescanAllowed?: boolean;
  Presence?: Presence;
  IastAgentStatus?: IastScanModelIastAgentStatusEnum;
  IastAgentType?: IastScanModelIastAgentTypeEnum;
  /** @format int32 */
  IastConnLostStopTimer?: number | null;
  OfferingType?: IastScanModelOfferingTypeEnum;
  IsUploadedFile?: boolean;
  ParsedFromUploadedFile?: boolean;
  CreatedBy?: BasicUserInfo;
  UseTestOptimizer?: boolean;
  IsDemoScan?: boolean;
  /** @format date-time */
  ExpirationTime?: string | null;
  Agentkey?: string | null;
}
export interface IdentityProviderInfo {
  Id?: string | null;
  DisplayName?: string | null;
}
export interface ImportAppResultModel {
  /** @format int32 */
  NCreated?: number;
  /** @format int32 */
  NModified?: number;
  /** @format int32 */
  NSkipped?: number;
}
export interface ImportIssueStatusModel {
  /** @format int32 */
  Imported?: number;
  /** @format int32 */
  Updated?: number;
  /** @format int32 */
  Skipped?: number;
}
export interface InviteResult {
  Email?: string | null;
  InviteStatus?: InviteResultInviteStatusEnum;
}
export interface InviteUsersModel {
  Emails?: string[] | null;
  AssetGroupIds?: string[] | null;
  /** @format uuid */
  RoleId?: string;
}
export interface IsValidUrlData {
  Url?: string | null;
}
export interface IsValidUrlResponse {
  IsValid?: boolean;
}
export interface IssueChangeSet {
  Changes?: Change[] | null;
  /** @format date-time */
  ChangedAt?: string;
  ChangedBy?: BasicUserInfo;
  ScanExecution?: ScanExecutionInfo;
}
export interface IssueMergeModel {
  /** @format int32 */
  NewIssues?: number;
  /** @format int32 */
  MergedIssues?: number;
  /** @format int32 */
  ReopenedIssues?: number;
}
export interface IssueModel {
  /** @format uuid */
  Id: string;
  Language?: string | null;
  Severity?: IssueModelSeverityEnum;
  Status?: IssueModelStatusEnum;
  IssueType?: string | null;
  Location?: string | null;
  /** @format date-time */
  DateCreated?: string;
  /** @format date-time */
  LastUpdated?: string;
  /** @format date-time */
  LastFound?: string | null;
  CallingMethod?: string | null;
  IsNewInScope?: boolean;
  /** @format uuid */
  PackageId?: string | null;
  /** @format uuid */
  AppPackageId?: string | null;
  AppPkgStatus?: IssueModelAppPkgStatusEnum;
  LibraryName?: string | null;
  LibraryVersion?: string | null;
  ScaTechnology?: string | null;
  FGStatus?: IssueModelFgStatusEnum;
  IsSticky?: boolean;
  /** @format uuid */
  ApplicationId?: string;
  /** @format uuid */
  FixGroupId?: string | null;
  Api?: string | null;
  Source?: string | null;
  Context?: string | null;
  AppscanVulnId?: string | null;
  CallingLine?: string | null;
  Class?: string | null;
  Cve?: string | null;
  CveId?: string | null;
  /** @format date-time */
  CvePublishDate?: string | null;
  /** @format double */
  EpssScore?: number | null;
  /** @format double */
  EpssPercentile?: number | null;
  DetailsUrl?: string | null;
  Cvss?: string | null;
  CvssVersion?: IssueModelCvssVersionEnum;
  DiscoveryMethod?: string | null;
  Domain?: string | null;
  Element?: string | null;
  ElementType?: string | null;
  ExternalId?: string | null;
  Host?: string | null;
  /** @minLength 1 */
  IssueTypeId: string;
  /** @format uuid */
  IssueTypeGuid?: string | null;
  IssueXml?: string | null;
  Line?: string | null;
  Package?: string | null;
  Path?: string | null;
  /** @format int32 */
  Port?: number;
  Scheme?: string | null;
  /** @format int32 */
  SeverityValue?: number;
  /** @format uuid */
  CorrelationGroupId?: string | null;
  SourceFile?: string | null;
  /** @format date-time */
  LastComment?: string | null;
  Scanner?: string | null;
  ScanName?: string | null;
  /** @format int32 */
  Cwe?: number | null;
  ThreatClassId?: string | null;
  DiffResult?: IssueModelDiffResultEnum;
  ApiVulnName?: string | null;
  RemediationId?: string | null;
  SourceFileUri?: string | null;
  ReplayScriptFrameworks?: IssueModelReplayScriptFrameworksEnum;
}
export interface IssueModelPageResultModel {
  Items?: IssueModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface IssuesReportJob {
  OdataFilter?: string | null;
  ApplyPolicies?: IssuesReportJobApplyPoliciesEnum;
  SelectPolicyIds?: string[] | null;
}
export interface JobsStatisticsModel {
  ScanTechnology?: JobsStatisticsModelScanTechnologyEnum;
  MeasureTypes?: string[] | null;
  DateValues?: DateValues[] | null;
}
export interface KPIData {
  /** @format double */
  Data?: number;
  /** @format double */
  TrendPercent?: number;
}
export interface LibraryModel {
  /** @format uuid */
  Id?: string;
  /** @format uuid */
  PackageId?: string;
  LibraryName?: string | null;
  Version?: string | null;
  HighestIssueSeverity?: LibraryModelHighestIssueSeverityEnum;
  /** @format date-time */
  FirstFound?: string | null;
  /** @format date-time */
  LastFound?: string | null;
  /** @format int32 */
  NumOfIssues?: number;
  Status?: LibraryModelStatusEnum;
  Licenses?: BasicLicenseInfo[] | null;
  Location?: string | null;
  LatestReleaseVersion?: string | null;
  /** @format date-time */
  LatestReleaseDateTime?: string | null;
}
export interface LibraryModelPageResultModel {
  Items?: LibraryModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface LicenseLibraryModel {
  /** @format uuid */
  PackageId?: string;
  /** @format uuid */
  AppPackageId?: string;
  Sha1?: string | null;
  LibSha1?: string | null;
  LibraryName?: string | null;
  Version?: string | null;
  /** @format int32 */
  NumberOfLicenses?: number;
  /** @format int64 */
  LicenseId?: number;
  RiskLevel?: LicenseLibraryModelRiskLevelEnum;
  CopyrightRiskScore?: LicenseLibraryModelCopyrightRiskScoreEnum;
  PatentRiskScore?: LicenseLibraryModelPatentRiskScoreEnum;
  Linking?: LicenseLibraryModelLinkingEnum;
  CopyLeft?: LicenseLibraryModelCopyLeftEnum;
  RoyaltyFree?: LicenseLibraryModelRoyaltyFreeEnum;
  Url?: string | null;
  LicenseName?: string | null;
  /** @format date-time */
  FirstFound?: string | null;
  /** @format date-time */
  LastFound?: string | null;
  PackageLocation?: string | null;
  /** @format int32 */
  NumOfIssues?: number;
  Status?: LicenseLibraryModelStatusEnum;
  Technology?: string | null;
  Malware?: boolean;
}
export interface LicenseLibraryModelPageResultModel {
  Items?: LicenseLibraryModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface LicenseModel {
  /** @format int64 */
  LicenseId?: number;
  RiskLevel?: LicenseModelRiskLevelEnum;
  CopyrightRiskScore?: LicenseModelCopyrightRiskScoreEnum;
  PatentRiskScore?: LicenseModelPatentRiskScoreEnum;
  Linking?: LicenseModelLinkingEnum;
  CopyLeft?: LicenseModelCopyLeftEnum;
  RoyaltyFree?: LicenseModelRoyaltyFreeEnum;
  Url?: string | null;
  LicenseName?: string | null;
}
export interface LicenseModelPageResultModel {
  Items?: LicenseModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface LicenseReportJob {
  OdataFilter?: string | null;
  Configuration: LicenseReportOptions;
}
export interface LicenseReportOptions {
  ReportFileType?: LicenseReportOptionsReportFileTypeEnum;
  Title?: string | null;
  Notes?: string | null;
  Locale?: string | null;
}
export interface LlmSettings {
  LoginRequired?: boolean;
  DbTableName?: string | null;
}
export interface LoginSettings {
  UserName?: string | null;
  Password?: string | null;
  ExtraField?: string | null;
}
export interface MHSPasetoAccount {
  id?: string | null;
  name?: string | null;
  hcn?: string | null;
}
export interface MHSPasetoDeployment {
  id?: string | null;
  name?: string | null;
  fingerprints?: string[] | null;
}
export interface MHSPasetoEntitlement {
  validity?: MHSPasetoEntitlementValidity;
  value?: string | null;
  item?: MHSPasetoEntitlementItem;
}
export interface MHSPasetoEntitlementItem {
  id?: string | null;
}
export interface MHSPasetoEntitlementValidity {
  start?: string | null;
  expiry?: string | null;
}
export interface MHSPasetoFeature {
  entitlements?: Record<string, MHSPasetoEntitlement>;
}
export interface MHSPasetoPayloadV1 {
  iat?: string | null;
  aud?: string | null;
  features?: Record<string, MHSPasetoFeature>;
  version?: string | null;
  account?: MHSPasetoAccount;
  deployment?: MHSPasetoDeployment;
}
export interface MHSPayloadAscpSignature {
  MHSError?: MhsPayloadAscpSignatureMhsErrorEnum;
  MHSSignature?: string | null;
  Payload?: MHSPasetoPayloadV1;
}
export interface MetricData {
  name?: string | null;
  /** @format int32 */
  value?: number;
}
export interface MetricInterval {
  date?: string | null;
  metrics?: MetricData[] | null;
}
export interface MinAssetGroupModel {
  /** @format uuid */
  Id?: string;
  /**
   * @minLength 0
   * @maxLength 120
   */
  Name?: string | null;
  /** @format int32 */
  AppsCount?: number;
  /** @format int32 */
  UsersCount?: number;
}
export interface MinPresenceData {
  PresenceName?: string | null;
  Status?: MinPresenceDataStatusEnum;
}
export interface MinScanExecutionModel {
  /** @format uuid */
  Id?: string;
  FileName?: string | null;
  UserMessage?: string | null;
  /** @format int32 */
  NNewAppIssues?: number;
  /** @format int32 */
  NIssuesFound?: number;
  Status?: MinScanExecutionModelStatusEnum;
  /** @format int32 */
  Progress?: number;
  ExecutionProgress?: MinScanExecutionModelExecutionProgressEnum;
  CreatedBy?: BasicUserInfo;
  /** @format date-time */
  CreatedAt?: string;
  /** @format date-time */
  ScanEndTime?: string | null;
  /** @format int32 */
  ExecutionDurationSec?: number;
  /** @format int32 */
  NNewAppCriticalIssues?: number;
  /** @format int32 */
  NCriticalIssues?: number;
  /** @format int32 */
  NNewAppHighIssues?: number;
  /** @format int32 */
  NHighIssues?: number;
  /** @format int32 */
  NNewAppMediumIssues?: number;
  /** @format int32 */
  NMediumIssues?: number;
  /** @format int32 */
  NNewAppLowIssues?: number;
  /** @format int32 */
  NLowIssues?: number;
  /** @format int32 */
  NNewAppInfoIssues?: number;
  /** @format int32 */
  NInfoIssues?: number;
  /** @format int32 */
  NOpenSourceLicenses?: number;
  /** @format int32 */
  NOpenSourcePackages?: number;
  HasLogs?: boolean;
  IsScanFileAvailable?: boolean;
  PredefinedMessageKey?: string | null;
  HandledByScanEnabler?: boolean;
  IsPartial?: boolean;
  /** @format uuid */
  IncrementalBaseJobId?: string | null;
  IsIncrementalRetest?: boolean | null;
  GitRepository?: string | null;
  GitBranch?: string | null;
  SupportModeEnabled?: boolean;
  CanResume?: boolean;
}
export interface MinScanModel {
  /** @format uuid */
  AppId?: string | null;
  /** @format uuid */
  Id?: string;
  Name?: string | null;
  Technology?: MinScanModelTechnologyEnum;
  IastAgentType?: MinScanModelIastAgentTypeEnum;
  IastAgentStatus?: MinScanModelIastAgentStatusEnum;
  Url?: string | null;
  AppName?: string | null;
  /** @format int32 */
  NumberOfExecutions?: number;
  CreatedBy?: BasicUserInfo;
  /** @format date-time */
  CreatedAt?: string;
  /** @format date-time */
  LastModified?: string;
  /** @format date-time */
  NextScheduledRun?: string | null;
  LatestExecution?: MinScanExecutionModel;
  Presence?: MinPresenceData;
  RecurrenceRule?: string | null;
  EnablePromote?: boolean;
  IsPersonal?: boolean;
  RescanAllowed?: boolean;
  ParsedFromUploadedFile?: boolean;
  DeletedAllowed?: boolean;
  /** @format date-time */
  RecurrenceEndDate?: string | null;
  FullyAutomatic?: boolean;
  EnableMailNotifications?: boolean | null;
  /** @format uuid */
  AssetGroupId?: string;
  /** @format uuid */
  BusinessUnitId?: string | null;
  EnableEditing?: boolean;
  ProactiveAlerts?: boolean;
}
export interface MinScanModelPageResultModel {
  Items?: MinScanModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface MonitoredServiceModel {
  /** @format date-time */
  FirstCheck?: string;
  /** @format date-time */
  LastCheck?: string;
  ServiceType?: MonitoredServiceModelServiceTypeEnum;
  Status?: MonitoredServiceModelStatusEnum;
}
export interface MonitoredServiceModelPageResultModel {
  Items?: MonitoredServiceModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface NameValuePair {
  /**
   * @minLength 0
   * @maxLength 128
   */
  Name?: string | null;
  /**
   * @minLength 0
   * @maxLength 128
   */
  Value?: string | null;
}
export interface NewAssetGroupModel {
  /**
   * @minLength 0
   * @maxLength 2048
   */
  Description?: string | null;
  IssuesStatusInheritance?: NewAssetGroupModelIssuesStatusInheritanceEnum;
  /** @format uuid */
  ContactUserId?: string | null;
  EnableIssuesAutoClose?: boolean | null;
  /**
   * @minLength 0
   * @maxLength 120
   */
  Name: string;
}
export interface NewBusinessUnitModel {
  /**
   * @minLength 0
   * @maxLength 256
   */
  Name?: string | null;
  AppIdsToAdd?: string[] | null;
}
export interface NewChartModel {
  /** @format uuid */
  AssetGroupId?: string | null;
  BusinessUnit?: string | null;
  ChartTimeFrame?: TimeFrame;
  Metrics?: NewChartModelMetricsEnum;
}
export interface NewDastScan {
  /**
   * @minLength 1
   * @maxLength 1024
   */
  ScanName: string;
  /** @default true */
  EnableMailNotification?: boolean;
  /**
   * @minLength 0
   * @maxLength 10
   * @default "en-US"
   */
  Locale?: string | null;
  /** @format uuid */
  AppId: string;
  Execute?: boolean;
  /** @default false */
  FullyAutomatic?: boolean;
  /** @default false */
  Personal?: boolean;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  Comment?: string | null;
  /**
   * File ID of AppScan Scan or Scan Template file that was uploaded
   * @format uuid
   */
  ScanOrTemplateFileId?: string | null;
  /**
   * File ID of login sequence file that was uploaded
   * @format uuid
   */
  LoginSequenceFileId?: string | null;
  ScanConfiguration?: NewDastScanConfiguration;
  /**
   * ID of Scan Template to be used (cannot be provided if ScanOrTemplateFileId is provided)
   * @format uuid
   */
  ScanTemplateId?: string | null;
  /** List of file ids for files with explore data (dast.config) */
  ExploreItems?: ExploreItem[] | null;
  PostmanCollectionFiles?: PostmanCollectionFiles;
  /** @format uuid */
  PresenceId?: string | null;
  IncludeVerifiedDomains?: boolean;
  Recurrence?: Recurrence;
  /** @default false */
  OnlyFullResults?: boolean;
  TestOperation?: NewDastScanTestOperationEnum;
}
export interface NewDastScanConfiguration {
  Target?: TargetSettings;
  Login?: LoginSettings;
  HttpAuth?: HttpAuthSettings;
  Otp?: OneTimePassword;
  Communication?: CommunicationSettings;
  Tests?: TestsSettings;
  ApplicationElements?: ApplicationElementsSettings;
  OpenAPI?: OpenAPIConfiguration;
  Llm?: LlmSettings;
}
export interface NewExternalUserModel {
  /**
   * @minLength 1
   * @maxLength 128
   */
  FirstName: string;
  /**
   * @minLength 1
   * @maxLength 128
   */
  LastName: string;
  /**
   * @minLength 0
   * @maxLength 100
   */
  PhoneNumber?: string | null;
  /**
   * @minLength 2
   * @maxLength 20
   */
  CountryCode?: string | null;
  /**
   * @minLength 8
   * @maxLength 256
   */
  Password: string;
  ProtectedUserName?: string | null;
}
export interface NewIASTKey {
  Key?: string | null;
}
export interface NewIastScan {
  /**
   * @minLength 1
   * @maxLength 1024
   */
  ScanName: string;
  /** @default true */
  EnableMailNotification?: boolean;
  /**
   * @minLength 0
   * @maxLength 10
   * @default "en-US"
   */
  Locale?: string | null;
  /** @format uuid */
  AppId: string;
  Execute?: boolean;
  /** @default false */
  FullyAutomatic?: boolean;
  /** @default false */
  Personal?: boolean;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  Comment?: string | null;
  /**
   * @format int32
   * @min 30
   * @max 2147483647
   * @default ""
   */
  ConnLostStopTimer?: number | null;
  AgentType?: NewIastScanAgentTypeEnum;
}
export interface NewOrgSettingsModel {
  SettingType?: NewOrgSettingsModelSettingTypeEnum;
  Value?: string | null;
  Units?: string | null;
}
export interface NewPolicyModel {
  /**
   * @minLength 0
   * @maxLength 256
   */
  Name: string;
  /**
   * @minLength 0
   * @maxLength 256
   */
  Description?: string | null;
  Expression: any;
}
export interface NewPresence {
  /**
   * @minLength 1
   * @maxLength 128
   */
  PresenceName: string;
}
export interface NewRoleModel {
  /**
   * @minLength 0
   * @maxLength 256
   */
  Name: string;
  IsDefault?: boolean;
  /**
   * @minLength 0
   * @maxLength 256
   */
  ExternalGroupName?: string | null;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  Description?: string | null;
  Capabilities: Record<string, boolean>;
}
export interface NewScaScan {
  /**
   * @minLength 1
   * @maxLength 1024
   */
  ScanName: string;
  /** @default true */
  EnableMailNotification?: boolean;
  /**
   * @minLength 0
   * @maxLength 10
   * @default "en-US"
   */
  Locale?: string | null;
  /** @format uuid */
  AppId: string;
  Execute?: boolean;
  /** @default false */
  FullyAutomatic?: boolean;
  /** @default false */
  Personal?: boolean;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  Comment?: string | null;
  /** @format uuid */
  ApplicationFileId?: string;
  ProactiveAlerts?: boolean;
}
export interface NewScanTemplateModel {
  /**
   * @minLength 0
   * @maxLength 256
   */
  Name: string;
  /** @format uuid */
  FileId: string;
  /**
   * @minLength 0
   * @maxLength 256
   */
  Description?: string | null;
  IsAccessLimitedForAssetGroups?: boolean | null;
  AssetGroupIds?: string[] | null;
}
export interface NewStaticScan {
  /**
   * @minLength 1
   * @maxLength 1024
   */
  ScanName: string;
  /** @default true */
  EnableMailNotification?: boolean;
  /**
   * @minLength 0
   * @maxLength 10
   * @default "en-US"
   */
  Locale?: string | null;
  /** @format uuid */
  AppId: string;
  Execute?: boolean;
  /** @default false */
  FullyAutomatic?: boolean;
  /** @default false */
  Personal?: boolean;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  Comment?: string | null;
  /** @format uuid */
  ApplicationFileId?: string | null;
  RepositoryDetails?: RepoDetails;
  Recurrence?: Recurrence;
}
export interface NewTestPolicyModel {
  /**
   * @minLength 0
   * @maxLength 256
   */
  Description?: string | null;
  IsDefault?: boolean;
  /**
   * @minLength 0
   * @maxLength 256
   */
  Name: string;
  /** @format uuid */
  TestPolicyFileId: string;
}
export interface NewUserAccount {
  /**
   * @minLength 1
   * @maxLength 128
   */
  FirstName: string;
  /**
   * @minLength 1
   * @maxLength 128
   */
  LastName: string;
  /** @maxLength 1024 */
  OrgName?: string | null;
  /**
   * @minLength 8
   * @maxLength 256
   */
  Password?: string | null;
  Signature?: string | null;
}
export interface NewWebhook {
  /**
   * @minLength 0
   * @maxLength 4096
   */
  AuthorizationHeader?: string | null;
  RequestMethod?: NewWebhookRequestMethodEnum;
  /**
   * @minLength 0
   * @maxLength 8192
   */
  RequestBody?: string | null;
  /**
   * @minLength 0
   * @maxLength 256
   */
  ContentType?: string | null;
  /** @format uuid */
  PresenceId: string;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  Uri: string;
  Global?: boolean;
  /** @format uuid */
  AssetGroupId?: string | null;
  Event: NewWebhookEventEnum;
}
export interface OnBoardResult {
  UserName?: string | null;
  OnBoardStatus?: OnBoardResultOnBoardStatusEnum;
}
export interface OnBoardUsersModel {
  ExternalIdType?: OnBoardUsersModelExternalIdTypeEnum;
  ExternalUserIds?: string[] | null;
  AssetGroupIds?: string[] | null;
  /** @format uuid */
  RoleId?: string;
}
export interface OneTimePassword {
  /**
   * @minLength 1
   * @maxLength 4096
   */
  SecretKey: string;
  /**
   * @format int32
   * @min 1
   * @max 1024
   */
  Length: number;
  HashType: OneTimePasswordHashTypeEnum;
  /**
   * @format int32
   * @min 1
   * @max 100000
   */
  TimeStep: number;
  HttpParameters?: string | null;
}
export interface OpenAIConfiguration {
  EnableOpenAI?: boolean;
  OpenAIUrl?: string | null;
  OpenAIKey?: string | null;
}
export interface OpenAPIConfiguration {
  /** Base url of the swagger endpoints */
  BaseUrl?: string | null;
  /** Url of the swagger file */
  Url?: string | null;
  /**
   * Id of the uploaded swagger json/yml file
   * @format uuid
   */
  FileId?: string | null;
  LoginKeys?: OpenApiLoginKey[] | null;
}
export interface OpenApiLoginKey {
  KeyName?: string | null;
  KeyValue?: string | null;
}
export interface OrgLibraryModel {
  /** @format uuid */
  PackageId?: string;
  /** @format date-time */
  FirstFound?: string | null;
  /** @format date-time */
  LastFound?: string | null;
  Name?: string | null;
  Version?: string | null;
  /** @format int32 */
  NApps?: number;
  /** @format int32 */
  NumberOfLicenses?: number;
  /** @format int32 */
  NumOfIssues?: number;
  Status?: OrgLibraryModelStatusEnum;
  Technology?: string | null;
  Malware?: boolean;
}
export interface OrgLibraryModelPageResultModel {
  Items?: OrgLibraryModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface OrgSettingsModel {
  /** @format uuid */
  Id?: string;
  SettingType?: OrgSettingsModelSettingTypeEnum;
  Value?: string | null;
  Units?: string | null;
  UpdatedBy?: BasicUserInfo;
  /** @format date-time */
  LastModified?: string;
}
export interface OrgSettingsModelPageResultModel {
  Items?: OrgSettingsModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface PalleteItem {
  key?: string | null;
  value?: string | null;
  /** @format int32 */
  sortVal?: number;
}
export interface PolicyAssociationModel {
  /** @format uuid */
  Id?: string;
  Name?: string | null;
  Description?: string | null;
  Expression?: string | null;
  Predefined?: boolean;
  /** @format date-time */
  CreatedAt?: string;
  CreatedBy?: string | null;
  /** @format int32 */
  NAssociatedApps?: number;
  Type?: PolicyAssociationModelTypeEnum;
  Category?: PolicyAssociationModelCategoryEnum;
  Region?: PolicyAssociationModelRegionEnum;
  UIFeatures?: string | null;
  Enabled?: boolean;
  Parameters?: NameValuePair[] | null;
}
export interface PolicyAssociationModelPageResultModel {
  Items?: PolicyAssociationModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface PolicyConfigurationModel {
  Enabled?: boolean;
  Parameters?: NameValuePair[] | null;
}
export interface PolicyModel {
  /** @format uuid */
  Id?: string;
  Name?: string | null;
  Description?: string | null;
  Expression?: string | null;
  Predefined?: boolean;
  /** @format date-time */
  CreatedAt?: string;
  CreatedBy?: string | null;
  /** @format int32 */
  NAssociatedApps?: number;
  Type?: PolicyModelTypeEnum;
  Category?: PolicyModelCategoryEnum;
  Region?: PolicyModelRegionEnum;
  UIFeatures?: string | null;
}
export interface PolicyModelPageResultModel {
  Items?: PolicyModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface PostmanCollectionFiles {
  /** @format uuid */
  CollectionJsonFileId?: string;
  /** @format uuid */
  EnvironmentJsonFileId?: string;
  /** @format uuid */
  GlobalJsonFileId?: string;
  /** @format uuid */
  AdditionalZipFileId?: string;
}
export interface Presence {
  /** @format uuid */
  Id?: string;
  PresenceName?: string | null;
  /** @format date-time */
  KeyExpiresAt?: string | null;
  HostName?: string | null;
  Status?: PresenceStatusEnum;
  IsV2?: boolean;
  Platform?: string | null;
  GitPlatform?: PresenceGitPlatformEnum;
  GitConnectActive?: boolean;
  /** @maxLength 2048 */
  GitConnectUrl?: string | null;
  /** @maxLength 2048 */
  GitServerUrl?: string | null;
  /** @maxLength 512 */
  GitServerName?: string | null;
}
export interface PresencePageResultModel {
  Items?: Presence[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  /** @format int32 */
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  [key: string]: any;
}
export interface RFAnalysisStatusUpdateModel {
  /** @format uuid */
  ScanExecutionId?: string;
  /**
   * @minLength 0
   * @maxLength 50
   */
  AnalysisId?: string | null;
  Status?: RfAnalysisStatusUpdateModelStatusEnum;
}
export interface RFFailureData {
  /**
   * @minLength 0
   * @maxLength 4096
   */
  Summary?: string | null;
  ProblemType?: string | null;
  Title?: string | null;
  Detail?: string | null;
}
export interface RFFixModel {
  CompleteSuccess?: boolean;
  /** @format date-time */
  CreatedAt?: string;
  Summary?: string | null;
  Description?: string | null;
  FailureData?: RFFailureData;
  DiffFileDownloadLink?: string | null;
}
export interface RFNewFixModel {
  /** @format uuid */
  IssueId: string;
  /**
   * @minLength 0
   * @maxLength 50
   */
  AnalysisId: string;
  /**
   * @minLength 0
   * @maxLength 4096
   */
  Summary?: string | null;
  /**
   * @minLength 0
   * @maxLength 8192
   */
  Description?: string | null;
  /** @format uuid */
  DiffFileId: string;
}
export interface RFNewIssueAnalysisFailureModel {
  /** @format uuid */
  IssueId: string;
  /**
   * @minLength 0
   * @maxLength 50
   */
  AnalysisId: string;
  /**
   * @format uri
   * @minLength 0
   * @maxLength 4096
   */
  ProblemType: string;
  /**
   * @minLength 0
   * @maxLength 8192
   */
  Title?: string | null;
  /**
   * @minLength 0
   * @maxLength 8192
   */
  Detail?: string | null;
}
export interface RFNewPatchModel {
  /** @format uuid */
  ScanExecutionId?: string;
  /**
   * @maxItems 10
   * @minItems 1
   */
  IssuesIds: string[];
}
export interface RFNewTriageModel {
  /** @format uuid */
  IssueId: string;
  /**
   * @minLength 0
   * @maxLength 50
   */
  AnalysisId: string;
  ProposedSeverity?: RfNewTriageModelProposedSeverityEnum;
  ProposedStatus?: RfNewTriageModelProposedStatusEnum;
  /**
   * @minLength 0
   * @maxLength 4096
   */
  Summary?: string | null;
}
export interface RFPatchModel {
  /** @format uuid */
  Id?: string;
  /** @format uuid */
  ScanExecutionId?: string;
  AnalysisId?: string | null;
  GitRepoPlatform?: RfPatchModelGitRepoPlatformEnum;
  /** @format int32 */
  PullRequestId?: number | null;
  PullRequestUrl?: string | null;
  Status?: RfPatchModelStatusEnum;
  IssuesIds?: string[] | null;
  /** @format date-time */
  CreatedAt?: string;
}
export interface RFPatchModelPageResultModel {
  Items?: RFPatchModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface RFTriageModel {
  CompleteSuccess?: boolean;
  ProposedSeverity?: RfTriageModelProposedSeverityEnum;
  ProposedStatus?: RfTriageModelProposedStatusEnum;
  /** @format date-time */
  CreatedAt?: string;
  Summary?: string | null;
  FailureData?: RFFailureData;
}
export interface RFUpdatePatchModel {
  /** @format uuid */
  Id?: string;
  GitRepoPlatform?: RfUpdatePatchModelGitRepoPlatformEnum;
  /** @format int32 */
  PullRequestId?: number | null;
  /**
   * @format uri
   * @minLength 0
   * @maxLength 4096
   */
  PullRequestUrl?: string | null;
  Status?: RfUpdatePatchModelStatusEnum;
}
export interface Recurrence {
  /**
   * @minLength 0
   * @maxLength 1024
   * @default "0 3 * * 0"
   */
  Rule?: string | null;
  /** @format date-time */
  StartDate?: string | null;
  /** @format date-time */
  EndDate?: string | null;
}
export interface RegionInfo {
  Id?: string | null;
  Name?: string | null;
  Url?: string | null;
}
export interface RegionsInfo {
  Regions?: RegionInfo[] | null;
  DefaultRegion?: string | null;
}
export interface RegisterOrganization {
  /**
   * @minLength 0
   * @maxLength 64
   */
  OrganizationName?: string | null;
  Signature?: string | null;
}
export interface RegistrationResult {
  RegisterResult?: RegistrationResultRegisterResultEnum;
  RegisterError?: RegistrationResultRegisterErrorEnum;
  MHSError?: RegistrationResultMhsErrorEnum;
  MHSSignature?: string | null;
}
export interface RegulationReportJob {
  OdataFilter?: string | null;
  ApplyPolicies?: RegulationReportJobApplyPoliciesEnum;
  SelectPolicyIds?: string[] | null;
  Configuration: RegulationReportOptions;
}
export interface RegulationReportOptions {
  ReportFileType?: RegulationReportOptionsReportFileTypeEnum;
  Title?: string | null;
  Notes?: string | null;
  Locale?: string | null;
  RegulationReportType: RegulationReportOptionsRegulationReportTypeEnum;
}
export interface RepoDetails {
  /** @format uuid */
  GitConnectPresenceId?: string | null;
  /**
   * @minLength 1
   * @pattern \d{5,20}:[a-zA-Z0-9/+]{43,1024}={0,2}
   */
  RepoSignature: string;
  /**
   * @minLength 1
   * @pattern ^[a-zA-Z0-9_.-]{1,39}$
   */
  Owner: string;
  /**
   * @minLength 1
   * @pattern ^[a-zA-Z0-9_.-]{1,100}$
   */
  RepoName: string;
  /** @pattern ^[a-zA-Z0-9_./-]{1,256}$ */
  BranchName?: string | null;
  Platform: RepoDetailsPlatformEnum;
}
export interface RepoSignature {
  Signature?: string | null;
}
export interface RepoSignatureRequest {
  /** @pattern ^[a-z]{3}_[a-zA-Z0-9]{36}$ */
  AccessToken?: string | null;
  /** @pattern ^[a-zA-Z0-9_.-]{1,39}$ */
  Owner?: string | null;
  /** @pattern ^[a-zA-Z0-9_.-]{1,100}$ */
  RepoName?: string | null;
}
export interface ReportCustomizationModel {
  ReportHeader?: string | null;
  ReportFooter?: string | null;
  /** @format uuid */
  MainLogoFileId?: string | null;
  MainLogoDownloadSignature?: string | null;
  /** @format uuid */
  AdditionalLogoFileId?: string | null;
  AdditionalLogoDownloadSignature?: string | null;
  ReportTitle?: string | null;
}
export interface ReportStatusModel {
  /** @format uuid */
  Id?: string;
  Name?: string | null;
  Status?: ReportStatusModelStatusEnum;
  /** @format int32 */
  Progress?: number;
  /** @format date-time */
  ValidUntil?: string;
  HtmlInsteadOfPdf?: boolean;
  DownloadLink?: string | null;
  ReportFileType?: string | null;
}
export interface ReportStatusModelPageResultModel {
  Items?: ReportStatusModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface RoleModel {
  /**
   * @minLength 0
   * @maxLength 256
   */
  Name: string;
  IsDefault?: boolean;
  /**
   * @minLength 0
   * @maxLength 256
   */
  ExternalGroupName?: string | null;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  Description?: string | null;
  Capabilities: Record<string, boolean>;
  /** @format uuid */
  Id?: string;
  AsmId?: string | null;
  Predefined?: boolean;
  IsAssignable?: boolean;
}
export interface RoleModelPageResultModel {
  Items?: RoleModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface SCXSubscription {
  LicenseKeyPostfix?: string | null;
  /** @format int64 */
  SubscriptionId?: number;
  OverageSupport?: boolean;
  /** @format date-time */
  ExpirationDate?: string | null;
  /** @format date-time */
  RenewalDate?: string | null;
  /** @format date-time */
  PurchaseDate?: string;
  OfferingType?: ScxSubscriptionOfferingTypeEnum;
  /** @format int32 */
  NSeats?: number;
  /** @format int32 */
  NTakenSeats?: number;
  /** @format int32 */
  NExecutions?: number;
  /** @format int32 */
  NApps?: number;
  FullReport?: boolean;
  /** @format int32 */
  MaxConcurrentScans?: number | null;
  PurchaseSupplier?: string | null;
  State?: string | null;
  IncludeOpenSource?: boolean;
  IncludeIAST?: boolean;
  /** @format int32 */
  MaxIASTConcurrency?: number | null;
  Is3PMOrder?: boolean;
}
export interface SCXUserInfo {
  Username?: string | null;
  IsAdmin?: boolean;
  Email?: string | null;
  PhoneNumber?: string | null;
  FirstName?: string | null;
  LastName?: string | null;
  /** @format int32 */
  IdleTimeForSignout?: number;
}
export interface SastScanExecutionModel {
  /** @format uuid */
  Id?: string;
  /** @format uuid */
  ScanId?: string;
  /** @format date-time */
  CreatedAt?: string;
  /** @format date-time */
  ExecutedAt?: string | null;
  /** @format date-time */
  ScanEndTime?: string | null;
  /** @format int32 */
  ExecutionDurationSec?: number;
  UserMessage?: string | null;
  PredefinedMessageKey?: string | null;
  Status?: SastScanExecutionModelStatusEnum;
  /** @format int32 */
  NIssuesFound?: number;
  Result?: SastScanExecutionModelResultEnum;
  ReadStatus?: SastScanExecutionModelReadStatusEnum;
  /** @format int32 */
  Progress?: number;
  /** @format int32 */
  NCriticalIssues?: number;
  /** @format int32 */
  NHighIssues?: number;
  /** @format int32 */
  NMediumIssues?: number;
  /** @format int32 */
  NLowIssues?: number;
  /** @format int32 */
  NInfoIssues?: number;
  /** @format int32 */
  NOpenSourceLicenses?: number;
  /** @format int32 */
  NOpenSourcePackages?: number;
  /** @format int32 */
  NNewAppIssues?: number;
  /** @format int32 */
  NNewAppCriticalIssues?: number;
  /** @format int32 */
  NNewAppHighIssues?: number;
  /** @format int32 */
  NNewAppMediumIssues?: number;
  /** @format int32 */
  NNewAppLowIssues?: number;
  /** @format int32 */
  NNewAppInfoIssues?: number;
  AvailableReports?: SastScanExecutionModelAvailableReportsEnum[] | null;
  ExecutionProgress?: SastScanExecutionModelExecutionProgressEnum;
  IncludeCustomUserMessage?: boolean;
  HasLogs?: boolean;
  FileName?: string | null;
  CreatedBy?: BasicUserInfo;
  IsScanFileAvailable?: boolean;
  Comment?: string | null;
  EnablementMessage?: string | null;
  HandledByScanEnabler?: boolean;
  IsPartial?: boolean;
  /** @format int32 */
  QueuedDurationSec?: number;
  IsValidForIncremental?: boolean;
  SupportModeEnabled?: boolean;
  CanResume?: boolean;
  ClientToolMessage?: string | null;
  ClientToolOS?: string | null;
  Languages?: string[] | null;
  IsSourceScanning?: boolean;
  /** @format int32 */
  NTotalLines?: number | null;
  GitRepository?: string | null;
  GitCommitId?: string | null;
  GitBranch?: string | null;
  RapidFixAnalysisStatus?: SastScanExecutionModelRapidFixAnalysisStatusEnum;
}
export interface SastScanModel {
  /** @format uuid */
  Id?: string;
  Name?: string | null;
  FullyAutomatic?: boolean;
  /** @format date-time */
  CreatedAt?: string;
  /** @format date-time */
  LastModified?: string;
  RecurrenceRule?: string | null;
  /** @format date-time */
  NextScheduledRun?: string | null;
  /** @format date-time */
  RecurrenceEndDate?: string | null;
  AppId?: string | null;
  AppName?: string | null;
  Technology?: SastScanModelTechnologyEnum;
  LatestExecution?: SastScanExecutionModel;
  EnableMailNotification?: boolean;
  /** @format int32 */
  NExecutions?: number;
  DeletedAllowed?: boolean;
  OfferingTriggered?: boolean;
  IsPrivate?: boolean;
  IsPersonal?: boolean;
  EnablePromote?: boolean;
  IsCompleted?: boolean;
  Url?: string | null;
  RescanAllowed?: boolean;
  Presence?: Presence;
  IastAgentStatus?: SastScanModelIastAgentStatusEnum;
  IastAgentType?: SastScanModelIastAgentTypeEnum;
  /** @format int32 */
  IastConnLostStopTimer?: number | null;
  OfferingType?: SastScanModelOfferingTypeEnum;
  IsUploadedFile?: boolean;
  ParsedFromUploadedFile?: boolean;
  CreatedBy?: BasicUserInfo;
  UseTestOptimizer?: boolean;
  IsDemoScan?: boolean;
  /** @format date-time */
  ExpirationTime?: string | null;
  GitRepoOwner?: string | null;
  GitRepoName?: string | null;
  GitBranch?: string | null;
  GitRepoPlatform?: SastScanModelGitRepoPlatformEnum;
}
export interface SbomReportOptions {
  SbomFormat?: SbomReportOptionsSbomFormatEnum;
  /** @maxLength 1024 */
  FileName?: string | null;
  /** @maxLength 1024 */
  DocumentName?: string | null;
  /** @maxLength 1024 */
  OrganizationName?: string | null;
  /** @maxLength 1024 */
  CreatorName?: string | null;
  /** @maxLength 1024 */
  CreatorEmail?: string | null;
}
export interface ScaScanExecutionModel {
  /** @format uuid */
  Id?: string;
  /** @format uuid */
  ScanId?: string;
  /** @format date-time */
  CreatedAt?: string;
  /** @format date-time */
  ExecutedAt?: string | null;
  /** @format date-time */
  ScanEndTime?: string | null;
  /** @format int32 */
  ExecutionDurationSec?: number;
  UserMessage?: string | null;
  PredefinedMessageKey?: string | null;
  Status?: ScaScanExecutionModelStatusEnum;
  /** @format int32 */
  NIssuesFound?: number;
  Result?: ScaScanExecutionModelResultEnum;
  ReadStatus?: ScaScanExecutionModelReadStatusEnum;
  /** @format int32 */
  Progress?: number;
  /** @format int32 */
  NCriticalIssues?: number;
  /** @format int32 */
  NHighIssues?: number;
  /** @format int32 */
  NMediumIssues?: number;
  /** @format int32 */
  NLowIssues?: number;
  /** @format int32 */
  NInfoIssues?: number;
  /** @format int32 */
  NOpenSourceLicenses?: number;
  /** @format int32 */
  NOpenSourcePackages?: number;
  /** @format int32 */
  NNewAppIssues?: number;
  /** @format int32 */
  NNewAppCriticalIssues?: number;
  /** @format int32 */
  NNewAppHighIssues?: number;
  /** @format int32 */
  NNewAppMediumIssues?: number;
  /** @format int32 */
  NNewAppLowIssues?: number;
  /** @format int32 */
  NNewAppInfoIssues?: number;
  AvailableReports?: ScaScanExecutionModelAvailableReportsEnum[] | null;
  ExecutionProgress?: ScaScanExecutionModelExecutionProgressEnum;
  IncludeCustomUserMessage?: boolean;
  HasLogs?: boolean;
  FileName?: string | null;
  CreatedBy?: BasicUserInfo;
  IsScanFileAvailable?: boolean;
  Comment?: string | null;
  EnablementMessage?: string | null;
  HandledByScanEnabler?: boolean;
  IsPartial?: boolean;
  /** @format int32 */
  QueuedDurationSec?: number;
  IsValidForIncremental?: boolean;
  SupportModeEnabled?: boolean;
  CanResume?: boolean;
  ClientToolMessage?: string | null;
  ClientToolOS?: string | null;
  Languages?: string[] | null;
  IsSourceScanning?: boolean;
  GitRepository?: string | null;
  GitCommitId?: string | null;
  GitBranch?: string | null;
  ScanMethod?: ScaScanExecutionModelScanMethodEnum;
}
export interface ScaScanModel {
  /** @format uuid */
  Id?: string;
  Name?: string | null;
  FullyAutomatic?: boolean;
  /** @format date-time */
  CreatedAt?: string;
  /** @format date-time */
  LastModified?: string;
  RecurrenceRule?: string | null;
  /** @format date-time */
  NextScheduledRun?: string | null;
  /** @format date-time */
  RecurrenceEndDate?: string | null;
  AppId?: string | null;
  AppName?: string | null;
  Technology?: ScaScanModelTechnologyEnum;
  LatestExecution?: ScaScanExecutionModel;
  EnableMailNotification?: boolean;
  /** @format int32 */
  NExecutions?: number;
  DeletedAllowed?: boolean;
  OfferingTriggered?: boolean;
  IsPrivate?: boolean;
  IsPersonal?: boolean;
  EnablePromote?: boolean;
  IsCompleted?: boolean;
  Url?: string | null;
  RescanAllowed?: boolean;
  Presence?: Presence;
  IastAgentStatus?: ScaScanModelIastAgentStatusEnum;
  IastAgentType?: ScaScanModelIastAgentTypeEnum;
  /** @format int32 */
  IastConnLostStopTimer?: number | null;
  OfferingType?: ScaScanModelOfferingTypeEnum;
  IsUploadedFile?: boolean;
  ParsedFromUploadedFile?: boolean;
  CreatedBy?: BasicUserInfo;
  UseTestOptimizer?: boolean;
  IsDemoScan?: boolean;
  /** @format date-time */
  ExpirationTime?: string | null;
  GitRepoOwner?: string | null;
  GitRepoName?: string | null;
  GitBranch?: string | null;
  GitRepoPlatform?: ScaScanModelGitRepoPlatformEnum;
  ProactiveAlerts?: boolean;
}
export interface ScanAndExecutionIds {
  /** @format uuid */
  ScanId?: string;
  /** @format uuid */
  ScanExecutionId?: string;
}
export interface ScanExecute {
  /** @format uuid */
  FileId?: string | null;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  Comment?: string | null;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  EnablementMessage?: string | null;
  /** @format uuid */
  IncrementalBaseJobId?: string | null;
  IsIncrementalRetest?: boolean;
}
export interface ScanExecutionInfo {
  ScanName?: string | null;
  /** @format uuid */
  ScanId?: string;
  /** @format uuid */
  ExecutionId?: string;
}
export interface ScanExecutionModel {
  /** @format uuid */
  Id?: string;
  /** @format uuid */
  ScanId?: string;
  /** @format date-time */
  CreatedAt?: string;
  /** @format date-time */
  ExecutedAt?: string | null;
  /** @format date-time */
  ScanEndTime?: string | null;
  /** @format int32 */
  ExecutionDurationSec?: number;
  UserMessage?: string | null;
  PredefinedMessageKey?: string | null;
  Status?: ScanExecutionModelStatusEnum;
  /** @format int32 */
  NIssuesFound?: number;
  Result?: ScanExecutionModelResultEnum;
  ReadStatus?: ScanExecutionModelReadStatusEnum;
  /** @format int32 */
  Progress?: number;
  /** @format int32 */
  NCriticalIssues?: number;
  /** @format int32 */
  NHighIssues?: number;
  /** @format int32 */
  NMediumIssues?: number;
  /** @format int32 */
  NLowIssues?: number;
  /** @format int32 */
  NInfoIssues?: number;
  /** @format int32 */
  NOpenSourceLicenses?: number;
  /** @format int32 */
  NOpenSourcePackages?: number;
  /** @format int32 */
  NNewAppIssues?: number;
  /** @format int32 */
  NNewAppCriticalIssues?: number;
  /** @format int32 */
  NNewAppHighIssues?: number;
  /** @format int32 */
  NNewAppMediumIssues?: number;
  /** @format int32 */
  NNewAppLowIssues?: number;
  /** @format int32 */
  NNewAppInfoIssues?: number;
  AvailableReports?: ScanExecutionModelAvailableReportsEnum[] | null;
  ExecutionProgress?: ScanExecutionModelExecutionProgressEnum;
  IncludeCustomUserMessage?: boolean;
  HasLogs?: boolean;
  FileName?: string | null;
  CreatedBy?: BasicUserInfo;
  IsScanFileAvailable?: boolean;
  Comment?: string | null;
  EnablementMessage?: string | null;
  HandledByScanEnabler?: boolean;
  IsPartial?: boolean;
  /** @format int32 */
  QueuedDurationSec?: number;
  IsValidForIncremental?: boolean;
  SupportModeEnabled?: boolean;
  CanResume?: boolean;
}
export interface ScanFileModel {
  FileType?: ScanFileModelFileTypeEnum;
  Filename?: string | null;
  /** @format int64 */
  Size?: number;
}
export interface ScanResultsModel {
  /** @format uuid */
  UploadedFileId?: string;
  ScanName?: string | null;
  /** @format uuid */
  AppId?: string;
}
export interface ScanTemplateModel {
  /** @format uuid */
  Id?: string;
  Name?: string | null;
  Description?: string | null;
  /** @format date-time */
  CreatedAt?: string | null;
  /** @format date-time */
  LastUpdatedAt?: string;
  /** @format date-time */
  LastUsedAt?: string | null;
  CreatedByUserId?: string | null;
  CreatedByUserName?: string | null;
  UpdatedByUserName?: string | null;
  DastConfiguration?: DastTemplateConfiguration;
  IsAccessLimitedForAssetGroups?: boolean;
  AssetGroups?: MinAssetGroupModel[] | null;
  /** @format int32 */
  AssetGroupsCount?: number | null;
}
export interface ScanTemplateModelPageResultModel {
  Items?: ScanTemplateModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface SecurityReportJob {
  OdataFilter?: string | null;
  ApplyPolicies?: SecurityReportJobApplyPoliciesEnum;
  SelectPolicyIds?: string[] | null;
  Configuration: SecurityReportOptions;
}
export interface SecurityReportOptions {
  ReportFileType?: SecurityReportOptionsReportFileTypeEnum;
  Title?: string | null;
  Notes?: string | null;
  Locale?: string | null;
  Summary?: boolean;
  Details?: boolean;
  Discussion?: boolean;
  Overview?: boolean;
  TableOfContent?: boolean;
  History?: boolean;
  Coverage?: boolean;
  MinimizeDetails?: boolean;
  Articles?: boolean;
}
export interface StringStringIEnumerableKeyValuePair {
  Key?: string | null;
  Value?: string[] | null;
}
export interface SubscriptionInfoModel {
  IsValid?: boolean;
  IsTrial?: boolean;
  HideCounters?: boolean;
  OfferingType?: SubscriptionInfoModelOfferingTypeEnum;
  /** @format date-time */
  ExpirationDate?: string | null;
  /** @format date-time */
  RemovalDate?: string | null;
  SubscriptionId?: string | null;
  TenantId?: string | null;
  /** @format int32 */
  TotalSeats?: number;
  /** @format int32 */
  TakenSeats?: number;
  FullCapabilitiesForTrialEnabled?: boolean;
  PurchaseSupplier?: string | null;
  /** @format int32 */
  MaxUsers?: number;
}
export interface TargetSettings {
  /**
   * @minLength 0
   * @maxLength 2048
   */
  StartingUrl?: string | null;
  AdditionalDomains?: string[] | null;
  ExclusionList?: ExcludeExceptionModel[] | null;
  ShouldScanBelowThisDirectory?: boolean | null;
  UseCaseSensitivePaths?: boolean | null;
}
export interface TenantBasicInfo {
  Name?: string | null;
  /** @format uuid */
  Id?: string;
  /** @format date-time */
  CreatedAt?: string;
}
export interface TenantInfo {
  /** @format int32 */
  NumberOfApps?: number;
  /** @format uuid */
  TenantId?: string;
  TenantName?: string | null;
  ContactEmail?: string | null;
  Subscriptions?: SCXSubscription[] | null;
  HideUsageCounters?: boolean;
  IssuesStatusInheritance?: TenantInfoIssuesStatusInheritanceEnum;
  SubscriptionTechnologies?: TenantInfoSubscriptionTechnologiesEnum;
  ActiveTechnologies?: TenantInfoActiveTechnologiesEnum;
  UserInfo?: SCXUserInfo;
  EntitledForExpertOnDemand?: boolean;
  /** @format int32 */
  NumBusinessUnitsInOrg?: number;
  /** @format int32 */
  AppsWithBusinessUnit?: number;
  /** @format int32 */
  AppsWithoutBusinessUnit?: number;
  SCAEnabled?: boolean;
  /** @format int32 */
  MaxScansPerApp?: number;
  AutoDeleteExceededScansPerApp?: boolean;
  AllowAppManagerOverrideAutoDeleteSettings?: boolean;
  /** @format int32 */
  MaxUsers?: number;
  /** @format int64 */
  DefaultSubscriptionId?: number | null;
  EnableIssuesAutoClose?: boolean;
  EnableOverrideIssuesAutoClose?: boolean;
  /** @format int32 */
  IdleTimeForSignout?: number;
  AllowPresence?: boolean;
  ShowNonCompliantIssuesOnly?: boolean;
  DomainVerificationRequired?: boolean;
  EnableGartner?: boolean;
  EnableTrainingLinks?: boolean;
  OpenAIConfiguration?: OpenAIConfiguration;
  /** @format int32 */
  NumAssetGroupsWithIssuesStatusInheritance?: number;
}
export interface TenantInfoModel {
  TenantName?: string | null;
  ContactEmail?: string | null;
  SubscriptionTechnologies?: TenantInfoModelSubscriptionTechnologiesEnum;
  AutoDeleteExceededScansPerApp?: boolean | null;
  AllowAppManagerOverrideAutoDeleteSettings?: boolean | null;
  EnableIssuesAutoClose?: boolean | null;
  EnableOverrideIssuesAutoClose?: boolean | null;
  ShowNonCompliantIssuesOnly?: boolean | null;
  OpenAIConfiguration?: OpenAIConfiguration;
  ReportCustomization?: ReportCustomizationModel;
}
export interface TestPolicyModel {
  /** @format uuid */
  Id?: string;
  Name?: string | null;
  Description?: string | null;
  CreatedBy?: BasicUserInfo;
  /** @format date-time */
  LastUpdatedAt?: string | null;
  LastUpdatedBy?: BasicUserInfo;
  IsPredefined?: boolean;
  IsDefault?: boolean;
}
export interface TestPolicyModelPageResultModel {
  Items?: TestPolicyModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface TestsSettings {
  /** @format uuid */
  CustomTestPolicyId?: string | null;
  TestOptimizationLevel?: TestsSettingsTestOptimizationLevelEnum;
  TestLoginPages?: boolean | null;
  TestLoginPagesWithoutSessionIds?: boolean | null;
  TestLogoutPages?: boolean | null;
  /** @default true */
  DetectVulnerableComponents?: boolean | null;
}
export interface TimeFrame {
  /**
   * @format float
   * @min -14
   * @max 14
   */
  TimeZoneOffset?: number;
  Interval?: TimeFrameIntervalEnum;
  /** @format date-time */
  Start?: string;
  /** @format date-time */
  End?: string;
}
export interface TimedDataPoints {
  /** @format date-time */
  Time?: string;
  Data?: number[] | null;
}
export interface TriageResult {
  /** @format int32 */
  NProvidedIssues?: number;
  /** @format int32 */
  NUpdatedIssues?: number;
  /** @format int32 */
  NInheritedIssues?: number;
  /** @format int32 */
  NStatusConflictIssues?: number;
}
export interface TrialUserDetails {
  /**
   * @minLength 5
   * @maxLength 256
   */
  Email: string;
  /**
   * @minLength 1
   * @maxLength 128
   */
  LastName?: string | null;
  /**
   * @minLength 1
   * @maxLength 128
   */
  FirstName?: string | null;
  /**
   * @minLength 0
   * @maxLength 1024
   */
  OrgName?: string | null;
  BackChunnelKey?: string | null;
}
export interface UpdateApplicationElementsSettings {
  EnableAutomaticFormFill?: boolean | null;
}
export interface UpdateAssetGroupModel {
  /**
   * @minLength 0
   * @maxLength 2048
   */
  Description?: string | null;
  IssuesStatusInheritance?: UpdateAssetGroupModelIssuesStatusInheritanceEnum;
  /** @format uuid */
  ContactUserId?: string | null;
  EnableIssuesAutoClose?: boolean | null;
  /**
   * @minLength 0
   * @maxLength 120
   */
  Name?: string | null;
}
export interface UpdateBusinessUnitModel {
  /**
   * @minLength 0
   * @maxLength 256
   */
  Name?: string | null;
  AppIdsToAdd?: string[] | null;
  AppIdsToRemove?: string[] | null;
}
export interface UpdateCommunicationSettings {
  /**
   * @format int32
   * @default 10
   */
  ThreadNum?: number | null;
  /**
   * @format int32
   * @default 10
   */
  ConnectionTimeout?: number | null;
  /** @default false */
  UseAutomaticTimeout?: boolean | null;
  /**
   * @format int32
   * @default 1
   */
  MaxRequestsIn?: number | null;
  /**
   * @format int32
   * @default 10
   */
  MaxRequestsTimeFrame?: number | null;
}
export interface UpdateCustomFieldModel {
  Name?: string | null;
  HelpText?: string | null;
}
export interface UpdateCustomFieldValueRequest {
  Value?: string | null;
}
export interface UpdateDomainManagementModel {
  Enabled?: boolean;
  IsAccessLimitedForAssetGroups?: boolean | null;
  /** @maxLength 256 */
  Description?: string | null;
  AssetGroupIds?: string[] | null;
  IncludeSubDomains?: boolean | null;
}
export interface UpdateFullDastScan {
  /**
   * @minLength 1
   * @maxLength 1024
   */
  ScanName?: string | null;
  /** @default true */
  EnableMailNotification?: boolean | null;
  /**
   * @minLength 0
   * @maxLength 10
   * @default "en-US"
   */
  Locale?: string | null;
  /** @default false */
  FullyAutomatic?: boolean | null;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  Comment?: string | null;
  /** @format uuid */
  LoginSequenceFileId?: string | null;
  ExploreItems?: ExploreItem[] | null;
  PostmanCollectionFiles?: UpdatePostmanCollectionFiles;
  /** @format uuid */
  PresenceId?: string | null;
  Recurrence?: Recurrence;
  TestOperation?: UpdateFullDastScanTestOperationEnum;
  Target?: UpdateTargetSettings;
  Login?: UpdateLoginSettings;
  HttpAuth?: UpdateHttpAuthSettings;
  Otp?: UpdateOneTimePassword;
  Communication?: UpdateCommunicationSettings;
  Tests?: UpdateTestsSettings;
  ApplicationElements?: UpdateApplicationElementsSettings;
  OpenAPI?: UpdateOpenAPISettings;
  LlmSettings?: UpdateLlmSettings;
}
export interface UpdateHttpAuthSettings {
  UserName?: string | null;
  Password?: string | null;
  Domain?: string | null;
}
export interface UpdateIastScan {
  /**
   * @minLength 1
   * @maxLength 1024
   */
  Name?: string | null;
  EnableMailNotifications?: boolean | null;
  /**
   * @minLength 0
   * @maxLength 10
   */
  Locale?: string | null;
  /** @default false */
  FullyAutomatic?: boolean;
  /** @format uuid */
  ConfigFileId?: string | null;
}
export interface UpdateIssue {
  /**
   * @minLength 0
   * @maxLength 1024
   */
  ExternalId?: string | null;
  Status?: UpdateIssueStatusEnum;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  Comment?: string | null;
}
export interface UpdateIssuesById {
  /**
   * @minLength 0
   * @maxLength 1024
   */
  ExternalId?: string | null;
  Status?: UpdateIssuesByIdStatusEnum;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  Comment?: string | null;
  issueIds?: string[] | null;
}
export interface UpdateLlmSettings {
  LoginRequired?: boolean | null;
  DbTableName?: string | null;
}
export interface UpdateLoginSettings {
  UserName?: string | null;
  Password?: string | null;
  ExtraField?: string | null;
}
export interface UpdateOneTimePassword {
  /**
   * @minLength 0
   * @maxLength 4096
   */
  SecretKey?: string | null;
  /**
   * @format int32
   * @min 1
   * @max 1024
   */
  Length?: number | null;
  HashType?: UpdateOneTimePasswordHashTypeEnum;
  /**
   * @format int32
   * @min 1
   * @max 100000
   */
  TimeStep?: number | null;
  HttpParameters?: string | null;
}
export interface UpdateOpenAPISettings {
  BaseUrl?: string | null;
  Url?: string | null;
  /** @format uuid */
  FileId?: string | null;
  LoginKeys?: OpenApiLoginKey[] | null;
}
export interface UpdateOrgSettingsModel {
  Value?: string | null;
}
export interface UpdatePostmanCollectionFiles {
  /** @format uuid */
  CollectionJsonFileId?: string | null;
  /** @format uuid */
  EnvironmentJsonFileId?: string | null;
  /** @format uuid */
  GlobalJsonFileId?: string | null;
  /** @format uuid */
  AdditionalZipFileId?: string | null;
}
export interface UpdatePresence {
  /**
   * @minLength 1
   * @maxLength 128
   */
  PresenceName: string;
}
export interface UpdateRoleModel {
  /**
   * @minLength 0
   * @maxLength 256
   */
  Name?: string | null;
  IsDefault?: boolean | null;
  /**
   * @minLength 0
   * @maxLength 256
   */
  ExternalGroupName?: string | null;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  Description?: string | null;
  Capabilities?: Record<string, boolean>;
}
export interface UpdateSastScan {
  /**
   * @minLength 1
   * @maxLength 1024
   */
  Name?: string | null;
  EnableMailNotifications?: boolean | null;
  /**
   * @minLength 0
   * @maxLength 10
   */
  Locale?: string | null;
  /** @default false */
  FullyAutomatic?: boolean;
  /** @format uuid */
  PresenceId?: string | null;
  RecurrenceRule?: string | null;
  /** @format date-time */
  RecurrenceStartDate?: string | null;
  /** @format date-time */
  RecurrenceEndDate?: string | null;
  /** @pattern ^[a-zA-Z0-9_./-]{1,256}$ */
  BranchName?: string | null;
}
export interface UpdateSastScanExecution {
  /** @pattern ^[a-zA-Z0-9_./-]{1,256}$ */
  BranchName?: string | null;
}
export interface UpdateScaScan {
  /**
   * @minLength 1
   * @maxLength 1024
   */
  Name?: string | null;
  EnableMailNotifications?: boolean | null;
  /**
   * @minLength 0
   * @maxLength 10
   */
  Locale?: string | null;
  /** @default false */
  FullyAutomatic?: boolean;
  ProactiveAlerts?: boolean;
}
export interface UpdateScanTemplateModel {
  /**
   * @minLength 0
   * @maxLength 256
   */
  Name?: string | null;
  /**
   * @minLength 0
   * @maxLength 256
   */
  Description?: string | null;
  IsAccessLimitedForAssetGroups?: boolean | null;
  AssetGroupIds?: string[] | null;
}
export interface UpdateScanWithPresenceAndRecurrence {
  /**
   * @minLength 1
   * @maxLength 1024
   */
  Name?: string | null;
  EnableMailNotifications?: boolean | null;
  /**
   * @minLength 0
   * @maxLength 10
   */
  Locale?: string | null;
  /** @default false */
  FullyAutomatic?: boolean;
  /** @format uuid */
  PresenceId?: string | null;
  RecurrenceRule?: string | null;
  /** @format date-time */
  RecurrenceStartDate?: string | null;
  /** @format date-time */
  RecurrenceEndDate?: string | null;
}
export interface UpdateTargetSettings {
  StartingUrl?: string | null;
  AdditionalDomains?: string[] | null;
  ExclusionList?: ExcludeExceptionModel[] | null;
  ShouldScanBelowThisDirectory?: boolean | null;
  UseCaseSensitivePaths?: boolean | null;
}
export interface UpdateTestsSettings {
  /** @format uuid */
  CustomTestPolicyId?: string | null;
  TestOptimizationLevel?: UpdateTestsSettingsTestOptimizationLevelEnum;
  TestLoginPages?: boolean | null;
  TestLoginPagesWithoutSessionIds?: boolean | null;
  TestLogoutPages?: boolean | null;
  /** @default true */
  DetectVulnerableComponents?: boolean | null;
}
export interface UpdateUserModel {
  AssetGroupIds?: string[] | null;
  /** @format uuid */
  RoleId?: string | null;
}
export interface UpdateWebhook {
  /**
   * @minLength 0
   * @maxLength 4096
   */
  AuthorizationHeader?: string | null;
  RequestMethod?: UpdateWebhookRequestMethodEnum;
  /**
   * @minLength 0
   * @maxLength 8192
   */
  RequestBody?: string | null;
  /**
   * @minLength 0
   * @maxLength 256
   */
  ContentType?: string | null;
  /** @format uuid */
  PresenceId?: string | null;
  /**
   * @minLength 0
   * @maxLength 2048
   */
  Uri?: string | null;
  Global?: boolean | null;
}
export interface UploadViewModel {
  /** @format uuid */
  FileId?: string;
  /** @format date-time */
  FileExpiration?: string;
  FileProperties?: Record<string, object | null>;
}
export interface UserInfo {
  Id?: string | null;
  UserName?: string | null;
  FirstName?: string | null;
  LastName?: string | null;
  DisplayName?: string | null;
  Email?: string | null;
  EligibleForTrial?: boolean;
  ReasonForNotEligibleToTrial?: UserInfoReasonForNotEligibleToTrialEnum;
  BlockedEmailDomain?: boolean;
  RegisteredLoginProviders?: string[] | null;
  CurrentLoginProvider?: string | null;
  RegisteredInOkta?: boolean;
  Tenants?: UserOrgRole[] | null;
  /** @format uuid */
  CurrentTenantId?: string | null;
  ShowWelcomeMessage?: boolean;
  HiddenFeatures?: string[] | null;
}
export interface UserModel {
  Id?: string | null;
  UserName?: string | null;
  FirstName?: string | null;
  LastName?: string | null;
  IsAdmin?: boolean;
  /** @format uuid */
  RoleId?: string | null;
  RoleName?: string | null;
  Email?: string | null;
  /** @format date-time */
  CreatedAt?: string | null;
  /** @format date-time */
  LastLogin?: string | null;
  HasApiKey?: boolean;
  Status?: UserModelStatusEnum;
  InvitedBy?: string | null;
}
export interface UserModelPageResultModel {
  Items?: UserModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export interface UserNameModel {
  /**
   * @minLength 0
   * @maxLength 256
   */
  UserName?: string | null;
}
export interface UserOrgRole {
  RoleInfo?: BasicRoleInfo;
  Tenant?: TenantBasicInfo;
  Status?: UserOrgRoleStatusEnum;
  InvitedBy?: BasicUserInfo;
}
/** Represents a user preference */
export interface UserPreference {
  /**
   * @minLength 1
   * @pattern [a-zA-Z0-9_.]{1,256}
   */
  Key: string;
  /**
   * @minLength 1
   * @maxLength 2048
   */
  Value: string;
}
export interface VerAndHashes {
  /**
   * @format int32
   * @min 0
   * @max 256
   */
  Version?: number;
  /** @maxItems 500 */
  Hashes?: string[] | null;
}
export interface WebhookAssociation {
  Scope: WebhookAssociationScopeEnum;
  /** @format uuid */
  ScopeId: string;
}
export interface WebhookModel {
  /**
   * @minLength 0
   * @maxLength 4096
   */
  AuthorizationHeader?: string | null;
  RequestMethod?: WebhookModelRequestMethodEnum;
  /**
   * @minLength 0
   * @maxLength 8192
   */
  RequestBody?: string | null;
  /**
   * @minLength 0
   * @maxLength 256
   */
  ContentType?: string | null;
  /** @format uuid */
  Id: string;
  /** @minLength 1 */
  Uri: string;
  Presence: Presence;
  AssetGroup?: AssetGroupShortModel;
  Global: boolean;
  Event: WebhookModelEventEnum;
}
export interface WebhookModelPageResultModel {
  Items?: WebhookModel[] | null;
  /** @format int64 */
  Count?: number | null;
}
export declare enum ActivationResultActivationStatusEnum {
  Verified = "Verified",
  VerifiedPendingIDPRegistration = "VerifiedPendingIDPRegistration",
  ActivationInvalidLicense = "ActivationInvalidLicense",
  ActivationFailed = "ActivationFailed",
  AccountAssigned = "AccountAssigned",
  Assigned = "Assigned",
  ActivationLinkExpired = "ActivationLinkExpired",
  ShouldFillRegistrationForm = "ShouldFillRegistrationForm",
  DeprecatedInvitation = "DeprecatedInvitation",
  DeprecatedActivation = "DeprecatedActivation",
}
export declare enum ActivationResultMhsErrorEnum {
  None = "None",
  GeneralError = "GeneralError",
  InvalidInput = "InvalidInput",
  MissingCapabilities = "MissingCapabilities",
  MHSLicenseGeneralStructureUnrecognized = "MHSLicenseGeneralStructureUnrecognized",
  MHSLicenseCertificateInvalid = "MHSLicenseCertificateInvalid",
  MHSLicensePasetoSignatureInvalid = "MHSLicensePasetoSignatureInvalid",
  MHSLicensePasetoRawPayloadUnrecognized = "MHSLicensePasetoRawPayloadUnrecognized",
  MHSLicenseInvalidAs360Fingerprint = "MHSLicenseInvalidAs360Fingerprint",
  MHSLicenseDeploymentIdMismatch = "MHSLicenseDeploymentIdMismatch",
  MHSLicenseIssuedEarlierThanCurrentlyUsed = "MHSLicenseIssuedEarlierThanCurrentlyUsed",
  MHSLicenseHasNoRelevantEntitlements = "MHSLicenseHasNoRelevantEntitlements",
  MHSLicenseWasAlreadyUploaded = "MHSLicenseWasAlreadyUploaded",
  MHSLicenseOldFeatureIsMissing = "MHSLicenseOldFeatureIsMissing",
  MHSLicenseChangingPreviousMhsValue = "MHSLicenseChangingPreviousMhsValue",
  MHSLicenseWasIssuedTooLongAgo = "MHSLicenseWasIssuedTooLongAgo",
  MHSLicenseInvalidASoCFingerprint = "MHSLicenseInvalidASoCFingerprint",
}
export declare enum AddMhsLicenseResultMhsErrorEnum {
  None = "None",
  GeneralError = "GeneralError",
  InvalidInput = "InvalidInput",
  MissingCapabilities = "MissingCapabilities",
  MHSLicenseGeneralStructureUnrecognized = "MHSLicenseGeneralStructureUnrecognized",
  MHSLicenseCertificateInvalid = "MHSLicenseCertificateInvalid",
  MHSLicensePasetoSignatureInvalid = "MHSLicensePasetoSignatureInvalid",
  MHSLicensePasetoRawPayloadUnrecognized = "MHSLicensePasetoRawPayloadUnrecognized",
  MHSLicenseInvalidAs360Fingerprint = "MHSLicenseInvalidAs360Fingerprint",
  MHSLicenseDeploymentIdMismatch = "MHSLicenseDeploymentIdMismatch",
  MHSLicenseIssuedEarlierThanCurrentlyUsed = "MHSLicenseIssuedEarlierThanCurrentlyUsed",
  MHSLicenseHasNoRelevantEntitlements = "MHSLicenseHasNoRelevantEntitlements",
  MHSLicenseWasAlreadyUploaded = "MHSLicenseWasAlreadyUploaded",
  MHSLicenseOldFeatureIsMissing = "MHSLicenseOldFeatureIsMissing",
  MHSLicenseChangingPreviousMhsValue = "MHSLicenseChangingPreviousMhsValue",
  MHSLicenseWasIssuedTooLongAgo = "MHSLicenseWasIssuedTooLongAgo",
  MHSLicenseInvalidASoCFingerprint = "MHSLicenseInvalidASoCFingerprint",
}
export declare enum AllowDomainModelUrlTypeEnum {
  Domain = "Domain",
  IpAddress = "IpAddress",
}
export declare enum AllowDomainResultMessageEnum {
  NONE = "NONE",
  APK_PROCESSED = "APK_PROCESSED",
  BLOCK_NEW_SCANS = "BLOCK_NEW_SCANS",
  HIGH_SEVERITY = "HIGH_SEVERITY",
  INCOMPLETE_SCAN_WITH_ISSUES = "INCOMPLETE_SCAN_WITH_ISSUES",
  INVALID_INPUT = "INVALID_INPUT",
  GENERAL_ERROR = "GENERAL_ERROR",
  INVALID_APK_FILE = "INVALID_APK_FILE",
  INVALID_IPA_FILE = "INVALID_IPA_FILE",
  INVALID_IPAX_FILE = "INVALID_IPAX_FILE",
  INVALID_IRX_FILE = "INVALID_IRX_FILE",
  WARNING_UTILITIES_VERSION = "WARNING_UTILITIES_VERSION",
  UNABLE_SCAN_EDITING = "UNABLE_SCAN_EDITING",
  INVALID_DAST_SCAN_CONFIGURATION = "INVALID_DAST_SCAN_CONFIGURATION",
  INVALID_TOTP_CONFIGURATION = "INVALID_TOTP_CONFIGURATION",
  INVALID_TEST_OPERATION_CONFIGURATION = "INVALID_TEST_OPERATION_CONFIGURATION",
  INVALID_JOB_IDENTIFIER = "INVALID_JOB_IDENTIFIER",
  INVALID_SCAN_IDENTIFIER = "INVALID_SCAN_IDENTIFIER",
  INVALID_REPORT_TYPE = "INVALID_REPORT_TYPE",
  INVALID_INCREMENTAL_BASE_JOB_IDENTIFIER = "INVALID_INCREMENTAL_BASE_JOB_IDENTIFIER",
  INCREMENTAL_BASE_SCAN_NO_TEST_STAGE = "INCREMENTAL_BASE_SCAN_NO_TEST_STAGE",
  INCREMENTAL_BASE_JOB_NOT_RELATED_TO_CURRENT_SCAN = "INCREMENTAL_BASE_JOB_NOT_RELATED_TO_CURRENT_SCAN",
  INCREMENTAL_BASE_SCAN_FILE_WAS_DELETED = "INCREMENTAL_BASE_SCAN_FILE_WAS_DELETED",
  LOW_SEVERITY = "LOW_SEVERITY",
  MEDIUM_SEVERITY = "MEDIUM_SEVERITY",
  NOT_ALLOWED_DAST_SCAN_HOST = "NOT_ALLOWED_DAST_SCAN_HOST",
  NOT_ALLOWED_DAST_SCAN_HOST_ADDITIONAL_DOMAIN = "NOT_ALLOWED_DAST_SCAN_HOST_ADDITIONAL_DOMAIN",
  ADDITIONAL_DOMAINS_LIMIT_EXCEEDED = "ADDITIONAL_DOMAINS_LIMIT_EXCEEDED",
  NOT_ASSOCIATED_PRESENCE_TO_APPLICATION = "NOT_ASSOCIATED_PRESENCE_TO_APPLICATION",
  APPLICATION_PRESENCES_LIMIT_EXCEEDED = "APPLICATION_PRESENCES_LIMIT_EXCEEDED",
  NO_ISSUES = "NO_ISSUES",
  REPORT_PROBLEMS = "REPORT_PROBLEMS",
  CLIENT_UTIL_DOWNLOAD_PROBLEMS = "CLIENT_UTIL_DOWNLOAD_PROBLEMS",
  CLIENT_UTIL_NOT_FOUND = "CLIENT_UTIL_NOT_FOUND",
  SCAN_ENDED_WITH_ERROR = "SCAN_ENDED_WITH_ERROR",
  SCAN_FAILURE = "SCAN_FAILURE",
  SCAN_LIMIT_EXCEEDED = "SCAN_LIMIT_EXCEEDED",
  SCAN_CONCURRENT_AND_QUEUED_EXCEEDED = "SCAN_CONCURRENT_AND_QUEUED_EXCEEDED",
  SUCCESSFUL_SCAN_MESSAGE = "SUCCESSFUL_SCAN_MESSAGE",
  UNAUTHORIZED_ACTION = "UNAUTHORIZED_ACTION",
  UNSUPPORTED_UPLOAD_REQUEST_TYPE = "UNSUPPORTED_UPLOAD_REQUEST_TYPE",
  UNSUPPORTED_LOGIN_METHOD = "UNSUPPORTED_LOGIN_METHOD",
  SCAN_STILL_IN_PROGRESS = "SCAN_STILL_IN_PROGRESS",
  SCAN_ALREADY_RUNNING_ON_APPLICATION = "SCAN_ALREADY_RUNNING_ON_APPLICATION",
  FAILED_CANCELLING_SCAN_IN_RESULTS_ANALYSIS_STATE = "FAILED_CANCELLING_SCAN_IN_RESULTS_ANALYSIS_STATE",
  FREE_SCAN_IS_NOT_ALLOWED = "FREE_SCAN_IS_NOT_ALLOWED",
  FREEMIUM_SCAN_NOT_ALLOWED = "FREEMIUM_SCAN_NOT_ALLOWED",
  INVALID_USER = "INVALID_USER",
  NO_RESCAN_WHILE_SCANNING = "NO_RESCAN_WHILE_SCANNING",
  INVALID_SUBSCRIPTION_FOR_SERVICE = "INVALID_SUBSCRIPTION_FOR_SERVICE",
  SUBSCRIPTION_EXPIRED_OR_DEACTIVATED = "SUBSCRIPTION_EXPIRED_OR_DEACTIVATED",
  INVALID_IRX_VERSION = "INVALID_IRX_VERSION",
  IRX_ENCRYPTION_MISMATCHED_ASOC = "IRX_ENCRYPTION_MISMATCHED_ASOC",
  IRX_ENCRYPTION_MISMATCHED_ASOP = "IRX_ENCRYPTION_MISMATCHED_ASOP",
  FEATURE_AVAILABLE_SOON = "FEATURE_AVAILABLE_SOON",
  SPECIFY_VALID_OS = "SPECIFY_VALID_OS",
  SCAN_IS_DELETED = "SCAN_IS_DELETED",
  SCAN_DELETION_NOT_ALLOWED = "SCAN_DELETION_NOT_ALLOWED",
  KNOWN_USER_SCX_LOGIN_ERROR = "KNOWN_USER_SCX_LOGIN_ERROR",
  UNKNOWN_USER_SCX_LOGIN_ERROR = "UNKNOWN_USER_SCX_LOGIN_ERROR",
  GENERAL_LOGIN_ERROR = "GENERAL_LOGIN_ERROR",
  UNKNOWN_USER_SCX_LOGIN_ERROR_API = "UNKNOWN_USER_SCX_LOGIN_ERROR_API",
  GENERAL_LOGIN_ERROR_API = "GENERAL_LOGIN_ERROR_API",
  LOGIN_BLOCKED = "LOGIN_BLOCKED",
  SUBSCRIPTION_SCAN_LIMIT_REACHED = "SUBSCRIPTION_SCAN_LIMIT_REACHED",
  APPLICATION_REQUIRES_OFFERINGTYPE_SWITCH = "APPLICATION_REQUIRES_OFFERINGTYPE_SWITCH",
  RESCAN_DISABLED_ON_FIRST_FAILURE = "RESCAN_DISABLED_ON_FIRST_FAILURE",
  PROMOTE_ON_SCAN_FAILURE = "PROMOTE_ON_SCAN_FAILURE",
  TRIAL_SCAN_LIMIT_REACHED = "TRIAL_SCAN_LIMIT_REACHED",
  PRESENCE_NAME_ALREADY_EXISTS = "PRESENCE_NAME_ALREADY_EXISTS",
  PRESENCE_WAS_DELETED = "PRESENCE_WAS_DELETED",
  PRESENCE_IS_INACTIVE = "PRESENCE_IS_INACTIVE",
  PSS_NOTSUPPORTED_DURING_TRIAL = "PSS_NOTSUPPORTED_DURING_TRIAL",
  INVALID_STARTING_URL = "INVALID_STARTING_URL",
  INVALID_STARTING_URL_LOCALHOST = "INVALID_STARTING_URL_LOCALHOST",
  INVALID_STARTING_URL_SCHEME = "INVALID_STARTING_URL_SCHEME",
  INVALID_LOGIN_SEQUENCE = "INVALID_LOGIN_SEQUENCE",
  SCAN_NAME_MISSING = "SCAN_NAME_MISSING",
  FILE_ID_MISSING = "FILE_ID_MISSING",
  UNABLE_TO_LOAD_FILE_FROM_STORAGE = "UNABLE_TO_LOAD_FILE_FROM_STORAGE",
  FILE_SIZE_LIMIT_EXCEEDED = "FILE_SIZE_LIMIT_EXCEEDED",
  INPUT_LENGTH_LIMIT_EXCEEDED = "INPUT_LENGTH_LIMIT_EXCEEDED",
  WRONG_TECHNOLOGY = "WRONG_TECHNOLOGY",
  THE_FILE_HAS_ALREADY_DELETED = "THE_FILE_HAS_ALREADY_DELETED",
  JOB_IS_NOT_READY = "JOB_IS_NOT_READY",
  MISSING_FILE_EXTENSION = "MISSING_FILE_EXTENSION",
  INCORRECT_FILE_EXTENSION = "INCORRECT_FILE_EXTENSION",
  RESCAN_DISABLED = "RESCAN_DISABLED",
  INSUFFICIENT_SUBSCRIPTION_CREDIT = "INSUFFICIENT_SUBSCRIPTION_CREDIT",
  CONSULTANT_DELETION_NOT_ALLOWED = "CONSULTANT_DELETION_NOT_ALLOWED",
  INVALID_DAST_FILE = "INVALID_DAST_FILE",
  DAST_FILE_REQUIRED = "DAST_FILE_REQUIRED",
  INVALID_URL = "INVALID_URL",
  INVALID_DAST_FILE_RESCAN = "INVALID_DAST_FILE_RESCAN",
  REPORT_IS_NOT_AVAILABLE = "REPORT_IS_NOT_AVAILABLE",
  UPLOAD_DAST_PERMISSION = "UPLOAD_DAST_PERMISSION",
  IFA_SCAN_LIMIT_REACHED = "IFA_SCAN_LIMIT_REACHED",
  INVALID_SCANT_MULTISTEP_TESTONLY = "INVALID_SCANT_MULTISTEP_TESTONLY",
  INVALID_SCAN_MULTISTEP_MANUALEXPL_TESTONLY = "INVALID_SCAN_MULTISTEP_MANUALEXPL_TESTONLY",
  UNABLE_TO_CHANGE_SCAN_OFFERING_TYPE = "UNABLE_TO_CHANGE_SCAN_OFFERING_TYPE",
  UNABLE_TO_USE_TRIAL_SUBSCIPTION_IF_PAID_SUBSCRIPTION_EXISTS = "UNABLE_TO_USE_TRIAL_SUBSCIPTION_IF_PAID_SUBSCRIPTION_EXISTS",
  SCAN_DOES_NOT_MATCH_APPLICATION_RESTRICTIONS_APPTYPE = "SCAN_DOES_NOT_MATCH_APPLICATION_RESTRICTIONS_APPTYPE",
  SCAN_DOES_NOT_MATCH_APPLICATION_RESTRICTIONS_DOMAIN = "SCAN_DOES_NOT_MATCH_APPLICATION_RESTRICTIONS_DOMAIN",
  SCAN_DOES_NOT_MATCH_APPLICATION_RESTRICTIONS_PACKAGE = "SCAN_DOES_NOT_MATCH_APPLICATION_RESTRICTIONS_PACKAGE",
  INVALID_DAST_CONFIG_FILE = "INVALID_DAST_CONFIG_FILE",
  INVALID_IAST_CONFIG_FILE = "INVALID_IAST_CONFIG_FILE",
  APP_CONCURRENT_SCANS_AND_QUEUE_EXCEEDED = "APP_CONCURRENT_SCANS_AND_QUEUE_EXCEEDED",
  MISSING_OFFERING_TYPE = "MISSING_OFFERING_TYPE",
  ASSETGROUP_NAME_ALREADY_EXISTS = "ASSETGROUP_NAME_ALREADY_EXISTS",
  ASSETGROUP_ASSOCIATION_ERROR = "ASSETGROUP_ASSOCIATION_ERROR",
  ASSETGROUP_CHANGE_DEFAULT_NOTALLOWED = "ASSETGROUP_CHANGE_DEFAULT_NOTALLOWED",
  ASSETGROUP_INVALID_CONTACT_PERSON = "ASSETGROUP_INVALID_CONTACT_PERSON",
  ASSETGROUP_OVERRIDE_AUTO_CLOSE_NOTALLOWED = "ASSETGROUP_OVERRIDE_AUTO_CLOSE_NOTALLOWED",
  ROLE_NAME_ALREADY_EXISTS = "ROLE_NAME_ALREADY_EXISTS",
  ROLE_NOT_EXISTS = "ROLE_NOT_EXISTS",
  ROLE_PREDEFINED_DELETION_NOT_ALLOWED = "ROLE_PREDEFINED_DELETION_NOT_ALLOWED",
  ROLE_PREDEFINED_EDIT_NOT_ALLOWED = "ROLE_PREDEFINED_EDIT_NOT_ALLOWED",
  ROLE_DEFAULT_DELETION_NOT_ALLOWED = "ROLE_DEFAULT_DELETION_NOT_ALLOWED",
  ROLE_UNSET_DEFAULT_NOT_ALLOWED = "ROLE_UNSET_DEFAULT_NOT_ALLOWED",
  ROLE_ASSOCIATION_ERROR = "ROLE_ASSOCIATION_ERROR",
  ORGANIZATION_NO_ACCESS = "ORGANIZATION_NO_ACCESS",
  ORGANIZATION_NOT_FOUND = "ORGANIZATION_NOT_FOUND",
  ORGANIZATION_CUSTOMIZATIONS_NOT_FOUND = "ORGANIZATION_CUSTOMIZATIONS_NOT_FOUND",
  UPDATE_ORGANIZATION_LOGO_FAILURE = "UPDATE_ORGANIZATION_LOGO_FAILURE",
  APPLICATION_NAME_ALREADY_EXISTS = "APPLICATION_NAME_ALREADY_EXISTS",
  APPLICATION_NO_ACCESS = "APPLICATION_NO_ACCESS",
  SCAN_NO_ACCESS = "SCAN_NO_ACCESS",
  SCAN_EXECUTION_NO_ACCESS = "SCAN_EXECUTION_NO_ACCESS",
  ISSUE_NO_ACCESS = "ISSUE_NO_ACCESS",
  FIXGROUP_NO_ACCESS = "FIXGROUP_NO_ACCESS",
  PACKAGE_NO_ACCESS = "PACKAGE_NO_ACCESS",
  INVALID_CSV_FILE = "INVALID_CSV_FILE",
  ISSUES_INVALID_IDS = "ISSUES_INVALID_IDS",
  REPORT_IN_PROGRESS_ERROR = "REPORT_IN_PROGRESS_ERROR",
  MISSING_APP_ID = "MISSING_APP_ID",
  MISSING_CAPABILITIES = "MISSING_CAPABILITIES",
  NO_ADMIN_ROLE_ERROR = "NO_ADMIN_ROLE_ERROR",
  NOT_SAME_ASSET_GROUPS = "NOT_SAME_ASSET_GROUPS",
  INVALID_POLICY_ID = "INVALID_POLICY_ID",
  INVALID_POLICY_EXPRESSION = "INVALID_POLICY_EXPRESSION",
  INVALID_POLICY_PARAMETERS = "INVALID_POLICY_PARAMETERS",
  POLICY_ALREADY_ASSOCIATED_TO_APP = "POLICY_ALREADY_ASSOCIATED_TO_APP",
  POLICY_NAME_ALREADY_EXISTS = "POLICY_NAME_ALREADY_EXISTS",
  INVALID_POLICY_IDENTIFIER = "INVALID_POLICY_IDENTIFIER",
  POLICY_PREDEFINED_DELETION_NOT_ALLOWED = "POLICY_PREDEFINED_DELETION_NOT_ALLOWED",
  POLICY_PREDEFINED_MODIFICATION_NOT_ALLOWED = "POLICY_PREDEFINED_MODIFICATION_NOT_ALLOWED",
  POLICY_DELETION_NOT_ALLOWED = "POLICY_DELETION_NOT_ALLOWED",
  POLICY_INVALID_DATE_FORMAT = "POLICY_INVALID_DATE_FORMAT",
  POLICY_INVALID_SEVERITY_VALUE = "POLICY_INVALID_SEVERITY_VALUE",
  POLICY_INVALID_TECHNOLOGY_VALUE = "POLICY_INVALID_TECHNOLOGY_VALUE",
  POLICY_OPERATION_NOT_ERROR = "POLICY_OPERATION_NOT_ERROR",
  POLICY_OPERATION_AND_ERROR = "POLICY_OPERATION_AND_ERROR",
  POLICY_INVALID_EXPRESSION_DEPTH = "POLICY_INVALID_EXPRESSION_DEPTH",
  INVALID_TEST_POLICY_IDENTIFIER = "INVALID_TEST_POLICY_IDENTIFIER",
  INVALID_TEST_POLICY_FILE = "INVALID_TEST_POLICY_FILE",
  INVALID_TEST_POLICY_NAME = "INVALID_TEST_POLICY_NAME",
  TEST_POLICY_NAME_ALREADY_EXISTS = "TEST_POLICY_NAME_ALREADY_EXISTS",
  MISSING_TEST_POLICY_FILE = "MISSING_TEST_POLICY_FILE",
  TEST_POLICY_PREDEFINED_MODIFICATION_NOT_ALLOWED = "TEST_POLICY_PREDEFINED_MODIFICATION_NOT_ALLOWED",
  TEST_POLICY_UNSET_DEFAULT_NOT_ALLOWED = "TEST_POLICY_UNSET_DEFAULT_NOT_ALLOWED",
  SANDBOX_ONLY_PRIVATE_CAN_BE_PROMOTE = "SANDBOX_ONLY_PRIVATE_CAN_BE_PROMOTE",
  PROMOTE_DISABLED_FOR_SCAN = "PROMOTE_DISABLED_FOR_SCAN",
  POLICY_INVALID_CWE_FORMAT = "POLICY_INVALID_CWE_FORMAT",
  POLICY_ASSOCIATION_LIMIT_REACHED = "POLICY_ASSOCIATION_LIMIT_REACHED",
  APPLICATIONS_MISMATCH = "APPLICATIONS_MISMATCH",
  PAY_PER_APP_APPLICATION_CANNOT_BE_DELETED = "PAY_PER_APP_APPLICATION_CANNOT_BE_DELETED",
  PAY_PER_APP_APPLICATION_CANNOT_BE_MODIFIED = "PAY_PER_APP_APPLICATION_CANNOT_BE_MODIFIED",
  ENVIRONMENT_STATUS_ERROR = "ENVIRONMENT_STATUS_ERROR",
  INVALID_LICENSE = "INVALID_LICENSE",
  USER_ALREADY_SUBSCRIBED = "USER_ALREADY_SUBSCRIBED",
  REGISTERATION_FAILURE = "REGISTERATION_FAILURE",
  TRIAL_EXPIRED = "TRIAL_EXPIRED",
  LICENSE_REQUIRED = "LICENSE_REQUIRED",
  REPORT_FILE_TYPE_IS_NOT_SUPPORTED = "REPORT_FILE_TYPE_IS_NOT_SUPPORTED",
  ODATA_QUERY_ERROR = "ODATA_QUERY_ERROR",
  BLOCKED_EMAIL_DOMAIN = "BLOCKED_EMAIL_DOMAIN",
  LOGIN_USING_IBMID_CRED_DEPRECATED = "LOGIN_USING_IBMID_CRED_DEPRECATED",
  DOWNLOAD_TRIAL_SCAN_NOT_PERMITTED = "DOWNLOAD_TRIAL_SCAN_NOT_PERMITTED",
  JOB_STATUS_CHANGE_ERROR = "JOB_STATUS_CHANGE_ERROR",
  INVALID_EMAIL_PATTERN = "INVALID_EMAIL_PATTERN",
  INVALID_EMAIL_DOMAIN = "INVALID_EMAIL_DOMAIN",
  STICKY_STATUS_PERSONAL_SCAN = "STICKY_STATUS_PERSONAL_SCAN",
  STICKY_STATUS_MISSING_STATUS = "STICKY_STATUS_MISSING_STATUS",
  ISSUE_STATUS_NEW_DEPRECATED = "ISSUE_STATUS_NEW_DEPRECATED",
  INVALID_WEBHOOK_IDENTIFIER = "INVALID_WEBHOOK_IDENTIFIER",
  WEBHOOK_OWNED_BY_ASSET_GROUP_ERROR = "WEBHOOK_OWNED_BY_ASSET_GROUP_ERROR",
  INVALID_PRESENCE_IDENTIFIER = "INVALID_PRESENCE_IDENTIFIER",
  INVALID_SCOPE_IDENTIFIER = "INVALID_SCOPE_IDENTIFIER",
  RESCAN_IAST_FORBIDDEN = "RESCAN_IAST_FORBIDDEN",
  INVALID_SUBSCRIPTION_FOR_TECHNOLOGY = "INVALID_SUBSCRIPTION_FOR_TECHNOLOGY",
  SUBSCRIPTION_LIMIT_EXCEEDED = "SUBSCRIPTION_LIMIT_EXCEEDED",
  USER_QUEUE_LIMIT_EXCEEDED = "USER_QUEUE_LIMIT_EXCEEDED",
  DOMAIN_NO_ACCESS = "DOMAIN_NO_ACCESS",
  DOMAIN_INVALID_VERIFICATION_METHOD = "DOMAIN_INVALID_VERIFICATION_METHOD",
  DOMAIN_IS_ALREADY_VERIFIED = "DOMAIN_IS_ALREADY_VERIFIED",
  MOBILE_TECHNOLOGY_NOT_SUPPORTED = "MOBILE_TECHNOLOGY_NOT_SUPPORTED",
  DASTCONFIG_DOMAIN_MISMATCH = "DASTCONFIG_DOMAIN_MISMATCH",
  INVALID_ID_OR_MISSING_CAPABILITIES = "INVALID_ID_OR_MISSING_CAPABILITIES",
  ISSUES_UPDATE_LIMIT_EXCEEDED = "ISSUES_UPDATE_LIMIT_EXCEEDED",
  ASSETGROUP_NO_ACCESS = "ASSETGROUP_NO_ACCESS",
  USER_IS_ASSETGROUP_CONTACT = "USER_IS_ASSETGROUP_CONTACT",
  PRESENCE_NO_ACCESS = "PRESENCE_NO_ACCESS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  DAST_INVALID_TRAFFIC_FILES = "DAST_INVALID_TRAFFIC_FILES",
  INVALID_SCANT_MANUALEXPLORE_TESTONLY = "INVALID_SCANT_MANUALEXPLORE_TESTONLY",
  INVALID_SCAN_WITH_TRAFFIC_CONFIG = "INVALID_SCAN_WITH_TRAFFIC_CONFIG",
  BUSINESS_UNIT_ALREADY_EXISTS = "BUSINESS_UNIT_ALREADY_EXISTS",
  BUSINESS_UNIT_DOES_NOT_EXIST = "BUSINESS_UNIT_DOES_NOT_EXIST",
  BUSINESS_UNIT_IS_ASSOCIATED_WITH_APPS_ERROR = "BUSINESS_UNIT_IS_ASSOCIATED_WITH_APPS_ERROR",
  BUSINESS_UNIT_UPDATE_APP_ERROR = "BUSINESS_UNIT_UPDATE_APP_ERROR",
  BUSINESS_UNITS_TO_MERGE_ARE_EQUAL = "BUSINESS_UNITS_TO_MERGE_ARE_EQUAL",
  INVALID_RECURRENCE = "INVALID_RECURRENCE",
  TOO_MANY_ISSUES_FOR_THIS_ACTION = "TOO_MANY_ISSUES_FOR_THIS_ACTION",
  INVALID_ZIP_FILE = "INVALID_ZIP_FILE",
  INVALID_XML_FILE = "INVALID_XML_FILE",
  INVALID_IMAGE_FILE = "INVALID_IMAGE_FILE",
  AD_LOGIN_DISABLED = "AD_LOGIN_DISABLED",
  INVALID_USR_PWD = "INVALID_USR_PWD",
  INTERNAL_ADMIN_INACTIVE = "INTERNAL_ADMIN_INACTIVE",
  USER_NOT_AUTHORIZED = "USER_NOT_AUTHORIZED",
  PASSWORD_EXPIRED = "PASSWORD_EXPIRED",
  AD_ACCOUNT_LOCKED_OUT = "AD_ACCOUNT_LOCKED_OUT",
  CHANGE_ROLE_NOT_SUPPORTED = "CHANGE_ROLE_NOT_SUPPORTED",
  SCAN_EXECUTIONS_SCAN_LIMIT_EXCEEDED = "SCAN_EXECUTIONS_SCAN_LIMIT_EXCEEDED",
  SCANS_PER_APPLICATION_LIMIT_EXCEEDED = "SCANS_PER_APPLICATION_LIMIT_EXCEEDED",
  ISSUES_PER_APPLICATION_LIMIT_EXCEEDED = "ISSUES_PER_APPLICATION_LIMIT_EXCEEDED",
  NO_METAL_SUBSCRIPTION = "NO_METAL_SUBSCRIPTION",
  TECHNOLOGIES_ALREAY_SET = "TECHNOLOGIES_ALREAY_SET",
  PROVIDED_LIST_IS_TOO_LONG = "PROVIDED_LIST_IS_TOO_LONG",
  INVALID_JSON_FILE = "INVALID_JSON_FILE",
  WRONG_CREDENTIALS = "WRONG_CREDENTIALS",
  INVITATION_REQUIRED = "INVITATION_REQUIRED",
  REGISTER_USERS_MANUAL_ONBOARD = "REGISTER_USERS_MANUAL_ONBOARD",
  RESCAN_SAST_FORBIDDEN = "RESCAN_SAST_FORBIDDEN",
  SCA_DOESNT_SUPPORT_IFA = "SCA_DOESNT_SUPPORT_IFA",
  SCA_DOESNT_SUPPORT_OPEN_SOURCE_FILES = "SCA_DOESNT_SUPPORT_OPEN_SOURCE_FILES",
  ENCRYPTED_DAST_FILE = "ENCRYPTED_DAST_FILE",
  DOWNLOADING_FILE_FAILED = "DOWNLOADING_FILE_FAILED",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  SOURCE_IP_RESTRICTION_VIOLATION = "SOURCE_IP_RESTRICTION_VIOLATION",
  SOURCE_IP_MISMATCH = "SOURCE_IP_MISMATCH",
  PDF_FORMAT_NOT_SUPPORTED = "PDF_FORMAT_NOT_SUPPORTED",
  FILE_NOT_FOUND = "FILE_NOT_FOUND",
  INVALID_TECHNOLOGIES_FOR_SUBSCRIPTION = "INVALID_TECHNOLOGIES_FOR_SUBSCRIPTION",
  SBOM_RAW_DATA_NOT_AVAILABLE = "SBOM_RAW_DATA_NOT_AVAILABLE",
  APP_SCANS_LIMIT_EXCEEDED = "APP_SCANS_LIMIT_EXCEEDED",
  REPORT_SIGNITURE_UNVERIFIED = "REPORT_SIGNITURE_UNVERIFIED",
  SIGNATURE_UNVERIFIED = "SIGNATURE_UNVERIFIED",
  DOMAIN_NOT_FOUND = "DOMAIN_NOT_FOUND",
  PROVIDED_URL_DOMAIN_IS_INVALID = "PROVIDED_URL_DOMAIN_IS_INVALID",
  PROVIDED_IP_IS_INVALID = "PROVIDED_IP_IS_INVALID",
  DOMAIN_VERIFICATION_IS_NOT_REQUIRED_IN_YOUR_ORG = "DOMAIN_VERIFICATION_IS_NOT_REQUIRED_IN_YOUR_ORG",
  DOMAIN_VERIFICATION_IS_REQUIRED_IN_YOUR_ORG = "DOMAIN_VERIFICATION_IS_REQUIRED_IN_YOUR_ORG",
  DOMAIN_ALREADY_BLOCKED = "DOMAIN_ALREADY_BLOCKED",
  PARENT_DOMAIN_IS_ALREADY_BLOCKED = "PARENT_DOMAIN_IS_ALREADY_BLOCKED",
  DOMAIN_ALREADY_ALLOWED = "DOMAIN_ALREADY_ALLOWED",
  PARENT_DOMAIN_IS_ALREADY_ALLOWED = "PARENT_DOMAIN_IS_ALREADY_ALLOWED",
  SUB_DOMAINS_DELETED = "SUB_DOMAINS_DELETED",
  THIS_OPERATION_WILL_EFFECT_THESE_DOMAINS_ARE_YOU_SURE_YOU_WANT_TO_BLOCK_IT = "THIS_OPERATION_WILL_EFFECT_THESE_DOMAINS_ARE_YOU_SURE_YOU_WANT_TO_BLOCK_IT",
  YOUR_ORGANIZATION_DOESNT_ALLOW_ASSOCIATING_DOMAIN_TO_ASSET_GROUPS = "YOUR_ORGANIZATION_DOESNT_ALLOW_ASSOCIATING_DOMAIN_TO_ASSET_GROUPS",
  SCA_STATIC_ONLY_ERROR = "SCA_STATIC_ONLY_ERROR",
  STATIC_SCA_ONLY_ERROR = "STATIC_SCA_ONLY_ERROR",
  REPO_NO_ACCESS = "REPO_NO_ACCESS",
  REPO_SIGNATURE_INVALID = "REPO_SIGNATURE_INVALID",
  FILE_NOT_ALLOWED = "FILE_NOT_ALLOWED",
  SCA_DOESNT_SUPPORT_REPOSITORY = "SCA_DOESNT_SUPPORT_REPOSITORY",
  SAST_RECURRENCE_NO_GIT = "SAST_RECURRENCE_NO_GIT",
  DEMO_SCAN_NO_RECURRENCE = "DEMO_SCAN_NO_RECURRENCE",
  THIS_DOMAIN_IS_FOR_OUR_DEMO_SITE_AND_IS_VERIFIED_BY_DEFAULT = "THIS_DOMAIN_IS_FOR_OUR_DEMO_SITE_AND_IS_VERIFIED_BY_DEFAULT",
  INVALID_ASENC_FILE = "INVALID_ASENC_FILE",
  INVALID_USER_PERMISSTION = "INVALID_USER_PERMISSTION",
  INVALID_ASYMETRIC_KEY = "INVALID_ASYMETRIC_KEY",
  TOO_MANY_USER_PREFERENCES = "TOO_MANY_USER_PREFERENCES",
  INVALID_OPEN_API_FILE = "INVALID_OPEN_API_FILE",
  MISSING_OPEN_AI_CREDENTIALS = "MISSING_OPEN_AI_CREDENTIALS",
  INVALID_OPEN_AI_CREDENTIALS = "INVALID_OPEN_AI_CREDENTIALS",
  DUPLICATE_OPEN_API_METHOD = "DUPLICATE_OPEN_API_METHOD",
  INVALID_DAST_SCAN_METHOD = "INVALID_DAST_SCAN_METHOD",
  MISSING_LOGIN_CREDENTIALS = "MISSING_LOGIN_CREDENTIALS",
  DUPLICATE_LOGIN_METHOD = "DUPLICATE_LOGIN_METHOD",
  MISSING_HTTP_AUTH_CREDENTIALS = "MISSING_HTTP_AUTH_CREDENTIALS",
  INVALID_EXD_FILE = "INVALID_EXD_FILE",
  SEQUENCEDOMAINS_DOES_NOT_MATCH_STRATINGURL_DOMAIN = "SEQUENCEDOMAINS_DOES_NOT_MATCH_STRATINGURL_DOMAIN",
  SCAN_TEMPLATE_MISSING = "SCAN_TEMPLATE_MISSING",
  REPORT_ISSUE_COUNT_LIMIT_EXCEEDED = "REPORT_ISSUE_COUNT_LIMIT_EXCEEDED",
  FRAMEWORK_ISNT_SUPPORTED = "FRAMEWORK_ISNT_SUPPORTED",
  REPLAY_SCRIPT_GENERATION_FAILED = "REPLAY_SCRIPT_GENERATION_FAILED",
  MALFORMED_ISSUE_XML = "MALFORMED_ISSUE_XML",
  ISSUE_INELIGIBLE_FOR_THE_REQUESTED_REPLAY_SCRIPT = "ISSUE_INELIGIBLE_FOR_THE_REQUESTED_REPLAY_SCRIPT",
  CANT_TERMINATE_MACHINE = "CANT_TERMINATE_MACHINE",
  NO_CUSTOM_FIELDS = "NO_CUSTOM_FIELDS",
  COLUMN_NAME_NOT_FOUND = "COLUMN_NAME_NOT_FOUND",
  MISSING_FIELD = "MISSING_FIELD",
  NO_CUSTOM_FIELDS_DEFINED = "NO_CUSTOM_FIELDS_DEFINED",
  CUSTOMFIELD_REQUIRED = "CUSTOMFIELD_REQUIRED",
  CUSTOM_FIELD_ALREADY_EXISTS = "CUSTOM_FIELD_ALREADY_EXISTS",
  COLUMN_NAME_IS_ALREADY_IN_USE = "COLUMN_NAME_IS_ALREADY_IN_USE",
  CUSTOM_FIELD_ID_DOES_NOT_EXIST = "CUSTOM_FIELD_ID_DOES_NOT_EXIST",
  SCA_SBOM_FILE_NOT_PERSONAL = "SCA_SBOM_FILE_NOT_PERSONAL",
  SBOM_FILE_NOT_SCA = "SBOM_FILE_NOT_SCA",
  SBOM_FILE_NOT_PROMOTE = "SBOM_FILE_NOT_PROMOTE",
  MISSING_PACKAGE_INFORMATION = "MISSING_PACKAGE_INFORMATION",
  COULD_NOT_RETRIEVE_DATA_ABOUT_THE_PACKAGE = "COULD_NOT_RETRIEVE_DATA_ABOUT_THE_PACKAGE",
  FEATURE_IS_DISABLED_FOR_YOUR_ORG = "FEATURE_IS_DISABLED_FOR_YOUR_ORG",
  SCAN_TEMPLATE_NAME_ALREADY_EXISTS = "SCAN_TEMPLATE_NAME_ALREADY_EXISTS",
  SCAN_TEMPLATE_NOT_FOUND = "SCAN_TEMPLATE_NOT_FOUND",
  SCAN_TEMPLATE_IS_DISABLED = "SCAN_TEMPLATE_IS_DISABLED",
  SCAN_TEMPLATE_WAS_NOT_ASSOCIATED_TO_ASSET_GROUP_CORRECTLY = "SCAN_TEMPLATE_WAS_NOT_ASSOCIATED_TO_ASSET_GROUP_CORRECTLY",
  INVALID_SCAN_TEMPLATE_CONFIGURATION = "INVALID_SCAN_TEMPLATE_CONFIGURATION",
  UNABLE_TO_SAVE_SCAN_TEMPLATE_CONFIGURATION = "UNABLE_TO_SAVE_SCAN_TEMPLATE_CONFIGURATION",
  MISSING_LOGS = "MISSING_LOGS",
  SAST_GIT_SCAN_BRANCH_UPDATE_NOT_ALLOWED = "SAST_GIT_SCAN_BRANCH_UPDATE_NOT_ALLOWED",
  EXTERNAL_IDP_MODE_NOT_SUPPORTED_FOR_OIDC = "EXTERNAL_IDP_MODE_NOT_SUPPORTED_FOR_OIDC",
  ORG_SETTING_ALREADY_EXISTS = "ORG_SETTING_ALREADY_EXISTS",
  SCA_SERVICE_URL_NOT_SUPPORTED_IN_THIS_ENVIRONMENT = "SCA_SERVICE_URL_NOT_SUPPORTED_IN_THIS_ENVIRONMENT",
  FILE_ENCRYPTION_UNAUTHORIZED_ENVIRONMENT = "FILE_ENCRYPTION_UNAUTHORIZED_ENVIRONMENT",
  FILE_DECRYPTION_FAILED = "FILE_DECRYPTION_FAILED",
  SETTINGS_ARE_DEFINED_IN_JSON_FILE = "SETTINGS_ARE_DEFINED_IN_JSON_FILE",
  COULD_NOT_CONNECT_TO_USER_LDAP_CONFIG = "COULD_NOT_CONNECT_TO_USER_LDAP_CONFIG",
  COULD_NOT_CONNECT_TO_USER_SSO_CONFIG = "COULD_NOT_CONNECT_TO_USER_SSO_CONFIG",
  SSO_URL_MUST_USE_HTTPS = "SSO_URL_MUST_USE_HTTPS",
  FAILED_TO_RESTAT_DEPLOYMENT = "FAILED_TO_RESTAT_DEPLOYMENT",
  SCAN_PROP_CANNOT_BE_UPDATED = "SCAN_PROP_CANNOT_BE_UPDATED",
  DEMO_SCAN_MUST_BE_EXECUTED = "DEMO_SCAN_MUST_BE_EXECUTED",
  DEMO_SCAN_NO_RESCAN = "DEMO_SCAN_NO_RESCAN",
  SCAN_EXECUTION_NOT_IN_A_STATE_TO_CREATE_PATCH = "SCAN_EXECUTION_NOT_IN_A_STATE_TO_CREATE_PATCH",
  NOT_ALL_ISSUES_HAVE_FIXES_IN_SCAN_EXECUTION = "NOT_ALL_ISSUES_HAVE_FIXES_IN_SCAN_EXECUTION",
  SCAN_EXECUTION_NOT_IN_A_STATE_FOR_RAPIDFIX_RECOMMANDATION = "SCAN_EXECUTION_NOT_IN_A_STATE_FOR_RAPIDFIX_RECOMMANDATION",
  ISSUE_NOT_IN_CONTEXT = "ISSUE_NOT_IN_CONTEXT",
  INVALID_PATCH_IDENTIFIER = "INVALID_PATCH_IDENTIFIER",
  PATCH_ALREADY_COMPLETED = "PATCH_ALREADY_COMPLETED",
  RAPIDFIX_ANALYSIS_ID_MISMATCH = "RAPIDFIX_ANALYSIS_ID_MISMATCH",
  URL_SIGNITURE_UNVERIFIED = "URL_SIGNITURE_UNVERIFIED",
  INVALID_DIFF_FILE = "INVALID_DIFF_FILE",
}
export declare enum AppCommentModelSourceTypeEnum {
  Issue = "Issue",
  FixGroup = "FixGroup",
}
export declare enum ApplicationCreateModelBusinessImpactEnum {
  Unspecified = "Unspecified",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}
export declare enum ApplicationCreateModelTestingStatusEnum {
  NotStarted = "NotStarted",
  InProgress = "InProgress",
  Completed = "Completed",
}
export declare enum ApplicationCreateModelCollateralDamagePotentialEnum {
  NotDefined = "NotDefined",
  None = "None",
  Low = "Low",
  LowMedium = "LowMedium",
  MediumHigh = "MediumHigh",
  High = "High",
}
export declare enum ApplicationCreateModelTargetDistributionEnum {
  NotDefined = "NotDefined",
  None = "None",
  Low = "Low",
  Medium = "Medium",
  High = "High",
}
export declare enum ApplicationCreateModelConfidentialityRequirementEnum {
  NotDefined = "NotDefined",
  Low = "Low",
  Medium = "Medium",
  High = "High",
}
export declare enum ApplicationCreateModelIntegrityRequirementEnum {
  NotDefined = "NotDefined",
  Low = "Low",
  Medium = "Medium",
  High = "High",
}
export declare enum ApplicationCreateModelAvailabilityRequirementEnum {
  NotDefined = "NotDefined",
  Low = "Low",
  Medium = "Medium",
  High = "High",
}
export declare enum ApplicationCreateModelPreferredOfferingTypeEnum {
  None = "None",
  ScanExecution = "ScanExecution",
  Applications = "Applications",
}
export declare enum ApplicationModelRiskRatingEnum {
  Unknown = "Unknown",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}
export declare enum ApplicationModelMaxSeverityEnum {
  Undetermined = "Undetermined",
  Informational = "Informational",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}
export declare enum ApplicationModelCorrelationStateEnum {
  None = "None",
  Active = "Active",
  InProgress = "InProgress",
}
export declare enum ApplicationModelBusinessImpactEnum {
  Unspecified = "Unspecified",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}
export declare enum ApplicationModelTestingStatusEnum {
  NotStarted = "NotStarted",
  InProgress = "InProgress",
  Completed = "Completed",
}
export declare enum ApplicationModelCollateralDamagePotentialEnum {
  NotDefined = "NotDefined",
  None = "None",
  Low = "Low",
  LowMedium = "LowMedium",
  MediumHigh = "MediumHigh",
  High = "High",
}
export declare enum ApplicationModelTargetDistributionEnum {
  NotDefined = "NotDefined",
  None = "None",
  Low = "Low",
  Medium = "Medium",
  High = "High",
}
export declare enum ApplicationModelConfidentialityRequirementEnum {
  NotDefined = "NotDefined",
  Low = "Low",
  Medium = "Medium",
  High = "High",
}
export declare enum ApplicationModelIntegrityRequirementEnum {
  NotDefined = "NotDefined",
  Low = "Low",
  Medium = "Medium",
  High = "High",
}
export declare enum ApplicationModelAvailabilityRequirementEnum {
  NotDefined = "NotDefined",
  Low = "Low",
  Medium = "Medium",
  High = "High",
}
export declare enum ApplicationModelPreferredOfferingTypeEnum {
  None = "None",
  ScanExecution = "ScanExecution",
  Applications = "Applications",
}
export declare enum ApplicationModelScanTechnologiesEnum {
  NONE = "NONE",
  DAST = "DAST",
  SAST = "SAST",
  IAST = "IAST",
  SCA = "SCA",
}
export declare enum ApplicationUpdateModelBusinessImpactEnum {
  Unspecified = "Unspecified",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}
export declare enum ApplicationUpdateModelTestingStatusEnum {
  NotStarted = "NotStarted",
  InProgress = "InProgress",
  Completed = "Completed",
}
export declare enum ApplicationUpdateModelCollateralDamagePotentialEnum {
  NotDefined = "NotDefined",
  None = "None",
  Low = "Low",
  LowMedium = "LowMedium",
  MediumHigh = "MediumHigh",
  High = "High",
}
export declare enum ApplicationUpdateModelTargetDistributionEnum {
  NotDefined = "NotDefined",
  None = "None",
  Low = "Low",
  Medium = "Medium",
  High = "High",
}
export declare enum ApplicationUpdateModelConfidentialityRequirementEnum {
  NotDefined = "NotDefined",
  Low = "Low",
  Medium = "Medium",
  High = "High",
}
export declare enum ApplicationUpdateModelIntegrityRequirementEnum {
  NotDefined = "NotDefined",
  Low = "Low",
  Medium = "Medium",
  High = "High",
}
export declare enum ApplicationUpdateModelAvailabilityRequirementEnum {
  NotDefined = "NotDefined",
  Low = "Low",
  Medium = "Medium",
  High = "High",
}
export declare enum ApplicationUpdateModelPreferredOfferingTypeEnum {
  None = "None",
  ScanExecution = "ScanExecution",
  Applications = "Applications",
}
export declare enum AssetGroupModelIssuesStatusInheritanceEnum {
  None = "None",
  Noise = "Noise",
  Fixed = "Fixed",
}
export declare enum AuditEffectedEntityEntityTypeEnum {
  Organization = "Organization",
  AssetGroup = "AssetGroup",
  User = "User",
  UserRole = "UserRole",
  App = "App",
  Scan = "Scan",
  ScanExecution = "ScanExecution",
  Presence = "Presence",
  IssueBulk = "IssueBulk",
  FixGroup = "FixGroup",
  Policy = "Policy",
  Session = "Session",
  BusinessUnit = "BusinessUnit",
  Domain = "Domain",
  TestPolicy = "TestPolicy",
  CustomFields = "CustomFields",
  ScanTemplate = "ScanTemplate",
  OrgSetting = "OrgSetting",
}
export declare enum AuditModelActionEnum {
  Login = "Login",
  Create = "Create",
  Update = "Update",
  Delete = "Delete",
}
export declare enum AuditModelActivityEnum {
  Login = "Login",
  Create = "Create",
  Update = "Update",
  Delete = "Delete",
  Reset = "Reset",
  Associate = "Associate",
  Disassociate = "Disassociate",
  CreateReport = "CreateReport",
  InviteUser = "InviteUser",
  Add = "Add",
  Remove = "Remove",
  UpdateIssuesBulk = "UpdateIssuesBulk",
  DeleteScanExecutions = "DeleteScanExecutions",
  BlockDomain = "BlockDomain",
  AllowDomain = "AllowDomain",
}
export declare enum AuditModelEntityTypeEnum {
  Organization = "Organization",
  AssetGroup = "AssetGroup",
  User = "User",
  UserRole = "UserRole",
  App = "App",
  Scan = "Scan",
  ScanExecution = "ScanExecution",
  Presence = "Presence",
  IssueBulk = "IssueBulk",
  FixGroup = "FixGroup",
  Policy = "Policy",
  Session = "Session",
  BusinessUnit = "BusinessUnit",
  Domain = "Domain",
  TestPolicy = "TestPolicy",
  CustomFields = "CustomFields",
  ScanTemplate = "ScanTemplate",
  OrgSetting = "OrgSetting",
}
export declare enum BlockedDomainModelUrlTypeEnum {
  Domain = "Domain",
  IpAddress = "IpAddress",
}
export declare enum ChartCreateModelMetricsEnum {
  RiskRating = "RiskRating",
  TestingStatus = "TestingStatus",
  Issues = "Issues",
  MTTR = "MTTR",
  ScanExecutions = "ScanExecutions",
}
export declare enum ChartFilterModelMinSeverityEnum {
  Undetermined = "Undetermined",
  Informational = "Informational",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}
export declare enum ComplianceStatusCategoryEnum {
  Custom = "Custom",
  Security = "Security",
  Regulation = "Regulation",
  IndustryStandard = "IndustryStandard",
}
export declare enum CorrelationGroupModelStatusEnum {
  Open = "Open",
  InProgress = "InProgress",
  Reopened = "Reopened",
  Noise = "Noise",
  Passed = "Passed",
  Fixed = "Fixed",
  New = "New",
}
export declare enum CorrelationGroupModelSeverityEnum {
  Undetermined = "Undetermined",
  Informational = "Informational",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}
export declare enum CountPerFinalStatusStatusEnum {
  Completed = "Completed",
  Failed = "Failed",
  Other = "Other",
}
export declare enum CountPerTechnologiesTechnologiesEnum {
  NONE = "NONE",
  DAST = "DAST",
  SAST = "SAST",
  IAST = "IAST",
  SCA = "SCA",
}
export declare enum CustomFieldModelValueTypeEnum {
  String = "String",
  DateTime = "DateTime",
}
export declare enum CustomFieldRequestModelValueTypeEnum {
  String = "String",
  DateTime = "DateTime",
}
export declare enum CustomFieldResponseModelValueTypeEnum {
  String = "String",
  DateTime = "DateTime",
}
export declare enum DastScanExecutionModelStatusEnum {
  Running = "Running",
  Stopping = "Stopping",
  Pausing = "Pausing",
  InQueue = "InQueue",
  Paused = "Paused",
  Ready = "Ready",
  Failed = "Failed",
}
export declare enum DastScanExecutionModelResultEnum {
  None = "None",
  NoIssues = "NoIssues",
  Informational = "Informational",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}
export declare enum DastScanExecutionModelReadStatusEnum {
  None = "None",
  Unread = "Unread",
  Read = "Read",
}
export declare enum DastScanExecutionModelAvailableReportsEnum {
  Xml = "Xml",
  Pdf = "Pdf",
  Html = "Html",
  CompliancePdf = "CompliancePdf",
  OwaspTop10Pdf = "OwaspTop10Pdf",
  Sans25Pdf = "Sans25Pdf",
  RawXml = "RawXml",
  Zip = "Zip",
  Json = "Json",
}
export declare enum DastScanExecutionModelExecutionProgressEnum {
  Pending = "Pending",
  Running = "Running",
  UnderReview = "UnderReview",
  RunningManually = "RunningManually",
  Paused = "Paused",
  Completed = "Completed",
}
export declare enum DastScanModelTechnologyEnum {
  DynamicAnalyzer = "DynamicAnalyzer",
  StaticAnalyzer = "StaticAnalyzer",
  IFA = "IFA",
  DastAutomation = "DastAutomation",
  IASTAnalyzer = "IASTAnalyzer",
  ScaAnalyzer = "ScaAnalyzer",
}
export declare enum DastScanModelIastAgentStatusEnum {
  None = "None",
  Active = "Active",
  KeyNeverUsed = "KeyNeverUsed",
  Inactive = "Inactive",
}
export declare enum DastScanModelIastAgentTypeEnum {
  Java = "Java",
  DotNet = "DotNet",
  NodeJS = "NodeJS",
  PhpWindows = "PhpWindows",
  PhpRedHat = "PhpRedHat",
  PhpUbuntu = "PhpUbuntu",
  Kubernetes = "Kubernetes",
}
export declare enum DastScanModelOfferingTypeEnum {
  None = "None",
  Trial = "Trial",
  HTrial = "HTrial",
  Applications = "Applications",
  ScanExecution = "ScanExecution",
  AnalyzerConcurrent = "AnalyzerConcurrent",
  ConsultantServices = "ConsultantServices",
  Premium = "Premium",
  OpenSourcePerApplication = "OpenSourcePerApplication",
  OpenSourcePremium = "OpenSourcePremium",
  OpenSourceConcurrent = "OpenSourceConcurrent",
  IASTConcurrent = "IASTConcurrent",
  IASTPayPerApp = "IASTPayPerApp",
  Promotional = "Promotional",
  Silver = "Silver",
  Gold = "Gold",
  Platinum = "Platinum",
  SCAPerApplication = "SCAPerApplication",
  ContributingUser = "ContributingUser",
  SilverContribUser = "SilverContribUser",
  GoldContribUser = "GoldContribUser",
  PlatinumContribUser = "PlatinumContribUser",
  SilverPerApp = "SilverPerApp",
  GoldPerApp = "GoldPerApp",
  PlatinumPerApp = "PlatinumPerApp",
}
export declare enum DastScanModelLoginConfigurationTypeEnum {
  None = "None",
  LoginSequence = "LoginSequence",
  LoginFile = "LoginFile",
  AutomaticLogin = "AutomaticLogin",
  LoginRequests = "LoginRequests",
  ApiKeyLogin = "ApiKeyLogin",
}
export declare enum DastScanModelTestOperationEnum {
  None = "None",
  Retest = "Retest",
  ContinueTest = "ContinueTest",
  ReportOnly = "ReportOnly",
}
export declare enum DastScanModelScanMethodEnum {
  Configured = "Configured",
  APIPostman = "APIPostman",
  APIOpenAPI = "APIOpenAPI",
  APIRecordedTraffic = "APIRecordedTraffic",
  Template = "Template",
  ScanFile = "ScanFile",
}
export declare enum DastTemplateConfigurationLoginConfigurationTypeEnum {
  None = "None",
  LoginSequence = "LoginSequence",
  LoginFile = "LoginFile",
  AutomaticLogin = "AutomaticLogin",
  LoginRequests = "LoginRequests",
  ApiKeyLogin = "ApiKeyLogin",
}
export declare enum DastTemplateConfigurationDastScanMethodEnum {
  Configured = "Configured",
  APIPostman = "APIPostman",
  APIOpenAPI = "APIOpenAPI",
  APIRecordedTraffic = "APIRecordedTraffic",
  Template = "Template",
  ScanFile = "ScanFile",
}
export declare enum DastUserScanConfigurationExtendedOtpHashTypeEnum {
  None = "None",
  Sha1 = "Sha1",
  Sha256 = "Sha256",
  Sha512 = "Sha512",
}
export declare enum DastUserScanConfigurationExtendedPredefinedTestPolicyEnum {
  Complete = "Complete",
  Default = "Default",
  OwaspTop10Api = "OwaspTop10Api",
  OwaspTop10 = "OwaspTop10",
  ProductionSite = "ProductionSite",
  Custom = "Custom",
}
export declare enum DastUserScanConfigurationExtendedTestOptimizationLevelEnum {
  NoOptimization = "NoOptimization",
  Fast = "Fast",
  Faster = "Faster",
  Fastest = "Fastest",
}
export declare enum DomainModelUrlTypeEnum {
  Domain = "Domain",
  IpAddress = "IpAddress",
}
export declare enum DomainModelTypeEnum {
  Support = "Support",
  Html = "Html",
  Email = "Email",
  DnsComparison = "DnsComparison",
  Manually = "Manually",
}
export declare enum DomainModelStatusEnum {
  None = "None",
  Verified = "Verified",
  Pending = "Pending",
}
export declare enum DomainOwnershipModelMailPrefixEnum {
  Admin = "Admin",
  Administrator = "Administrator",
  HostMaster = "HostMaster",
  Root = "Root",
  WebMaster = "WebMaster",
  PostMaster = "PostMaster",
}
export declare enum DomainOwnershipModelVerificationModelMailPrefixEnum {
  Admin = "Admin",
  Administrator = "Administrator",
  HostMaster = "HostMaster",
  Root = "Root",
  WebMaster = "WebMaster",
  PostMaster = "PostMaster",
}
export declare enum ExcludeExceptionModelTypeEnum {
  Exclude = "Exclude",
  Exception = "Exception",
}
export declare enum ExploreItemTrafficTypeEnum {
  Undefined = "Undefined",
  Manual = "Manual",
  MultiStep = "MultiStep",
  Llm = "Llm",
}
export declare enum FixGroupFixGroupTypeEnum {
  OpenSourceLib = "OpenSourceLib",
  FixLocation = "FixLocation",
  Api = "Api",
}
export declare enum FixGroupFixLocationEntityTypeEnum {
  None = "None",
  ImplementationOf = "ImplementationOf",
  UsageOf = "UsageOf",
}
export declare enum FixGroupSeverityEnum {
  Undetermined = "Undetermined",
  Informational = "Informational",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}
export declare enum FixGroupStatusEnum {
  Open = "Open",
  InProgress = "InProgress",
  Reopened = "Reopened",
  Noise = "Noise",
  Passed = "Passed",
  Fixed = "Fixed",
  New = "New",
}
export declare enum FixGroupUpdateStatusEnum {
  Open = "Open",
  InProgress = "InProgress",
  Noise = "Noise",
  Passed = "Passed",
  Fixed = "Fixed",
  New = "New",
}
export declare enum GeneralScanExecutionModelStatusEnum {
  Running = "Running",
  Stopping = "Stopping",
  Pausing = "Pausing",
  InQueue = "InQueue",
  Paused = "Paused",
  Ready = "Ready",
  Failed = "Failed",
}
export declare enum GeneralScanExecutionModelResultEnum {
  None = "None",
  NoIssues = "NoIssues",
  Informational = "Informational",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}
export declare enum GeneralScanExecutionModelReadStatusEnum {
  None = "None",
  Unread = "Unread",
  Read = "Read",
}
export declare enum GeneralScanExecutionModelAvailableReportsEnum {
  Xml = "Xml",
  Pdf = "Pdf",
  Html = "Html",
  CompliancePdf = "CompliancePdf",
  OwaspTop10Pdf = "OwaspTop10Pdf",
  Sans25Pdf = "Sans25Pdf",
  RawXml = "RawXml",
  Zip = "Zip",
  Json = "Json",
}
export declare enum GeneralScanExecutionModelExecutionProgressEnum {
  Pending = "Pending",
  Running = "Running",
  UnderReview = "UnderReview",
  RunningManually = "RunningManually",
  Paused = "Paused",
  Completed = "Completed",
}
export declare enum GlobalEnvironmentInfoExternalIdpModeEnum {
  Disabled = "Disabled",
  AutoOnboard = "AutoOnboard",
  ManualOnboard = "ManualOnboard",
  GroupsAccess = "GroupsAccess",
  MapGroupsToRoles = "MapGroupsToRoles",
}
export declare enum IastScanExecutionModelStatusEnum {
  Running = "Running",
  Stopping = "Stopping",
  Pausing = "Pausing",
  InQueue = "InQueue",
  Paused = "Paused",
  Ready = "Ready",
  Failed = "Failed",
}
export declare enum IastScanExecutionModelResultEnum {
  None = "None",
  NoIssues = "NoIssues",
  Informational = "Informational",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}
export declare enum IastScanExecutionModelReadStatusEnum {
  None = "None",
  Unread = "Unread",
  Read = "Read",
}
export declare enum IastScanExecutionModelAvailableReportsEnum {
  Xml = "Xml",
  Pdf = "Pdf",
  Html = "Html",
  CompliancePdf = "CompliancePdf",
  OwaspTop10Pdf = "OwaspTop10Pdf",
  Sans25Pdf = "Sans25Pdf",
  RawXml = "RawXml",
  Zip = "Zip",
  Json = "Json",
}
export declare enum IastScanExecutionModelExecutionProgressEnum {
  Pending = "Pending",
  Running = "Running",
  UnderReview = "UnderReview",
  RunningManually = "RunningManually",
  Paused = "Paused",
  Completed = "Completed",
}
export declare enum IastScanModelTechnologyEnum {
  DynamicAnalyzer = "DynamicAnalyzer",
  StaticAnalyzer = "StaticAnalyzer",
  IFA = "IFA",
  DastAutomation = "DastAutomation",
  IASTAnalyzer = "IASTAnalyzer",
  ScaAnalyzer = "ScaAnalyzer",
}
export declare enum IastScanModelIastAgentStatusEnum {
  None = "None",
  Active = "Active",
  KeyNeverUsed = "KeyNeverUsed",
  Inactive = "Inactive",
}
export declare enum IastScanModelIastAgentTypeEnum {
  Java = "Java",
  DotNet = "DotNet",
  NodeJS = "NodeJS",
  PhpWindows = "PhpWindows",
  PhpRedHat = "PhpRedHat",
  PhpUbuntu = "PhpUbuntu",
  Kubernetes = "Kubernetes",
}
export declare enum IastScanModelOfferingTypeEnum {
  None = "None",
  Trial = "Trial",
  HTrial = "HTrial",
  Applications = "Applications",
  ScanExecution = "ScanExecution",
  AnalyzerConcurrent = "AnalyzerConcurrent",
  ConsultantServices = "ConsultantServices",
  Premium = "Premium",
  OpenSourcePerApplication = "OpenSourcePerApplication",
  OpenSourcePremium = "OpenSourcePremium",
  OpenSourceConcurrent = "OpenSourceConcurrent",
  IASTConcurrent = "IASTConcurrent",
  IASTPayPerApp = "IASTPayPerApp",
  Promotional = "Promotional",
  Silver = "Silver",
  Gold = "Gold",
  Platinum = "Platinum",
  SCAPerApplication = "SCAPerApplication",
  ContributingUser = "ContributingUser",
  SilverContribUser = "SilverContribUser",
  GoldContribUser = "GoldContribUser",
  PlatinumContribUser = "PlatinumContribUser",
  SilverPerApp = "SilverPerApp",
  GoldPerApp = "GoldPerApp",
  PlatinumPerApp = "PlatinumPerApp",
}
export declare enum InviteResultInviteStatusEnum {
  Success = "Success",
  BlockedEmail = "BlockedEmail",
  InvalidEmail = "InvalidEmail",
  AlreadyExist = "AlreadyExist",
  Failed = "Failed",
  EmailSentRecently = "EmailSentRecently",
}
export declare enum IssueModelSeverityEnum {
  Undetermined = "Undetermined",
  Informational = "Informational",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}
export declare enum IssueModelStatusEnum {
  Open = "Open",
  InProgress = "InProgress",
  Reopened = "Reopened",
  Noise = "Noise",
  Passed = "Passed",
  Fixed = "Fixed",
  New = "New",
}
export declare enum IssueModelAppPkgStatusEnum {
  Discovered = "Discovered",
  Rediscovered = "Rediscovered",
  Removed = "Removed",
}
export declare enum IssueModelFgStatusEnum {
  Open = "Open",
  InProgress = "InProgress",
  Reopened = "Reopened",
  Noise = "Noise",
  Passed = "Passed",
  Fixed = "Fixed",
  New = "New",
}
export declare enum IssueModelCvssVersionEnum {
  None = "None",
  Cvss20 = "Cvss20",
  Cvss30 = "Cvss30",
  Cvss31 = "Cvss31",
}
export declare enum IssueModelDiffResultEnum {
  NoChange = "NoChange",
  Added = "Added",
  Removed = "Removed",
}
export declare enum IssueModelReplayScriptFrameworksEnum {
  None = "None",
  Python = "Python",
  JsConsole = "JsConsole",
}
export declare enum IssuesReportJobApplyPoliciesEnum {
  None = "None",
  All = "All",
  Select = "Select",
}
export declare enum JobsStatisticsModelScanTechnologyEnum {
  DynamicAnalyzer = "DynamicAnalyzer",
  StaticAnalyzer = "StaticAnalyzer",
  IFA = "IFA",
  DastAutomation = "DastAutomation",
  IASTAnalyzer = "IASTAnalyzer",
  ScaAnalyzer = "ScaAnalyzer",
}
export declare enum LibraryModelHighestIssueSeverityEnum {
  Undetermined = "Undetermined",
  Informational = "Informational",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}
export declare enum LibraryModelStatusEnum {
  Discovered = "Discovered",
  Rediscovered = "Rediscovered",
  Removed = "Removed",
}
export declare enum LicenseLibraryModelRiskLevelEnum {
  Undefined = "Undefined",
  Unknown = "Unknown",
  Low = "Low",
  Medium = "Medium",
  High = "High",
}
export declare enum LicenseLibraryModelCopyrightRiskScoreEnum {
  UNDEFINED = "UNDEFINED",
  ONE = "ONE",
  TWO = "TWO",
  THREE = "THREE",
  FOUR = "FOUR",
  FIVE = "FIVE",
  SIX = "SIX",
  SEVEN = "SEVEN",
}
export declare enum LicenseLibraryModelPatentRiskScoreEnum {
  UNDEFINED = "UNDEFINED",
  ONE = "ONE",
  TWO = "TWO",
  THREE = "THREE",
  FOUR = "FOUR",
}
export declare enum LicenseLibraryModelLinkingEnum {
  Undefined = "Undefined",
  Viral = "Viral",
  NonViral = "Non_Viral",
  Dynamic = "Dynamic",
}
export declare enum LicenseLibraryModelCopyLeftEnum {
  Undefined = "Undefined",
  No = "No",
  Partial = "Partial",
  Full = "Full",
}
export declare enum LicenseLibraryModelRoyaltyFreeEnum {
  Yes = "Yes",
  Conditional = "Conditional",
  No = "No",
  Undefined = "Undefined",
}
export declare enum LicenseLibraryModelStatusEnum {
  Discovered = "Discovered",
  Rediscovered = "Rediscovered",
  Removed = "Removed",
}
export declare enum LicenseModelRiskLevelEnum {
  Undefined = "Undefined",
  Unknown = "Unknown",
  Low = "Low",
  Medium = "Medium",
  High = "High",
}
export declare enum LicenseModelCopyrightRiskScoreEnum {
  UNDEFINED = "UNDEFINED",
  ONE = "ONE",
  TWO = "TWO",
  THREE = "THREE",
  FOUR = "FOUR",
  FIVE = "FIVE",
  SIX = "SIX",
  SEVEN = "SEVEN",
}
export declare enum LicenseModelPatentRiskScoreEnum {
  UNDEFINED = "UNDEFINED",
  ONE = "ONE",
  TWO = "TWO",
  THREE = "THREE",
  FOUR = "FOUR",
}
export declare enum LicenseModelLinkingEnum {
  Undefined = "Undefined",
  Viral = "Viral",
  NonViral = "Non_Viral",
  Dynamic = "Dynamic",
}
export declare enum LicenseModelCopyLeftEnum {
  Undefined = "Undefined",
  No = "No",
  Partial = "Partial",
  Full = "Full",
}
export declare enum LicenseModelRoyaltyFreeEnum {
  Yes = "Yes",
  Conditional = "Conditional",
  No = "No",
  Undefined = "Undefined",
}
export declare enum LicenseReportOptionsReportFileTypeEnum {
  Pdf = "Pdf",
  Html = "Html",
  Xml = "Xml",
  Csv = "Csv",
  Sarif = "Sarif",
}
export declare enum MhsPayloadAscpSignatureMhsErrorEnum {
  None = "None",
  GeneralError = "GeneralError",
  InvalidInput = "InvalidInput",
  MissingCapabilities = "MissingCapabilities",
  MHSLicenseGeneralStructureUnrecognized = "MHSLicenseGeneralStructureUnrecognized",
  MHSLicenseCertificateInvalid = "MHSLicenseCertificateInvalid",
  MHSLicensePasetoSignatureInvalid = "MHSLicensePasetoSignatureInvalid",
  MHSLicensePasetoRawPayloadUnrecognized = "MHSLicensePasetoRawPayloadUnrecognized",
  MHSLicenseInvalidAs360Fingerprint = "MHSLicenseInvalidAs360Fingerprint",
  MHSLicenseDeploymentIdMismatch = "MHSLicenseDeploymentIdMismatch",
  MHSLicenseIssuedEarlierThanCurrentlyUsed = "MHSLicenseIssuedEarlierThanCurrentlyUsed",
  MHSLicenseHasNoRelevantEntitlements = "MHSLicenseHasNoRelevantEntitlements",
  MHSLicenseWasAlreadyUploaded = "MHSLicenseWasAlreadyUploaded",
  MHSLicenseOldFeatureIsMissing = "MHSLicenseOldFeatureIsMissing",
  MHSLicenseChangingPreviousMhsValue = "MHSLicenseChangingPreviousMhsValue",
  MHSLicenseWasIssuedTooLongAgo = "MHSLicenseWasIssuedTooLongAgo",
  MHSLicenseInvalidASoCFingerprint = "MHSLicenseInvalidASoCFingerprint",
}
export declare enum MinPresenceDataStatusEnum {
  Active = "Active",
  NeverUsed = "NeverUsed",
  KeyExpired = "KeyExpired",
  KeyNeverUsed = "KeyNeverUsed",
  Inactive = "Inactive",
  Disable = "Disable",
}
export declare enum MinScanExecutionModelStatusEnum {
  Running = "Running",
  Stopping = "Stopping",
  Pausing = "Pausing",
  InQueue = "InQueue",
  Paused = "Paused",
  Ready = "Ready",
  Failed = "Failed",
}
export declare enum MinScanExecutionModelExecutionProgressEnum {
  Pending = "Pending",
  Running = "Running",
  UnderReview = "UnderReview",
  RunningManually = "RunningManually",
  Paused = "Paused",
  Completed = "Completed",
}
export declare enum MinScanModelTechnologyEnum {
  DynamicAnalyzer = "DynamicAnalyzer",
  StaticAnalyzer = "StaticAnalyzer",
  IFA = "IFA",
  DastAutomation = "DastAutomation",
  IASTAnalyzer = "IASTAnalyzer",
  ScaAnalyzer = "ScaAnalyzer",
}
export declare enum MinScanModelIastAgentTypeEnum {
  Java = "Java",
  DotNet = "DotNet",
  NodeJS = "NodeJS",
  PhpWindows = "PhpWindows",
  PhpRedHat = "PhpRedHat",
  PhpUbuntu = "PhpUbuntu",
  Kubernetes = "Kubernetes",
}
export declare enum MinScanModelIastAgentStatusEnum {
  None = "None",
  Active = "Active",
  KeyNeverUsed = "KeyNeverUsed",
  Inactive = "Inactive",
}
export declare enum MonitoredServiceModelServiceTypeEnum {
  ASCP = "ASCP",
  SAST = "SAST",
  DAST = "DAST",
  SCA = "SCA",
}
export declare enum MonitoredServiceModelStatusEnum {
  Operational = "Operational",
  Overloaded = "Overloaded",
  OutOfService = "OutOfService",
  OutOfOrder = "OutOfOrder",
  MonitoringDisabled = "MonitoringDisabled",
}
export declare enum NewAssetGroupModelIssuesStatusInheritanceEnum {
  None = "None",
  Noise = "Noise",
  Fixed = "Fixed",
}
export declare enum NewChartModelMetricsEnum {
  RiskRating = "RiskRating",
  TestingStatus = "TestingStatus",
  Issues = "Issues",
  MTTR = "MTTR",
  ScanExecutions = "ScanExecutions",
}
export declare enum NewDastScanTestOperationEnum {
  None = "None",
  Retest = "Retest",
  ContinueTest = "ContinueTest",
  ReportOnly = "ReportOnly",
}
export declare enum NewIastScanAgentTypeEnum {
  Java = "Java",
  DotNet = "DotNet",
  PhpWindows = "PhpWindows",
  PhpRedHat = "PhpRedHat",
  PhpUbuntu = "PhpUbuntu",
  Kubernetes = "Kubernetes",
}
export declare enum NewOrgSettingsModelSettingTypeEnum {
  ReportTitle = "ReportTitle",
  ReportHeader = "ReportHeader",
  ReportFooter = "ReportFooter",
  MainLogoFileName = "MainLogoFileName",
  AdditionalLogoFileName = "AdditionalLogoFileName",
}
export declare enum NewWebhookRequestMethodEnum {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
}
export declare enum NewWebhookEventEnum {
  ScanExecutionCompleted = "ScanExecutionCompleted",
  ApplicationUpdated = "ApplicationUpdated",
  NewPatchRequest = "NewPatchRequest",
}
export declare enum OnBoardResultOnBoardStatusEnum {
  Success = "Success",
  NotFound = "NotFound",
  Ambiguous = "Ambiguous",
  AlreadyExist = "AlreadyExist",
  Failed = "Failed",
}
export declare enum OnBoardUsersModelExternalIdTypeEnum {
  Username = "Username",
  Email = "Email",
}
export declare enum OneTimePasswordHashTypeEnum {
  None = "None",
  Sha1 = "Sha1",
  Sha256 = "Sha256",
  Sha512 = "Sha512",
}
export declare enum OrgLibraryModelStatusEnum {
  Discovered = "Discovered",
  Rediscovered = "Rediscovered",
  Removed = "Removed",
}
export declare enum OrgSettingsModelSettingTypeEnum {
  ReportTitle = "ReportTitle",
  ReportHeader = "ReportHeader",
  ReportFooter = "ReportFooter",
  MainLogoFileName = "MainLogoFileName",
  AdditionalLogoFileName = "AdditionalLogoFileName",
  LdapProvider = "LdapProvider",
  LdapDomain = "LdapDomain",
  LdapTargetOU = "LdapTargetOU",
  LdapUsername = "LdapUsername",
  LdapPassword = "LdapPassword",
  LdapEnableSSL = "LdapEnableSSL",
  SsoUrl = "SsoUrl",
  SsoClientId = "SsoClientId",
  SsoClientSecret = "SsoClientSecret",
  OnBoardingMode = "OnBoardingMode",
}
export declare enum PolicyAssociationModelTypeEnum {
  None = "None",
  OwaspTop102017 = "OwaspTop10_2017",
  Sans25 = "Sans25",
  EuGdpr2016 = "EuGdpr_2016",
  PCI = "PCI",
  Hipaa = "Hipaa",
  OwaspTop10Mobile2016 = "OwaspTop10Mobile_2016",
  ISO27001 = "ISO27001",
  ISO27002 = "ISO27002",
  Wasc = "Wasc",
  Nist = "Nist",
  Sox = "Sox",
  Fisma = "Fisma",
  Fippa = "Fippa",
  Efta = "Efta",
  DisaStig = "DisaStig",
  Padss = "Padss",
  OwaspTop102021 = "OwaspTop10_2021",
  OwaspTop10OpenApi2019 = "OwaspTop10OpenApi_2019",
  Ccpa = "Ccpa",
  FedRamp = "FedRamp",
  Popia = "Popia",
  OwaspTop10Api2023 = "OwaspTop10Api_2023",
  Sans252023 = "Sans25_2023",
  OwaspTop10CloudNativeApp = "OwaspTop10CloudNativeApp",
  Nis2 = "Nis2",
  Dora = "Dora",
  OwaspAsvs = "OwaspAsvs",
  Sans252024 = "Sans25_2024",
  OwaspTop10Llm2025 = "OwaspTop10Llm_2025",
  Itsg33 = "Itsg33",
}
export declare enum PolicyAssociationModelCategoryEnum {
  Custom = "Custom",
  Security = "Security",
  Regulation = "Regulation",
  IndustryStandard = "IndustryStandard",
}
export declare enum PolicyAssociationModelRegionEnum {
  Global = "Global",
  US = "US",
  UK = "UK",
  Canada = "Canada",
  EU = "EU",
  Japan = "Japan",
  AUS = "AUS",
  SouthAfrica = "SouthAfrica",
}
export declare enum PolicyModelTypeEnum {
  None = "None",
  OwaspTop102017 = "OwaspTop10_2017",
  Sans25 = "Sans25",
  EuGdpr2016 = "EuGdpr_2016",
  PCI = "PCI",
  Hipaa = "Hipaa",
  OwaspTop10Mobile2016 = "OwaspTop10Mobile_2016",
  ISO27001 = "ISO27001",
  ISO27002 = "ISO27002",
  Wasc = "Wasc",
  Nist = "Nist",
  Sox = "Sox",
  Fisma = "Fisma",
  Fippa = "Fippa",
  Efta = "Efta",
  DisaStig = "DisaStig",
  Padss = "Padss",
  OwaspTop102021 = "OwaspTop10_2021",
  OwaspTop10OpenApi2019 = "OwaspTop10OpenApi_2019",
  Ccpa = "Ccpa",
  FedRamp = "FedRamp",
  Popia = "Popia",
  OwaspTop10Api2023 = "OwaspTop10Api_2023",
  Sans252023 = "Sans25_2023",
  OwaspTop10CloudNativeApp = "OwaspTop10CloudNativeApp",
  Nis2 = "Nis2",
  Dora = "Dora",
  OwaspAsvs = "OwaspAsvs",
  Sans252024 = "Sans25_2024",
  OwaspTop10Llm2025 = "OwaspTop10Llm_2025",
  Itsg33 = "Itsg33",
}
export declare enum PolicyModelCategoryEnum {
  Custom = "Custom",
  Security = "Security",
  Regulation = "Regulation",
  IndustryStandard = "IndustryStandard",
}
export declare enum PolicyModelRegionEnum {
  Global = "Global",
  US = "US",
  UK = "UK",
  Canada = "Canada",
  EU = "EU",
  Japan = "Japan",
  AUS = "AUS",
  SouthAfrica = "SouthAfrica",
}
export declare enum PresenceStatusEnum {
  Active = "Active",
  NeverUsed = "NeverUsed",
  KeyExpired = "KeyExpired",
  KeyNeverUsed = "KeyNeverUsed",
  Inactive = "Inactive",
  Disable = "Disable",
}
export declare enum PresenceGitPlatformEnum {
  GitHub = "GitHub",
}
export declare enum RfAnalysisStatusUpdateModelStatusEnum {
  InProgress = "InProgress",
  CompleteSuccess = "CompleteSuccess",
  CompleteFail = "CompleteFail",
}
export declare enum RfNewTriageModelProposedSeverityEnum {
  Undetermined = "Undetermined",
  Informational = "Informational",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}
export declare enum RfNewTriageModelProposedStatusEnum {
  Open = "Open",
  InProgress = "InProgress",
  Reopened = "Reopened",
  Noise = "Noise",
  Passed = "Passed",
  Fixed = "Fixed",
  New = "New",
}
export declare enum RfPatchModelGitRepoPlatformEnum {
  GitHub = "GitHub",
}
export declare enum RfPatchModelStatusEnum {
  None = "None",
  Pending = "Pending",
  InProgress = "InProgress",
  CompleteSuccess = "CompleteSuccess",
  CompleteFail = "CompleteFail",
}
export declare enum RfTriageModelProposedSeverityEnum {
  Undetermined = "Undetermined",
  Informational = "Informational",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}
export declare enum RfTriageModelProposedStatusEnum {
  Open = "Open",
  InProgress = "InProgress",
  Reopened = "Reopened",
  Noise = "Noise",
  Passed = "Passed",
  Fixed = "Fixed",
  New = "New",
}
export declare enum RfUpdatePatchModelGitRepoPlatformEnum {
  GitHub = "GitHub",
}
export declare enum RfUpdatePatchModelStatusEnum {
  InProgress = "InProgress",
  CompleteSuccess = "CompleteSuccess",
  CompleteFail = "CompleteFail",
}
export declare enum RegistrationResultRegisterResultEnum {
  Success = "Success",
  VerificationRequired = "VerificationRequired",
  Failed = "Failed",
}
export declare enum RegistrationResultRegisterErrorEnum {
  None = "None",
  InvalidLicense = "InvalidLicense",
  AlreadyUsedTheService = "AlreadyUsedTheService",
  ShouldFillRegistrationForm = "ShouldFillRegistrationForm",
}
export declare enum RegistrationResultMhsErrorEnum {
  None = "None",
  GeneralError = "GeneralError",
  InvalidInput = "InvalidInput",
  MissingCapabilities = "MissingCapabilities",
  MHSLicenseGeneralStructureUnrecognized = "MHSLicenseGeneralStructureUnrecognized",
  MHSLicenseCertificateInvalid = "MHSLicenseCertificateInvalid",
  MHSLicensePasetoSignatureInvalid = "MHSLicensePasetoSignatureInvalid",
  MHSLicensePasetoRawPayloadUnrecognized = "MHSLicensePasetoRawPayloadUnrecognized",
  MHSLicenseInvalidAs360Fingerprint = "MHSLicenseInvalidAs360Fingerprint",
  MHSLicenseDeploymentIdMismatch = "MHSLicenseDeploymentIdMismatch",
  MHSLicenseIssuedEarlierThanCurrentlyUsed = "MHSLicenseIssuedEarlierThanCurrentlyUsed",
  MHSLicenseHasNoRelevantEntitlements = "MHSLicenseHasNoRelevantEntitlements",
  MHSLicenseWasAlreadyUploaded = "MHSLicenseWasAlreadyUploaded",
  MHSLicenseOldFeatureIsMissing = "MHSLicenseOldFeatureIsMissing",
  MHSLicenseChangingPreviousMhsValue = "MHSLicenseChangingPreviousMhsValue",
  MHSLicenseWasIssuedTooLongAgo = "MHSLicenseWasIssuedTooLongAgo",
  MHSLicenseInvalidASoCFingerprint = "MHSLicenseInvalidASoCFingerprint",
}
export declare enum RegulationReportJobApplyPoliciesEnum {
  None = "None",
  All = "All",
  Select = "Select",
}
export declare enum RegulationReportOptionsReportFileTypeEnum {
  Pdf = "Pdf",
  Html = "Html",
  Xml = "Xml",
  Csv = "Csv",
  Sarif = "Sarif",
}
export declare enum RegulationReportOptionsRegulationReportTypeEnum {
  None = "None",
  OwaspTop102017 = "OwaspTop10_2017",
  Sans25 = "Sans25",
  EuGdpr2016 = "EuGdpr_2016",
  PCI = "PCI",
  Hipaa = "Hipaa",
  OwaspTop10Mobile2016 = "OwaspTop10Mobile_2016",
  ISO27001 = "ISO27001",
  ISO27002 = "ISO27002",
  Wasc = "Wasc",
  Nist = "Nist",
  Sox = "Sox",
  Fisma = "Fisma",
  Fippa = "Fippa",
  Efta = "Efta",
  DisaStig = "DisaStig",
  Padss = "Padss",
  OwaspTop102021 = "OwaspTop10_2021",
  OwaspTop10OpenApi2019 = "OwaspTop10OpenApi_2019",
  Ccpa = "Ccpa",
  FedRamp = "FedRamp",
  Popia = "Popia",
  OwaspTop10Api2023 = "OwaspTop10Api_2023",
  Sans252023 = "Sans25_2023",
  OwaspTop10CloudNativeApp = "OwaspTop10CloudNativeApp",
  Nis2 = "Nis2",
  Dora = "Dora",
  OwaspAsvs = "OwaspAsvs",
  Sans252024 = "Sans25_2024",
  OwaspTop10Llm2025 = "OwaspTop10Llm_2025",
  Itsg33 = "Itsg33",
}
export declare enum RepoDetailsPlatformEnum {
  GitHub = "GitHub",
}
export declare enum ReportStatusModelStatusEnum {
  Pending = "Pending",
  Starting = "Starting",
  Running = "Running",
  Failed = "Failed",
  Ready = "Ready",
  Deleted = "Deleted",
}
export declare enum ScxSubscriptionOfferingTypeEnum {
  None = "None",
  Trial = "Trial",
  HTrial = "HTrial",
  Applications = "Applications",
  ScanExecution = "ScanExecution",
  AnalyzerConcurrent = "AnalyzerConcurrent",
  ConsultantServices = "ConsultantServices",
  Premium = "Premium",
  OpenSourcePerApplication = "OpenSourcePerApplication",
  OpenSourcePremium = "OpenSourcePremium",
  OpenSourceConcurrent = "OpenSourceConcurrent",
  IASTConcurrent = "IASTConcurrent",
  IASTPayPerApp = "IASTPayPerApp",
  Promotional = "Promotional",
  Silver = "Silver",
  Gold = "Gold",
  Platinum = "Platinum",
  SCAPerApplication = "SCAPerApplication",
  ContributingUser = "ContributingUser",
  SilverContribUser = "SilverContribUser",
  GoldContribUser = "GoldContribUser",
  PlatinumContribUser = "PlatinumContribUser",
  SilverPerApp = "SilverPerApp",
  GoldPerApp = "GoldPerApp",
  PlatinumPerApp = "PlatinumPerApp",
}
export declare enum SastScanExecutionModelStatusEnum {
  Running = "Running",
  Stopping = "Stopping",
  Pausing = "Pausing",
  InQueue = "InQueue",
  Paused = "Paused",
  Ready = "Ready",
  Failed = "Failed",
}
export declare enum SastScanExecutionModelResultEnum {
  None = "None",
  NoIssues = "NoIssues",
  Informational = "Informational",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}
export declare enum SastScanExecutionModelReadStatusEnum {
  None = "None",
  Unread = "Unread",
  Read = "Read",
}
export declare enum SastScanExecutionModelAvailableReportsEnum {
  Xml = "Xml",
  Pdf = "Pdf",
  Html = "Html",
  CompliancePdf = "CompliancePdf",
  OwaspTop10Pdf = "OwaspTop10Pdf",
  Sans25Pdf = "Sans25Pdf",
  RawXml = "RawXml",
  Zip = "Zip",
  Json = "Json",
}
export declare enum SastScanExecutionModelExecutionProgressEnum {
  Pending = "Pending",
  Running = "Running",
  UnderReview = "UnderReview",
  RunningManually = "RunningManually",
  Paused = "Paused",
  Completed = "Completed",
}
export declare enum SastScanExecutionModelRapidFixAnalysisStatusEnum {
  None = "None",
  Pending = "Pending",
  InProgress = "InProgress",
  CompleteSuccess = "CompleteSuccess",
  CompleteFail = "CompleteFail",
}
export declare enum SastScanModelTechnologyEnum {
  DynamicAnalyzer = "DynamicAnalyzer",
  StaticAnalyzer = "StaticAnalyzer",
  IFA = "IFA",
  DastAutomation = "DastAutomation",
  IASTAnalyzer = "IASTAnalyzer",
  ScaAnalyzer = "ScaAnalyzer",
}
export declare enum SastScanModelIastAgentStatusEnum {
  None = "None",
  Active = "Active",
  KeyNeverUsed = "KeyNeverUsed",
  Inactive = "Inactive",
}
export declare enum SastScanModelIastAgentTypeEnum {
  Java = "Java",
  DotNet = "DotNet",
  NodeJS = "NodeJS",
  PhpWindows = "PhpWindows",
  PhpRedHat = "PhpRedHat",
  PhpUbuntu = "PhpUbuntu",
  Kubernetes = "Kubernetes",
}
export declare enum SastScanModelOfferingTypeEnum {
  None = "None",
  Trial = "Trial",
  HTrial = "HTrial",
  Applications = "Applications",
  ScanExecution = "ScanExecution",
  AnalyzerConcurrent = "AnalyzerConcurrent",
  ConsultantServices = "ConsultantServices",
  Premium = "Premium",
  OpenSourcePerApplication = "OpenSourcePerApplication",
  OpenSourcePremium = "OpenSourcePremium",
  OpenSourceConcurrent = "OpenSourceConcurrent",
  IASTConcurrent = "IASTConcurrent",
  IASTPayPerApp = "IASTPayPerApp",
  Promotional = "Promotional",
  Silver = "Silver",
  Gold = "Gold",
  Platinum = "Platinum",
  SCAPerApplication = "SCAPerApplication",
  ContributingUser = "ContributingUser",
  SilverContribUser = "SilverContribUser",
  GoldContribUser = "GoldContribUser",
  PlatinumContribUser = "PlatinumContribUser",
  SilverPerApp = "SilverPerApp",
  GoldPerApp = "GoldPerApp",
  PlatinumPerApp = "PlatinumPerApp",
}
export declare enum SastScanModelGitRepoPlatformEnum {
  GitHub = "GitHub",
}
export declare enum SbomReportOptionsSbomFormatEnum {
  SPDXJson = "SPDX_Json",
  SPDXText = "SPDX_Text",
}
export declare enum ScaScanExecutionModelStatusEnum {
  Running = "Running",
  Stopping = "Stopping",
  Pausing = "Pausing",
  InQueue = "InQueue",
  Paused = "Paused",
  Ready = "Ready",
  Failed = "Failed",
}
export declare enum ScaScanExecutionModelResultEnum {
  None = "None",
  NoIssues = "NoIssues",
  Informational = "Informational",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}
export declare enum ScaScanExecutionModelReadStatusEnum {
  None = "None",
  Unread = "Unread",
  Read = "Read",
}
export declare enum ScaScanExecutionModelAvailableReportsEnum {
  Xml = "Xml",
  Pdf = "Pdf",
  Html = "Html",
  CompliancePdf = "CompliancePdf",
  OwaspTop10Pdf = "OwaspTop10Pdf",
  Sans25Pdf = "Sans25Pdf",
  RawXml = "RawXml",
  Zip = "Zip",
  Json = "Json",
}
export declare enum ScaScanExecutionModelExecutionProgressEnum {
  Pending = "Pending",
  Running = "Running",
  UnderReview = "UnderReview",
  RunningManually = "RunningManually",
  Paused = "Paused",
  Completed = "Completed",
}
export declare enum ScaScanExecutionModelScanMethodEnum {
  None = "None",
  Hash = "Hash",
  Config = "Config",
  SBOM = "SBOM",
}
export declare enum ScaScanModelTechnologyEnum {
  DynamicAnalyzer = "DynamicAnalyzer",
  StaticAnalyzer = "StaticAnalyzer",
  IFA = "IFA",
  DastAutomation = "DastAutomation",
  IASTAnalyzer = "IASTAnalyzer",
  ScaAnalyzer = "ScaAnalyzer",
}
export declare enum ScaScanModelIastAgentStatusEnum {
  None = "None",
  Active = "Active",
  KeyNeverUsed = "KeyNeverUsed",
  Inactive = "Inactive",
}
export declare enum ScaScanModelIastAgentTypeEnum {
  Java = "Java",
  DotNet = "DotNet",
  NodeJS = "NodeJS",
  PhpWindows = "PhpWindows",
  PhpRedHat = "PhpRedHat",
  PhpUbuntu = "PhpUbuntu",
  Kubernetes = "Kubernetes",
}
export declare enum ScaScanModelOfferingTypeEnum {
  None = "None",
  Trial = "Trial",
  HTrial = "HTrial",
  Applications = "Applications",
  ScanExecution = "ScanExecution",
  AnalyzerConcurrent = "AnalyzerConcurrent",
  ConsultantServices = "ConsultantServices",
  Premium = "Premium",
  OpenSourcePerApplication = "OpenSourcePerApplication",
  OpenSourcePremium = "OpenSourcePremium",
  OpenSourceConcurrent = "OpenSourceConcurrent",
  IASTConcurrent = "IASTConcurrent",
  IASTPayPerApp = "IASTPayPerApp",
  Promotional = "Promotional",
  Silver = "Silver",
  Gold = "Gold",
  Platinum = "Platinum",
  SCAPerApplication = "SCAPerApplication",
  ContributingUser = "ContributingUser",
  SilverContribUser = "SilverContribUser",
  GoldContribUser = "GoldContribUser",
  PlatinumContribUser = "PlatinumContribUser",
  SilverPerApp = "SilverPerApp",
  GoldPerApp = "GoldPerApp",
  PlatinumPerApp = "PlatinumPerApp",
}
export declare enum ScaScanModelGitRepoPlatformEnum {
  GitHub = "GitHub",
}
export declare enum ScanExecutionModelStatusEnum {
  Running = "Running",
  Stopping = "Stopping",
  Pausing = "Pausing",
  InQueue = "InQueue",
  Paused = "Paused",
  Ready = "Ready",
  Failed = "Failed",
}
export declare enum ScanExecutionModelResultEnum {
  None = "None",
  NoIssues = "NoIssues",
  Informational = "Informational",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}
export declare enum ScanExecutionModelReadStatusEnum {
  None = "None",
  Unread = "Unread",
  Read = "Read",
}
export declare enum ScanExecutionModelAvailableReportsEnum {
  Xml = "Xml",
  Pdf = "Pdf",
  Html = "Html",
  CompliancePdf = "CompliancePdf",
  OwaspTop10Pdf = "OwaspTop10Pdf",
  Sans25Pdf = "Sans25Pdf",
  RawXml = "RawXml",
  Zip = "Zip",
  Json = "Json",
}
export declare enum ScanExecutionModelExecutionProgressEnum {
  Pending = "Pending",
  Running = "Running",
  UnderReview = "UnderReview",
  RunningManually = "RunningManually",
  Paused = "Paused",
  Completed = "Completed",
}
export declare enum ScanFileModelFileTypeEnum {
  DastScan = "DastScan",
  DastScanTemplate = "DastScanTemplate",
  DastLoginSequence = "DastLoginSequence",
  DastManualExplore = "DastManualExplore",
  DastMultiStep = "DastMultiStep",
  DastOpenAPI = "DastOpenAPI",
  DastLlmExplore = "DastLlmExplore",
}
export declare enum SecurityReportJobApplyPoliciesEnum {
  None = "None",
  All = "All",
  Select = "Select",
}
export declare enum SecurityReportOptionsReportFileTypeEnum {
  Pdf = "Pdf",
  Html = "Html",
  Xml = "Xml",
  Csv = "Csv",
  Sarif = "Sarif",
}
export declare enum SubscriptionInfoModelOfferingTypeEnum {
  None = "None",
  Trial = "Trial",
  Metered = "Metered",
  PayPerApplication = "PayPerApplication",
  HTrial = "HTrial",
  PayPerScanExec = "PayPerScanExec",
  Premium = "Premium",
  AnalyzerConcurrent = "AnalyzerConcurrent",
  OpenSourcePerApplication = "OpenSourcePerApplication",
  OpenSourcePremium = "OpenSourcePremium",
  OpenSourceConcurrent = "OpenSourceConcurrent",
  IASTConcurrent = "IASTConcurrent",
  IASTPayPerApp = "IASTPayPerApp",
  Promotional = "Promotional",
  Silver = "Silver",
  Gold = "Gold",
  Platinum = "Platinum",
  SCAPerApplication = "SCAPerApplication",
  ContributingUser = "ContributingUser",
  SilverContribUser = "SilverContribUser",
  GoldContribUser = "GoldContribUser",
  PlatinumContribUser = "PlatinumContribUser",
  SilverPerApp = "SilverPerApp",
  GoldPerApp = "GoldPerApp",
  PlatinumPerApp = "PlatinumPerApp",
  ConsultantServices = "ConsultantServices",
}
export declare enum TenantInfoIssuesStatusInheritanceEnum {
  None = "None",
  Noise = "Noise",
  Fixed = "Fixed",
}
export declare enum TenantInfoSubscriptionTechnologiesEnum {
  None = "None",
  DynamicAnalyzer = "DynamicAnalyzer",
  StaticAnalyzer = "StaticAnalyzer",
  IASTAnalyzer = "IASTAnalyzer",
  ScaAnalyzer = "ScaAnalyzer",
}
export declare enum TenantInfoActiveTechnologiesEnum {
  None = "None",
  DynamicAnalyzer = "DynamicAnalyzer",
  StaticAnalyzer = "StaticAnalyzer",
  IASTAnalyzer = "IASTAnalyzer",
  ScaAnalyzer = "ScaAnalyzer",
}
export declare enum TenantInfoModelSubscriptionTechnologiesEnum {
  None = "None",
  DynamicAnalyzer = "DynamicAnalyzer",
  StaticAnalyzer = "StaticAnalyzer",
  IASTAnalyzer = "IASTAnalyzer",
  ScaAnalyzer = "ScaAnalyzer",
}
export declare enum TestsSettingsTestOptimizationLevelEnum {
  NoOptimization = "NoOptimization",
  Fast = "Fast",
  Faster = "Faster",
  Fastest = "Fastest",
}
export declare enum TimeFrameIntervalEnum {
  Day = "Day",
  Week = "Week",
  Month = "Month",
  Quarter = "Quarter",
  Year = "Year",
}
export declare enum UpdateAssetGroupModelIssuesStatusInheritanceEnum {
  None = "None",
  Noise = "Noise",
  Fixed = "Fixed",
}
export declare enum UpdateFullDastScanTestOperationEnum {
  None = "None",
  Retest = "Retest",
  ContinueTest = "ContinueTest",
  ReportOnly = "ReportOnly",
}
export declare enum UpdateIssueStatusEnum {
  Open = "Open",
  InProgress = "InProgress",
  Reopened = "Reopened",
  Noise = "Noise",
  Passed = "Passed",
  Fixed = "Fixed",
  New = "New",
}
export declare enum UpdateIssuesByIdStatusEnum {
  Open = "Open",
  InProgress = "InProgress",
  Reopened = "Reopened",
  Noise = "Noise",
  Passed = "Passed",
  Fixed = "Fixed",
  New = "New",
}
export declare enum UpdateOneTimePasswordHashTypeEnum {
  None = "None",
  Sha1 = "Sha1",
  Sha256 = "Sha256",
  Sha512 = "Sha512",
}
export declare enum UpdateTestsSettingsTestOptimizationLevelEnum {
  NoOptimization = "NoOptimization",
  Fast = "Fast",
  Faster = "Faster",
  Fastest = "Fastest",
}
export declare enum UpdateWebhookRequestMethodEnum {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
}
export declare enum UserInfoReasonForNotEligibleToTrialEnum {
  None = "None",
  AlreadyUsedTheService = "AlreadyUsedTheService",
  ShouldFillRegistrationForm = "ShouldFillRegistrationForm",
}
export declare enum UserModelStatusEnum {
  Active = "Active",
  BlockNewScans = "BlockNewScans",
  BlockAccess = "BlockAccess",
  PendingActivation = "PendingActivation",
  BlockAccessFromAPI = "BlockAccessFromAPI",
  Archived = "Archived",
  InvitationExpired = "InvitationExpired",
}
export declare enum UserOrgRoleStatusEnum {
  Active = "Active",
  BlockNewScans = "BlockNewScans",
  BlockAccess = "BlockAccess",
  PendingActivation = "PendingActivation",
  BlockAccessFromAPI = "BlockAccessFromAPI",
  Archived = "Archived",
  InvitationExpired = "InvitationExpired",
}
export declare enum WebhookAssociationScopeEnum {
  AssetGroup = "AssetGroup",
  Application = "Application",
}
export declare enum WebhookModelRequestMethodEnum {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
}
export declare enum WebhookModelEventEnum {
  ScanExecutionCompleted = "ScanExecutionCompleted",
  ApplicationUpdated = "ApplicationUpdated",
  NewPatchRequest = "NewPatchRequest",
}
/**
 * Determine which policies will be applied for filtering in non compliant issues
 * @default "None"
 */
export declare enum AppsGetAppCorrelationGroupsParamsApplyPoliciesEnum {
  None = "None",
  All = "All",
  Select = "Select",
}
/** mail prefix */
export declare enum DomainsResendMailParamsMailPrefixEnum {
  Admin = "Admin",
  Administrator = "Administrator",
  HostMaster = "HostMaster",
  Root = "Root",
  WebMaster = "WebMaster",
  PostMaster = "PostMaster",
}
export declare enum DomainsRegisterParamsRegistrationTypeEnum {
  Email = "Email",
  Html = "Html",
}
export declare enum DomainsRegisterParamsEnum {
  Email = "Email",
  Html = "Html",
}
/** Uploaded File type (required for zip files only) */
export declare enum FileUploadPostParamsFileTypeEnum {
  ZippedXmlDast = "ZippedXmlDast",
  SourceCodeArchive = "SourceCodeArchive",
  DastPostmanCollectionJson = "DastPostmanCollectionJson",
  DastPostmanCollectionZip = "DastPostmanCollectionZip",
  AsencEncryptionArchive = "AsencEncryptionArchive",
  DastOpenAPIFile = "DastOpenAPIFile",
  SbomSpdx = "SbomSpdx",
}
/**
 * Determine which policies will be applied for filtering in non compliant issues
 * @default "None"
 */
export declare enum FixGroupsGetParamsApplyPoliciesEnum {
  None = "None",
  All = "All",
  Select = "Select",
}
/** The Scope of the fix group */
export declare enum FixGroupsGetParamsScopeEnum {
  Application = "Application",
  Scan = "Scan",
  ScanExecution = "ScanExecution",
}
export declare enum FixGroupsGetParamsEnum {
  Application = "Application",
  Scan = "Scan",
  ScanExecution = "ScanExecution",
}
/**
 * Determine which policies will be applied for filtering in non compliant issues
 * @default "None"
 */
export declare enum FixGroupsUpdateParamsApplyPoliciesEnum {
  None = "None",
  All = "All",
  Select = "Select",
}
/** The Scope of the fix group */
export declare enum FixGroupsUpdateParamsScopeEnum {
  Application = "Application",
  Scan = "Scan",
  ScanExecution = "ScanExecution",
}
export declare enum FixGroupsUpdateParamsEnum {
  Application = "Application",
  Scan = "Scan",
  ScanExecution = "ScanExecution",
}
/**
 * Determine which policies will be applied for filtering in non compliant issues
 * @default "None"
 */
export declare enum IssuesGetParamsApplyPoliciesEnum {
  None = "None",
  All = "All",
  Select = "Select",
}
/** The Scope of the issues */
export declare enum IssuesGetParamsScopeEnum {
  Application = "Application",
  Scan = "Scan",
  ScanExecution = "ScanExecution",
}
export declare enum IssuesGetParamsEnum {
  Application = "Application",
  Scan = "Scan",
  ScanExecution = "ScanExecution",
}
/**
 * Determine which policies will be applied for filtering in non compliant issues
 * @default "None"
 */
export declare enum IssuesUpdateFilteredIssuesParamsApplyPoliciesEnum {
  None = "None",
  All = "All",
  Select = "Select",
}
/** The Scope of the issues */
export declare enum IssuesUpdateFilteredIssuesParamsScopeEnum {
  Application = "Application",
  Scan = "Scan",
  ScanExecution = "ScanExecution",
}
export declare enum IssuesUpdateFilteredIssuesParamsEnum {
  Application = "Application",
  Scan = "Scan",
  ScanExecution = "ScanExecution",
}
/** script framework */
export declare enum IssuesReplayScriptParamsFrameworkEnum {
  Python = "Python",
  JsConsole = "JsConsole",
}
/** Presence platform */
export declare enum PresencesDownloadPresenceWithKeyParamsPlatformEnum {
  WinX64 = "win_x64",
  LinuxX64 = "linux_x64",
  OsxX64 = "osx_x64",
}
export declare enum PresencesDownloadPresenceWithKeyParamsEnum {
  WinX64 = "win_x64",
  LinuxX64 = "linux_x64",
  OsxX64 = "osx_x64",
}
export declare enum ReportsCreateIssuesReportParamsScopeEnum {
  Application = "Application",
  Scan = "Scan",
  ScanExecution = "ScanExecution",
}
export declare enum ReportsCreateIssuesReportParamsEnum {
  Application = "Application",
  Scan = "Scan",
  ScanExecution = "ScanExecution",
}
export declare enum ReportsCreateSecurityReportParamsScopeEnum {
  Application = "Application",
  Scan = "Scan",
  ScanExecution = "ScanExecution",
}
export declare enum ReportsCreateSecurityReportParamsEnum {
  Application = "Application",
  Scan = "Scan",
  ScanExecution = "ScanExecution",
}
export declare enum ReportsCreateRegulationReportParamsScopeEnum {
  Application = "Application",
  Scan = "Scan",
  ScanExecution = "ScanExecution",
}
export declare enum ReportsCreateRegulationReportParamsEnum {
  Application = "Application",
  Scan = "Scan",
  ScanExecution = "ScanExecution",
}
export declare enum ReportsCreateLicenseReportParamsScopeEnum {
  Application = "Application",
  Scan = "Scan",
  ScanExecution = "ScanExecution",
}
export declare enum ReportsCreateLicenseReportParamsEnum {
  Application = "Application",
  Scan = "Scan",
  ScanExecution = "ScanExecution",
}
export declare enum ReportsGetArticleParamsModeEnum {
  Light = "light",
  Dark = "dark",
}
/** Operation */
export declare enum ScansExecutionActionParamsOperationEnum {
  Pause = "Pause",
  Resume = "Resume",
  Stop = "Stop",
}
export declare enum ScansExecutionActionParamsEnum {
  Pause = "Pause",
  Resume = "Resume",
  Stop = "Stop",
}
export declare enum ReposGetRepoSignatureParamsPlatformEnum {
  GitHub = "GitHub",
}
export declare enum ReposGetRepoSignatureParamsEnum {
  GitHub = "GitHub",
}
/** Platform - osx_x64 is not yet supported !! */
export declare enum ToolsGetPresenceV2ParamsPlatformEnum {
  WinX64 = "win_x64",
  LinuxX64 = "linux_x64",
  OsxX64 = "osx_x64",
}
/** Platform */
export declare enum ToolsGetTrafficRecorderParamsPlatformEnum {
  WinX64 = "win_x64",
  LinuxX64 = "linux_x64",
}
export declare enum ToolsGetTrafficRecorderParamsEnum {
  WinX64 = "win_x64",
  LinuxX64 = "linux_x64",
}
/** Platform */
export declare enum ToolsGetTrafficRecorderVersionParamsPlatformEnum {
  WinX64 = "win_x64",
  LinuxX64 = "linux_x64",
}
export declare enum ToolsGetTrafficRecorderVersionParamsEnum {
  WinX64 = "win_x64",
  LinuxX64 = "linux_x64",
}
/**
 * Agent type (Java or DotNet)
 * @default "Java"
 */
export declare enum ToolsDownloadIastAgentParamsTypeEnum {
  Java = "Java",
  DotNet = "DotNet",
  PhpWindows = "PhpWindows",
  PhpRedHat = "PhpRedHat",
  PhpUbuntu = "PhpUbuntu",
  Kubernetes = "Kubernetes",
}
export declare enum ToolsSaClientUtilByTypeParamsToolTypeEnum {
  Win = "Win",
  Linux = "Linux",
  Mac = "Mac",
  WinGui = "WinGui",
  LinuxGui = "LinuxGui",
  MacGui = "MacGui",
}
/** Scope of the association to delete */
export declare enum WebhooksDeleteAssociationParamsScopeEnum {
  AssetGroup = "AssetGroup",
  Application = "Application",
}
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  ResponseType,
} from "axios";
export type QueryParamsType = Record<string | number, any>;
export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}
export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;
export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}
export declare enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}
export declare class HttpClient<SecurityDataType = unknown> {
  instance: AxiosInstance;
  private securityData;
  private securityWorker?;
  private secure?;
  private format?;
  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }?: ApiConfig<SecurityDataType>);
  setSecurityData: (data: SecurityDataType | null) => void;
  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig;
  protected stringifyFormItem(formItem: unknown): string;
  protected createFormData(input: Record<string, unknown>): FormData;
  request: <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams) => Promise<T>;
}
/**
 * @title AppScan Rest API
 * @version v4
 * @license License Agreement (https://www.hcltechsw.com/resources/license-agreements)
 * @contact HCL Software Customer Support portal (https://support.hcl-software.com/csm)
 *
 * This API allows you to interact with the service. The API allows you to perform many of the operations available in the UI and more.For authentication, use the relevant APIs in the Account section. A successful authentication response includes a bearer token for use in subsequent API calls. Pasting this token in the 'Access token' field above will automatically add the authorization header to any API call that requires a valid session.
 */
export declare class Api<SecurityDataType extends unknown> {
  http: HttpClient<SecurityDataType>;
  constructor(http: HttpClient<SecurityDataType>);
  v4: {
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
    Account_Logout: (params?: RequestParams) => Promise<AxiosResponse<void>>;
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
    Account_ApiKeyLogin: (
      data: ApiKey,
      params?: RequestParams,
    ) => Promise<AxiosResponse<AccessTokenData>>;
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
    Account_CreateApiKey: (
      params?: RequestParams,
    ) => Promise<AxiosResponse<ApiKeyInfo>>;
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
    Account_GetTenantInfo: (
      params?: RequestParams,
    ) => Promise<AxiosResponse<TenantInfo>>;
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
    Account_UpdateTenantInfo: (
      data: TenantInfoModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<TenantInfoModel>>;
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
    Account_InviteUsers: (
      data: InviteUsersModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<InviteResult[]>>;
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
    Apps_Get: (
      query?: {
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<ApplicationModelPageResultModel>>;
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
    Apps_Post: (
      data: ApplicationCreateModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<ApplicationModel>>;
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
    Apps_Delete: (
      id: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Apps_Update: (
      id: string,
      data: ApplicationUpdateModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<ApplicationModel>>;
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
    Apps_Reset: (
      id: string,
      data: ApplicationResetModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Apps_GetAppCorrelationGroups: (
      id: string,
      query?: {
        /**
         * Determine which policies will be applied for filtering in non compliant issues
         * @default "None"
         */
        applyPolicies?: AppsGetAppCorrelationGroupsParamsApplyPoliciesEnum;
        /** If applyPolicies is set to Select, only issues that are not compliant with these policies will be filtered in */
        selectPolicyIds?: string[];
        /** If provided, it overrides the Accept-Language header. (If not provided and there is no Accept-Language header, the locale will be: en-US) */
        locale?: string;
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<CorrelationGroupModelPageResultModel>>;
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
    Apps_ImportFile: (
      data: {
        /** @format binary */
        uploadedFile: File;
      },
      query?: {
        /**
         * Asset group Id
         * @format uuid
         */
        assetGroupId?: string;
        /** If provided, this parameter will override the name of the uploaded file, including its extension(CSV). */
        fileName?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<ImportAppResultModel>>;
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
    Apps_GetAppPolicies: (
      appId: string,
      query?: {
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<PolicyAssociationModelPageResultModel>>;
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
    Apps_AttachPolicy: (
      appId: string,
      policyId: string,
      data: NameValuePair[],
      params?: RequestParams,
    ) => Promise<AxiosResponse<PolicyAssociationModel>>;
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
    Apps_UpdatePolicy: (
      appId: string,
      policyId: string,
      data: PolicyConfigurationModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<PolicyAssociationModel>>;
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
    Apps_DeletePolicyAssociation: (
      appId: string,
      policyId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    AssetGroups_Get: (
      query?: {
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<AssetGroupModelPageResultModel>>;
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
    AssetGroups_Post: (
      data: NewAssetGroupModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<AssetGroupModel>>;
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
    AssetGroups_Delete: (
      id: string,
      query?: {
        /**
         * If 'true' then force deletion of asset group include its related applications and disassociate its members
         * @default false
         */
        forceDeletion?: boolean;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    AssetGroups_Put: (
      id: string,
      data: UpdateAssetGroupModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<AssetGroupModel>>;
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
    AssetGroups_Move: (
      sourceId: string,
      destId: string,
      data: AssetGroupMoveModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<AssetGroupModel>>;
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
    Audits_Get: (
      query?: {
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<AuditModelPageResultModel>>;
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
    Audits_GetAdditionalData: (
      auditId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<AuditAdditionalData[]>>;
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
    BusinessUnits_Get: (
      query?: {
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<BusinessUnitModelPageResultModel>>;
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
    BusinessUnits_Create: (
      data: NewBusinessUnitModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<BusinessUnitModel>>;
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
    BusinessUnits_Merge: (
      idToKeep: string,
      idToMerge: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    BusinessUnits_Delete: (
      id: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    BusinessUnits_Update: (
      id: string,
      data: UpdateBusinessUnitModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<BusinessUnitModel>>;
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
    "/api/v4/CustomFields": (
      data: CustomFieldRequestModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<CustomFieldResponseModel>>;
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
    "/api/v4/CustomFields2": (
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    "/api/v4/CustomFields/{id}": (
      id: string,
      data: UpdateCustomFieldModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<any>>;
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
    "/api/v4/CustomFields/{id}2": (
      id: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    "/api/v4/CustomFields/DeleteAllCustomFields": (
      params?: RequestParams,
    ) => Promise<AxiosResponse<any>>;
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
    Domains_Get: (
      query?: {
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<DomainModelPageResultModel>>;
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
    Domains_Update: (
      id: number,
      data: UpdateDomainManagementModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<DomainModel>>;
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
    Domains_Multiple_Delete: (
      data: number[],
      params?: RequestParams,
    ) => Promise<AxiosResponse<DeleteDomainsResult>>;
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
    Domains_ResendMail: (
      id: number,
      query?: {
        /** mail prefix */
        mailPrefix?: DomainsResendMailParamsMailPrefixEnum;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Domains_DownloadFile: (
      id: number,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Domains_Verify: (
      data: DomainOwnershipModelVerificationModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<boolean>>;
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
    Domains_Confirm: (
      verificationKey: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Domains_Register: (
      registrationType: DomainsRegisterParamsEnum,
      data: DomainOwnershipModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Domains_Allow: (
      data: AllowDomainModel,
      query?: {
        /** @format uuid */
        assetGroupId?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<AllowDomainResult>>;
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
    Domains_Block: (
      data: BlockDomainRequestModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<DomainModel>>;
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
    FileUpload_Post: (
      data: {
        /** @format binary */
        uploadedFile: File;
      },
      query?: {
        /** Uploaded File type (required for zip files only) */
        fileType?: FileUploadPostParamsFileTypeEnum;
        /** If provided, it will be used as the file name */
        fileName?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<UploadViewModel>>;
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
    FixGroups_Get: (
      scope: FixGroupsGetParamsEnum,
      scopeId: string,
      query?: {
        /**
         * Determine which policies will be applied for filtering in non compliant issues
         * @default "None"
         */
        applyPolicies?: FixGroupsGetParamsApplyPoliciesEnum;
        /** If applyPolicies is set to Select, only issues that are not compliant with these policies will be filtered in */
        selectPolicyIds?: string[];
        /** If provided, it overrides the Accept-Language header. (If not provided and there is no Accept-Language header, the locale will be: en-US) */
        locale?: string;
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<FixGroupPageResultModel>>;
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
    FixGroups_Update: (
      scope: FixGroupsUpdateParamsEnum,
      scopeId: string,
      fixGroupId: string,
      data: FixGroupUpdate,
      query?: {
        /**
         * Determine which policies will be applied for filtering in non compliant issues
         * @default "None"
         */
        applyPolicies?: FixGroupsUpdateParamsApplyPoliciesEnum;
        /** If applyPolicies is set to Select, only issues that are not compliant with these policies will be filtered in */
        selectPolicyIds?: string[];
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<TriageResult>>;
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
    FixGroups_GetComments: (
      fixGroupId: string,
      query?: {
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<CommentModelResponsePageResultModel>>;
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
    Issues_Get: (
      scope: IssuesGetParamsEnum,
      scopeId: string,
      query?: {
        /**
         * Determine which policies will be applied for filtering in non compliant issues
         * @default "None"
         */
        applyPolicies?: IssuesGetParamsApplyPoliciesEnum;
        /** If applyPolicies is set to Select, only issues that are not compliant with these policies will be filtered in */
        selectPolicyIds?: string[];
        /** If provided, it overrides the Accept-Language header. (If not provided and there is no Accept-Language header, the locale will be: en-US) */
        locale?: string;
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<IssueModelPageResultModel>>;
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
    Issues_UpdateFilteredIssues: (
      scope: IssuesUpdateFilteredIssuesParamsEnum,
      scopeId: string,
      data: UpdateIssue,
      query?: {
        /** Odata filter that will be applied */
        odataFilter?: string;
        /**
         * Determine which policies will be applied for filtering in non compliant issues
         * @default "None"
         */
        applyPolicies?: IssuesUpdateFilteredIssuesParamsApplyPoliciesEnum;
        /** If applyPolicies is set to Select, only issues that are not compliant with these policies will be filtered in */
        selectPolicyIds?: string[];
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<TriageResult>>;
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
    Issues_GetIssue: (
      issueId: string,
      query?: {
        /** If provided, it overrides the Accept-Language header. (If not provided and there is no Accept-Language header, the locale will be: en-US) */
        locale?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<IssueModel>>;
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
    Issues_GetIssueComments: (
      issueId: string,
      query?: {
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<CommentModelResponsePageResultModel>>;
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
    Issues_IssueDetails: (
      issueId: string,
      query?: {
        /** @default "en-US" */
        locale?: string;
        /**
         * html or xml
         * @default "html"
         */
        format?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<File>>;
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
    Issues_GetIssueHistory: (
      issueId: string,
      query?: {
        /**
         * If set to true, the history will contain all the scan executions that found this issue
         * @default false
         */
        includeAllScanExecutions?: boolean;
        /**
         * locale (default value: en-US)
         * @default "en-US"
         */
        locale?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<IssueChangeSet[]>>;
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
    Issues_ImportIssues: (
      query: {
        /** @format uuid */
        appId: string;
        scanName?: string;
      },
      data: {
        /** @format binary */
        file: File;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<ImportIssueStatusModel>>;
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
    Issues_ReplayScript: (
      issueId: string,
      query: {
        /** script framework */
        framework: IssuesReplayScriptParamsFrameworkEnum;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<File>>;
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
    OrgSettings_GetReportCustomization: (
      params?: RequestParams,
    ) => Promise<AxiosResponse<ReportCustomizationModel>>;
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
    OrgSettings_UpdateReportCustomization: (
      data: ReportCustomizationModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<ReportCustomizationModel>>;
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
    Policies_Get: (
      query?: {
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<PolicyModelPageResultModel>>;
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
    Policies_Post: (
      data: NewPolicyModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<PolicyModel>>;
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
    Policies_Update: (
      id: string,
      data: EditPolicyModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<PolicyModel>>;
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
    Policies_Delete: (
      id: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Presences_Get: (
      query?: {
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<PresencePageResultModel>>;
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
    Presences_Post: (
      data: NewPresence,
      params?: RequestParams,
    ) => Promise<AxiosResponse<Presence>>;
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
    Presences_Delete: (
      presenceId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Presences_Update: (
      presenceId: string,
      data: UpdatePresence,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Presences_GenerateNewKey: (
      presenceId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<File>>;
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
    Presences_DownloadPresenceWithKey: (
      presenceId: string,
      platform: PresencesDownloadPresenceWithKeyParamsEnum,
      params?: RequestParams,
    ) => Promise<AxiosResponse<File>>;
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
    Reports_Get: (
      query?: {
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<ReportStatusModelPageResultModel>>;
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
    Reports_Download: (
      id: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<File>>;
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
    Reports_CreateIssuesReport: (
      scope: ReportsCreateIssuesReportParamsEnum,
      id: string,
      data: IssuesReportJob,
      params?: RequestParams,
    ) => Promise<AxiosResponse<ReportStatusModel>>;
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
    Reports_CreateSecurityReport: (
      scope: ReportsCreateSecurityReportParamsEnum,
      id: string,
      data: SecurityReportJob,
      params?: RequestParams,
    ) => Promise<AxiosResponse<ReportStatusModel>>;
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
    Reports_CreateRegulationReport: (
      scope: ReportsCreateRegulationReportParamsEnum,
      id: string,
      data: RegulationReportJob,
      params?: RequestParams,
    ) => Promise<AxiosResponse<ReportStatusModel>>;
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
    Reports_CreateLicenseReport: (
      scope: ReportsCreateLicenseReportParamsEnum,
      id: string,
      data: LicenseReportJob,
      params?: RequestParams,
    ) => Promise<AxiosResponse<ReportStatusModel>>;
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
    Reports_CreateSbomReport: (
      scanExecutionId: string,
      data: SbomReportOptions,
      params?: RequestParams,
    ) => Promise<AxiosResponse<ReportStatusModel>>;
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
    Reports_Delete: (
      id: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Reports_GetArticle: (
      query?: {
        id?: string;
        issuetype?: string;
        language?: string;
        api?: string;
        cveId?: string;
        nl?: string;
        mode?: ReportsGetArticleParamsModeEnum;
        enableTrainingLinks?: boolean;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Roles_Get: (
      query?: {
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<RoleModelPageResultModel>>;
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
    Roles_Create: (
      data: NewRoleModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<RoleModel>>;
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
    Roles_Delete: (
      id: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Roles_Update: (
      id: string,
      data: UpdateRoleModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<RoleModel>>;
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
    Scans_Get: (
      query?: {
        /**
         * The max number of records. (Up to 500)
         * @max 500
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<MinScanModelPageResultModel>>;
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
    Scans_Update: (
      scanId: string,
      data: UpdateScanWithPresenceAndRecurrence,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Scans_Delete: (
      scanId: string,
      query?: {
        /** Determine if the issues generated by this scan will also be deleted */
        deleteIssues?: boolean;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Scans_UpdateDastScan: (
      scanId: string,
      data: UpdateFullDastScan,
      params?: RequestParams,
    ) => Promise<AxiosResponse<DastScanModel>>;
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
    Scans_GetDastScan: (
      scanId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<DastScanModel>>;
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
    Scans_PromoteIssues: (
      scanId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<IssueMergeModel>>;
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
    Scans_DeleteScanExecutions: (
      scanId: string,
      query?: {
        /**
         * Determine if the issues generated by this scan will also be deleted
         * @default false
         */
        deleteIssues?: boolean;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Scans_Execute: (
      scanId: string,
      data: ScanExecute,
      params?: RequestParams,
    ) => Promise<AxiosResponse<ScanExecutionModel>>;
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
    Scans_GetExecutions: (
      scanId: string,
      query?: {
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<GeneralScanExecutionModel[]>>;
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
    Scans_CreateSastScan: (
      data: NewStaticScan,
      params?: RequestParams,
    ) => Promise<AxiosResponse<SastScanModel>>;
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
    Scans_CreateScaScan: (
      data: NewScaScan,
      params?: RequestParams,
    ) => Promise<AxiosResponse<ScaScanModel>>;
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
    Scans_CreateIastScan: (
      data: NewIastScan,
      params?: RequestParams,
    ) => Promise<AxiosResponse<IastScanModel>>;
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
    Scans_CreateDastScan: (
      data: NewDastScan,
      params?: RequestParams,
    ) => Promise<AxiosResponse<DastScanModel>>;
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
    Scans_GetExecutionRawResults: (
      executionId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<File>>;
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
    Scans_GetExploreDataCounters: (
      executionId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<ExploreDataCounters>>;
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
    Scans_GetScanLogs: (
      scanId: string,
      query?: {
        /**
         * downloading the extended support logs
         * @default false
         */
        support?: boolean;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<File>>;
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
    Scans_GetLiveLog: (
      executionId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<File>>;
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
    Scans_GetLiveLogTail: (
      executionId: string,
      query?: {
        /**
         * The requested size of bytes from log file tail. Limited up to 1500
         * @format int32
         * @default 1500
         */
        tailSize?: number;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<File>>;
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
    Scans_GetDastScanFile: (
      executionId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<File>>;
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
    Scans_GetStaticScanExecution: (
      executionId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<SastScanExecutionModel>>;
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
    Scans_GetSastScanExecution: (
      executionId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<SastScanExecutionModel>>;
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
    Scans_UpdateSastScanExecution: (
      executionId: string,
      data: UpdateSastScanExecution,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Scans_GetDynamicScanExecution: (
      executionId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<DastScanExecutionModel>>;
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
    Scans_GetDastExecution: (
      executionId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<DastScanExecutionModel>>;
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
    Scans_GetScaScanExecution: (
      executionId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<ScaScanExecutionModel>>;
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
    Scans_GetDynamicScan: (
      scanId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<DastScanModel>>;
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
    Scans_GetStaticScan: (
      scanId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<SastScanModel>>;
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
    Scans_GetSastScan: (
      scanId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<SastScanModel>>;
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
    Scans_UpdateSastScan: (
      scanId: string,
      data: UpdateSastScan,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Scans_GetScaScan: (
      scanId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<ScaScanModel>>;
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
    Scans_UpdateScaScan: (
      scanId: string,
      data: UpdateScaScan,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Scans_UpdateIastScan: (
      scanId: string,
      data: UpdateIastScan,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Scans_UpdateIastScan_old: (
      scanId: string,
      data: UpdateIastScan,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Scans_GenerateNewIastKey: (
      scanId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<NewIASTKey>>;
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
    Scans_DownloadIastConfig: (
      scanId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<File>>;
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
    Scans_DeleteExecution: (
      executionId: string,
      query?: {
        deleteIssues?: boolean;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Scans_GetExecution: (
      executionId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<GeneralScanExecutionModel>>;
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
    Scans_ExecutionAction: (
      executionId: string,
      operation: ScansExecutionActionParamsEnum,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Repos_GetRepoSignature: (
      platform: ReposGetRepoSignatureParamsEnum,
      data: RepoSignatureRequest,
      params?: RequestParams,
    ) => Promise<AxiosResponse<RepoSignature>>;
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
    ScanTemplates_Get: (
      query?: {
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<ScanTemplateModelPageResultModel>>;
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
    ScanTemplates_Create: (
      data: NewScanTemplateModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<ScanTemplateModel>>;
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
    ScanTemplates_GetScanTemplate: (
      scanTemplateId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<ScanTemplateModel>>;
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
    ScanTemplates_Update: (
      scanTemplateId: string,
      data: UpdateScanTemplateModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<ScanTemplateModel>>;
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
    ScanTemplates_Delete: (
      scanTemplateId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    ScanTemplates_DownloadTemplateFile: (
      scanTemplateId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<File>>;
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
    ScanTemplates_GetDastConfiguration: (
      uploadedFileId: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<DastTemplateConfiguration>>;
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
    TestPolicies_Get: (
      query?: {
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<TestPolicyModelPageResultModel>>;
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
    TestPolicies_Post: (
      data: NewTestPolicyModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<TestPolicyModel>>;
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
    TestPolicies_Update: (
      id: string,
      data: EditTestPolicyModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<TestPolicyModel>>;
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
    TestPolicies_Delete: (
      id: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    TestPolicies_SetDefault: (
      id: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<TestPolicyModel>>;
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
    TestPolicies_Download: (
      id: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<File>>;
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
    Tools_GetPresenceV2: (
      query?: {
        /** Platform - osx_x64 is not yet supported !! */
        platform?: ToolsGetPresenceV2ParamsPlatformEnum;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<File>>;
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
    Tools_GetTrafficRecorder: (
      platform: ToolsGetTrafficRecorderParamsEnum,
      params?: RequestParams,
    ) => Promise<AxiosResponse<File>>;
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
    Tools_GetTrafficRecorderVersion: (
      platform: ToolsGetTrafficRecorderVersionParamsEnum,
      params?: RequestParams,
    ) => Promise<AxiosResponse<HttpContent>>;
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
    Tools_DownloadIASTAgent: (
      query?: {
        /**
         * Agent type (Java or DotNet)
         * @default "Java"
         */
        type?: ToolsDownloadIastAgentParamsTypeEnum;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<File>>;
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
    Tools_DownloadIASTAgentWithKey: (
      query?: {
        /**
         * Scan identifier
         * @format uuid
         */
        scanId?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<File>>;
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
    Tools_SAClientUtilByType: (
      query: {
        toolType: ToolsSaClientUtilByTypeParamsToolTypeEnum;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<File>>;
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
    Users_Get: (
      query?: {
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<UserModelPageResultModel>>;
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
    Users_Update: (
      id: string,
      data: UpdateUserModel,
      params?: RequestParams,
    ) => Promise<AxiosResponse<UserModel>>;
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
    Users_Delete: (
      id: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Webhooks_Get: (
      query?: {
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<WebhookModelPageResultModel>>;
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
    Webhooks_Create: (
      data: NewWebhook,
      params?: RequestParams,
    ) => Promise<AxiosResponse<WebhookModel>>;
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
    Webhooks_Update: (
      id: string,
      data: UpdateWebhook,
      params?: RequestParams,
    ) => Promise<AxiosResponse<WebhookModel>>;
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
    Webhooks_Delete: (
      id: string,
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
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
    Webhooks_GetAssociations: (
      id: string,
      query?: {
        /**
         * The max number of records. (Up to 5000)
         * @max 5000
         * @default 100
         */
        $top?: number;
        /** The number of records to skip. */
        $skip?: number;
        /** A function that must evaluate to true for a record to be returned. (e.g. Name eq 'sam' or Name eq 'dan') */
        $filter?: string;
        /** Specifies a subset of properties to return. */
        $select?: string;
        /** Determines what values are used to order a collection of records. (e.g. Name,Id) */
        $orderby?: string;
        /** Specifies the related resources to be included in line with retrieved resources. */
        $expand?: string;
        /**
         * Specifies that the response to the request MUST include the count of the number of entities in the collection of entities.
         * @default false
         */
        $count?: boolean;
        /** Aggregation of results. */
        $apply?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<WebhookAssociation[]>>;
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
    Webhooks_CreateAssociation: (
      id: string,
      data: WebhookAssociation,
      params?: RequestParams,
    ) => Promise<AxiosResponse<WebhookAssociation>>;
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
    Webhooks_DeleteAssociation: (
      id: string,
      query?: {
        /** Scope of the association to delete */
        scope?: WebhooksDeleteAssociationParamsScopeEnum;
        /**
         * Scope id (AssetGroup or Application Id)
         * @format uuid
         */
        scopeId?: string;
      },
      params?: RequestParams,
    ) => Promise<AxiosResponse<void>>;
  };
}
