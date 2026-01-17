import { hash } from "bcryptjs";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log("=== Nimbus Admin Password Hash Generator ===\n");

  const password = await new Promise<string>((resolve) => {
    rl.question("Enter admin password: ", (answer) => {
      resolve(answer);
    });
  });

  if (!password) {
    console.error("Password cannot be empty");
    rl.close();
    process.exit(1);
  }

  try {
    const hashedPassword = await hash(password, 10);
    console.log("\n✅ Password hash generated successfully!\n");
    console.log("Add this to your .env.local or Vercel environment variables:\n");
    console.log(`ADMIN_PASSWORD_HASH=${hashedPassword}\n`);
    console.log("Also set:");
    console.log(`ADMIN_EMAIL=admin@example.com`);
    console.log(`NEXTAUTH_SECRET=$(openssl rand -base64 32)\n`);
  } catch (error) {
    console.error("Error generating hash:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
