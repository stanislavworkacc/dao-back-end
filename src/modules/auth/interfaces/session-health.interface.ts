export interface SessionHealthResult {
  success: boolean;
  address?: string;
  chainId?: number;
  expiresAt?: string | null;
}