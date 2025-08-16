import prisma from '../utils/database';
import { 
  generateHDWallet, 
  generateSimpleWallet, 
  encrypt, 
  decrypt, 
  isValidBitcoinAddress,
  createTransaction,
  btcToSatoshis,
  satoshisToBtc,
  generateQRCode 
} from '../utils/bitcoin';
import logger from '../utils/logger';
import { TransactionType, TransactionStatus } from '../types';

export interface WalletBalance {
  balanceBtc: number;
  balanceUsd: number;
  address: string;
}

export interface SendTransactionResult {
  txId: string;
  fee: number;
  transaction: any;
}

class WalletService {
  // Create HD wallet for user
  async createUserWallet(userId: string) {
    try {
      const walletData = generateHDWallet();
      
      const wallet = await prisma.wallet.create({
        data: {
          userId,
          address: walletData.address,
          privateKeyEncrypted: encrypt(walletData.privateKey),
          publicKey: walletData.publicKey,
          mnemonic: walletData.mnemonic ? encrypt(walletData.mnemonic) : null,
          balanceBtc: 0,
          balanceUsd: 0,
        },
      });

      logger.info('Created wallet for user:', { userId, address: wallet.address });
      return wallet;
    } catch (error) {
      logger.error('Error creating wallet:', error);
      throw error;
    }
  }

  // Create simple wallet for guest
  async createGuestWallet(email: string) {
    try {
      const walletData = generateSimpleWallet();
      
      return {
        address: walletData.address,
        privateKeyEncrypted: encrypt(walletData.privateKey),
        publicKey: walletData.publicKey,
      };
    } catch (error) {
      logger.error('Error creating guest wallet:', error);
      throw error;
    }
  }

  // Get wallet balance
  async getWalletBalance(userId: string): Promise<WalletBalance> {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      return {
        balanceBtc: Number(wallet.balanceBtc),
        balanceUsd: Number(wallet.balanceUsd),
        address: wallet.address,
      };
    } catch (error) {
      logger.error('Error getting wallet balance:', error);
      throw error;
    }
  }

  // Update wallet balance
  async updateWalletBalance(
    userId: string, 
    balanceBtc: number, 
    balanceUsd: number
  ) {
    try {
      const wallet = await prisma.wallet.update({
        where: { userId },
        data: {
          balanceBtc,
          balanceUsd,
        },
      });

      logger.info('Updated wallet balance:', { 
        userId, 
        balanceBtc, 
        balanceUsd 
      });

      return wallet;
    } catch (error) {
      logger.error('Error updating wallet balance:', error);
      throw error;
    }
  }

  // Send Bitcoin transaction
  async sendBitcoin(
    userId: string,
    toAddress: string,
    amountBtc: number,
    description?: string
  ): Promise<SendTransactionResult> {
    try {
      // Validate recipient address
      if (!isValidBitcoinAddress(toAddress)) {
        throw new Error('Invalid recipient address');
      }

      // Get user wallet
      const wallet = await prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const currentBalance = Number(wallet.balanceBtc);
      if (currentBalance < amountBtc) {
        throw new Error('Insufficient balance');
      }

      // In a real implementation, you would:
      // 1. Fetch UTXOs from blockchain
      // 2. Create and sign transaction
      // 3. Broadcast to network
      // 4. Monitor for confirmations
      
      // For this demo, we'll simulate the transaction
      const simulatedTxId = this.generateTxId();
      const simulatedFee = 0.0001; // 0.0001 BTC fee

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type: TransactionType.SEND,
          amountBtc: amountBtc,
          amountUsd: 0, // Will be calculated based on current price
          fee: simulatedFee,
          status: TransactionStatus.PENDING,
          txHash: simulatedTxId,
          fromAddress: wallet.address,
          toAddress,
          description,
        },
      });

      // Update wallet balance
      const newBalance = currentBalance - amountBtc - simulatedFee;
      await this.updateWalletBalance(userId, newBalance, 0);

      logger.info('Bitcoin sent:', {
        userId,
        toAddress,
        amountBtc,
        txId: simulatedTxId,
      });

      return {
        txId: simulatedTxId,
        fee: simulatedFee,
        transaction,
      };
    } catch (error) {
      logger.error('Error sending Bitcoin:', error);
      throw error;
    }
  }

  // Generate receive address QR code
  async generateReceiveQR(userId: string): Promise<string> {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const qrCodeDataUrl = await generateQRCode(wallet.address);
      return qrCodeDataUrl;
    } catch (error) {
      logger.error('Error generating receive QR:', error);
      throw error;
    }
  }

  // Process incoming transaction (would be called by blockchain monitoring)
  async processIncomingTransaction(
    address: string,
    amountBtc: number,
    txHash: string,
    confirmations: number = 0
  ) {
    try {
      // Find wallet by address
      const wallet = await prisma.wallet.findUnique({
        where: { address },
        include: { user: true },
      });

      if (!wallet) {
        logger.warn('Received transaction for unknown address:', { address, txHash });
        return;
      }

      // Check if transaction already exists
      const existingTx = await prisma.transaction.findFirst({
        where: { txHash },
      });

      if (existingTx) {
        // Update confirmations
        await prisma.transaction.update({
          where: { id: existingTx.id },
          data: { confirmations },
        });
        return;
      }

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId: wallet.userId,
          type: TransactionType.RECEIVE,
          amountBtc,
          amountUsd: 0, // Will be calculated
          fee: 0,
          status: confirmations >= 1 ? TransactionStatus.CONFIRMED : TransactionStatus.PENDING,
          txHash,
          toAddress: address,
          confirmations,
        },
      });

      // Update wallet balance if confirmed
      if (confirmations >= 1) {
        const currentBalance = Number(wallet.balanceBtc);
        const newBalance = currentBalance + amountBtc;
        await this.updateWalletBalance(wallet.userId, newBalance, 0);
      }

      logger.info('Processed incoming transaction:', {
        userId: wallet.userId,
        address,
        amountBtc,
        txHash,
        confirmations,
      });

      return transaction;
    } catch (error) {
      logger.error('Error processing incoming transaction:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
    type?: TransactionType
  ) {
    try {
      const skip = (page - 1) * limit;
      
      const where: any = { userId };
      if (type) {
        where.type = type;
      }

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.transaction.count({ where }),
      ]);

      return {
        transactions: transactions.map(tx => ({
          ...tx,
          amountBtc: Number(tx.amountBtc),
          amountUsd: Number(tx.amountUsd),
          fee: Number(tx.fee),
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error getting transaction history:', error);
      throw error;
    }
  }

  // Helper method to generate simulated transaction ID
  private generateTxId(): string {
    return Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  // Validate wallet exists and belongs to user
  async validateUserWallet(userId: string): Promise<boolean> {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { userId },
      });
      return !!wallet;
    } catch (error) {
      logger.error('Error validating wallet:', error);
      return false;
    }
  }

  // Get wallet by address (for processing incoming transactions)
  async getWalletByAddress(address: string) {
    try {
      return await prisma.wallet.findUnique({
        where: { address },
        include: { user: true },
      });
    } catch (error) {
      logger.error('Error getting wallet by address:', error);
      throw error;
    }
  }
}

export const walletService = new WalletService();
export default walletService;