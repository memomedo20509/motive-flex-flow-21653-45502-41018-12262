import { runMigrations } from "../server/migrate";

runMigrations().catch((error) => {
  console.error(error);
  process.exit(1);
});
