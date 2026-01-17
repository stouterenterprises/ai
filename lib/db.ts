import mysql from "mysql2/promise";

export type DbConfig = {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
};

const getMysqlConfig = (): DbConfig => {
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;
  const port = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : undefined;

  if (!host || !user || !password || !database) {
    throw new Error(
      "Missing MySQL environment variables. Please configure MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE."
    );
  }

  return { host, user, password, database, port };
};

let mysqlPool: mysql.Pool | null = null;

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

export const query = async <T>(sql: string, params: unknown[] = []): Promise<T[]> => {
  const [rows] = await getMysqlPool().query(sql, params);
  return rows as T[];
};

export const execute = async (sql: string, params: unknown[] = []) => {
  const [result] = await getMysqlPool().execute(sql, params);
  return result;
};
