var SocialNetwork  = artifacts.require("./SocialNetwork.sol");

// Tells truffle to deploy Social Network smart contract
module.exports = function(deployer) {
  deployer.deploy(SocialNetwork);
};
