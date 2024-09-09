import {
  useConnection,
  useAnchorWallet,
} from "@solana/wallet-adapter-react";
import { Keypair, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";
import { FC, useEffect, useState } from "react";
import idl from "../idl.json";
import { Button } from "@chakra-ui/react";
import { AnchorCampaign } from "../types/AnchorCampaign";

export interface Props {
  setCampaign;
  setTransactionUrl;
}

export const CreateCampaign: FC<Props> = ({ setCampaign, setTransactionUrl }) => {
  const [program, setProgram] = useState<anchor.Program<AnchorCampaign>>();

  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  // Function to check if the campaign account exists
  const checkCampaignExists = async (program, campaignPDA) => {
    try {
      // Attempt to fetch the account data
      const campaignAccount = await program.account.campaign.fetch(campaignPDA);
      console.log('Campaign account exists:', campaignAccount);
      return true;
    } catch (error) {
      if (error.message.includes('Account does not exist')) {
        console.log('Campaign account does not exist');
        return false;
      }
      console.error('Error fetching account:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (connection && wallet) {
      const provider = new anchor.AnchorProvider(connection, wallet, {});
      anchor.setProvider(provider);
      const program = new anchor.Program(idl as AnchorCampaign);
      setProgram(program);
    }
  }, [connection, wallet]);

  const onClick = async () => {
    try {
      const userPublicKey = wallet.publicKey;
  
      // Define seeds for the PDA (Program Derived Address)
      const [campaignPDA] = await anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("CAMPAIGN_DEMO"), // The constant value used in the seeds
          userPublicKey.toBuffer() // The user's public key as part of the seed
        ],
        program.programId // The program's ID
      );
    
      // Check if the campaign account exists
      const exists = await checkCampaignExists(program, campaignPDA);

      if (exists) {
        console.log('Campaign account already exists');
        setCampaign(campaignPDA);
        return;
      }

      // Call the program's create method
      const sig = await program.methods
        .create("campaign name", "campaign description")
        .accounts({
          campaign: campaignPDA,
          user: userPublicKey,
        })
        .signers([]) // Ensure all required signers are included
        .rpc();
  
      // Update the UI with transaction details
      setTransactionUrl(`https://explorer.solana.com/tx/${sig}?cluster=devnet`);
      setCampaign(campaignPDA);
    } catch (error) {
      console.error("Transaction failed:", error);
      if (error instanceof anchor.web3.SendTransactionError) {
        const logs = await error.getLogs(program.provider.connection);
        console.log("Transaction logs:", logs);
      }
    }
  };
    
  return <Button onClick={onClick}>Create Campaign</Button>;
};
