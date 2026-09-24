import "dotenv/config"
import { defineConfig, env } from "prisma/config"

// Prisma 7.x konfiguráció
// Lokális: SQLite (file:./prisma/dev.db)
// Élesítés: PostgreSQL – csak a DATABASE_URL env változót kell cserélni
export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
})
