import * as bitcoin from 'bitcoinjs-lib';
import * as crypto from 'crypto';
import * as bip39 from 'bip39';
import * as bip32 from 'bip32';
import QRCode from 'qrcode';
import logger from './logger';

const NETWORK = process.env.BITCOIN_NETWORK === 'mainnet' 
  ? bitcoin.networks.bitcoin 
  : bitcoin.networks.testnet;

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be exactly 32 characters long');
}

// Encryption utilities
export const encrypt = (text: string): string => {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

export const decrypt = (encryptedText: string): string => {
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// HD Wallet creation
export const generateHDWallet = () => {
  try {
    // Generate mnemonic
    const mnemonic = bip39.generateMnemonic();
    
    // Create seed from mnemonic
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    
    // Create root key
    const root = bip32.fromSeed(seed, NETWORK);
    
    // Derive first account (m/84'/0'/0'/0/0 for native segwit)
    const path = NETWORK === bitcoin.networks.bitcoin 
      ? "m/84'/0'/0'/0/0"  // mainnet
      : "m/84'/1'/0'/0/0";  // testnet
      
    const child = root.derivePath(path);
    
    if (!child.privateKey) {
      throw new Error('Failed to generate private key');
    }
    
    // Generate address
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: NETWORK,
    });
    
    if (!address) {
      throw new Error('Failed to generate address');
    }
    
    return {
      mnemonic,
      privateKey: child.privateKey.toString('hex'),
      publicKey: child.publicKey.toString('hex'),
      address,
    };
  } catch (error) {
    logger.error('Error generating HD wallet:', error);
    throw error;
  }
};

// Simple wallet creation (for guest accounts)
export const generateSimpleWallet = () => {
  try {
    const keyPair = bitcoin.ECPair.makeRandom({ network: NETWORK });
    
    if (!keyPair.privateKey) {
      throw new Error('Failed to generate private key');
    }
    
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: NETWORK,
    });
    
    if (!address) {
      throw new Error('Failed to generate address');
    }
    
    return {
      privateKey: keyPair.privateKey.toString('hex'),
      publicKey: keyPair.publicKey.toString('hex'),
      address,
    };
  } catch (error) {
    logger.error('Error generating simple wallet:', error);
    throw error;
  }
};

// Address validation
export const isValidBitcoinAddress = (address: string): boolean => {
  try {
    bitcoin.address.toOutputScript(address, NETWORK);
    return true;
  } catch {
    return false;
  }
};

// QR Code generation
export const generateQRCode = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text);
  } catch (error) {
    logger.error('Error generating QR code:', error);
    throw error;
  }
};

// Create transaction
export const createTransaction = (
  fromPrivateKey: string,
  toAddress: string,
  amountSatoshis: number,
  utxos: any[],
  feeRate: number = 10 // sats per byte
) => {
  try {
    const keyPair = bitcoin.ECPair.fromPrivateKey(
      Buffer.from(fromPrivateKey, 'hex'),
      { network: NETWORK }
    );
    
    const psbt = new bitcoin.Psbt({ network: NETWORK });
    
    let inputAmount = 0;
    
    // Add inputs
    for (const utxo of utxos) {
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: Buffer.from(utxo.scriptPubKey, 'hex'),
          value: utxo.value,
        },
      });
      inputAmount += utxo.value;
    }
    
    // Calculate fee (estimate)
    const estimatedSize = 110 * utxos.length + 34 * 2 + 10;
    const fee = estimatedSize * feeRate;
    
    // Add output for recipient
    psbt.addOutput({
      address: toAddress,
      value: amountSatoshis,
    });
    
    // Add change output if needed
    const change = inputAmount - amountSatoshis - fee;
    if (change > 0) {
      const { address: changeAddress } = bitcoin.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: NETWORK,
      });
      
      if (changeAddress) {
        psbt.addOutput({
          address: changeAddress,
          value: change,
        });
      }
    }
    
    // Sign inputs
    for (let i = 0; i < utxos.length; i++) {
      psbt.signInput(i, keyPair);
    }
    
    // Finalize and extract
    psbt.finalizeAllInputs();
    const tx = psbt.extractTransaction();
    
    return {
      txHex: tx.toHex(),
      txId: tx.getId(),
      fee,
    };
  } catch (error) {
    logger.error('Error creating transaction:', error);
    throw error;
  }
};

// Convert BTC to satoshis
export const btcToSatoshis = (btc: number): number => {
  return Math.round(btc * 100000000);
};

// Convert satoshis to BTC
export const satoshisToBtc = (satoshis: number): number => {
  return satoshis / 100000000;
};

export { NETWORK };