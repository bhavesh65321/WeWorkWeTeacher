import { execFileSync } from "node:child_process";

export function sql(query) {
  return execFileSync("docker", ["exec", "gm-qa-pg", "psql", "-U", "postgres", "-d", "gurumates_qa", "-tAc", query], {
    encoding: "utf8",
  }).trim();
}

export function backdateJob(jobId, hours = 3) {
  sql(`UPDATE "Job" SET "createdAt" = now() - interval '${hours} hours' WHERE id = '${jobId}'`);
}

export function setCoins(userId, coins) {
  sql(`WITH w AS (SELECT id, "coinBalance" FROM "Wallet" WHERE "userId" = '${userId}'),
    adj AS (INSERT INTO "LedgerEntry" (id, "walletId", amount, unit, type, note, "createdAt")
      SELECT 'qa' || substr(md5(random()::text), 1, 20), id, ${coins} - "coinBalance", 'COIN', 'ADMIN', 'qa adjust', now() FROM w RETURNING 1)
    UPDATE "Wallet" SET "coinBalance" = ${coins} WHERE "userId" = '${userId}'`);
}

export function markVerified(userId) {
  sql(`UPDATE "User" SET "emailVerifiedAt" = now(), "phoneVerifiedAt" = now(), phone = coalesce(phone, '+9199${Math.floor(10000000 + Math.random() * 89999999)}') WHERE id = '${userId}'`);
}

export function count(table, where) {
  return Number(sql(`SELECT count(*) FROM "${table}" WHERE ${where}`));
}
