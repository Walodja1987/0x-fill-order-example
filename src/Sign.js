/**
 * Component to sign and submit a 0x limit order
 */


/**
 * Polygon test tokens:
 * Long: 0xc03ce38bc55836a4ef61ab570253cd7bfff3af44 (used as makerToken)
 * Short: 0x9d2c22ec4cd2aa908a653d89acb4127916d64ed0 (used as takerToken)
 * Tx hash: 0x8b817b46662a440ed9a2be621e2a38ae33940ac20e6cc1b131fe70db95db1178
 * USDC: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
 */

/**
 * Ropsten test tokens:
 * Option: 0x32de47Fc9bc48F4c56f9649440532081466036A2 (used as makerToken)
 * DAI: 0xad6d458402f60fd3bd25163575031acdce07538d (used as takerToken)
 */

const utils = require("@0x/protocol-utils");
const contractAddresses = require("@0x/contract-addresses");

function Sign() {
    
    async function sign() {
        
        const CHAIN_ID = 137; // 3: Ropsten; 1: Mainnet; 137: Polygon
        const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
        const addresses = contractAddresses.getContractAddressesForChainOrThrow(CHAIN_ID);
    
        // Calculate value for order expiry parameter (here: 50 minutes)
        const getFutureExpiryInSeconds = () =>
        Math.floor(Date.now() / 1000 + 3000).toString();
    
        // Unlock MetaMask (assumes that you have MetaMask installed; Wallet connect logic is handled in WalletConnectButton component)
        const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
        });

        // Use currently connected MetaMask account as the maker account
        const maker = accounts[0];
        console.log("Maker address: " + maker)
    
        // Create order
        // maker is the account creating the order; makerToken is the asset the maker wants to sell
        // taker is the account filling a maker's order; takerToken is the token the maker wants to buy / taker will sell
        // QUESTION: Can maker create the order even when he doesn't own the respective amount of takerTokens?
        const order = new utils.LimitOrder({
            makerToken: "0xc03ce38bc55836a4ef61ab570253cd7bfff3af44", //"0xc03ce38bc55836a4ef61ab570253cd7bfff3af44", // 0x32de... is a test ERC20 token; you can leverage the @0x/contract-addresses library for standard tokens (e.g., addresses.etherToken, addresses.zrxToken)
            takerToken: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // Polygon USDC: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; Ropsten DAI: 0xad6d458402f60fd3bd25163575031acdce07538d
            makerAmount: "10000000000000000", // 0.01 for ERC20 tokens with 18 decimals
            takerAmount: "1000", // <- Polygon USDC with 6 decimals (1000 = 0.001); Ropsten DAI with 18 decimals (50000000000000000 = 0.05)
            maker: maker,
            sender: NULL_ADDRESS,
            expiry: getFutureExpiryInSeconds(),
            salt: Date.now().toString(), // Some random input to ensure uniqueness of order
            chainId: CHAIN_ID,
            verifyingContract: addresses.exchangeProxy, // typically 0x's exchangeProxy contract; erc20Proxy: 
            takerTokenFeeAmount: "0",
            sender: "0x0000000000000000000000000000000000000000",
            feeRecipient: "0x0000000000000000000000000000000000000000" 
        });
        
        console.dir(order);

        // Sign order conforming to the EIP712 standard
        const signature = await order.getSignatureWithProviderAsync(
            window.ethereum, // assuming Metamask is installed and connected. Wallet connect logic is handled in WalletConnectButton component
            utils.SignatureType.EIP712 // Optional
        );
        console.log(`Signature: ${JSON.stringify(signature, undefined, 2)}`);
    
        // Alternative way to sign an order using MetamaskSubprovider from @0x/subprovider package (requires installation of that package)
        // const { MetamaskSubprovider } = require("@0x/subproviders");
        // const provider = new MetamaskSubprovider(window.ethereum);
        // const signature = await order.getSignatureWithProviderAsync(
        //     provider, // using MetaMask provider assuming the wallet is installed and connected. Wallet connect logic is handled in WalletConnectButton component
        //     utils.SignatureType.EIP712 // Optional
        // );

        // Append signature object to order object for the post of the order
        const signedOrder = { ...order, signature };
        console.log(signedOrder)
        // Post order to the Standard Relayer API (SRA)
        // const resp = await fetch("https://polygon.api.0x.org/sra/v4/order", {
        //     method: "POST",
        //     body: JSON.stringify(signedOrder),
        //     headers: {
        //         "Content-Type": "application/json"
        //     }
        // });

        const resp = await fetch("https://polygon.api.0x.org/orderbook/v1/order", {
            method: "POST",
            body: JSON.stringify(signedOrder),
            headers: {
                "Content-Type": "application/json"
            }
        });
    
        // Handle response
        if (resp.status === 200) {
            alert("Successfully posted order to SRA");
        } else {
            const body = await resp.json();
            alert(
                `ERROR(status code ${resp.status}): ${JSON.stringify(body, undefined, 2)}`
            )
        }
    }
    
      return (
          <button onClick={sign}>Sign and submit</button>
      );
    
  }
  
  export default Sign;