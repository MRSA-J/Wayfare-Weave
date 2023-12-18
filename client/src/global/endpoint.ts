const devEndpoint = "http://localhost:8000/";
const prodEndpoint = "https://wayfare-weave.onrender.com/";

const isProduction = process.env.NODE_ENV === "production";
export const endpoint = isProduction ? prodEndpoint : devEndpoint;
