/**
 * Illustration how to fill an order from https://ropsten.api.0x.org/swap/v1/quote
 * Note: If transaction fails due to insufficient gas, just increase the gas limit by a factor of 10 or more
 */

import { ERC20TokenContract, IZeroExContract } from '@0x/contract-wrappers'; // Optional in case you prefer 0x libraries to connect to contracts
import { BigNumber, providerUtils } from '@0x/utils';
import * as qs from 'qs';
import Web3 from 'web3';
import * as data from './ERC20.json';

const ERC20_ABI = data.abi;
const utils = require("@0x/protocol-utils");
const contractAddresses = require("@0x/contract-addresses");

function FillQuote() {
    

    async function fillQuote() {
        
        // Get exchangeProxy contract address on Ropsten
        const CHAIN_ID = 3; // 3: Ropsten; 1: Mainnet
        const addresses = contractAddresses.getContractAddressesForChainOrThrow(CHAIN_ID);
        const exchangeProxyAddress = addresses.exchangeProxy;
        
        // Initialize web3 using MetaMask (window.ethereum) as the provider
        let web3 = null;
        web3 = new Web3(window.ethereum);

        // Set default account so that we don't need to specify a "from" address in every single send method
        const accounts = await web3.eth.getAccounts();
        const taker = accounts[0];
        console.log("Signer address: " + taker)
        
        web3.eth.defaultAccount = taker;

        // Get a quote from 0x API which contains `allowanceTarget`
        // This is the contract that the user needs to set an ERC20 allowance for
        // API string: https://ropsten.api.0x.org/swap/v1/quote?buyToken=WETH&sellToken=DAI&buyAmount=10000000000000000
        const params = {
            buyToken: "WETH",// "0xa03b86865fd90ad68dbe5db5a01ca9d02b5a1896",
            sellToken: "DAI", // "0xad6d458402f60fd3bd25163575031acdce07538d",
            sellAmount: "10000000000000000", // 0.01
        }
        const res = await fetch(`https://ropsten.api.0x.org/swap/v1/quote?${qs.stringify(params)}`);
        const quote = await res.json();

        // Set up approval for the token the taker wants to sell. 
        const takerTokenAddress = "0xad6d458402f60fd3bd25163575031acdce07538d"; // Ropsten DAI
        const maxApproval = new BigNumber(2).pow(256).minus(1);

        // **************** Approve token transfers (method 1 using web3) *************
        // Connect to contract
        const TakerTokenContract = await new web3.eth.Contract(ERC20_ABI, takerTokenAddress)

        // Set allowance for the exchange proxy contract
        await TakerTokenContract.methods.approve(exchangeProxyAddress, maxApproval).send({from: web3.eth.defaultAccount});
        
        // Check allowance
        const allowanceFromTaker = await TakerTokenContract.methods.allowance(taker, exchangeProxyAddress).call();

        // **************** Approve token transfers (method 2 using 0x libraries) *************
        // // Initialize taker contract
        // const takerTokenContract = new ERC20TokenContract(takerTokenAddress, web3.eth.currentProvider);

        // // Set allowance for the exchange proxy contract
        // await takerTokenContract.approve(exchangeProxyAddress, maxApproval).awaitTransactionSuccessAsync({ from: takerAccount }); // Comment out when you are connected to takerAccount

        // // Check allowance
        // const approvedByTaker = await takerTokenContract.allowance(takerAccount, exchangeProxyAddress).callAsync();

        console.log("Allowance taker: " + await allowanceFromTaker.toString());
        
        // Fill quote
        await web3.eth.sendTransaction(quote, {gasLimit: 1000000}); // gas set to 1mln, otherwise tx will fail

    };

    return (
        <div>
            <button onClick={fillQuote}>FillQuote</button>
        </div>
    );
}

export default FillQuote;