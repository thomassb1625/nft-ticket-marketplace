import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TicketNFTAbi from '../contracts/TicketNFT.json';
import TicketMarketplaceAbi from '../contracts/TicketMarketplace.json';

interface Web3ContextType {
  account: string | null;
  ticketNFT: ethers.Contract | null;
  marketplace: ethers.Contract | null;
  connectWallet: () => Promise<void>;
  isLoading: boolean;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  ticketNFT: null,
  marketplace: null,
  connectWallet: async () => {},
  isLoading: true,
});

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [ticketNFT, setTicketNFT] = useState<ethers.Contract | null>(null);
  const [marketplace, setMarketplace] = useState<ethers.Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccount(accounts[0]);
        setupContracts();
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const setupContracts = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Replace with your deployed contract addresses
      const ticketNFTAddress = 'YOUR_TICKET_NFT_ADDRESS';
      const marketplaceAddress = 'YOUR_MARKETPLACE_ADDRESS';

      const ticketNFTContract = new ethers.Contract(
        ticketNFTAddress,
        TicketNFTAbi.abi,
        signer
      );
      const marketplaceContract = new ethers.Contract(
        marketplaceAddress,
        TicketMarketplaceAbi.abi,
        signer
      );

      setTicketNFT(ticketNFTContract);
      setMarketplace(marketplaceContract);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setupContracts();
        }
      }
      setIsLoading(false);
    };

    checkConnection();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
        if (accounts[0]) {
          setupContracts();
        }
      });
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        ticketNFT,
        marketplace,
        connectWallet,
        isLoading,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
