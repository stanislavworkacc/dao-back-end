import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import DAO_ABI from '../../abis/DAOContract.json';
import { ethers, Network } from 'ethers';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger: Logger = new Logger(BlockchainService.name);
  private readonly provider: ethers.JsonRpcProvider;
  private readonly wallet: ethers.Wallet;
  private readonly daoContract: ethers.Contract;

  constructor() {
    const rpcUrl: string = process.env.RPC_URL!;
    const daoAddress: string = process.env.DAO_ADDRESS!;
    const privateKey: string = process.env.PRIVATE_KEY!;

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    this.daoContract = new ethers.Contract(daoAddress, DAO_ABI, this.wallet);
  }

  async onModuleInit() {
    try {
      this.logger.log('Starting Web3 DAO Event Indexer & API Service...');

      const network: Network = await this.provider.getNetwork();
      this.logger.log(
        `Current network: ${network.name} (chainId: ${network.chainId})`,
      );

      const blockNumber = await this.provider.getBlockNumber();
      this.logger.log(`Current block number: ${blockNumber}`);
    } catch (e) {
      this.logger.error('Failed to initialize blockchain provider', e as Error);
    }
  }

  getDaoContract() {
    return this.daoContract;
  }

  getProvider() {
    return this.provider;
  }

  getWallet() {
    return this.wallet;
  }
}
