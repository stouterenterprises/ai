import mysql from "mysql2/promise";

export type DbConfig = {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
};

const getDbConfig = (): DbConfig => {
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

let pool: mysql.Pool | null = null;

export const getDbPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      ...getDbConfig(),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  return pool;
};

export const query = async <T>(sql: string, params: unknown[] = []): Promise<T[]> => {
  const [rows] = await getDbPool().query(sql, params);
  return rows as T[];
};

export const execute = async (sql: string, params: unknown[] = []) => {
  const [result] = await getDbPool().execute(sql, params);
  return result;
};
