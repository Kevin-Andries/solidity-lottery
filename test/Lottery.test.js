const assert = require("assert");
const ganache = require("ganache");
const Web3 = require("web3");
const { abi, evm } = require("../compile");

const web3 = new Web3(ganache.provider());

let accounts;
let lottery;

beforeEach(async () => {
	// Get a list of all accounts
	accounts = await web3.eth.getAccounts();

	// Use one of those account to deploy the contract
	lottery = await new web3.eth.Contract(abi)
		.deploy({
			data: evm.bytecode.object,
		})
		.send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery Contract", () => {
	it("deploys a contract", () => {
		assert.ok(lottery.options.address);
	});

	it("adds one player", async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei("0.02", "ether"),
		});

		const players = await lottery.methods.getPlayers().call({
			from: accounts[0],
		});

		assert.equal(accounts[0], players[0]);
		assert.equal(1, players.length);
	});

	it("adds multiple player", async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei("0.02", "ether"),
		});
		await lottery.methods.enter().send({
			from: accounts[1],
			value: web3.utils.toWei("0.02", "ether"),
		});
		await lottery.methods.enter().send({
			from: accounts[2],
			value: web3.utils.toWei("0.02", "ether"),
		});

		const players = await lottery.methods.getPlayers().call({
			from: accounts[0],
		});

		assert.equal(accounts[0], players[0]);
		assert.equal(accounts[1], players[1]);
		assert.equal(accounts[2], players[2]);
		assert.equal(3, players.length);
	});

	it("requires a minimum amount of ether to enter the lottery", async () => {
		try {
			await lottery.methods.enter().send({
				from: accounts[0],
				value: 0,
			});
			// test fails if the line above does not throw an error
			assert(false);
		} catch (err) {
			assert(err);
		}
	});

	it("makes sure that only the manager can pick a winner", async () => {
		try {
			await lottery.methods.pickWinner().send({
				from: accounts[1],
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	});

	it("sends money to the winner and resets the contract", async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei("2", "ether"),
		});

		const initialBalance = await web3.eth.getBalance(accounts[0]);

		await lottery.methods.pickWinner().send({ from: accounts[0] });

		const finalBalance = await web3.eth.getBalance(accounts[0]);

		const difference = finalBalance - initialBalance;
		// We use 1.99 because of gas spent
		assert(difference > web3.utils.toWei("1.99", "ether"));

		// Makes sure that players array is empty
		const players = await lottery.methods.getPlayers().call();
		assert.equal(0, players.length);

		// Makes sure that the contract balance has been reset
		const contractBalance = await web3.eth.getBalance(
			lottery.options.address
		);
		assert.equal(0, contractBalance);
	});
});
