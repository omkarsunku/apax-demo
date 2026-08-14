import { ethers } from "ethers";

const tokenAbi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
] as const;

export async function getBlockchainStatus() {
  const rpcUrl = process.env.RPC_URL;
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!rpcUrl || !contractAddress) {
    throw new Error("RPC_URL and CONTRACT_ADDRESS must be configured");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const code = await provider.getCode(contractAddress);
  if (code === "0x") {
    throw new Error(`No APAX contract deployed at ${contractAddress}`);
  }

  const contract = new ethers.Contract(contractAddress, tokenAbi, provider);
  const [network, blockNumber, name, symbol, totalSupply] = await Promise.all([
    provider.getNetwork(),
    provider.getBlockNumber(),
    contract.name() as Promise<string>,
    contract.symbol() as Promise<string>,
    contract.totalSupply() as Promise<bigint>,
  ]);

  return {
    connected: true,
    chainId: network.chainId.toString(),
    blockNumber,
    contractAddress,
    name,
    symbol,
    totalSupply: ethers.formatUnits(totalSupply, 18),
  };
}
