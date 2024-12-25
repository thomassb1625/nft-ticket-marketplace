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
  price: string;
  seller: string;
}

const Home: React.FC = () => {
  const { marketplace, ticketNFT } = useWeb3();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, [marketplace, ticketNFT]);

  const loadTickets = async () => {
    if (!marketplace || !ticketNFT) return;

    try {
      // This is a simplified example - you'll need to implement proper event listening
      // and filtering based on your smart contract implementation
      const filter = marketplace.filters.TicketListed();
      const events = await marketplace.queryFilter(filter);
      
      const ticketsData = await Promise.all(
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
          };
        })
      );

      setTickets(ticketsData.filter((ticket) => ticket.price !== '0'));
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

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
                <p className="text-lg font-bold text-indigo-600">
                  {ticket.price} ETH
                </p>
              </div>
              <button
                onClick={() => buyTicket(ticket.tokenId, ticket.price)}
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
