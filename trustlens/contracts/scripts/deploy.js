import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const args = process.argv.slice(2);
  let networkName = "localhost";
  const netIdx = args.indexOf("--network");
  if (netIdx !== -1 && args[netIdx + 1]) {
    networkName = args[netIdx + 1];
  } else if (process.env.NETWORK) {
    networkName = process.env.NETWORK;
  }

  console.log(`\n======================================================`);
  console.log(`TrustLensRegistry Deployment on Network: ${networkName}`);
  console.log(`======================================================`);

  const rpcUrl = networkName === "sepolia"
    ? (process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia.publicnode.com")
    : (process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545");

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  let privateKey = process.env.SEPOLIA_PRIVATE_KEY;
  if (networkName !== "sepolia") {
    // Default Hardhat/Anvil account #0 for local tests
    privateKey = process.env.LOCAL_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  }

  if (!privateKey) {
    throw new Error(
      `Deployment failed: SEPOLIA_PRIVATE_KEY environment variable is required to deploy to ${networkName}.`
    );
  }

  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`Deployer address : ${wallet.address}`);

  const network = await provider.getNetwork();
  console.log(`Chain ID         : ${network.chainId}`);

  const balance = await provider.getBalance(wallet.address);
  console.log(`Deployer balance : ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n && networkName === "sepolia") {
    throw new Error(
      `Insufficient testnet funds: Deployer address ${wallet.address} has 0 Sepolia ETH. Please fund from a Sepolia faucet before deploying.`
    );
  }

  // Load compiled artifact
  const artifactPath = path.resolve(__dirname, "..", "artifacts", "TrustLensRegistry.json");
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Compiled artifact not found at ${artifactPath}. Run 'npm run compile' first.`);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  console.log("\nBroadcasting deployment transaction...");
  const registry = await factory.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  const deploymentTx = registry.deploymentTransaction();
  const txHash = deploymentTx ? deploymentTx.hash : "0x0";

  console.log(`\n✓ TrustLensRegistry Deployed Successfully!`);
  console.log(`  Contract Address : ${contractAddress}`);
  console.log(`  Transaction Hash : ${txHash}`);

  // Register the first demo report as Genesis Web3 Proof
  const GENESIS_REPORT_HASH = "0xc04031a7ae4138079beefb150468f6d2c17059f775561ebc4a8edfc3227dff10";
  console.log(`\nRegistering initial Genesis Report Hash: ${GENESIS_REPORT_HASH}...`);
  const regTx = await registry.registerReport(GENESIS_REPORT_HASH, 1); // 1 = UrlScan
  const regReceipt = await regTx.wait();
  console.log(`  ✓ Genesis Report Tx Hash: ${regTx.hash}`);

  // Read back report
  const stored = await registry.getReport(GENESIS_REPORT_HASH);
  console.log(`  ✓ Verified On-Chain Timestamp: ${new Date(Number(stored[1]) * 1000).toISOString()}`);

  // Update deployments.json
  const deploymentsFile = path.resolve(__dirname, "..", "deployments.json");
  let deployments = {};
  if (fs.existsSync(deploymentsFile)) {
    try {
      deployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf8"));
    } catch {
      deployments = {};
    }
  }

  deployments[networkName] = {
    contractAddress,
    transactionHash: txHash,
    deployer: wallet.address,
    deployedAt: new Date().toISOString(),
    network: networkName,
    chainId: Number(network.chainId),
    sampleReport: {
      hash: GENESIS_REPORT_HASH,
      registrationTxHash: regTx.hash,
      timestamp: Number(stored[1]),
    },
    explorerUrl: networkName === "sepolia"
      ? `https://sepolia.etherscan.io/address/${contractAddress}`
      : `http://localhost:8545/address/${contractAddress}`,
  };

  fs.writeFileSync(deploymentsFile, JSON.stringify(deployments, null, 2), "utf8");
  console.log(`\n✓ Updated ${deploymentsFile}`);

  // Export to frontend
  const frontendAbiDir = path.resolve(__dirname, "..", "..", "frontend", "src", "lib", "web3");
  if (!fs.existsSync(frontendAbiDir)) {
    fs.mkdirSync(frontendAbiDir, { recursive: true });
  }
  fs.writeFileSync(
    path.resolve(frontendAbiDir, "TrustLensRegistry.json"),
    JSON.stringify({ address: contractAddress, abi: artifact.abi }, null, 2),
    "utf8"
  );
  console.log(`✓ Exported ABI & Address to frontend/src/lib/web3/TrustLensRegistry.json`);
}

main().catch((error) => {
  console.error("Deployment failed:", error.message || error);
  process.exit(1);
});
