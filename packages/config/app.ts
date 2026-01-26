export const appConfig = {
  appUrl: import.meta.env.APP_URL || "http://localhost:9000",
  apiUrl: import.meta.env.APP_API_URL + "/api/",
  apiPayment: import.meta.env.APP_API_PAYMENT + "/api/",
  baseUrl: import.meta.env.APP_API_URL,
  clientId: import.meta.env.APP_CLIENT_ID,
  tenant: import.meta.env.APP_X_TENANT,
  apiKunLun: import.meta.env.APP_KUN_LUN + "/api",
  appRedirectUrl: import.meta.env.APP_REDIRECT_URL || "http://localhost:9000",
  platform: import.meta.env.APP_PLATFORM,
  notificationWss: import.meta.env.APP_NOTIFICATION_WSS,
}
