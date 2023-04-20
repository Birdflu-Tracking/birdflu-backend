export type User = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number;
  outletName: string;
  outletAddress: string;
  type: "farmer" | "seller" | "distributor" | "reporter";
};

export type Farmer = {
  userId: string;
  farmName: string;
  latitude: number;
  longitude: number;
};

export type Distributor = {
  userId: string;
  distributorName: string;
  latitude: number;
  longitude: number;
};

export type Seller = {
  userId: string;
  sellerShopName: string;
  latitude: number;
  longitude: number;
};

export type HealthWorker = {
  userId: string;
  assignedAt: Date;
};

export type Batch = {
  batchSize: number;
  createdAt: Date;
  farmerId: string;
  distributorId: string;
  sellerId: string;
  infected: boolean;
};

export type UserReports = {
  reporterName: string;
  reporterContact: number;
  sellerId: string;
  createdAt: Date;
  symptomsStartDate: Date;
};

type Symptoms =
  | "depression"
  | "combs_wattle_blush_face"
  | "swollen_face_region"
  | "narrowness_of_eyes"
  | "balance_desorder";

export type FarmReports = {
  farmId: string;
  HealthWorkerId: string;
  initiatedAt: Date;
  submittedAt: Date;
  predictionResult: boolean;
  chickenSymptoms: Array<Array<Symptoms>>;
};

export type SymptomsReport = {
  farmerId: string;
  symptoms: Array<string>;
};

export type NFCTags = {
  userId: string;
  createdAt: Date;
  tag: string;
};
