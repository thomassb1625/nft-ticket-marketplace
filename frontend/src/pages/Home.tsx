import React, { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { DUMMY_EVENTS, type Ticket } from '../constants/dummyData';

const Home: React.FC = () => {
  const { marketplace, ticketNFT } = useWeb3();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    try {
      let ticketsData: Ticket[] = [];

      if (marketplace && ticketNFT) {
        // Try to get real listings from the blockchain
        const filter = marketplace.filters.TicketListed();
        const events = await marketplace.queryFilter(filter);

        const realTickets = await Promise.all(
          events.map(async (event: any) => {
            const tokenId = event.args.tokenId.toNumber();
            const listing = await marketplace.getListing(tokenId);
            const details = await ticketNFT.getTicketDetails(tokenId);

            return {
              tokenId,
              artist: details.artist,
              eventDate: new Date(details.eventDate.toNumber() * 1000),
              venue: details.venue,
              section: details.section,
              seatNumber: details.seatNumber.toNumber(),
              price: ethers.utils.formatEther(listing.price),
              seller: listing.seller,
              imageUrl: '/images/artists/default.jpg' // You might want to store this in IPFS or your contract
            };
          })
        );

        ticketsData = realTickets.filter((ticket) => ticket.price !== '0');
      }

      // If no real tickets, use dummy data
      if (ticketsData.length === 0) {
        ticketsData = DUMMY_EVENTS.map((event, index) => ({
          ...event,
          tokenId: index + 1
        }));
      }

      setTickets(ticketsData);
    } catch (error) {
      console.error('Error loading tickets:', error);
      // Fall back to dummy data on error
      setTickets(DUMMY_EVENTS.map((event, index) => ({
        ...event,
        tokenId: index + 1
      })));
    } finally {
      setLoading(false);
    }
  }, [marketplace, ticketNFT]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const buyTicket = async (tokenId: number, price: string) => {
    if (!marketplace) return;

    try {
      const tx = await marketplace.buyTicket(tokenId, {
        value: ethers.utils.parseEther(price),
      });
      await tx.wait();
      loadTickets();
    } catch (error) {
      console.error('Error buying ticket:', error);
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Tickets</h1>
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
                <p className="text-lg font-bold text-indigo-600">
                  {ticket.price} ETH
                </p>
              </div>
              <button
                onClick={() => buyTicket(ticket.tokenId!, ticket.price!)}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Buy Ticket
              </button>
            </div>
          </div>
        ))}
      </div>
      {tickets.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No tickets are currently available for sale.
        </p>
      )}
    </div>
  );
};

export default Home;
