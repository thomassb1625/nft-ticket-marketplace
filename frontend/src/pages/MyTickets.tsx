import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';

interface Ticket {
  tokenId: number;
  artist: string;
  eventDate: Date;
  venue: string;
  section: string;
  seatNumber: number;
  isUsed: boolean;
  isListed: boolean;
  price?: string;
}

const MyTickets: React.FC = () => {
  const { ticketNFT, marketplace, account } = useWeb3();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account) {
      loadMyTickets();
    }
  }, [account, ticketNFT, marketplace]);

  const loadMyTickets = async () => {
    if (!ticketNFT || !marketplace || !account) return;

    try {
      const filter = ticketNFT.filters.Transfer(null, account);
      const events = await ticketNFT.queryFilter(filter);
      
      const ticketsData = await Promise.all(
        events.map(async (event: any) => {
          const tokenId = event.args.tokenId.toNumber();
          
          try {
            const owner = await ticketNFT.ownerOf(tokenId);
            if (owner.toLowerCase() !== account.toLowerCase()) {
              return null;
            }

            const details = await ticketNFT.getTicketDetails(tokenId);
            const listing = await marketplace.getListing(tokenId);

            return {
              tokenId,
              artist: details.artist,
              eventDate: new Date(details.eventDate.toNumber() * 1000),
              venue: details.venue,
              section: details.section,
              seatNumber: details.seatNumber.toNumber(),
              isUsed: details.isUsed,
              isListed: listing.isActive,
              price: listing.isActive ? ethers.utils.formatEther(listing.price) : undefined,
            };
          } catch {
            return null;
          }
        })
      );

      setTickets(ticketsData.filter((ticket): ticket is Ticket => ticket !== null));
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelListing = async (tokenId: number) => {
    if (!marketplace) return;

    try {
      const tx = await marketplace.cancelListing(tokenId);
      await tx.wait();
      loadMyTickets();
    } catch (error) {
      console.error('Error canceling listing:', error);
    }
  };

  const useTicket = async (tokenId: number) => {
    if (!ticketNFT) return;

    try {
      const tx = await ticketNFT.useTicket(tokenId);
      await tx.wait();
      loadMyTickets();
    } catch (error) {
      console.error('Error using ticket:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tickets</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.tokenId}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {ticket.artist}
              </h3>
              <p className="text-gray-600 mb-4">
                {ticket.venue} - {ticket.eventDate.toLocaleDateString()}
              </p>
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Section {ticket.section}, Seat {ticket.seatNumber}
                </p>
                {ticket.isListed && (
                  <p className="text-lg font-bold text-indigo-600">
                    Listed for {ticket.price} ETH
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {ticket.isListed ? (
                  <button
                    onClick={() => cancelListing(ticket.tokenId)}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Cancel Listing
                  </button>
                ) : ticket.isUsed ? (
                  <div className="w-full text-center py-2 px-4 bg-gray-100 text-gray-500 rounded-md">
                    Ticket Used
                  </div>
                ) : (
                  <button
                    onClick={() => useTicket(ticket.tokenId)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Use Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {tickets.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          You don't have any tickets yet.
        </p>
      )}
    </div>
  );
};

export default MyTickets;
