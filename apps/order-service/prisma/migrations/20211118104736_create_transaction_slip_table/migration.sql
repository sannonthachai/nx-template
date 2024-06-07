-- CreateEnum
CREATE TYPE "OrderInstanceStatus" AS ENUM ('WaitingPurchase', 'WaitingApproval', 'Complete');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('WaitingPurchase', 'WaitingApproval', 'Void', 'Refund', 'Complete');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('income', 'outcome');

-- CreateEnum
CREATE TYPE "TransactionGateway" AS ENUM ('gb-pay', 'omise', '2c2p', 'transfer');

-- CreateEnum
CREATE TYPE "TransactionMethod" AS ENUM ('full-payment', 'transfer-payment', 'qrcode-payment', 'installment-payment');

-- CreateEnum
CREATE TYPE "TransactionBank" AS ENUM ('ktb', 'scb', 'kbank', 'bbl', 'installment_bay', 'installment_scb', 'installment_citi', 'installment_bbl', 'installment_kbank', 'installment_uob', 'installment_ktc', 'installment_first_choice', 'installment_tbank');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('WaitingApproval', 'Approved');

-- CreateTable
CREATE TABLE "order_instances" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "OrderInstanceStatus" NOT NULL DEFAULT E'WaitingPurchase',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "owner_id" TEXT NOT NULL,
    "owner_json" JSONB NOT NULL,
    "code" TEXT NOT NULL,
    "terms" TEXT NOT NULL,
    "remark" TEXT NOT NULL,
    "discount_total" INTEGER NOT NULL,
    "witholding_tax" INTEGER NOT NULL,
    "tags" TEXT[],
    "pre_tax_amount" INTEGER NOT NULL,
    "vat_amount" INTEGER NOT NULL,
    "net_amount" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT E'WaitingPurchase',
    "issued_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "purchased_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_discount_jsons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "remark" TEXT NOT NULL,
    "order_item_id" INTEGER NOT NULL,

    CONSTRAINT "order_item_discount_jsons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "item_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "item_json" JSONB NOT NULL,
    "price" INTEGER NOT NULL,
    "vat" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "discount" INTEGER NOT NULL,
    "discount_json" JSONB NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "order_id" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "medthod" "TransactionMethod" NOT NULL,
    "gateway" "TransactionGateway" NOT NULL,
    "net" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "bank" "TransactionBank" NOT NULL,
    "installment_term" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "order_instance_id" INTEGER NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_slips" (
    "id" SERIAL NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT E'WaitingApproval',
    "from_bank" TEXT NOT NULL,
    "to_bank" TEXT NOT NULL,
    "slip_path" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "transferred_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "order_instance_id" INTEGER NOT NULL,

    CONSTRAINT "transfer_slips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_instances_code_key" ON "order_instances"("code");

-- CreateIndex
CREATE UNIQUE INDEX "orders_code_key" ON "orders"("code");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_order_instance_id_key" ON "transactions"("order_instance_id");

-- CreateIndex
CREATE UNIQUE INDEX "transfer_slips_order_instance_id_key" ON "transfer_slips"("order_instance_id");

-- AddForeignKey
ALTER TABLE "order_instances" ADD CONSTRAINT "order_instances_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_discount_jsons" ADD CONSTRAINT "order_item_discount_jsons_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_instance_id_fkey" FOREIGN KEY ("order_instance_id") REFERENCES "order_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_slips" ADD CONSTRAINT "transfer_slips_order_instance_id_fkey" FOREIGN KEY ("order_instance_id") REFERENCES "order_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
