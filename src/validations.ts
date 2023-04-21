export const validateFarmerData = (data: any) => {
  if (Object.values(data).some((element) => element === null)) {
    throw new Error("None of the values should be undefined or null");
  } else {
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      outletAddress: data.outletAddress,
      farmName: data.farmName,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  }
};

export const validateDistributorData = (data: any) => {
  if (Object.values(data).some((element) => element === null)) {
    throw new Error("None of the values should be undefined or null");
  } else {
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      outletAddress: data.outletAddress,
      distributorName: data.distributorName,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  }
};

export const validateSellerData = (data: any) => {
  if (Object.values(data).some((element) => element === null)) {
    throw new Error("None of the values should be undefined or null");
  } else {
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      outletAddress: data.outletAddress,
      sellerShopName: data.sellerShopName,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  }
};
