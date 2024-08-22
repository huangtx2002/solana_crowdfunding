import './App.css';
import { useEffect } from 'react';

const App = () => {
  const checkIfWalletIsConnected = async () => {
    try {
      const {solana} = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found!");
          const response = await solana.connect({});
          console.log("Connected with public key:", response.publicKey.toString());
          if (response) {
            console.log('Connected to wallet');
          } else {
            console.log('Not connected to wallet');
          }
        } else {
          console.log("Solana object not found! Get a Phantom wallet!");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  const connectWallet = async () => {};
  const renderNotConnectedContainer = () => {
    <button onClick={connectWallet}>Connect Wallet</button>;
  };
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return <div className="App">{renderNotConnectedContainer()}</div>;
};

export default App;
