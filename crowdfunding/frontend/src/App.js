import './App.css';
import idl from './idl.json';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3, utils, BN, } from '@project-serum/anchor';
import { useEffect, useState } from 'react';

const programID = new PublicKey(idl.address);
const network = clusterApiUrl('devnet');
const opts = {
  preflightCommitment: "processed",
  commitment: "processed",
};
const { SystemProgram } = web3;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(connection, window.solana, opts.preflightCommitment);
    return provider;
  }
  const checkIfWalletIsConnected = async () => {
    try {
      const {solana} = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found!");
          const response = await solana.connect({onlyIfTrusted: true});
          if (response) {
            console.log("Connected with public key:", response.publicKey.toString());
            console.log('Connected to wallet');
            setWalletAddress(response.publicKey.toString());
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
  const connectWallet = async () => {
    const {solana} = window;
    if (solana) {
      if (solana.isPhantom) {
        const response = await solana.connect();
        if (response) {
          console.log("Connected with public key:", response.publicKey.toString());
          console.log('Connected to wallet');
          setWalletAddress(response.publicKey.toString());
        } else {
          console.log('Not connected to wallet');
        }
      } else {
        console.log("Solana object not found! Get a Phantom wallet!");
      }
    }
  };

  const createCampaign = async () => {
    try {
      const provider = getProvider();
      console.log("Provider:", provider);
      console.log("Program ID:", programID.toString());
      console.log("IDL:", idl);

      const program = new Program(idl, programID, provider);
      console.log("Program instantiated:", program);

      const [campain] = await web3.PublicKey.findProgramAddress(
          [
            utils.bytes.utf8.encode("CAMPAIGN_DEMO"),
            provider.wallet.publicKey.toBuffer(),
          ],
          program.programId
        );
        console.log("Campaign address:", campain.toString());
        
        await program.rpc.create("campaign name", "campaign description", {
          accounts: {
            campain,
            user: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          }
        });
        console.log("Created a new campain w/ address:", campain.toString());
    } catch (error) {
      console.error("Errpr creating campain account:", error);
    }
  };

  const renderNotConnectedContainer = () => {
    return <button onClick={connectWallet}>Connect Wallet</button>;
  };
  const renderConnectedContainer = () => {
    return <button onClick={createCampaign}>Create a campaign</button>;
  };
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return <div className="App">
      {walletAddress ? renderConnectedContainer() : renderNotConnectedContainer()}
    </div>;
};

export default App;
