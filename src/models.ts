import { Symptoms, UserType } from "./lib/commons";
import { DocumentReference, Timestamp, v1 } from "@google-cloud/firestore";

export type User = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number;
  outletAddress: string;
  firebaseAuthUid: string;
  type: UserType;
};

export type Farmer = {
  userId: DocumentReference;
  farmName: string;
  latitude: number;
  longitude: number;
  infected: boolean;
};

export type Distributor = {
  userId: DocumentReference;
  distributorName: string;
  latitude: number;
  longitude: number;
  infected: boolean;
};

export type Seller = {
  userId: DocumentReference;
  sellerShopName: string;
  latitude: number;
  longitude: number;
  infected: boolean;
};

export type HealthWorker = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number;
  firebaseAuthUid: string;
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
  // sellerId: string;
  createdAt: Timestamp;
  address: string;
  phoneNumber: number;
  poultryShop: string;
  symptomStartDate: Date;
};

export type FarmReports = {
  farmId: string;
  HealthWorkerId: string;
  initiatedAt: Timestamp;
  submittedAt: Timestamp;
  submitted: boolean;
  predictionResult: boolean;
  chickenSymptoms: Array<object>;
};

export type NFCTags = {
  uid: string;
  nfcCode: string;
  type: "seller" | "distributor";
};
