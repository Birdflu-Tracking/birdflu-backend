export const validateFarmerData = (data: any) => {
  if (Object.values(data).some((element) => element === null)) {
    throw new Error("None of the values should be undefined or null");
  } else {
    if (
      isNaN(data.phoneNumber) ||
      isNaN(data.latitude) ||
      isNaN(data.longitude)
    )
      throw new Error(
        "Phone Number, Latitude and Longitude must be valid numbers"
      );

    return {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      outletAddress: data.outletAddress,
      outletName: data.outletName,
      latitude: data.latitude,
      longitude: data.longitude,
      password: data.password,
    };
  }
};

export const validateDistributorData = (data: any) => {
  if (Object.values(data).some((element) => element === null)) {
    throw new Error("None of the values should be undefined or null");
  } else {
    if (
      isNaN(data.phoneNumber) ||
      isNaN(data.latitude) ||
      isNaN(data.longitude)
    )
      throw new Error(
        "Phone Number, Latitude and Longitude must be valid numbers"
      );

    return {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      outletAddress: data.outletAddress,
      outletName: data.outletName,
      latitude: data.latitude,
      longitude: data.longitude,
      password: data.password,
    };
  }
};

export const validateSellerData = (data: any) => {
  if (Object.values(data).some((element) => element === null)) {
    throw new Error("None of the values should be undefined or null");
  } else {
    if (
      isNaN(data.phoneNumber) ||
      isNaN(data.latitude) ||
      isNaN(data.longitude)
    )
      throw new Error(
        "Phone Number, Latitude and Longitude must be valid numbers"
      );

    return {
      fullName: data.fullName,

      email: data.email,
      phoneNumber: data.phoneNumber,
      outletAddress: data.outletAddress,
      outletName: data.outletName,
      latitude: data.latitude,
      longitude: data.longitude,
      password: data.password,
    };
  }
};
