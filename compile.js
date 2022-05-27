const fs = require("fs");
const path = require("path");
const solc = require("solc");

const url = path.resolve(__dirname, "contracts", "Lottery.sol");
const file = fs.readFileSync(url, "utf8");

const input = {
	language: "Solidity",
	sources: {
		"Lottery.sol": {
			content: file,
		},
	},
	settings: {
		outputSelection: {
			"*": {
				"*": ["*"],
			},
		},
	},
};

module.exports = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
	"Lottery.sol"
].Lottery;
