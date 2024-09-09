import {
  useConnection,
  useWallet,
  useAnchorWallet,
} from "@solana/wallet-adapter-react"
import * as anchor from "@coral-xyz/anchor"
import { FC, useCallback, useEffect, useState } from "react"
import idl from "../idl.json"
import { Button, HStack, VStack, Text } from "@chakra-ui/react"
import { AnchorCampaign } from "../types/AnchorCampaign"

const LAMPORTS_PER_SOL = 1000000000;

export interface Props {
  campaign,
  setTransactionUrl
}

export const Campaign: FC<Props> = ({ campaign, setTransactionUrl }) => {
  const [amount, setAmount] = useState(0)
  const [program, setProgram] = useState<anchor.Program<AnchorCampaign>>()
  const { connection } = useConnection()
  const wallet = useAnchorWallet()

  useEffect(() => {
    if (connection && wallet) {
      const provider = new anchor.AnchorProvider(connection, wallet, {});
      anchor.setProvider(provider);
      const program = new anchor.Program(idl as AnchorCampaign);
      setProgram(program);
      refreshAmount(program)
    }
  }, [connection, wallet]);

  const withdrawAmount = useCallback(async () => {
    const userPublicKey = wallet.publicKey;

    const sig = await program.methods
      .withdraw(new anchor.BN(1 * LAMPORTS_PER_SOL))
      .accounts({
        campaign: campaign,
        user: userPublicKey,
      })
      .signers([]) // Ensure all required signers are included
      .rpc()

    setTransactionUrl(`https://explorer.solana.com/tx/${sig}?cluster=devnet`)
  }, [program])

  const donateAmount = useCallback(async () => {
    const userPublicKey = wallet.publicKey;

    const sig = await program.methods
      .donate(new anchor.BN(2 * LAMPORTS_PER_SOL))
      .accounts({
        campaign: campaign,
        user: userPublicKey,
      })
      .signers([]) // Ensure all required signers are included
      .rpc();

    setTransactionUrl(`https://explorer.solana.com/tx/${sig}?cluster=devnet`)
  }, [program])

  const refreshAmount = async (program) => {
    console.info("refreshAmount: " + campaign);
    const campaignAccount = await program.account.campaign.fetch(campaign);
    console.log("Fetched campaign account:", campaignAccount);
    setAmount(campaignAccount.amountDonated.toNumber());
  }

  return (
    <VStack>
      <HStack>
        <Button onClick={withdrawAmount}>Withdraw</Button>
        <Button onClick={donateAmount}>Donate</Button>
        <Button onClick={() => refreshAmount(program)}>Refresh amount</Button>
      </HStack>
      <Text color="white">Amount: {amount}</Text>
    </VStack>
  )
}
