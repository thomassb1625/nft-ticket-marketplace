import React, { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { DUMMY_MY_TICKETS, type Ticket } from '../constants/dummyData';

const MyTickets: React.FC = () => {
  const { ticketNFT, marketplace, account } = useWeb3();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMyTickets = useCallback(async () => {
    try {
      let ticketsData: Ticket[] = [];

      if (ticketNFT && marketplace && account) {
        // Try to get real tickets from the blockchain
        const filter = ticketNFT.filters.Transfer(null, account);
        const events = await ticketNFT.queryFilter(filter);
        
        const realTickets = await Promise.all(
          events.map(async (event: any) => {
            const tokenId = event.args.tokenId.toNumber();
            
            try {
              const owner = await ticketNFT.ownerOf(tokenId);
              if (owner.toLowerCase() !== account.toLowerCase()) {
                return null;
              }

              const details = await ticketNFT.getTicketDetails(tokenId);
              const listing = await marketplace.getListing(tokenId);

              const ticket: Ticket = {
                tokenId,
                artist: details.artist,
                eventDate: new Date(details.eventDate.toNumber() * 1000),
                venue: details.venue,
                section: details.section,
                seatNumber: details.seatNumber.toNumber(),
                isUsed: details.isUsed,
                isListed: listing.isActive,
                imageUrl: '/images/artists/default.jpg' // You might want to store this in IPFS or your contract
              };

              if (listing.isActive) {
                ticket.price = ethers.utils.formatEther(listing.price);
              }

              return ticket;
            } catch {
              return null;
            }
          })
        );

        ticketsData = realTickets.filter((ticket): ticket is Ticket => ticket !== null);
      }

      // If no real tickets or not connected, use dummy data
      if (ticketsData.length === 0) {
        ticketsData = DUMMY_MY_TICKETS.map((ticket, index) => ({
          ...ticket,
          tokenId: index + 1
        }));
      }

      setTickets(ticketsData);
    } catch (error) {
      console.error('Error loading tickets:', error);
      // Fall back to dummy data on error
      setTickets(DUMMY_MY_TICKETS.map((ticket, index) => ({
        ...ticket,
        tokenId: index + 1
      })));
    } finally {
      setLoading(false);
    }
  }, [ticketNFT, marketplace, account]);

  const cancelListing = useCallback(async (tokenId: number) => {
    if (!marketplace) return;

    try {
      const tx = await marketplace.cancelListing(tokenId);
      await tx.wait();
      loadMyTickets();
    } catch (error) {
      console.error('Error canceling listing:', error);
    }
  }, [marketplace, loadMyTickets]);

  const handleUseTicket = useCallback(async (tokenId: number) => {
    if (!ticketNFT) return;

    try {
      const tx = await ticketNFT.useTicket(tokenId);
      await tx.wait();
      loadMyTickets();
    } catch (error) {
      console.error('Error using ticket:', error);
    }
  }, [ticketNFT, loadMyTickets]);

  useEffect(() => {
    loadMyTickets();
  }, [loadMyTickets]);

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
            <div 
              className="h-48 bg-cover bg-center"
              style={{ backgroundImage: `url(${ticket.imageUrl})` }}
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {ticket.artist}
              </h3>
              <p className="text-gray-600 mb-4">
                {ticket.venue} - {ticket.eventDate.toLocaleDateString()} {ticket.eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Section {ticket.section}, Seat {ticket.seatNumber}
                </p>
                {ticket.isListed && ticket.price && (
                  <p className="text-lg font-bold text-indigo-600">
                    Listed for {ticket.price} ETH
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {ticket.isListed ? (
                  <button
                    onClick={() => cancelListing(ticket.tokenId!)}
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
                    onClick={() => handleUseTicket(ticket.tokenId!)}
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
