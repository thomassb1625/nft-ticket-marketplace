export interface Ticket {
  tokenId?: number;
  artist: string;
  eventDate: Date;
  venue: string;
  section: string;
  seatNumber: number;
  isUsed?: boolean;
  isListed?: boolean;
  price?: string;
  seller?: string;
  imageUrl: string;
}

export const DUMMY_EVENTS: Omit<Ticket, 'tokenId'>[] = [
  {
    artist: "Taylor Swift",
    eventDate: new Date('2024-12-31T19:00:00'),
    venue: "Madison Square Garden",
    section: "Floor",
    seatNumber: 1,
    price: "0.5",
    seller: "0x1234567890123456789012345678901234567890",
    imageUrl: "/images/artists/taylor-swift.jpg"
  },
  {
    artist: "Ed Sheeran",
    eventDate: new Date('2024-12-28T20:00:00'),
    venue: "Barclays Center",
    section: "100",
    seatNumber: 15,
    price: "0.3",
    seller: "0x1234567890123456789012345678901234567890",
    imageUrl: "/images/artists/ed-sheeran.jpg"
  },
  {
    artist: "The Weeknd",
    eventDate: new Date('2024-12-30T21:00:00'),
    venue: "MetLife Stadium",
    section: "200",
    seatNumber: 22,
    price: "0.4",
    seller: "0x1234567890123456789012345678901234567890",
    imageUrl: "/images/artists/the-weeknd.jpg"
  }
];

export const DUMMY_MY_TICKETS: Omit<Ticket, 'tokenId'>[] = [
  {
    artist: "Beyoncé",
    eventDate: new Date('2024-12-29T20:00:00'),
    venue: "Yankee Stadium",
    section: "100",
    seatNumber: 5,
    isUsed: false,
    isListed: true,
    price: "0.8",
    imageUrl: "/images/artists/beyonce.jpg"
  },
  {
    artist: "Drake",
    eventDate: new Date('2024-12-27T21:00:00'),
    venue: "Prudential Center",
    section: "Floor",
    seatNumber: 12,
    isUsed: false,
    isListed: false,
    imageUrl: "/images/artists/drake.jpg"
  },
  {
    artist: "Bad Bunny",
    eventDate: new Date('2024-12-26T19:30:00'),
    venue: "Citi Field",
    section: "200",
    seatNumber: 8,
    isUsed: true,
    isListed: false,
    imageUrl: "/images/artists/bad-bunny.jpg"
  }
];
