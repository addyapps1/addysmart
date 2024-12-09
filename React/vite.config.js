
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  //base: '/', // Ensure this points to the correct base URL of your app in production
})



// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// // https://vitejs.dev/config/
// export default defineConfig(({ mode }) => {
//   const isProduction = mode === "production";

//   // Define the array of allowed services
//   const allowedOrigins = isProduction
//     ? [
//         `https://${import.meta.env.VITE_AUTH_HOST}`,
//         `https://${import.meta.env.VITE_SUPPORT_HOST}`,
//         `https://${import.meta.env.VITE_E_VIDEO_HOST}`,
//         `https://${import.meta.env.VITE_MINING_HOST}`,
//         `https://${import.meta.env.VITE_AFFILIATE_HOST}`,
//         `https://${import.meta.env.VITE_MESSAGING_HOST}`,
//         `https://${import.meta.env.VITE_ADVERTIZING_HOST}`,
//         `https://${import.meta.env.VITE_SPONSORSHIP_HOST}`,
//         `https://${import.meta.env.VITE_PAYMENT_HOST}`,
//         `https://${import.meta.env.VITE_CAMPAIGN_HOST}`,
//         `https://${import.meta.env.VITE_CLIENT_HOST}`,
//       ]
//     : [
//         `http://${import.meta.env.VITE_DEV_AUTH_HOST}`,
//         `http://${import.meta.env.VITE_DEV_SUPPORT_HOST}`,
//         `http://${import.meta.env.VITE_DEV_E_VIDEO_HOST}`,
//         `http://${import.meta.env.VITE_DEV_MINING_HOST}`,
//         `http://${import.meta.env.VITE_DEV_AFFILIATE_HOST}`,
//         `http://${import.meta.env.VITE_DEV_MESSAGING_HOST}`,
//         `http://${import.meta.env.VITE_DEV_ADVERTIZING_HOST}`,
//         `http://${import.meta.env.VITE_DEV_SPONSORSHIP_HOST}`,
//         `http://${import.meta.env.VITE_DEV_PAYMENT_HOST}`,
//         `http://${import.meta.env.VITE_DEV_CAMPAIGN_HOST}`,
//         `http://${import.meta.env.VITE_DEV_CLIENT_HOST}`,
//       ];

//   // Join the allowed services into a string for the CSP
//   const servicesString = allowedOrigins.join(" ");

//   return {
//     plugins: [react()],
//     base: isProduction ? "/your-production-path/" : "/", // Set the base path for production
//     build: {
//       outDir: "dist", // Directory to output the build files
//       minify: isProduction ? "terser" : false, // Use minification in production
//       sourcemap: !isProduction, // Enable sourcemaps for development only
//       assetsDir: "assets", // Directory for static assets
//     },
//     server: {
//       headers: {
//         "Content-Security-Policy": isProduction
//           ? `default-src 'self'; script-src 'self' ${servicesString}; connect-src 'self' ${servicesString}; style-src 'self'; img-src 'self';`
//           : `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' ${servicesString}; connect-src 'self' ${servicesString}; style-src 'self'; img-src 'self';`,
//       },
//     },
//   };
// });
