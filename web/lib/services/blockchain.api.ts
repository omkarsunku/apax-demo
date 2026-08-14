const apiUrl = process.env.NEXT_PUBLIC_API_URL
  ?? (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4000')

export interface BlockchainStatus {
  connected: true
  chainId: string
  blockNumber: number
  contractAddress: string
  name: string
  symbol: string
  totalSupply: string
}

export async function getBlockchainStatus(): Promise<BlockchainStatus> {
  const response = await fetch(`${apiUrl}/api/blockchain/status`)
  const body = await response.json() as { data?: BlockchainStatus; message?: string }
  if (!response.ok || !body.data) throw new Error(body.message || 'Blockchain unavailable')
  return body.data
}
