// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Lottery {
    address public manager;
    address payable[] public players;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        // Check if the right amount of ether is sent
        require(msg.value > .01 ether);

        players.push(payable(msg.sender));
    }

    function random() private view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, block.difficulty, players)
                )
            );
    }

    function pickWinner() public onlyManager {
        uint256 index = random() % players.length;
        players[index].transfer(address(this).balance);
        players = new address payable[](0);
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    // Only the manager can pick a winner
    modifier onlyManager() {
        require(msg.sender == manager);
        _;
    }
}
