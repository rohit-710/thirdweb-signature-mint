import{
  useAddress, 
  useMetamask,
  useContract, 
  useNetwork, 
  useNetworkMismatch,
  ConnectWallet, 
  ChainId
} from "@thirdweb-dev/react";

import {
  SignatureDrop,
  SignedPayload721WithQuantitySignature,
} from "@thirdweb-dev/sdk";


import type { NextPage } from "next";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const isMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();

  const { contract, isLoading, error } = useContract(
    "0x934c99b6eD90AB20C23338F0a700DA900ec558D5",
    "signature-drop",
  );

  async function claim() {
    if (!address)
    {
      connectWithMetamask();
      return;
    }

    if (isMismatch){
      switchNetwork?.(ChainId.Goerli);
      return;
    }

    try {
      const tx =await contract?.claimTo(address, 1);
      alert(`Successfully minted NFT`);
    } catch (error: any){
      alert(error?.message);
    }
  
  }
    async function claimWithSignature() {
      if (!address) {
      switchNetwork && switchNetwork(ChainId.Goerli);
      return;
    }

    const signedPayloadReq = await fetch(`/api/generate-mint-signature`,{
      method: "POST",
      body: JSON.stringify({
        address: address,
      }),
    });

    console.log(signedPayloadReq);

    if (signedPayloadReq.status === 500)
    {
      alert(
        "Looks like you don't own an early access NFT: You don't qualify for the free mint"
      );
      return;
    } else {
      try {
        const signedPayload = (await signedPayloadReq.json()) as SignedPayload721WithQuantitySignature;

        console.log(signedPayload);

        const nft = await contract?.signature.mint(signedPayload);

        alert(`NFT was successfully minted!`);
      } catch(error: any){
        alert(error?.message);
      }
    }
  }

 

  return (
    <div className={styles.container}>
      {address ? (
        <div className = {styles.nftBoxGrid}>
          <div className = {styles.optionSelectBox} onClick={() => claim()}>
            <h2 className = {styles.selectBoxTitle}>Claim NFT</h2>
            <p className = {styles.selectBoxDescription}>
              Use the normal <code>claim</code> function to mint an NFT 
              under the claim conditions of the claim phase.
            </p>
          </div>

          <div className={styles.optionSelectBox}
               onClick={() => claimWithSignature()}
          >
            <h2 className={styles.selectBoxTitle}>Mint with Signature</h2>
            <p className={styles.selectBoxDescription}>
              Check if you are eligible to mint an NFT for free, 
              by using signature-based minting.
            </p>

          </div>
        </div>
      ) : (
        <button 
           className = {styles.mainButton}
           onClick = {() => connectWithMetamask()}
        >
          Connect Wallet
        </button>
      )}
    </div>

  )



};

export default Home;
