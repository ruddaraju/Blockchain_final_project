// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DAOVoting
 * @dev A decentralized autonomous organization (DAO) voting smart contract
 * @notice This contract allows members to create proposals, vote on them, and execute them
 * 
 * Features:
 * - Member management (add/remove members)
 * - Proposal creation with voting period
 * - Voting with vote weights based on membership duration
 * - Proposal execution after voting period
 * - Quorum requirements for proposal validity
 */
contract DAOVoting is Ownable, ReentrancyGuard {
    // ============ Structs ============
    
    /**
     * @dev Represents a proposal in the DAO
     */
    struct Proposal {
        uint256 id;                    // Unique proposal ID
        address proposer;              // Address of the member who created the proposal
        string description;            // Description of the proposal
        uint256 voteStart;             // Timestamp when voting starts
        uint256 voteEnd;               // Timestamp when voting ends
        uint256 forVotes;              // Total votes in favor
        uint256 againstVotes;          // Total votes against
        bool executed;                 // Whether the proposal has been executed
        bool canceled;                 // Whether the proposal has been canceled
        mapping(address => bool) hasVoted; // Track who has voted
    }

    /**
     * @dev Represents a member of the DAO
     */
    struct Member {
        address memberAddress;        // Member's wallet address
        uint256 joinDate;              // Timestamp when member joined
        bool isActive;                 // Whether member is currently active
    }

    // ============ State Variables ============
    
    uint256 public constant VOTING_PERIOD = 7 days;  // Voting period duration
    uint256 public constant MIN_QUORUM = 3;          // Minimum number of votes required
    uint256 public constant MEMBERSHIP_REQUIREMENT = 1 days; // Minimum membership duration for voting
    
    uint256 public proposalCount;                     // Total number of proposals created
    uint256 public memberCount;                      // Total number of members
    
    mapping(uint256 => Proposal) public proposals;   // Mapping of proposal ID to Proposal
    mapping(address => Member) public members;       // Mapping of address to Member
    mapping(address => bool) public isMember;        // Quick check if address is a member
    
    address[] public memberList;                     // Array of all member addresses

    // ============ Events ============
    
    event MemberAdded(address indexed member, uint256 timestamp);
    event MemberRemoved(address indexed member, uint256 timestamp);
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description,
        uint256 voteStart,
        uint256 voteEnd
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);

    // ============ Modifiers ============
    
    /**
     * @dev Modifier to check if caller is a member
     */
    modifier onlyMember() {
        require(isMember[msg.sender], "DAOVoting: caller is not a member");
        _;
    }

    /**
     * @dev Modifier to check if proposal exists
     */
    modifier proposalExists(uint256 proposalId) {
        require(proposalId < proposalCount, "DAOVoting: proposal does not exist");
        _;
    }

    // ============ Constructor ============
    
    /**
     * @dev Constructor sets the deployer as the owner and first member
     */
    constructor() Ownable(msg.sender) {
        _addMember(msg.sender);
    }

    // ============ Member Management Functions ============
    
    /**
     * @dev Add a new member to the DAO (only owner can add members)
     * @param newMember Address of the new member to add
     */
    function addMember(address newMember) external onlyOwner {
        require(newMember != address(0), "DAOVoting: invalid address");
        require(!isMember[newMember], "DAOVoting: already a member");
        
        _addMember(newMember);
    }

    /**
     * @dev Internal function to add a member
     * @param newMember Address of the new member
     */
    function _addMember(address newMember) internal {
        isMember[newMember] = true;
        members[newMember] = Member({
            memberAddress: newMember,
            joinDate: block.timestamp,
            isActive: true
        });
        memberList.push(newMember);
        memberCount++;
        
        emit MemberAdded(newMember, block.timestamp);
    }

    /**
     * @dev Remove a member from the DAO (only owner can remove members)
     * @param memberToRemove Address of the member to remove
     */
    function removeMember(address memberToRemove) external onlyOwner {
        require(isMember[memberToRemove], "DAOVoting: not a member");
        
        isMember[memberToRemove] = false;
        members[memberToRemove].isActive = false;
        memberCount--;
        
        emit MemberRemoved(memberToRemove, block.timestamp);
    }

    // ============ Proposal Functions ============
    
    /**
     * @dev Create a new proposal
     * @param description Description of the proposal
     * @return proposalId The ID of the newly created proposal
     */
    function createProposal(string memory description) 
        external 
        onlyMember 
        returns (uint256 proposalId) 
    {
        require(bytes(description).length > 0, "DAOVoting: description cannot be empty");
        
        proposalId = proposalCount;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.description = description;
        proposal.voteStart = block.timestamp;
        proposal.voteEnd = block.timestamp + VOTING_PERIOD;
        proposal.executed = false;
        proposal.canceled = false;
        
        proposalCount++;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            description,
            proposal.voteStart,
            proposal.voteEnd
        );
        
        return proposalId;
    }

    /**
     * @dev Vote on a proposal
     * @param proposalId ID of the proposal to vote on
     * @param support true for yes, false for no
     */
    function vote(uint256 proposalId, bool support) 
        external 
        onlyMember 
        proposalExists(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp >= proposal.voteStart, "DAOVoting: voting has not started");
        require(block.timestamp <= proposal.voteEnd, "DAOVoting: voting has ended");
        require(!proposal.hasVoted[msg.sender], "DAOVoting: already voted");
        require(!proposal.executed, "DAOVoting: proposal already executed");
        require(!proposal.canceled, "DAOVoting: proposal canceled");
        
        // Calculate vote weight based on membership duration
        uint256 voteWeight = getVoteWeight(msg.sender);
        require(voteWeight > 0, "DAOVoting: insufficient membership duration");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.forVotes += voteWeight;
        } else {
            proposal.againstVotes += voteWeight;
        }
        
        emit VoteCast(proposalId, msg.sender, support, voteWeight);
    }

    /**
     * @dev Calculate vote weight based on membership duration
     * @param voter Address of the voter
     * @return weight The vote weight (minimum 1, increases with membership duration)
     */
    function getVoteWeight(address voter) public view returns (uint256 weight) {
        require(isMember[voter], "DAOVoting: not a member");
        
        Member memory member = members[voter];
        require(member.isActive, "DAOVoting: member is not active");
        
        uint256 membershipDuration = block.timestamp - member.joinDate;
        
        if (membershipDuration < MEMBERSHIP_REQUIREMENT) {
            return 0; // Not eligible to vote yet
        }
        
        // Base weight of 1, plus 1 for each additional week of membership (capped at 5)
        weight = 1 + (membershipDuration / 1 weeks);
        if (weight > 5) {
            weight = 5;
        }
        
        return weight;
    }

    /**
     * @dev Execute a proposal if it has passed
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) 
        external 
        onlyMember 
        proposalExists(proposalId) 
        nonReentrant 
    {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp > proposal.voteEnd, "DAOVoting: voting period has not ended");
        require(!proposal.executed, "DAOVoting: proposal already executed");
        require(!proposal.canceled, "DAOVoting: proposal canceled");
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        require(totalVotes >= MIN_QUORUM, "DAOVoting: quorum not met");
        require(proposal.forVotes > proposal.againstVotes, "DAOVoting: proposal did not pass");
        
        proposal.executed = true;
        
        emit ProposalExecuted(proposalId);
    }

    /**
     * @dev Cancel a proposal (only proposer or owner can cancel)
     * @param proposalId ID of the proposal to cancel
     */
    function cancelProposal(uint256 proposalId) 
        external 
        proposalExists(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "DAOVoting: not authorized to cancel"
        );
        require(!proposal.executed, "DAOVoting: proposal already executed");
        require(!proposal.canceled, "DAOVoting: proposal already canceled");
        
        proposal.canceled = true;
        
        emit ProposalCanceled(proposalId);
    }

    // ============ View Functions ============
    
    /**
     * @dev Get proposal details
     * @param proposalId ID of the proposal
     * @return proposer Address of the proposer
     * @return description Description of the proposal
     * @return voteStart Voting start timestamp
     * @return voteEnd Voting end timestamp
     * @return forVotes Total votes in favor
     * @return againstVotes Total votes against
     * @return executed Whether proposal is executed
     * @return canceled Whether proposal is canceled
     */
    function getProposal(uint256 proposalId)
        external
        view
        proposalExists(proposalId)
        returns (
            address proposer,
            string memory description,
            uint256 voteStart,
            uint256 voteEnd,
            uint256 forVotes,
            uint256 againstVotes,
            bool executed,
            bool canceled
        )
    {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.proposer,
            proposal.description,
            proposal.voteStart,
            proposal.voteEnd,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.executed,
            proposal.canceled
        );
    }

    /**
     * @dev Check if a user has voted on a proposal
     * @param proposalId ID of the proposal
     * @param voter Address of the voter
     * @return hasVoted Whether the voter has voted
     */
    function hasVoted(uint256 proposalId, address voter)
        external
        view
        proposalExists(proposalId)
        returns (bool hasVoted)
    {
        return proposals[proposalId].hasVoted[voter];
    }

    /**
     * @dev Get total number of active members
     * @return count Number of active members
     */
    function getActiveMemberCount() external view returns (uint256 count) {
        count = 0;
        for (uint256 i = 0; i < memberList.length; i++) {
            if (members[memberList[i]].isActive) {
                count++;
            }
        }
        return count;
    }
}

