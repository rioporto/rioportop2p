import { PrismaClient, EscrowStatus, TransactionStatus, PaymentStatus } from '@prisma/client';
import { logger } from '../../utils/logger';
import { CustomError } from '../../errors/custom-error';

export class EscrowService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Lock funds in escrow (mark escrow as LOCKED)
   */
  async lockFunds(transactionId: string): Promise<void> {
    logger.info('Locking funds in escrow', { transactionId });

    try {
      // Get transaction with escrow
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { escrow: true }
      });

      if (!transaction) {
        throw new CustomError('Transaction not found', 404);
      }

      if (!transaction.escrow) {
        throw new CustomError('Escrow not found for this transaction', 404);
      }

      if (transaction.escrow.status !== EscrowStatus.PENDING) {
        throw new CustomError(
          `Cannot lock funds. Escrow status is ${transaction.escrow.status}`,
          400
        );
      }

      // Update escrow status to LOCKED
      await this.prisma.escrow.update({
        where: { id: transaction.escrow.id },
        data: {
          status: EscrowStatus.LOCKED,
          lockedAt: new Date()
        }
      });

      logger.info('Funds locked in escrow successfully', {
        transactionId,
        escrowId: transaction.escrow.id
      });
    } catch (error) {
      logger.error('Error locking funds in escrow', {
        transactionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Release funds from escrow
   */
  async releaseFunds(transactionId: string): Promise<void> {
    logger.info('Releasing funds from escrow', { transactionId });

    try {
      // Get transaction with escrow and payment
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          escrow: true,
          payment: true
        }
      });

      if (!transaction) {
        throw new CustomError('Transaction not found', 404);
      }

      if (!transaction.escrow) {
        throw new CustomError('Escrow not found for this transaction', 404);
      }

      // Verify escrow is LOCKED
      if (transaction.escrow.status !== EscrowStatus.LOCKED) {
        throw new CustomError(
          `Cannot release funds. Escrow status is ${transaction.escrow.status}`,
          400
        );
      }

      // Verify payment is confirmed
      if (!transaction.payment || transaction.payment.status !== PaymentStatus.CONFIRMED) {
        throw new CustomError(
          'Cannot release funds. Payment is not confirmed',
          400
        );
      }

      // Use transaction to update both escrow and transaction atomically
      await this.prisma.$transaction([
        // Update escrow to RELEASED
        this.prisma.escrow.update({
          where: { id: transaction.escrow.id },
          data: {
            status: EscrowStatus.RELEASED,
            releasedAt: new Date()
          }
        }),
        // Update transaction to RELEASING_CRYPTO
        this.prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: TransactionStatus.RELEASING_CRYPTO
          }
        })
      ]);

      logger.info('Funds released from escrow successfully', {
        transactionId,
        escrowId: transaction.escrow.id,
        newTransactionStatus: TransactionStatus.RELEASING_CRYPTO
      });
    } catch (error) {
      logger.error('Error releasing funds from escrow', {
        transactionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Refund funds from escrow
   */
  async refundFunds(transactionId: string, reason?: string): Promise<void> {
    logger.info('Refunding funds from escrow', { transactionId, reason });

    try {
      // Get transaction with escrow
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { escrow: true }
      });

      if (!transaction) {
        throw new CustomError('Transaction not found', 404);
      }

      if (!transaction.escrow) {
        throw new CustomError('Escrow not found for this transaction', 404);
      }

      // Check if escrow can be refunded
      const canRefund = [
        EscrowStatus.PENDING,
        EscrowStatus.LOCKED
      ].includes(transaction.escrow.status);

      if (!canRefund) {
        throw new CustomError(
          `Cannot refund. Escrow status is ${transaction.escrow.status}`,
          400
        );
      }

      // Check if transaction is in a refundable state
      const refundableStatuses = [
        TransactionStatus.PENDING,
        TransactionStatus.ACCEPTED,
        TransactionStatus.WAITING_PAYMENT,
        TransactionStatus.PAYMENT_CONFIRMED,
        TransactionStatus.DISPUTED
      ];

      if (!refundableStatuses.includes(transaction.status)) {
        throw new CustomError(
          `Cannot refund. Transaction status is ${transaction.status}`,
          400
        );
      }

      // Use transaction to update both escrow and transaction atomically
      await this.prisma.$transaction([
        // Update escrow to REFUNDED
        this.prisma.escrow.update({
          where: { id: transaction.escrow.id },
          data: {
            status: EscrowStatus.REFUNDED,
            refundedAt: new Date(),
            refundReason: reason
          }
        }),
        // Update transaction to CANCELLED
        this.prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: TransactionStatus.CANCELLED,
            cancelledAt: new Date()
          }
        })
      ]);

      logger.info('Funds refunded from escrow successfully', {
        transactionId,
        escrowId: transaction.escrow.id,
        reason,
        newTransactionStatus: TransactionStatus.CANCELLED
      });
    } catch (error) {
      logger.error('Error refunding funds from escrow', {
        transactionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get current escrow status
   */
  async getEscrowStatus(transactionId: string): Promise<{
    status: EscrowStatus;
    lockedAt?: Date | null;
    releasedAt?: Date | null;
    refundedAt?: Date | null;
    refundReason?: string | null;
  }> {
    logger.debug('Getting escrow status', { transactionId });

    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { escrow: true }
      });

      if (!transaction) {
        throw new CustomError('Transaction not found', 404);
      }

      if (!transaction.escrow) {
        throw new CustomError('Escrow not found for this transaction', 404);
      }

      const escrowStatus = {
        status: transaction.escrow.status,
        lockedAt: transaction.escrow.lockedAt,
        releasedAt: transaction.escrow.releasedAt,
        refundedAt: transaction.escrow.refundedAt,
        refundReason: transaction.escrow.refundReason
      };

      logger.debug('Escrow status retrieved', {
        transactionId,
        status: escrowStatus.status
      });

      return escrowStatus;
    } catch (error) {
      logger.error('Error getting escrow status', {
        transactionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Check if escrow can be released
   */
  async canRelease(transactionId: string): Promise<boolean> {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          escrow: true,
          payment: true
        }
      });

      if (!transaction || !transaction.escrow || !transaction.payment) {
        return false;
      }

      return (
        transaction.escrow.status === EscrowStatus.LOCKED &&
        transaction.payment.status === PaymentStatus.CONFIRMED
      );
    } catch (error) {
      logger.error('Error checking if escrow can be released', {
        transactionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Check if escrow can be refunded
   */
  async canRefund(transactionId: string): Promise<boolean> {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { escrow: true }
      });

      if (!transaction || !transaction.escrow) {
        return false;
      }

      const canRefundStatus = [
        EscrowStatus.PENDING,
        EscrowStatus.LOCKED
      ].includes(transaction.escrow.status);

      const refundableTransactionStatus = [
        TransactionStatus.PENDING,
        TransactionStatus.ACCEPTED,
        TransactionStatus.WAITING_PAYMENT,
        TransactionStatus.PAYMENT_CONFIRMED,
        TransactionStatus.DISPUTED
      ].includes(transaction.status);

      return canRefundStatus && refundableTransactionStatus;
    } catch (error) {
      logger.error('Error checking if escrow can be refunded', {
        transactionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
}

// Export singleton instance
export const escrowService = new EscrowService();