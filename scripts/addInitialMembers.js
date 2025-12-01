const hre = require("hardhat");

/**
 * Helper script to add initial members to the DAO after deployment
 * Usage: npx hardhat run scripts/addInitialMembers.js --network sepolia
 */
async function main() {
  // Replace with your deployed contract address
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "YOUR_CONTRACT_ADDRESS_HERE";
  
  // Replace with member addresses you want to add
  const MEMBER_ADDRESSES = [
    // Add member addresses here, e.g.:
    // "0x1234567890123456789012345678901234567890",
    // "0x0987654321098765432109876543210987654321",
  ];

  if (MEMBER_ADDRESSES.length === 0) {
    console.log("Please add member addresses to the MEMBER_ADDRESSES array in this script.");
    return;
  }

  console.log("Connecting to DAOVoting contract at:", CONTRACT_ADDRESS);

  const DAOVoting = await hre.ethers.getContractFactory("DAOVoting");
  const daoVoting = DAOVoting.attach(CONTRACT_ADDRESS);

  console.log("Adding members...");
  for (let i = 0; i < MEMBER_ADDRESSES.length; i++) {
    try {
      const tx = await daoVoting.addMember(MEMBER_ADDRESSES[i]);
      await tx.wait();
      console.log(`✓ Added member ${i + 1}: ${MEMBER_ADDRESSES[i]}`);
    } catch (error) {
      console.error(`✗ Failed to add member ${MEMBER_ADDRESSES[i]}:`, error.message);
    }
  }

  console.log("\nDone! Members added successfully.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

