# NFT Ticket Marketplace

A decentralized marketplace for event tickets powered by NFTs. This platform enables event organizers to mint tickets as NFTs and allows users to buy, sell, and trade event tickets securely on the blockchain.

## Features

- Mint NFT tickets with event-specific metadata (artist, date, venue, section, seat)
- List tickets for sale
- Purchase tickets directly from organizers or secondary market
- View owned tickets and transaction history
- Smart contract-powered secure transactions

## Tech Stack

- Frontend: React.js, ethers.js, TailwindCSS
- Smart Contracts: Solidity, Foundry
- Testing: Foundry Test Suite
- Development: Solidity, TypeScript

## Project Structure

```
nft-ticket-marketplace/
├── frontend/           # React frontend application
├── contracts/         # Foundry project directory
│   ├── src/          # Smart contract source files
│   ├── test/         # Contract test files
│   ├── script/       # Deployment scripts
│   └── lib/          # Dependencies
└── README.md
```

## Smart Contract Development

### Prerequisites

First, install Foundry:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Build

```bash
cd contracts
forge build
```

### Test

```bash
cd contracts
forge test
```

### Deploy

```bash
cd contracts
forge script script/Deploy.s.sol:DeployScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

## Frontend Development

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start local Anvil node:
```bash
anvil
```

3. Deploy contracts to local network:
```bash
cd contracts
forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --broadcast
```

4. Start frontend:
```bash
cd frontend
npm start
```

## Smart Contract Architecture

The project consists of the following main contracts:
- `TicketNFT.sol`: ERC721 implementation for ticket NFTs
- `TicketMarketplace.sol`: Handles listing, buying, and selling of tickets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
