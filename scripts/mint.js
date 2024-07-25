const hre = require("hardhat");
const fs = require("fs");
const { encryptDataField } = require("@swisstronik/utils");

const sendShieldedTransaction = async (signer, destination, data, value) => {
  const rpclink = hre.network.config.url;
  const [encryptedData] = await encryptDataField(rpclink, data);
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  const contractAddress = fs.readFileSync("contract.txt", "utf8").trim();
  const [signer] = await hre.ethers.getSigners();
  const contractFactory = await hre.ethers.getContractFactory("Degen");
  const contract = contractFactory.attach(contractAddress);
  const functionName = "safeMint";
  const addressTo = "0x310a0f46124d0bab052835ba28213e70a4c014ae"
  const mintTx = await sendShieldedTransaction(signer, contractAddress, contract.interface.encodeFunctionData(functionName, [addressTo]), 0);
  await mintTx.wait();
  console.log("Transaction Receipt: ", `Minting nft has been success! Transaction hash: https://explorer-evm.testnet.swisstronik.com/tx/${mintTx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});