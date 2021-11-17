/**
 * Component to set taker token approval
 */

import { ERC20TokenContract, IZeroExContract } from '@0x/contract-wrappers'; // Optional in case you prefer 0x libraries to connect to contracts 
import { BigNumber } from '@0x/utils';
import Web3 from 'web3';
import * as ERC20 from './ERC20.json';

const ERC20_ABI = ERC20.abi;
const contractAddresses = require("@0x/contract-addresses");

function ApproveTaker() {
    
    async function approveTaker() {
        
        // Get exchangeProxy contract address from @0x/contract-addresses library
        const CHAIN_ID = 137; // 3: Ropsten; 1: Mainnet; 137: Polygon
        const addresses = contractAddresses.getContractAddressesForChainOrThrow(CHAIN_ID);
        const exchangeProxyAddress = addresses.exchangeProxy; // 0xdef1c0ded9bec7f1a1670819833240f027b25eff (same for several chains including Mainnet and Ropsten)

        // Create web3 instance using window.ethereum (i.e. MetaMask wallet) as the provider
        let web3 = null;
        web3 = new Web3(window.ethereum);
        
        const takerTokenAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // Polygon USDC: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; Ropsten DAI: 0xad6d458402f60fd3bd25163575031acdce07538d

        // Get connected account
        const accounts = await web3.eth.getAccounts();
        const takerAccount = accounts[0]; 
        console.log("Current account connected: " + takerAccount)

        // Allowance amount. Maximum allowance chosen for illustration purposes only. Not recommended in production environment.
        const maxApproval = new BigNumber(2).pow(256).minus(1);

        // **************** Approve token transfers (method 1 using web3) *************
        // Initialize taker contract
        const takerTokenContract = await new web3.eth.Contract(ERC20_ABI, takerTokenAddress)
        
        // Set allowance for the exchange proxy contract
        await takerTokenContract.methods.approve(exchangeProxyAddress, maxApproval).send({from: takerAccount});
        
        // Check allowance
        const approvedByTaker = await takerTokenContract.methods.allowance(takerAccount, exchangeProxyAddress).call();
        // *************************************************************************************

        // **************** Approve token transfers (method 2 using 0x libraries) *************
        // You have to comment out the approval part above if you want to use this method

        // // Initialize taker contract
        // const takerTokenContract = new ERC20TokenContract(takerTokenAddress, web3.eth.currentProvider);

        // // Set allowance for the exchange proxy contract
        // await takerTokenContract.approve(exchangeProxyAddress, maxApproval).awaitTransactionSuccessAsync({ from: takerAccount }); // Comment out when you are connected to takerAccount

        // // Check allowance
        // const approvedByTaker = await takerTokenContract.allowance(takerAccount, exchangeProxyAddress).callAsync();
        // *************************************************************************************

        // Print allowances
        console.log("Approved by taker: " + await approvedByTaker.toString())

        alert(`Taker allowance for ${takerTokenAddress} successfully set`)

        
    };

    return (
        <div>
            <button onClick={approveTaker}>Approve by Taker</button>
        </div>
    );
}

export default ApproveTaker;