const AkropolisCrowdsale = artifacts.require('./AkropolisCrowdsale.sol');
const AkropolisToken = artifacts.require('./AkropolisToken.sol');
function ether (n) {
	return new web3.BigNumber(web3.toWei(n, 'ether'));
}
module.exports = async function(deployer, network, accounts) {
	const startTime = 1518203941; //Custom time, set to UNIX (Epoch) Standard Seconds
	const endTime = startTime + 36200; // 10 days
	let advisorsAddress = '0xefc08b5e6c3ba5ada5b483eb0529f3b2d1b55afc';
	let presaleAddress = '0xdf3c3fdb7bfea5874c856b6c00fe4da0d561e47e';
	let teamAddress = '0x5ad2b7338efad08f9e7260a6ed4b329dd888b4e5';
	let salesConfigAddress = '0x41d7cb4ebcba3318e1bfbdf473bb8e92e24f521b';
	let tokenAddress = '0x370da3b89263ad40809cd639f1387f70b30db117';
	let whitelistAddress = '0x3b28c1dafb30271663906439313f47f60d6e3295';

	let bountyFundAddress = '0x6E5244E929BA540Cd83774B6BFee940A197c2A09';
	let developmentFundAddress = '0x447C00fBE180d99969eaBDc643042B3848c2595C';
	let reserveFundAddress = '0x0d95255b0B044242aD7BD63964DfaB5f5D06a21D';

	const wallet = await accounts[0];

	await deployer.deploy(AkropolisCrowdsale, startTime, endTime, wallet, whitelistAddress, salesConfigAddress);
	let crowdsale = await AkropolisCrowdsale.deployed();
	let token = await AkropolisToken.at(tokenAddress);
	await token.transferOwnership(crowdsale.address);
	await crowdsale.setToken(tokenAddress);
	await crowdsale.setBaseCap(ether(3));
	await crowdsale.setMaxCap(ether(20));
	await crowdsale.setRoundDuration(9050); //Hardcoded to be 2.5 days
	await crowdsale.setBountyFund(bountyFundAddress);
	await crowdsale.setDevelopmentFund(developmentFundAddress);
	await crowdsale.setReserveFund(reserveFundAddress);
	await crowdsale.setAdvisorsAllocations(advisorsAddress);
	await crowdsale.setPresaleAllocations(presaleAddress);
	await crowdsale.setTeamAllocations(teamAddress);

};