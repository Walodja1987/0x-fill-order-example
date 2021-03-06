/**
 * Component to fill limit order
 * Note that fillLimitOrder requires prior authorization of the 0x exchange contract to transfer maker and taker tokens (to be done separately by maker and taker)
 * 
 * Links/Resources:
 * https://0x.org/docs/guides/v3-specification#fillorder
 * List of 0x contract addresses across networks here: https://github.com/0xProject/protocol/blob/development/packages/contract-addresses/addresses.json
 * 
 * Error messages:
 * 1. MetaMask - RPC Error: Invalid parameters: must provide an Ethereum address. 
 * Reason: You are trying to fill the order with the same account that created it
 * 2. MetaMask - RPC Error: Provided chainId "137" must match the active chainId "3" 
 * -> Your MetaMask wallet is not connected to the right chain
 */

import { ERC20TokenContract, IZeroExContract } from '@0x/contract-wrappers'; 
import { BigNumber, providerUtils } from '@0x/utils';
import * as qs from 'qs';
import Web3 from 'web3';
import * as ERC20 from './ERC20.json';

const ERC20_ABI = ERC20.abi;
const utils = require("@0x/protocol-utils");
const contractAddresses = require("@0x/contract-addresses");

function FillLimitOrder() {
  
    async function fillLimitOrder() {
        
        // Get exchangeProxy contract address from @0x/contract-addresses library
        const CHAIN_ID = 137; // 3: Ropsten; 1: Mainnet; 137: Polygon
        const addresses = contractAddresses.getContractAddressesForChainOrThrow(CHAIN_ID);
        const exchangeProxyAddress = addresses.exchangeProxy; // 0xdef1c0ded9bec7f1a1670819833240f027b25eff (same for most chains including Mainnet, Ropsten and Polygon)

        // Connect to 0x exchange contract 
        const exchange = new IZeroExContract(exchangeProxyAddress, window.ethereum);
               
        // Create web3 instance using window.ethereum (i.e. MetaMask wallet) as the provider
        let web3 = null;
        web3 = new Web3(window.ethereum);
        
        // Define parameters for API call (format: https://polygon.api.0x.org/orderbook/v1/orders?makerToken=0xc03ce38bc55836a4ef61ab570253cd7bfff3af44&takerToken=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174)
        const params = {
            makerToken: "0xc03ce38bc55836a4ef61ab570253cd7bfff3af44", // Polygon ERC20: 0xc03ce38bc55836a4ef61ab570253cd7bfff3af44, Ropsten ERC20: 0x32de47Fc9bc48F4c56f9649440532081466036A2
            takerToken: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // Polygon USDC: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174, Ropsten DAI: 0xaD6D458402F60fD3Bd25163575031ACDce07538D
        }

        // Issue API request and fetch JSON response
        const res = await fetch(`https://polygon.api.0x.org/orderbook/v1/orders?${qs.stringify(params)}`);
        const resJSON = await res.json();
        
        // Fetch first order object in records JSON object array
        let responseOrder;
        try {
            responseOrder = resJSON["records"][0]["order"];
        } catch(err) {
            alert("No orders found")
            console.log(err);
            return;
        }

        // Separate signature from the rest of the response object as they are required as separate inputs in fillLimitOrder (see below)
        const { signature, ...order } = responseOrder

        // Get connected account
        const accounts = await web3.eth.getAccounts();
        const takerAccount = accounts[0]; 
        console.log("Current account connected: " + takerAccount)

        // ************* Set up approval ****************
        // Contract addresses of maker and taker token
        const takerTokenAddress = order.takerToken;

        // **************** Check allowance (method 1 using web) *************
        // Initialize taker and maker contracts
        const takerTokenContract = await new web3.eth.Contract(ERC20_ABI, takerTokenAddress)
        
        // Check allowance
        const approvedByTaker = await takerTokenContract.methods.allowance(takerAccount, exchangeProxyAddress).call();
        // *************************************************************************************

        // **************** Check allowance (method 1 using 0x libraries) *************
        // You have to comment out the approval part above if you want to use this part

        // // Initialize taker and maker contracts
        // const takerTokenContract = new ERC20TokenContract(takerTokenAddress, web3.eth.currentProvider);

        // // Check allowance
        // const approvedByTaker = await takerTokenContract.allowance(takerAccount, exchangeProxyAddress).callAsync();
        // *************************************************************************************

        // Print allowances
        console.log("Approved by taker: " + await approvedByTaker.toString())

        // Set taker amount
        const takerAssetFillAmount = new BigNumber(1000); // 0.001 USDC (has only 6 decimals!) 
        if (takerAssetFillAmount > approvedByTaker) {
            alert("takerAssetFillAmount exceeds allowance.");
            return;
        }
        
        // TODO WHETHER takerAmount exceeds remainingFillable amount

        // Fill order
        await exchange
            .fillLimitOrder(order, signature, takerAssetFillAmount)
            .awaitTransactionSuccessAsync({ from: takerAccount})
            .catch((err) => console.error(err));
    };

    return (
        <div>
            <button onClick={fillLimitOrder}>Fill limit order</button>
        </div>
    );
}

export default FillLimitOrder;