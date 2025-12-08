import { IsString } from 'class-validator';

export class VerifySiweDto {
  @IsString()
  message!: string;

  @IsString()
  signature!: string;
}