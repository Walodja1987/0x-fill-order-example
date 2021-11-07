/**
 * Wallet connect button example for a React application
 * 
 * This example implements the following functionality:
 * Allows user to triggers MetaMask's onboarding process (i.e. forwards user to MetaMask's download page), if MetaMask is not installed
 * Disables button on click
 * Button text displays the current account address in the format 0x1234...abcd
 * Account address in button changes when user connects a different account
 * 
 * Code based on the following two tutorials:
 * https://docs.metamask.io/guide/create-dapp.html
 * https://docs.alchemy.com/alchemy/tutorials/how-to-create-an-nft
 * 
 * author: Wladimir Weinbender
 * date: 1 Nov 2021
 */


/**
 * Required packages to install via npm install:
 * @metamask/onboarding (https://docs.metamask.io/guide/onboarding-library.html)
 * 
 * How to run the code:
 * npm install (one-off to install the dependencies after you downloaded the files from github)
 * npm start
 */

import { useEffect, useState } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding'

function WalletConnectButton() {
    
    const [btnText, setBtnText] = useState("");
    const [isDisabled, setDisabled] = useState(false)
    const [metaMaskInstalled, setMetaMaskInstalled] = useState("")
    const [walletAddress, setWallet] = useState("");
    
    // For the onboarding process when Metamask is not installed (from @metamask/onboarding library)
    // Could also be done with a simple link
    const onboarding = new MetaMaskOnboarding(); // defaults to "https://fwd.metamask.io"
    
    // Do this in order to shorten window.ethereum to simply ethereum later in the code
    const { ethereum } = window;

    useEffect( async () => {
        // Check whether MetaMask is installed
        MetaMaskClientCheck();
        
        if (isMetaMaskInstalled()) {
          // Get current wallet connected (useful after refresh of page and used to display in the button that you are already connected)
          const { address } = await getCurrentWalletConnected(); 
          setWallet(address);

          // Add wallet listener to handle account changes by the user
          addWalletListener();
        }
    },[])

    // Check whether MetaMask Chrome extension is installed
    const isMetaMaskInstalled = () => {
        const isInstalled = Boolean(ethereum && ethereum.isMetaMask);
        setMetaMaskInstalled(isInstalled);
        return isInstalled;
    };

    // Aux function for isMetaMaskInstalled function
    const MetaMaskClientCheck = () => {
        if (!isMetaMaskInstalled()) {
            setBtnText("Install Metamask");
            console.log("Hello")
        } else {
            setBtnText("Connect");
        }
    };

    // Example code to initialize a web3 instance using window.ethereum as the provider
    // Requires installatino of web3 via npm install web3
    // const checkConnection = async () => {
    //     // Check if browser is running Metamask
    //     let web3: any;
    //     if (window.ethereum) {
    //         web3 = new Web3(window.ethereum);
    //     } else if (window.web3) {
    //         web3 = new Web3(window.web3.currentProvider);
    //     };

    //     // Check if User is already connected by retrieving the accounts
    //     const accounts = await web3.eth.getAccounts();
    // };

    // Executed on page load. When an account is already connected, then it will display the corresponding account in the button text
    const getCurrentWalletConnected = async () => {
        if (ethereum) {
          try {
            const addressArray = await ethereum.request({
              method: "eth_accounts",
            });
            if (addressArray.length > 0) {
                setBtnText(addressFormatter(addressArray[0]));
                setDisabled(true);
                return {
                  address: addressArray[0],
                };
            } else {
                return {
                  address: "",
                };
            }
          } catch (error) {
              console.error(error);
              return {
                  address: "",
              };
          }
        } else {
            return {
                address: "",
            };
        }
    }

    // Execute on button click when MetaMask is already installed
    // Note that "if (window.ethereum)" check is done at page load in the MetaMaskClientCheck and
    // doesn't need to be included here again
    const onClickConnect = async () => {
        try {
            // Disable button when clicked
            setDisabled(true);

            // Note: This part will trigger the MetaMask pop-up if you are either logged out of your wallet or logged in but not connected to any account. 
            // There won't be a pop-up window if you are already connected with an account
            const addressArray = await ethereum.request({ method: 'eth_requestAccounts' });
            
            if (addressArray.length > 0) {
                setWallet(addressArray[0])
                setBtnText(addressFormatter(addressArray[0]))
                return {
                  address: addressArray[0],
                };
              } else {
                  setBtnText("No account connected")
                return {
                  address: "",
                };
              };
        } catch (error) { // Wwhen user rejects the request
            setDisabled(false);                       
            console.error(error);
            return {
                address: ""
            };
        }
    };
    
    // Start onboarding process when MetaMask is not yet installed 
    const onClickInstall = () => {
        setBtnText("Onboarding in progress");
        setDisabled(true);
        onboarding.startOnboarding();
    }
 
    // Wallet listener to handle accounts changes by the user
    function addWalletListener() {
        if (ethereum) {
          ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length > 0) {
              setWallet(accounts[0]);
              setBtnText(addressFormatter(accounts[0]))
            } else {
              setWallet("");
              setBtnText("Connect");
              setDisabled(false);
            }
          });
        } else {
          setWallet("");
          setBtnText("No window.ethereum object found");
        }
      }

    // Converts any given account address into the following format: 0x1234...6789
    const addressFormatter = (account) => {
        return (
            "Connected: " +
            String(account).substring(0, 6) +
            "..." +
            String(account).substring(38)
        )          
    }  

    return (
        <div>
            <button onClick={metaMaskInstalled ? onClickConnect : onClickInstall} disabled={isDisabled}>{btnText}</button>       
        </div>
    )
}

export default WalletConnectButton;
