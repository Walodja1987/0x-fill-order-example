import './App.css';
import WalletConnectButton from './WalletConnectButton';
import Sign from './Sign';
import FillLimitOrder from './FillLimitOrder';
import FillQuoteV1 from './FillQuote_v1';
import FillQuoteV2 from './FillQuote_v2'; // Same as FillQuoteV1 but with less code
import ApproveMaker from './ApproveMaker';
import ApproveTaker from './ApproveTaker';


function App() {
  return (
    <div className="App">
      <h1>Step 1: Connect wallet</h1>
      <WalletConnectButton />
      <h1>Step 2: Approve by maker</h1>
      <ApproveMaker />
      <h1>Step 3: Create, sign and submit 0x order</h1>
      <Sign />
      <h1>Step 4: Approve by taker</h1>
      <ApproveTaker />
      <h1>Step 5: Fill limit order</h1>
      <FillLimitOrder />
      <h1>Other: Fill quote</h1>
      <FillQuoteV1 />
    </div>
  );
}

export default App;
