const hre = require("hardhat");

async function main() {
  await hre.network.provider.send("hardhat_reset")
  console.log("Hardhat network reset complete");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });