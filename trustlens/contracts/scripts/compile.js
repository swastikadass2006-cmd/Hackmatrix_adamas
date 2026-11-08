const fs = require('fs');
const path = require('path');
const solc = require('solc');

function compile() {
  const contractPath = path.resolve(__dirname, '..', 'TrustLensRegistry.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'TrustLensRegistry.sol': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode'],
        },
      },
    },
  };

  console.log('Compiling TrustLensRegistry.sol with solc 0.8.20...');
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    let hasError = false;
    for (const err of output.errors) {
      if (err.severity === 'error') {
        console.error(err.formattedMessage);
        hasError = true;
      } else {
        console.warn(err.formattedMessage);
      }
    }
    if (hasError) {
      throw new Error('Solidity compilation failed.');
    }
  }

  const contract = output.contracts['TrustLensRegistry.sol']['TrustLensRegistry'];
  const artifact = {
    contractName: 'TrustLensRegistry',
    abi: contract.abi,
    bytecode: '0x' + contract.evm.bytecode.object,
    deployedBytecode: '0x' + contract.evm.deployedBytecode.object,
    compilerVersion: solc.version(),
    updatedAt: new Date().toISOString(),
  };

  const artifactsDir = path.resolve(__dirname, '..', 'artifacts');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const outPath = path.resolve(artifactsDir, 'TrustLensRegistry.json');
  fs.writeFileSync(outPath, JSON.stringify(artifact, null, 2), 'utf8');
  console.log(`Compilation successful! Artifact saved to: ${outPath}`);
  return artifact;
}

if (require.main === module) {
  compile();
}

module.exports = { compile };
