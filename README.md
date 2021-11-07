# 0x-fill-order-example
Example how to create and fill a 0x order based on v4 of the protocol on Ropsten (Chain ID = 3).

# Installation
Clone or fork <code>0x-fill-order-example</code>:

<code>git clone https://github.com/Walodja1987/0x-fill-order-example</code>

Install all dependencies:

<code>cd 0x-fill-order-example</code>

<code>npm install</code>

Run your app:

<code>npm start</code>

# 0x Libraries used
The following 0x packages were required (note that these packages will be installed automatically when installing the dependencies) via <code>npm install</code>): 

<code>@0x/contract-addresses</code> A tiny utility library to get the 0x contract addresses across networks. Link to github: https://github.com/0xProject/protocol/blob/development/packages/contract-addresses/addresses.json

<code>@0x/protocol-utils</code> 0x protocol-related utilities for the V4/Exchange Proxy constellation of contracts. Link to github: https://github.com/0xProject/protocol/tree/development/packages/protocol-utils

<code>@0x/contract-wrappers</code>

<code>web3</code> 

<code>qs</code>

Optional in case you want to use 0x library to initialize your provider or if you want to work with multiple providers that will handle different sets of JSON RPC requests (Provider Engine): <code>@0x/subproviders</code> Link: https://0x.org/docs/tools/subproviders 

# Links
Official 0x protocol repository: https://github.com/0xProject/protocol
