// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TicketNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct EventDetails {
        string artist;
        uint256 eventDate;
        string venue;
        string section;
        uint256 seatNumber;
        bool isUsed;
    }

    mapping(uint256 => EventDetails) public ticketDetails;
    
    constructor() ERC721("Event Ticket", "TCKT") {}

    function mint(
        address to,
        string memory artist,
        uint256 eventDate,
        string memory venue,
        string memory section,
        uint256 seatNumber,
        string memory uri
    ) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, uri);

        ticketDetails[newTokenId] = EventDetails(
            artist,
            eventDate,
            venue,
            section,
            seatNumber,
            false
        );

        return newTokenId;
    }

    function useTicket(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not ticket owner");
        require(!ticketDetails[tokenId].isUsed, "Ticket already used");
        
        ticketDetails[tokenId].isUsed = true;
    }

    function getTicketDetails(uint256 tokenId) external view returns (EventDetails memory) {
        return ticketDetails[tokenId];
    }

    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
