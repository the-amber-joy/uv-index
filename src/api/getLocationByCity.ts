import axios, { AxiosResponse } from "axios";
import { config, geocodeUrl } from "./config";
import { map } from "lodash";

export interface GeocodeApiResponse {
  data: {
    name: string; // the city name submitted
    latitude: string;
    longitude: string;
    state: string;
    country: string;
  };
}

export interface GeocodeResponse {
  data: GeocodeApiResponse[];
  status: number;
}
export interface CityQueryParams {
  city: string;
  state: string;
  country: string;
}

/**
 *
 * @param {QueryParams} query
 * @returns {GeocodeResponse}
 */
export async function getLocationByCity(query: CityQueryParams) {
  try {
    return axios
      .get(geocodeUrl, {
        headers: { "X-Api-Key": "zzlMvGjana5iDiZztIJGAA==q23zJW7Kg6gF7uGu" },
        params: query,
      })
      .then(
        (response: AxiosResponse<GeocodeApiResponse>) => {
          console.log("response", response);
          const { data, status } = response;

          const foo = map(data, (item) => ({
            name: item.name,
            state: item.state,
            lat: parseFloat(item.latitude).toFixed(2),
            lng: parseFloat(item.longitude).toFixed(2),
          }));

          return { data: foo, status };
        },
        (err) => err.response
      );
  } catch (err) {
    console.log("error: ", err);
  }
}
