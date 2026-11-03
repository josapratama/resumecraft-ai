export const ENV = {
  jwtSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl:
    process.env.BUILT_IN_FORGE_API_URL ||
    process.env.OPENAI_BASE_URL ||
    (process.env.OPENAI_API_KEY ? "https://api.openai.com" : ""),
  forgeApiKey:
    process.env.BUILT_IN_FORGE_API_KEY ||
    process.env.OPENAI_API_KEY ||
    "",
  aiModel:
    process.env.AI_MODEL ||
    process.env.OPENAI_MODEL ||
    "",
};
