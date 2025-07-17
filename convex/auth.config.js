// Auth configuration for Convex
// This file configures authentication providers for your Convex app

export default {
  // Configure providers here
  providers: [
    {
      // OAuth using Google
      domain: "google",
      // Optional customization
      buttonText: "Sign in with Google",
    },
    {
      // OAuth using GitHub
      domain: "github",
      // Optional customization
      buttonText: "Sign in with GitHub",
    },
    // You can add more providers as needed
  ],
};