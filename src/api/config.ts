export const config = {
  headers: {
    "x-access-token": process.env.API_KEY,
    "X-Api-Key":
      process.env.API_NINJA_KEY,
  },
};

export const openUvUrl =
  process.env.REACT_APP_OPENUV_API_URL ?? "https://api.openuv.io/api/v1/uv";
export const geocodeUrl =
  process.env.REACT_APP_API_NINJA_GEOCODE_URL ??
  "https://api.api-ninjas.com/v1/geocoding";
