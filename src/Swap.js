// // Testing:
//         // MakerToken: 0x32de47Fc9bc48F4c56f9649440532081466036A2 (Long side)
//         // TakerToken: 0xaD6D458402F60fD3Bd25163575031ACDce07538D
//         // Maker address: 0x50f1c11616a9e53d0002bb8df358a133845acd25
//         // Get order: https://ropsten.api.0x.org/sra/v4/orders?makerToken=0x32de47Fc9bc48F4c56f9649440532081466036A2&takerToken=0xaD6D458402F60fD3Bd25163575031ACDce07538D

//         // Get a quote from 0x API which contains `allowanceTarget`
//         // This is the contract that the user needs to set an ERC20 allowance for
//         const params = {
//             buyToken: "0x3df0b27CCd68462C52Fb8F1870761085280E0686",// "0xa03b86865fd90ad68dbe5db5a01ca9d02b5a1896",
//             sellToken: "DAI", // "0xad6d458402f60fd3bd25163575031acdce07538d",
//             sellAmount: "10000000000000000", // 0.01
//         }
//         console.log(`https://ropsten.api.0x.org/swap/v1/quote?${qs.stringify(params)}`)
//         // const res = await fetch(`https://ropsten.api.0x.org/swap/v1/quote?${qs.stringify(params)}`);
//         // console.log(JSON.stringify(res))
//         //const res = await fetch("https://ropsten.api.0x.org/swap/v1/quote?buyToken=DAI&sellToken=WETH&sellAmount=100000000000000000")
//         // const quote = await res.json();
//         // console.log("Type of :" + typeof quote)

//         const accounts = await web3.eth.getAccounts();
//         const signer = accounts[0];
//         console.log("Address: " + signer)
//         // console.log("account 0: " + accounts[0])

//         // Set up approval
//         const CollateralTokenAddress = "0xad6d458402f60fd3bd25163575031acdce07538d"// WETH: '0xc778417e063141139fce010982780140aa0cd5ab';
//         const PositionTokenAddress = "0x32de47Fc9bc48F4c56f9649440532081466036A2"
//         // const CollateralTokenContract = new ERC20TokenContract(CollateralTokenAddress, web3.eth.currentProvider);
//         const maxApproval = new BigNumber(2).pow(256).minus(1);

//         // Add allowance check in final code
//         const CollateralTokenContract = await new web3.eth.Contract(ERC20_ABI, CollateralTokenAddress)
//         const PositionTokenContract = await new web3.eth.Contract(ERC20_ABI, PositionTokenAddress)

        
//         // Maker and taker both have to set allowance for the exchange proxy contract
//         // await CollateralTokenContract.methods.approve(exchangeProxyAddress, maxApproval).send({from: "0x1DaceFC4686f6b3bA6Ccf6842b0aFB6044E4B422"});
//         // await PositionTokenContract.methods.approve(exchangeProxyAddress, maxApproval).send({from: "0x50F1c11616a9e53d0002bB8df358a133845ACD25"});
        
//         // Check allowance
//         // Instead of call and methods you can also use awaitTransactionSuccessAsyncawait tokenB.approve(contractWrappers.contractAddresses.erc20Proxy, new BigNumber('100000000000000000000000')).awaitTransactionSuccessAsync({ from: bob })
//         const allowanceFromTaker = await CollateralTokenContract.methods.allowance("0x1DaceFC4686f6b3bA6Ccf6842b0aFB6044E4B422", exchangeProxyAddress).call();
//         const allowanceFromMaker = await PositionTokenContract.methods.allowance("0x50F1c11616a9e53d0002bB8df358a133845ACD25", exchangeProxyAddress).call();

//         console.log("Allowance taker: " + await allowanceFromTaker.toString())
//         console.log("Allowance maker: " + await allowanceFromMaker.toString())

        
//         // Send the approval to the allowance target smart contract
//         // const chainId = 3;
//         // const approvalTxData = CollateralTokenContract
//         //     .approve(quote.allowanceTarget, maxApproval)
//         //     .getABIEncodedTransactionData();
//         // console.dir(approvalTxData)
//         // await web3.eth.sendTransaction(approvalTxData, {from: account});

//         // web3.eth.defaultAccount = signer;
//         web3.eth.defaultAccount = "0x50F1c11616a9e53d0002bB8df358a133845ACD25";
//         console.log("Default account: " + await web3.eth.defaultAccount)
        
//         // await web3.eth.sendTransaction(quote, {from: signer})
