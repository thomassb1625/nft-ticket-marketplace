// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TicketNFT.sol";

contract TicketMarketplace is ReentrancyGuard, Ownable {
    struct Listing {
        address seller;
        uint256 price;
        bool isActive;
    }

    TicketNFT public ticketNFT;
    mapping(uint256 => Listing) public listings;
    uint256 public platformFee = 25; // 2.5% fee (in basis points)

    event TicketListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event TicketSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ListingCanceled(uint256 indexed tokenId, address indexed seller);

    constructor(address _ticketNFT) {
        ticketNFT = TicketNFT(_ticketNFT);
    }

    function listTicket(uint256 tokenId, uint256 price) external {
        require(ticketNFT.ownerOf(tokenId) == msg.sender, "Not ticket owner");
        require(ticketNFT.getApproved(tokenId) == address(this), "Marketplace not approved");
        require(price > 0, "Price must be greater than zero");

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            isActive: true
        });

        emit TicketListed(tokenId, msg.sender, price);
    }

    function buyTicket(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.isActive, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");

        uint256 fee = (listing.price * platformFee) / 1000;
        uint256 sellerAmount = listing.price - fee;

        listings[tokenId].isActive = false;
        
        // Transfer NFT to buyer
        ticketNFT.transferFrom(listing.seller, msg.sender, tokenId);
        
        // Transfer funds to seller
        payable(listing.seller).transfer(sellerAmount);
        
        // Transfer fee to contract owner
        payable(owner()).transfer(fee);

        // Refund excess payment
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }

        emit TicketSold(tokenId, listing.seller, msg.sender, listing.price);
    }

    function cancelListing(uint256 tokenId) external {
        require(listings[tokenId].seller == msg.sender, "Not the seller");
        require(listings[tokenId].isActive, "Listing not active");

        listings[tokenId].isActive = false;
        emit ListingCanceled(tokenId, msg.sender);
    }

    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 100, "Fee too high"); // Max 10%
        platformFee = _fee;
    }

    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
    }
}
