import { IsEthereumAddress } from 'class-validator';

export class GetNonceDto {
  @IsEthereumAddress()
  address!: string;
}