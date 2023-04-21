export const USER_COLLECTION_NAME = "Users";
export const FARM_COLLECTION_NAME = "Farms";
export const DISTRIBUTOR_COLLECTION_NAME = "Distributors";
export const SELLER_COLLECTION_NAME = "Sellers";
export const HEALTH_WORKER_COLLECTION_NAME = "HealthWorkers";
export const BATCH_COLLECTION_NAME = "Batches";
export const USER_REPORTS_COLLECTION_NAME = "UserReports";
export const FARM_REPORTS_COLLECTION_NAME = "FarmReports";
export const SYMPTOMS_REPORTS_COLLECTION_NAME = "SymptomsReports";
export const NFC_TAGS_COLLECTION_NAME = "NFCTags";

export type Symptoms =
  | "depression"
  | "combs_wattle_blush_face"
  | "swollen_face_region"
  | "narrowness_of_eyes"
  | "balance_desorder";

export type UserType = "farmer" | "distributor" | "seller";
