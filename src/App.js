import './App.css';
import WalletConnectButton from './WalletConnectButton';
import Sign from './Sign';
import ApproveAndFill from './ApproveAndFill';
import FillQuote from './FillQuote';


function App() {
  return (
    <div className="App">
      <h1>Step 1: Connect wallet</h1>
      <WalletConnectButton />
      <h1>Step 2: Create, sign and submit 0x order</h1>
      <Sign />
      <h1>Step 3: Approve and fill</h1>
      <ApproveAndFill />
      <h1>Fill quote</h1>
      <FillQuote />
    </div>
  );
}

export default App;
