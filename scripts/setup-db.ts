import mysql from "mysql2/promise";

const setupDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "support_portal"
  });

  try {
    console.log("Creating tables...\n");

    // Create businesses table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS businesses (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Created businesses table");

    // Create departments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        business_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
        INDEX idx_business_id (business_id)
      )
    `);
    console.log("✓ Created departments table");

    // Create tickets table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tickets (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        business_id VARCHAR(36) NOT NULL,
        department_id VARCHAR(36),
        subject VARCHAR(255) NOT NULL,
        conversation_id VARCHAR(255),
        status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
        INDEX idx_business_id (business_id),
        INDEX idx_department_id (department_id),
        INDEX idx_status (status)
      )
    `);
    console.log("✓ Created tickets table");

    // Create conversations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        business_id VARCHAR(36) NOT NULL,
        department_id VARCHAR(36),
        customer_email VARCHAR(255),
        messages JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
        INDEX idx_business_id (business_id)
      )
    `);
    console.log("✓ Created conversations table");

    // Create jobs table for async processing
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS jobs (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        business_id VARCHAR(36),
        type VARCHAR(100) NOT NULL,
        payload JSON,
        status ENUM('queued', 'processing', 'completed', 'failed') DEFAULT 'queued',
        result TEXT,
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
        INDEX idx_status (status),
        INDEX idx_type (type)
      )
    `);
    console.log("✓ Created jobs table");

    console.log("\n✅ Database setup complete!");
    console.log("\nNow you can:");
    console.log("1. Go back to your app");
    console.log("2. Refresh the admin page");
    console.log("3. Create your first business");

  } catch (error) {
    console.error("❌ Error setting up database:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
};

setupDatabase();
