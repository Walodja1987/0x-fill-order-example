/**
 * Component to batch fill limit order
 * 
 * Preparation:
 * To make this example work, you need to have two different ERC20 tokens on Polygon in your wallet and MATIC to pay for gas. 
 * The makerToken (0xc03ce...) used in this example is a custom ERC20 token that was minted on Polygon. The takerToken (0x2791B...) is USDC on Polygon
 * 
 * Notes:
 * - batchFillLimitOrder requires prior authorization of the 0x exchange contract to transfer maker and taker tokens.
 *   Use the ApproveMaker and ApproveTaker components to set the respective allowances.
 * 
 * 
 * Functionality:
 * TODO: Order response array is sorted by price before execution
 * TODO: Checks remainingFillableTakerAmount
 * 
 * Resources/Links:
 * Check batchFillLimitOrder function defintion in: node_modules\@0x\contract-wrappers\lib\src\generated-wrappers\i_zero_ex.d.ts
 * 
 * Trouble shooting:
 * 1. MetaMask - RPC Error: Invalid parameters: must provide an Ethereum address. 
 * -> Reason: You are trying to fill the order with the same account that created it
 * 2. MetaMask - RPC Error: Provided chainId "137" must match the active chainId "3" 
 * -> Your MetaMask wallet is not connected to the right chain
 * 3. Uncaught (in promise) Error: Expected revertIfIncomplete to be of type boolean, encountered: undefined
 * -> You are missing the fourth parameter in batchFillLimitOrder function (check function definition)
 */

import { ERC20TokenContract, IZeroExContract } from '@0x/contract-wrappers'; 
import { BigNumber, providerUtils } from '@0x/utils';
import * as qs from 'qs';
import Web3 from 'web3';
import * as ERC20 from './ERC20.json';

const ERC20_ABI = ERC20.abi;
const utils = require("@0x/protocol-utils");
const contractAddresses = require("@0x/contract-addresses");

function BatchFillOrders() {
  
    async function batchFillOrders() {
        
        // Get exchangeProxy contract address from @0x/contract-addresses library
        const CHAIN_ID = 3; // 3: Ropsten; 1: Mainnet; 137: Polygon
        const addresses = contractAddresses.getContractAddressesForChainOrThrow(CHAIN_ID);
        const exchangeProxyAddress = addresses.exchangeProxy; // 0xdef1c0ded9bec7f1a1670819833240f027b25eff (same for most chains including Mainnet, Ropsten and Polygon)

        // Connect to 0x exchange contract 
        const exchange = new IZeroExContract(exchangeProxyAddress, window.ethereum);
               
        // Create web3 instance using window.ethereum (i.e. MetaMask wallet) as the provider
        let web3 = null;
        web3 = new Web3(window.ethereum);
        
        // Define parameters for API call
        // format: https://ropsten.api.0x.org/orderbook/v1/orderbook?quoteToken=0xc03ce38bc55836a4ef61ab570253cd7bfff3af44&baseToken=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174)
        const params = {
            quoteToken: "0x134e62bd2ee247d4186a1fdbaa9e076cb26c1355",
            baseToken: "0x03582cb41f2fd982e1b531d633b6de049d56f2a0",
        }

        // Issue API request and fetch JSON response
        // const res = await fetch(`https://ropsten.api.0x.org/orderbook/v1/orders?${qs.stringify(params)}`); // unordered list including either bids or asks
        const res = await fetch(`https://ropsten.api.0x.org/orderbook/v1?${qs.stringify(params)}`); // ordered orderbook including both bids and asks
        const resJSON = await res.json();

        console.log(resJSON)
        // Fetch first order object in records JSON object array
        let orders = [];
        let signatures = [];
        let responseOrder;
        let metaData = [];
        try {
            responseOrder = resJSON["bids"]["records"];
            
            console.log(responseOrder)
            // Separate signature from the rest of the response object as they are required as separate inputs in fillLimitOrder (see below)
            const aux = responseOrder.map(item => item.order);
            orders = aux.map(({ signature, ...rest }) => rest);
            signatures = aux.map(({ signature, ...rest }) => signature);
            // Get metaData which contains the remainingFillableTakerAmount
            metaData = responseOrder.map(item => item.metaData);
        } catch(err) {
            alert("No orders found")
            console.log(err);
            return;
        }
        
        // Get connected account
        const accounts = await web3.eth.getAccounts();
        const takerAccount = accounts[0]; 
        console.log("Current account connected: " + takerAccount)

        // **************** Check allowance (method 1 using web3) *************
        // Contract addresses of taker token
        const takerTokenAddress = params.baseToken;

        // Initialize taker token contract
        const takerTokenContract = await new web3.eth.Contract(ERC20_ABI, takerTokenAddress)
        
        // Check allowance
        const approvedByTaker = await takerTokenContract.methods.allowance(takerAccount, exchangeProxyAddress).call();
        // *************************************************************************************

        // **************** Check allowance (method 2 using 0x libraries) *************
        // Contract addresses of taker token
        // const takerTokenAddress = params.baseToken;

        // // Initialize taker contract
        // const takerTokenContract = new ERC20TokenContract(takerTokenAddress, web3.eth.currentProvider);

        // // Check allowance
        // const approvedByTaker = await takerTokenContract.allowance(takerAccount, exchangeProxyAddress).callAsync();
        // *************************************************************************************

        // Print allowances
        console.log("Approved by taker: " + await approvedByTaker.toString())

        // TODO: Handle sum(takerAssetAmountFillAmounts) > allowance
        
        console.log(metaData)

        // Enter amounts to fill for each of the orders as an array of strings 
        const takerAssetFillAmounts = [
            metaData[0].remainingFillableTakerAmount,
            // metaData[1].remainingFillableTakerAmount,
            // metaData[2].remainingFillableTakerAmount,
            // '1'
        ]

        console.log('takerAssetFillAmounts')
        console.log(takerAssetFillAmounts)

        const len = takerAssetFillAmounts.length

        // TODO Handle sum(takerAssetAmountFillAmounts) > remainingFillable amount

        // Batch fill limit order
        await exchange
            .batchFillLimitOrders(orders.slice(0,len), signatures.slice(0,len), takerAssetFillAmounts, true)
            .awaitTransactionSuccessAsync({ from: takerAccount})
            .catch((err) => console.error(err));
    };

    return (
        <div>
            <button onClick={batchFillOrders}>Batch fill orders</button>
        </div>
    );
}

export default BatchFillOrders;