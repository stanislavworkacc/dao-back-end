import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import DAO_ABI from '../../abis/DAOContract.json';
import { ethers, Network } from 'ethers';
import { Interval } from '@nestjs/schedule';
import { StorageService } from './storage.service';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger: Logger = new Logger(BlockchainService.name);
  private readonly provider: ethers.JsonRpcProvider;
  private readonly wallet: ethers.Wallet;
  private readonly daoContract: ethers.Contract;
  private readonly startBlock = Number(process.env.START_BLOCK ?? 0);
  private readonly batchSize: number = Number(process.env.BATCH_SIZE ?? 5000);

  constructor(
    private readonly _storageService: StorageService,
  ) {
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


      await this.loadHistoricalEvents();
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

  async startEventPooling() {
    const currentBlock = await this.provider.getBlockNumber();
    const fromBlock = this._storageService.lastBlockProcessed + 1;

    if (fromBlock > currentBlock) {
      return;
    }
    this.logger.log(`Polling events from ${fromBlock} to ${currentBlock}`);

    const [proposalCreatedEvents, votedEvents, proposalExecutedEvents] =
      await Promise.all([
        this.daoContract.queryFilter(
          'ProposalCreated',
          fromBlock,
          currentBlock,
        ),
        this.daoContract.queryFilter('Voted', fromBlock, currentBlock),
        this.daoContract.queryFilter(
          'ProposalExecuted',
          fromBlock,
          currentBlock,
        ),
      ]);

    if (proposalCreatedEvents.length > 0) {
      this.logger.log(
        `Found ${proposalCreatedEvents.length} ProposalCreated events`,
      );
      this.handleProposalCreated(proposalCreatedEvents);
    }

    if (votedEvents.length > 0) {
      this.logger.log(`Found ${votedEvents.length} Voted events`);
      this.handleVoteEvents(votedEvents);
    }

    if (proposalExecutedEvents.length > 0) {
      this.logger.log(
        `Found ${proposalExecutedEvents.length} ProposalExecuted events`,
      );
      this.handleProposalExecuted(proposalExecutedEvents);
    }


    this._storageService.lastBlockProcessed = currentBlock;
  }


  @Interval(5000)
  async pollEvents() {
    try {
      await this.startEventPooling();
    } catch (error) {
      this.logger.error('Error while polling events', error);
    }
  }

  private handleProposalCreated(events: any) {
    for (const event of events) {
      try {
        const [id, description, creator] = event.args;
        const idStr = id.toString();

        this.logger.log('\nProposalCreated event detected');
        this.logger.log(`Proposal ID: ${idStr}`);
        this.logger.log(`Creator: ${creator}`);
        this.logger.log(`Description: ${description}`);
        this.logger.log(`Block Number: ${event.blockNumber}`);
        this.logger.log(`Timestamp: ${(event).timestamp}`);
        this.logger.log(`Transaction Hash: ${event.transactionHash}`);

        const proposal = {
          id: idStr,
          creator,
          description,
          startBlock: event.blockNumber,
          createdAt: new Date(),
          endBlock: null,
          executedAt: null,
          executed: false,
          voteCountFor: '0',
          voteCountAgainst: '0',
          transactionHash: event.transactionHash,
          votes: [] as any[],
        };

        this._storageService.proposals.set(idStr, proposal);
      } catch (error) {
        this.logger.error('Error while handling ProposalCreated event', error);
      }
    }
  }

  private handleVoteEvents(events) {
    for (const event of events) {
      try {
        const [id, voter, support, amount] = event.args;

        const idStr = id.toString();
        const amountBig = BigInt(amount.toString());

        this.logger.log('\nVoted event detected');
        this.logger.log(`Proposal ID: ${idStr}`);
        this.logger.log(`Voter: ${voter}`);
        this.logger.log(`Support: ${support}`);
        this.logger.log(`Amount: ${amount.toString()}`);
        this.logger.log(`Block Number: ${event.blockNumber}`);
        this.logger.log(`Transaction Hash: ${event.transactionHash}`);

        const vote = {
          voter,
          support,
          amount: amount.toString(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          timestamp: new Date().toISOString(),
        };

        const proposal = this._storageService.proposals.get(idStr);

        if (!proposal) {
          this.logger.error(`Proposal ${idStr} not found`);
          continue;
        }

        proposal.votes.push(vote);
        proposal.voteCountFor = support ? String(BigInt(proposal.voteCountFor ?? '0') + amountBig) : proposal.voteCountFor;
        proposal.voteCountAgainst = support ? proposal.voteCountAgainst : String(BigInt(proposal.voteCountAgainst ?? '0') + amountBig);
        this._storageService.proposals.set(idStr, proposal);
      } catch (e: any) {
        this.logger.error('Error handling Voted event:', e?.message ?? e);
      }
    }
  }

  private handleProposalExecuted(events) {
    for (const event of events) {
      try {
        const [id] = event.args;

        const idStr = id.toString();

        this.logger.log('\nProposalExecuted event detected');
        this.logger.log(`Proposal ID: ${idStr}`);
        this.logger.log(`Block Number: ${event.blockNumber}`);
        this.logger.log(`Transaction Hash: ${event.transactionHash}`);

        const proposal = this._storageService.proposals.get(idStr);

        if (!proposal) {
          this.logger.error(`Proposal ${idStr} not found`);
          continue;
        }

        proposal.executed = true;
        proposal.executedAt = new Date().toISOString();
        this._storageService.totalExecutedProposals++;


        this._storageService.proposals.set(idStr, proposal);
      } catch (e: any) {
        this.logger.error(
          'Error handling ProposalExecuted event:',
          e?.message ?? e,
        );
      }
    }
  }

  public async loadHistoricalEvents(): Promise<void> {
    try {
      this.logger.log('Loading historical events...');

      const currentBlock: number = await this.provider.getBlockNumber();
      const fromBlock: number = this.startBlock;
      const toBlock: number = currentBlock;

      const blocksToScan: number = toBlock - fromBlock + 1;
      const batches: number = Math.ceil(blocksToScan / this.batchSize);

      const allProposalCreatedEvents: any = [];
      const allVotedEvents: any = [];
      const allProposalExecutedEvents: any = [];

      for (let i = 0; i < batches; i++) {
        const batchFrom: number = fromBlock + i * this.batchSize;
        const batchTo: number = Math.min(
          batchFrom + this.batchSize - 1,
          toBlock,
        );

        const [proposalCreatedEvents, votedEvents, proposalExecutedEvents] =
          await Promise.all([
            this.daoContract.queryFilter('ProposalCreated', batchFrom, batchTo),
            this.daoContract.queryFilter('Voted', batchFrom, batchTo),
            this.daoContract.queryFilter(
              'ProposalExecuted',
              batchFrom,
              batchTo,
            ),
          ]);

        allProposalCreatedEvents.push(...proposalCreatedEvents);
        allVotedEvents.push(...votedEvents);
        allProposalExecutedEvents.push(...proposalExecutedEvents);
      }

      if (allProposalCreatedEvents.length > 0) {
        await this.handleProposalCreated(allProposalCreatedEvents);
      }

      if (allVotedEvents.length > 0) {
        await this.handleVoteEvents(allVotedEvents);
      }

      if (allProposalExecutedEvents.length > 0) {
        await this.handleProposalExecuted(allProposalExecutedEvents);
      }

      this._storageService.lastBlockProcessed = toBlock;
      this.logger.log(
        `Historical events loaded successfully. Last block processed: ${toBlock}`,
      );
    } catch (e: any) {
      this.logger.error('Error loading historical events:', e?.message ?? e,
      );
    }
  }
}
