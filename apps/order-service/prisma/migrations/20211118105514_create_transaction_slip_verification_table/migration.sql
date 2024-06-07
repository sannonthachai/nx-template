-- CreateTable
CREATE TABLE "transfer_slip_verifications" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_json" JSONB NOT NULL,
    "verified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "transfer_slip_id" INTEGER NOT NULL,

    CONSTRAINT "transfer_slip_verifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transfer_slip_verifications" ADD CONSTRAINT "transfer_slip_verifications_transfer_slip_id_fkey" FOREIGN KEY ("transfer_slip_id") REFERENCES "transfer_slips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
