import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';

const ListTicket: React.FC = () => {
  const { ticketNFT, marketplace, account } = useWeb3();
  const [formData, setFormData] = useState({
    artist: '',
    eventDate: '',
    venue: '',
    section: '',
    seatNumber: '',
    price: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNFT || !marketplace || !account) return;

    try {
      setLoading(true);

      // Convert event date to timestamp
      const eventTimestamp = Math.floor(new Date(formData.eventDate).getTime() / 1000);

      // First mint the NFT
      const mintTx = await ticketNFT.mint(
        account,
        formData.artist,
        eventTimestamp,
        formData.venue,
        formData.section,
        formData.seatNumber,
        '' // Token URI - you might want to add IPFS metadata here
      );
      const mintReceipt = await mintTx.wait();

      // Get the token ID from the mint event
      const event = mintReceipt.events?.find((e: any) => e.event === 'Transfer');
      const tokenId = event?.args?.tokenId;

      // Approve marketplace to transfer the NFT
      const approveTx = await ticketNFT.approve(marketplace.address, tokenId);
      await approveTx.wait();

      // List the ticket for sale
      const listTx = await marketplace.listTicket(
        tokenId,
        ethers.utils.parseEther(formData.price)
      );
      await listTx.wait();

      // Reset form
      setFormData({
        artist: '',
        eventDate: '',
        venue: '',
        section: '',
        seatNumber: '',
        price: '',
      });

      alert('Ticket successfully listed!');
    } catch (error) {
      console.error('Error listing ticket:', error);
      alert('Error listing ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">List a New Ticket</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Artist</label>
          <input
            type="text"
            name="artist"
            value={formData.artist}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Event Date
          </label>
          <input
            type="datetime-local"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Venue</label>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Section
          </label>
          <input
            type="text"
            name="section"
            value={formData.section}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Seat Number
          </label>
          <input
            type="number"
            name="seatNumber"
            value={formData.seatNumber}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price (ETH)
          </label>
          <input
            type="number"
            step="0.01"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Processing...' : 'List Ticket'}
        </button>
      </form>
    </div>
  );
};

export default ListTicket;
