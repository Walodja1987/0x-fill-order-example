/**
 * Component to set maker token approval
 */

import { ERC20TokenContract, IZeroExContract } from '@0x/contract-wrappers'; // Optional in case you prefer 0x libraries to connect to contracts
import { BigNumber } from '@0x/utils';
import Web3 from 'web3';
import * as ERC20 from './ERC20.json';

const ERC20_ABI = ERC20.abi;
const contractAddresses = require("@0x/contract-addresses");

function ApproveMaker() {
    
    async function approveMaker() {
        
        // Get exchangeProxy contract address from @0x/contract-addresses library
        const CHAIN_ID = 3; // 3: Ropsten; 1: Mainnet
        const addresses = contractAddresses.getContractAddressesForChainOrThrow(CHAIN_ID);
        const exchangeProxyAddress = addresses.exchangeProxy; // 0xdef1c0ded9bec7f1a1670819833240f027b25eff (same for several chains including Mainnet and Ropsten)

        // Create web3 instance using window.ethereum (i.e. MetaMask wallet) as the provider
        let web3 = null;
        web3 = new Web3(window.ethereum);
        
        const makerTokenAddress = "0x32de47Fc9bc48F4c56f9649440532081466036A2";

        // Get connected account
        const accounts = await web3.eth.getAccounts();
        const makerAccount = accounts[0]; 
        console.log("Current account connected: " + makerAccount)

        // Allowance amount. Maximum allowance chosen for illustration purposes only. Not recommended in production environment.
        const maxApproval = new BigNumber(2).pow(256).minus(1);

        // **************** Approve token transfers (method 1 using web3) *************
        // Initialize maker contract
        const makerTokenContract = await new web3.eth.Contract(ERC20_ABI, makerTokenAddress)
        
        // Set allowance for the exchange proxy contract
        await makerTokenContract.methods.approve(exchangeProxyAddress, maxApproval).send({from: makerAccount});
        
        // Check allowance
        const approvedByMaker = await makerTokenContract.methods.allowance(makerAccount, exchangeProxyAddress).call();
        // *************************************************************************************

        // **************** Approve token transfers (method 2 using 0x libraries) *************
        // You have to comment out the approval part above if you want to use this method

        // // Initialize maker contract
        // const makerTokenContract = new ERC20TokenContract(makerTokenAddress, web3.eth.currentProvider);

        // // Set allowance for the exchange proxy contract
        // await makerTokenContract.approve(exchangeProxyAddress, maxApproval).awaitTransactionSuccessAsync({ from: makerAccount }); // Comment out when you are connected to takerAccount

        // // Check allowance
        // const approvedByMaker = await makerTokenContract.allowance(makerAccount, exchangeProxyAddress).callAsync();
        // *************************************************************************************

        // Print allowances
        console.log("Approved by maker: " + await approvedByMaker.toString())

        alert(`Maker allowance for ${makerTokenAddress} successfully set`)

        
    };

    return (
        <div>
            <button onClick={approveMaker}>Approve by Maker</button>
        </div>
    );
}

export default ApproveMaker;