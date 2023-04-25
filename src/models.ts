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
};

export type Distributor = {
  userId: DocumentReference;
  distributorName: string;
  latitude: number;
  longitude: number;
};

export type Seller = {
  userId: DocumentReference;
  sellerShopName: string;
  latitude: number;
  longitude: number;
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
  reporterContact: number;
  sellerId: string;
  createdAt: Date;
  symptomsStartDate: Date;
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
  userId: string;
  createdAt: Date;
  tag: string;
};
