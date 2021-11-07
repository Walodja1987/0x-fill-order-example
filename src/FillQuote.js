/**
 * Illustration how to fill an order from https://ropsten.api.0x.org/swap/v1/quote
 * Note: If transaction fails due to insufficient gas, just increase the gas limit by a factor of 10 or more
 */

import { ERC20TokenContract, IZeroExContract } from '@0x/contract-wrappers';
import { BigNumber, providerUtils } from '@0x/utils';
import * as qs from 'qs';
import Web3 from 'web3';
import * as data from './ERC20.json';

const ERC20_ABI = data.abi;

function FillQuote() {
    const utils = require("@0x/protocol-utils");

    async function fillQuote() {
        
        // Get exchangeProxy contract address on Ropsten
        const contractAddresses = require("@0x/contract-addresses");
        const CHAIN_ID = 3;
        const addresses = contractAddresses.getContractAddressesForChainOrThrow(CHAIN_ID);
        const exchangeProxyAddress = addresses.exchangeProxy;
        
        // Initialize web3 using MetaMask (window.ethereum) as the provider
        let web3 = null;
        web3 = new Web3(window.ethereum);

        // Set default account so that we don't need to specify a "from" address in every single send method
        const accounts = await web3.eth.getAccounts();
        const signer = accounts[0];
        console.log("Signer address: " + signer)
        
        web3.eth.defaultAccount = signer;

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
        const sellTokenAddress = "0xad6d458402f60fd3bd25163575031acdce07538d"; // DAI
        const maxApproval = new BigNumber(2).pow(256).minus(1);

        // Connect to contract
        const SellTokenContract = await new web3.eth.Contract(ERC20_ABI, sellTokenAddress)

        // Set allowance for the exchange proxy contract
        await SellTokenContract.methods.approve(exchangeProxyAddress, maxApproval).send({from: web3.eth.defaultAccount});
        // await SellTokenContract.approve(contractWrappers.contractAddresses.erc20Proxy, new BigNumber('100000000000000000000000')).awaitTransactionSuccessAsync({ from: signer })
        
        // Check allowance
        // Instead of call and methods you can also use awaitTransactionSuccessAsyncawait tokenB.approve(contractWrappers.contractAddresses.erc20Proxy, new BigNumber('100000000000000000000000')).awaitTransactionSuccessAsync({ from: bob })
        const allowanceFromTaker = await SellTokenContract.methods.allowance("0x1DaceFC4686f6b3bA6Ccf6842b0aFB6044E4B422", exchangeProxyAddress).call();

        console.log("Allowance taker: " + await allowanceFromTaker.toString());
        
        await web3.eth.sendTransaction(quote);

    };

    return (
        //<button onClick={() => {this.sign.catch((err) => console.error(err))}}>Sign and submit</button>  // this part is including error handling
        <div>
            <button onClick={fillQuote}>FillQuote</button>
        </div>
    );
}

export default FillQuote;