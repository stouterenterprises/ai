import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const host = process.env.MYSQL_HOST;
    const user = process.env.MYSQL_USER;
    const password = process.env.MYSQL_PASSWORD;
    const database = process.env.MYSQL_DATABASE;
    const port = process.env.MYSQL_PORT || "3306";

    const missingVars = [];
    if (!host) missingVars.push("MYSQL_HOST");
    if (!user) missingVars.push("MYSQL_USER");
    if (!password) missingVars.push("MYSQL_PASSWORD");
    if (!database) missingVars.push("MYSQL_DATABASE");

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing MySQL environment variables",
          missing: missingVars,
          hasAllVars: false
        },
        { status: 400 }
      );
    }

    console.log("Testing MySQL connection...");
    console.log("Host:", host);
    console.log("Port:", port);
    console.log("User:", user);
    console.log("Database:", database);

    // Try to import and test connection
    const mysql = require("mysql2/promise");
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database,
      port: parseInt(port),
      connectTimeout: 5000
    });

    const [rows] = await connection.execute("SELECT 1 as connected");
    await connection.end();

    return NextResponse.json({
      status: "ok",
      message: "MySQL connection successful",
      config: {
        host,
        port,
        user,
        database
      },
      testQuery: rows
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: (error as Error).message,
        hint: "Check MySQL credentials in Vercel environment variables"
      },
      { status: 500 }
    );
  }
}
