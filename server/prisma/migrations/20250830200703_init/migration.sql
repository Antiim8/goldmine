-- CreateTable
CREATE TABLE "Deal" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "liquidity" INTEGER NOT NULL,
    "buff" DOUBLE PRECISION NOT NULL,
    "csgoTm" DOUBLE PRECISION NOT NULL,
    "vol7d" INTEGER NOT NULL,
    "purch" INTEGER NOT NULL,
    "target" DOUBLE PRECISION NOT NULL,
    "youpin" DOUBLE PRECISION NOT NULL,
    "margin" DOUBLE PRECISION NOT NULL,
    "sku" TEXT,
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealBlacklist" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealBlacklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DealBlacklist_key_expiresAt_idx" ON "DealBlacklist"("key", "expiresAt");
