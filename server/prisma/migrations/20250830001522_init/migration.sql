-- CreateTable
CREATE TABLE "Deal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "liquidity" INTEGER NOT NULL,
    "buff" REAL NOT NULL,
    "csgoTm" REAL NOT NULL,
    "vol7d" INTEGER NOT NULL,
    "purch" INTEGER NOT NULL,
    "target" REAL NOT NULL,
    "youpin" REAL NOT NULL,
    "margin" REAL NOT NULL,
    "sku" TEXT,
    "deletedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DealBlacklist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "DealBlacklist_key_expiresAt_idx" ON "DealBlacklist"("key", "expiresAt");
