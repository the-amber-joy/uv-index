import { SearchIcon } from "@chakra-ui/icons";
import {
  CloseButton,
  FormControl,
  FormErrorMessage,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import { isEmpty } from "lodash";
import { useEffect, useRef, useState } from "react";

import { getCityByGeocode } from "../../api/getCityByGeocode";
import { getLocationByCity } from "../../api/getLocationByCity";
import { getCurrentIndexByLocation } from "../../api/getUVindex";
import { useLoadingContext } from "../../context/LoadingContext";
import { useLocationContext } from "../../context/LocationContext";
import { useWeatherContext } from "../../context/WeatherContext";
import { OptionList } from "./OptionList";

export const SearchComponent = () => {
  const { updateLocation } = useLocationContext();
  const { updateWeather } = useWeatherContext();
  const { isLoading, updateLoading } = useLoadingContext();

  const [cityName, setCityName] = useState<string>("");
  const [stateName, setStateName] = useState<string>("");
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const hasRequestedLocation = useRef(false);

  const handleSubmit = async () => {
    updateLoading(true);
    const query = { city: cityName, state: stateName, country: "US" };

    await getLocationByCity(query)
      .then((geoResponse: any) => {
        if (isEmpty(geoResponse.data)) {
          setIsInvalid(true);
          updateLoading(false);
        }
        if (!isEmpty(geoResponse.data)) {
          updateLocation(geoResponse.data[0]);

          getCurrentIndexByLocation({
            lat: geoResponse.data[0].lat,
            lng: geoResponse.data[0].lng,
          }).then((uvResponse) => {
            if (uvResponse.status === 200) {
              updateWeather(uvResponse.data);
            }
          });
        }
      })
      .finally(() => updateLoading(false));
  };

  useEffect(() => {
    if (hasRequestedLocation.current) {
      return;
    }
    hasRequestedLocation.current = true;

    const getPosition = async (position: any) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      await getCityByGeocode({ lat, lon }).then((res) => {
        updateLocation(res.data[0]);

        getCurrentIndexByLocation({
          lat,
          lng: lon,
        }).then((uvResponse) => {
          if (uvResponse.status === 200) {
            updateWeather(uvResponse.data);
          }
        });
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getPosition);
    } else {
      console.log("Geolocation not supported");
    }
  }, [updateLocation, updateWeather]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <FormControl isInvalid={isInvalid}>
        <VStack w={{ base: "auto", lg: "sm" }}>
          <InputGroup>
            <Input
              placeholder="City"
              onChange={(e) => {
                setIsInvalid(false);
                setCityName(e.currentTarget.value);
              }}
              value={cityName}
              isDisabled={isLoading}
            />
            {cityName !== "" && (
              <InputRightElement>
                <CloseButton
                  aria-label="Clear Search Input"
                  onClick={() => {
                    setIsInvalid(false);
                    setCityName("");
                  }}
                />
              </InputRightElement>
            )}
          </InputGroup>
          <Select
            value={stateName}
            onChange={(e) => {
              setStateName(e.currentTarget.value);
            }}
            placeholder="Select a state..."
            isDisabled={isLoading || cityName === ""}
          >
            <OptionList />
          </Select>
          {isInvalid && (
            <FormErrorMessage>
              No city with this name in {stateName}.
            </FormErrorMessage>
          )}
          <IconButton
            type="submit"
            aria-label="Search"
            icon={isLoading ? <Spinner size="sm" /> : <SearchIcon />}
            onClick={() => {
              handleSubmit();
            }}
            isDisabled={isLoading || cityName === "" || stateName === ""}
          />
        </VStack>
      </FormControl>
    </form>
  );
};
