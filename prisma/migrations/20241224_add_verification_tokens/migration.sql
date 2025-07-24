-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_attempts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 1,
    "last_attempt_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blocked_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE INDEX "verification_tokens_user_id_idx" ON "verification_tokens"("user_id");

-- CreateIndex
CREATE INDEX "verification_tokens_type_idx" ON "verification_tokens"("type");

-- CreateIndex
CREATE INDEX "verification_tokens_expires_at_idx" ON "verification_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "verification_tokens_token_type_idx" ON "verification_tokens"("token", "type");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_attempts_email_key" ON "email_verification_attempts"("email");

-- CreateIndex
CREATE INDEX "email_verification_attempts_ip_address_idx" ON "email_verification_attempts"("ip_address");

-- CreateIndex
CREATE INDEX "email_verification_attempts_blocked_until_idx" ON "email_verification_attempts"("blocked_until");

-- AddForeignKey
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add indexes for better performance on user table
CREATE INDEX IF NOT EXISTS "users_email_verified_idx" ON "users"("email_verified");
CREATE INDEX IF NOT EXISTS "users_phone_verified_idx" ON "users"("phone_verified");
CREATE INDEX IF NOT EXISTS "users_status_created_at_idx" ON "users"("status", "created_at");