const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const { abi, evm } = require("./compile");

const provider = new HDWalletProvider(
	"someone task castle early chair fee drum wave attack utility else essay",
	"https://rinkeby.infura.io/v3/fa0749f52012478e82b6970f80e5e8fb"
);

const web3 = new Web3(provider);

(async () => {
	const accounts = await web3.eth.getAccounts();
	console.log("Attempting to deploy from account", accounts[0]);

	const lottery = await new web3.eth.Contract(abi)
		.deploy({ data: evm.bytecode.object })
		.send({ gas: "1000000", from: accounts[0] });

	// Log newly deployed contract address
	console.log("Contract address", inbox.options.address);

	// Strop provider
	provider.engine.stop();
})();
