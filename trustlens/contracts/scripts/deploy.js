import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import hre from "hardhat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { ethers, network } = hre;

async function main() {
  console.log(`\n======================================================`);
  console.log(`TrustLensRegistry Deployment on Network: ${network.name}`);
  console.log(`======================================================`);

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} ETH`);

  const TrustLensRegistry = await ethers.getContractFactory("TrustLensRegistry");
  console.log("Deploying TrustLensRegistry contract...");
  const registry = await TrustLensRegistry.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  const deploymentTx = registry.deploymentTransaction();
  const txHash = deploymentTx ? deploymentTx.hash : "0x0";

  console.log(`\n TrustLensRegistry Deployed Successfully!`);
  console.log(`  Contract Address : ${contractAddress}`);
  console.log(`  Transaction Hash : ${txHash}`);
  console.log(`  Network Chain ID : ${(await ethers.provider.getNetwork()).chainId}`);

  // Register the first demo report as Genesis Web3 Proof
  const GENESIS_REPORT_HASH = "0xc04031a7ae4138079beefb150468f6d2c17059f775561ebc4a8edfc3227dff10";
  console.log(`\nRegistering initial Genesis Report Hash: ${GENESIS_REPORT_HASH}...`);
  const regTx = await registry.registerReport(GENESIS_REPORT_HASH, 1); // 1 = UrlScan
  const regReceipt = await regTx.wait();
  console.log(`  Genesis Report Tx Hash: ${regTx.hash}`);

  // Read back report
  const stored = await registry.getReport(GENESIS_REPORT_HASH);
  console.log(`  Verified On-Chain Timestamp: ${new Date(Number(stored.timestamp) * 1000).toISOString()}`);

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

  deployments[network.name] = {
    contractAddress,
    transactionHash: txHash,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    sampleReport: {
      hash: GENESIS_REPORT_HASH,
      registrationTxHash: regTx.hash,
      timestamp: Number(stored.timestamp),
    },
    explorerUrl: network.name === "sepolia" 
      ? `https://sepolia.etherscan.io/address/${contractAddress}` 
      : `http://localhost:8545/address/${contractAddress}`,
  };

  fs.writeFileSync(deploymentsFile, JSON.stringify(deployments, null, 2), "utf8");
  console.log(`\nUpdated ${deploymentsFile}`);

  // Copy ABI to frontend
  const artifactPath = path.resolve(__dirname, "..", "artifacts", "TrustLensRegistry.sol", "TrustLensRegistry.json");
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const frontendAbiDir = path.resolve(__dirname, "..", "..", "frontend", "src", "lib", "web3");
    if (!fs.existsSync(frontendAbiDir)) {
      fs.mkdirSync(frontendAbiDir, { recursive: true });
    }
    fs.writeFileSync(
      path.resolve(frontendAbiDir, "TrustLensRegistry.json"),
      JSON.stringify({ address: contractAddress, abi: artifact.abi }, null, 2),
      "utf8"
    );
    console.log(`Exported ABI & Address to frontend/src/lib/web3/TrustLensRegistry.json`);
  }
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});
