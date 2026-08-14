const apiUrl = process.env.NEXT_PUBLIC_API_URL
  ?? (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4000')

interface HoldingDto {
  amount: number
  updatedAt: string | null
}

export interface HoldingsResponse {
  unit: 'grams'
  holdings: {
    gold: HoldingDto
    silver: HoldingDto
    platinum: HoldingDto
  }
}

export async function getHoldings(token: string): Promise<HoldingsResponse> {
  const response = await fetch(`${apiUrl}/api/holdings`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await response.json() as {
    success: boolean
    message?: string
    data?: HoldingsResponse
  }

  if (!response.ok || !body.data) {
    throw new Error(body.message || 'Unable to load holdings')
  }

  return body.data
}
