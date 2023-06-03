import { Symptoms, UserType } from "./lib/commons";
import { DocumentReference, Timestamp, v1 } from "@google-cloud/firestore";

export type User = {
  userId: string;
  fullName:string,
  email: string;
  phoneNumber: number;
  outletAddress: string;
  type: UserType;
  outletName: string;
  latitude: number;
  longitude: number;
  infected: boolean;
};

export type HealthWorker = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number;
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
  currentOwner: DocumentReference;
};

export type UserReports = {
  reporterName: string;
  createdAt: Timestamp;
  address: string;
  phoneNumber: number;
  poultryShopName: string;
  poultryShopDocId: string;
  symptomStartDate: Date;
};

export type FarmReports = {
  farmId: string;
  HealthWorkerDocId: string;
  initiatedAt: Timestamp;
  submittedAt: Timestamp;
  submitted: boolean;
  predictionResult: boolean;
  chickenSymptoms: Array<object>;
};

export type NFCTags = {
  userDocId: string;
  nfcCode: string;
  type: "seller" | "distributor";
};
