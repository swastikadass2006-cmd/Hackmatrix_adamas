#!/usr/bin/env bash
set -e

# ==============================================================================
# TrustLens Smart Contract Sepolia Deployment Script
# ==============================================================================

if [ -z "$SEPOLIA_PRIVATE_KEY" ]; then
  echo "Error: SEPOLIA_PRIVATE_KEY is not set."
  echo "Usage:"
  echo "  export SEPOLIA_RPC_URL=\"https://ethereum-sepolia.publicnode.com\""
  echo "  export SEPOLIA_PRIVATE_KEY=\"<YOUR_TESTNET_PRIVATE_KEY>\""
  echo "  ./scripts/deploy_sepolia.sh"
  exit 1
fi

cd "$(dirname "$0")/.."

echo "Compiling Solidity contracts..."
node scripts/compile.js

echo "Deploying TrustLensRegistry to Ethereum Sepolia Testnet..."
node scripts/deploy.js --network sepolia
