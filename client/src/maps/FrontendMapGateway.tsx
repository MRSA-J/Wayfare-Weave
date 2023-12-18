import axios from 'axios';
import { 
  IServiceResponse, 
  failureServiceResponse, 
  successfulServiceResponse 
} from '~/types';

export const FrontendMapGateway = {
  getLocation: async (address: string): Promise<IServiceResponse<{lat: number, lng: number}>> => {
    try {
      const geocodeResp = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json?" +
        "address=" + encodeURIComponent(address) + "&" +
        "key=" + process.env.NEXT_PUBLIC_API_KEY ?? "KEY"
      );
      if (geocodeResp.status == 200 && geocodeResp.data.status == "OK") {
        return successfulServiceResponse(geocodeResp.data.results[0].geometry.location);
      }
      return failureServiceResponse("Unable to find the restaurant with the address");
    } catch (exception) {
      return failureServiceResponse("Unable to access backend");
    }
  },
}
