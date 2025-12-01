const fs = require('fs');
const path = require('path');

/**
 * Helper script to export the contract ABI for front-end use
 * Usage: node scripts/exportABI.js
 */
async function main() {
  const artifactPath = path.join(__dirname, '../artifacts/contracts/DAOVoting.sol/DAOVoting.json');
  
  if (!fs.existsSync(artifactPath)) {
    console.error('Contract artifact not found. Please compile the contract first:');
    console.error('  npx hardhat compile');
    return;
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const abi = artifact.abi;

  // Save ABI to frontend directory
  const frontendABIPath = path.join(__dirname, '../frontend/src/contractABI.json');
  fs.writeFileSync(frontendABIPath, JSON.stringify(abi, null, 2));
  
  console.log('✓ ABI exported to frontend/src/contractABI.json');
  console.log(`  Total functions: ${abi.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

