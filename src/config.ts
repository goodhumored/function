import * as dotenv from "dotenv";

dotenv.config();

export default function getConfig() {
  return {
    baseUrl: "https://functiondesign.studio",
    baseUrlEmail: process.env["NEXT_PUBLIC_BASE_URL_EMAIL"] ?? "https://functiondesign.studio",
    strapi: {
      baseUrl: process.env["STRAPI_BASE_URL"] ?? "http://localhost:1337",
      publicUrl:
        process.env["PUBLIC_STRAPI_URL"] ??
        process.env["STRAPI_BASE_URL"] ??
        "http://localhost:1337",
      apiToken: process.env["STRAPI_TOKEN"] ?? "",
    },
    debug: process.env["DEBUG"],
    table: {
      email: process.env["GOOGLE_SPREADSHEET_EMAIL"] ?? "",
      tokenPath: process.env["GOOGLE_SPREADSHEET_API_KEY_PATH"] ?? "",
      privateKey: process.env["GOOGLE_SPREADSHEET_PRIVATE_KEY"] ?? "",
      id: process.env["GOOGLE_SPREADSHEET_ID"] ?? "",
    },
    email: {
      host: process.env["EMAIL_HOST"] ?? "smtp.gmail.com",
      port: Number(process.env["EMAIL_PORT"]) || 587,
      secure: process.env["EMAIL_SECURE"] === "true",
      user: process.env["EMAIL_USER"] ?? "",
      password: process.env["EMAIL_PASSWORD"] ?? "",
      from: process.env["EMAIL_FROM"] ?? "",
      to: process.env["EMAIL_TO"] ?? "",
    },
  };
}
