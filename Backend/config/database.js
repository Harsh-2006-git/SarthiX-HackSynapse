import * as dotenv from "dotenv";
import fs from "fs";
import { Sequelize } from "sequelize";

import path from "path";
import { fileURLToPath } from "url";

// Try loading local .env first, then fallback to parent directory .env
dotenv.config();

const resolvedEnvPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", ".env");
dotenv.config({ path: resolvedEnvPath });

/**
 * Sequelize instance
 */

// Helper to choose variables based on mode
// If Vercel is used, we usually have VERCEL environment variable, but let's just check DATABASE_URL
const isCloud = process.env.DB_MODE === "cloud" || !!process.env.DATABASE_URL;

let sequelize;

let sslOptions = {};
if (process.env.DB_SSL === "true") {
  sslOptions = {
    require: true,
    rejectUnauthorized: false
  };

  if (process.env.DB_CA_CERT_PATH) {
    try {
      // Use process.cwd() or fallback to basic requires
      const certPath = process.env.DB_CA_CERT_PATH.startsWith("/")
        ? process.env.DB_CA_CERT_PATH
        : new URL(`../${process.env.DB_CA_CERT_PATH}`, import.meta.url).pathname;

      if (fs.existsSync(certPath)) {
        sslOptions.ca = fs.readFileSync(certPath);
      } else if (fs.existsSync(process.env.DB_CA_CERT_PATH)) {
        sslOptions.ca = fs.readFileSync(process.env.DB_CA_CERT_PATH);
      }
    } catch (err) {
      console.warn("⚠️ Could not read DB CA certificate:", err.message);
    }
  }
}

if (isCloud && process.env.DATABASE_URL) {
  // Use connection string if provided for cloud
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "mysql",
    logging: false,
    dialectOptions: process.env.DB_SSL === "true" ? { ssl: sslOptions } : {},
  });
} else {
  // Otherwise use individual variables
  const DB_NAME = isCloud ? process.env.DB_NAME : process.env.DB_NAME_LOCAL;
  const DB_USER = isCloud ? process.env.DB_USER : process.env.DB_USER_LOCAL;
  const DB_PASS = isCloud ? process.env.DB_PASSWORD : process.env.DB_PASSWORD_LOCAL;
  const DB_HOST = isCloud ? process.env.DB_HOST : process.env.DB_HOST_LOCAL;
  const DB_PORT = isCloud ? (process.env.DB_PORT || 3306) : (process.env.DB_PORT_LOCAL || 3306);

  sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASS,
    {
      host: DB_HOST,
      port: Number(DB_PORT),
      dialect: "mysql",
      logging: false,
      dialectOptions: process.env.DB_SSL === "true" ? { ssl: sslOptions } : {},
    }
  );
}

/**
 * Connect to database
 */


const connectDB = async () => {
  try {
    await sequelize.authenticate();
    const config = sequelize.options;
    const dbName = config.database || (sequelize.connectionManager.config && sequelize.connectionManager.config.database);
    const dbHost = config.host || (sequelize.connectionManager.config && sequelize.connectionManager.config.host);
    console.log(`✅ Database Connected: ${dbName} at ${dbHost}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
};

export { sequelize, connectDB };
export default sequelize;
