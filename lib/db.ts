import mysql from "mysql2/promise";
import { Pool } from "pg";

export type DbAdapter = "mysql" | "postgres";

export type DbConfig = {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
};

export const getDbAdapter = (): DbAdapter => (process.env.DATABASE_URL ? "postgres" : "mysql");

const getMysqlConfig = (): DbConfig => {
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;
  const port = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : undefined;

  if (!host || !user || !password || !database) {
    throw new Error("Missing MySQL environment variables");
  }

  return { host, user, password, database, port };
};

const getPostgresConfig = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL environment variable");
  }
  const sslRequired = connectionString.includes("sslmode=require");
  return {
    connectionString,
    ssl: sslRequired ? { rejectUnauthorized: false } : undefined
  };
};

const formatPostgresSql = (sql: string) => {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`).replace(/`/g, '"');
};

let mysqlPool: mysql.Pool | null = null;
let postgresPool: Pool | null = null;

const getMysqlPool = () => {
  if (!mysqlPool) {
    mysqlPool = mysql.createPool({
      ...getMysqlConfig(),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  return mysqlPool;
};

const getPostgresPool = () => {
  if (!postgresPool) {
    postgresPool = new Pool(getPostgresConfig());
  }
  return postgresPool;
};

export const query = async <T>(sql: string, params: unknown[] = []): Promise<T[]> => {
  if (getDbAdapter() === "postgres") {
    const result = await getPostgresPool().query(formatPostgresSql(sql), params);
    return result.rows as T[];
  }

  const [rows] = await getMysqlPool().query(sql, params);
  return rows as T[];
};

export const execute = async (sql: string, params: unknown[] = []) => {
  if (getDbAdapter() === "postgres") {
    return getPostgresPool().query(formatPostgresSql(sql), params);
  }

  const [result] = await getMysqlPool().execute(sql, params);
  return result;
};
