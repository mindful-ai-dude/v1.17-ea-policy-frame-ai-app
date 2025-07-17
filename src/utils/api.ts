import { ConvexReactClient } from "convex/react";
import { api as convexApi } from "../../convex/_generated/api";

// Create a Convex client
const convexUrl = import.meta.env.VITE_CONVEX_URL as string;
const convex = new ConvexReactClient(convexUrl);

// Export the typed API
export const api = convexApi;

export default convex;