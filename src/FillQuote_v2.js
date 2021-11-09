/**
 * Same as FillQuote_v1.js but retrieving the allowance target address from the json response directly (typically equal to the 0x exchange proxy address). Makes the code shorter
 * Note: If transaction fails due to insufficient gas, just increase the gas limit by a factor of 10 or more
 */
 import { ERC20TokenContract } from '@0x/contract-wrappers'; // Optional in case you prefer 0x libraries to connect to contracts
 import { BigNumber } from '@0x/utils';
 import * as qs from 'qs';
 import Web3 from 'web3';
 import * as data from './ERC20.json';
 
 const ERC20_ABI = data.abi;
 
 function FillQuoteV2() {
     
     async function fillQuoteV2() {
         
         // Initialize web3 using MetaMask (window.ethereum) as the provider
         let web3 = null;
         web3 = new Web3(window.ethereum);
 
         // Set default account so that we don't need to specify a "from" address in every single send method
         const accounts = await web3.eth.getAccounts();
         const taker = accounts[0];
         console.log("Signer address: " + taker)
         
         web3.eth.defaultAccount = taker;
 
         // Get a quote from 0x API which contains `allowanceTarget`. This is the contract that the user needs to set an ERC20 allowance for
         // API string: https://ropsten.api.0x.org/swap/v1/quote?buyToken=WETH&sellToken=DAI&buyAmount=10000000000000000
         const params = {
             buyToken: "WETH",// "0xa03b86865fd90ad68dbe5db5a01ca9d02b5a1896",
             sellToken: "DAI", // "0xad6d458402f60fd3bd25163575031acdce07538d",
             sellAmount: "10000000000000000", // 0.01
         }
         const res = await fetch(`https://ropsten.api.0x.org/swap/v1/quote?${qs.stringify(params)}`);
         const quote = await res.json();
 
         // Set up approval for the token the taker wants to sell. 
         const takerTokenAddress = quote.sellTokenAddress; // "0xad6d458402f60fd3bd25163575031acdce07538d"; // Ropsten DAI
         const maxApproval = new BigNumber(2).pow(256).minus(1);
 
         // **************** Approve token transfers (method 1 using web3) *************
         // Connect to contract
         const TakerTokenContract = await new web3.eth.Contract(ERC20_ABI, takerTokenAddress)
 
         // Set allowance for the exchange proxy contract
         await TakerTokenContract.methods.approve(quote.allowanceTarget, maxApproval).send({from: taker}); // had to specify "from" here as it's not working otherwise

         // Check allowance
         const allowanceFromTaker = await TakerTokenContract.methods.allowance(taker, quote.allowanceTarget).call();
 
         // **************** Approve token transfers (method 2 using 0x libraries) *************
        //  // Initialize taker contract
        //  const takerTokenContract = new ERC20TokenContract(takerTokenAddress, web3.eth.currentProvider);
 
        //  // Set allowance for the exchange proxy contract
        //  await takerTokenContract.approve(quote.allowanceTarget, maxApproval).awaitTransactionSuccessAsync({ from: taker }); // Comment out when you are connected to takerAccount
 
        //  // Check allowance
        //  const allowanceFromTaker = await takerTokenContract.allowance(taker, quote.allowanceTarget).callAsync();
 
         console.log("Allowance taker: " + await allowanceFromTaker.toString());
         
         // Fill quote
         await web3.eth.sendTransaction(quote, {gasLimit: 1000000}); // gas set to 1mln, otherwise tx will fail
 
     };
 
     return (
         <div>
             <button onClick={fillQuoteV2}>FillQuote</button>
         </div>
     );
 }
 
 export default FillQuoteV2;