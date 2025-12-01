const hre = require("hardhat");

async function main() {
  console.log("Deploying DAOVoting contract...");

  // Get the contract factory
  const DAOVoting = await hre.ethers.getContractFactory("DAOVoting");

  // Deploy the contract
  const daoVoting = await DAOVoting.deploy();

  // Wait for deployment
  await daoVoting.waitForDeployment();

  const contractAddress = await daoVoting.getAddress();
  console.log("DAOVoting deployed to:", contractAddress);

  // Wait for a few block confirmations before verifying
  console.log("Waiting for block confirmations...");
  await daoVoting.deploymentTransaction().wait(5);

  // Verify contract on Etherscan (if API key is set)
  if (hre.network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Transaction Hash:", daoVoting.deploymentTransaction().hash);
  console.log("\nView on Sepolia Blockscanner:");
  console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("\nSave this information for your project submission!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

