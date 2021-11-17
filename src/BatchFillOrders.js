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
            takerToken: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // Collateral token: Polygon USDC: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174, Ropsten DAI: 0xaD6D458402F60fD3Bd25163575031ACDce07538D
        }

        // Issue API request and fetch JSON response
        const res = await fetch(`https://polygon.api.0x.org/orderbook/v1/orders?${qs.stringify(params)}`);
        const resJSON = await res.json();
        
        // Fetch first order object in records JSON object array
        let orders = [];
        let signatures = [];
        let responseOrder;
        try {
            responseOrder = resJSON["records"];
            // Separate signature from the rest of the response object as they are required as separate inputs in fillLimitOrder (see below)
            const aux = responseOrder.map(item => item.order);
            orders = aux.map(({ signature, ...rest }) => rest);
            signatures = aux.map(({ signature, ...rest }) => signature);
        } catch(err) {
            alert("No orders found")
            console.log(err);
            return;
        }
        
        // Get connected account
        const accounts = await web3.eth.getAccounts();
        const takerAccount = accounts[0]; 
        console.log("Current account connected: " + takerAccount)

        // ************* Set up approval ****************
        // Contract addresses of maker and taker token
        const takerTokenAddress = params.takerToken;

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


        // TODO: Handle sum(takerAssetAmountFillAmounts) > allowance

        // Set taker amount
        const takerFillAmount1 = new BigNumber(100);
        const takerFillAmount2 = new BigNumber(200);
        const takerFillAmount3 = new BigNumber(300);

        // Serialize an array of three BigNumbers
        const str = JSON.stringify( [takerFillAmount1, takerFillAmount2, takerFillAmount3] )
        // Return an array of three BigNumbers
        const takerAssetFillAmounts = JSON.parse(str, function (key, val) {
            return key === '' ? val : new BigNumber(val)
        })

        console.log(takerAssetFillAmounts)
        
        // TODO Handle sum(takerAssetAmountFillAmounts) > remainingFillable amount

        // Batch fill limit order
        await exchange
            .batchFillLimitOrders(orders, signatures, takerAssetFillAmounts, true)
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