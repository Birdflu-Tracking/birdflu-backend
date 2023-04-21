import { Symptoms } from "./lib/commons";
import { DocumentReference } from "@google-cloud/firestore";

export type User = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number;
  outletAddress: string;
  type: "farmer" | "seller" | "distributor" | "reporter";
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
