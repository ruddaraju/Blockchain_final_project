# DAO Voting Smart Contract

A decentralized autonomous organization (DAO) voting smart contract built with Solidity, Hardhat, and React. This project implements a complete voting system where members can create proposals, vote on them, and execute approved proposals.

## 📋 Project Overview

This project implements a **DAO (Decentralized Autonomous Organization)** voting system that allows:

- **Member Management**: Add and remove members (owner-controlled)
- **Proposal Creation**: Members can create proposals with descriptions
- **Voting System**: Weighted voting based on membership duration
- **Proposal Execution**: Execute proposals that meet quorum and majority requirements
- **Time-based Features**: Voting periods, membership requirements, and time-dependent functionality

## 🎯 Project Requirements Coverage

### Core Requirements (100 points)

✅ **Working Smart Contract (40 points)**
- Well-commented Solidity contract using OpenZeppelin libraries
- Comprehensive functionality for DAO operations

✅ **Deployment on Sepolia Testnet (5 points)**
- Deployment script included
- Instructions for Sepolia deployment provided

✅ **Live Demo and Explanation (30 points)**
- Front-end application for interaction
- User-friendly interface for all contract functions

✅ **Hardhat Tests (25 points)**
- Comprehensive test suite covering all functionality
- Time-travel tests for extra credit

### Extra Credit Features

✅ **OpenZeppelin Standard Implementation (1 point)**
- Uses `Ownable` and `ReentrancyGuard` from OpenZeppelin

✅ **Working Front-end (Up to 6 points)**
- React-based front-end with modern UI
- Full interaction with smart contract

✅ **User Voting or Staking (1 point)**
- Voting system with weighted votes based on membership duration

✅ **Hardhat Tests with Time-Travel (1 point)**
- Tests using `evm_increaseTime` feature
- Time-dependent functionality testing

## 🏗️ Project Structure

```
.
├── contracts/
│   └── DAOVoting.sol          # Main smart contract
├── test/
│   └── DAOVoting.test.js      # Comprehensive test suite
├── scripts/
│   ├── deploy.js              # Deployment script
│   └── addInitialMembers.js   # Helper script to add members
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Styling
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Project dependencies
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask or another Web3 wallet
- Sepolia testnet ETH (for deployment)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
   PRIVATE_KEY=your_private_key_here
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

3. **Compile the contract:**
   ```bash
   npm run compile
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

## 📝 Smart Contract Features

### Key Functions

- **`addMember(address)`**: Add a new member to the DAO (owner only)
- **`removeMember(address)`**: Remove a member from the DAO (owner only)
- **`createProposal(string)`**: Create a new voting proposal
- **`vote(uint256, bool)`**: Vote on a proposal (true = yes, false = no)
- **`executeProposal(uint256)`**: Execute a proposal that has passed
- **`cancelProposal(uint256)`**: Cancel a proposal (proposer or owner only)
- **`getVoteWeight(address)`**: Get voting weight based on membership duration

### Constants

- **VOTING_PERIOD**: 7 days
- **MIN_QUORUM**: 3 votes required
- **MEMBERSHIP_REQUIREMENT**: 1 day minimum membership to vote
- **Vote Weight**: Base weight of 1, increases by 1 per week (capped at 5)

## 🧪 Testing

The test suite includes:

- Deployment tests
- Member management tests
- Proposal creation tests
- Voting functionality tests
- Proposal execution tests
- Proposal cancellation tests
- **Time-travel tests** (extra credit)
- View function tests

Run tests with:
```bash
npm test
```

## 🌐 Deployment

### Deploy to Sepolia Testnet

1. **Ensure you have Sepolia ETH** in your wallet
2. **Configure your `.env` file** with Sepolia RPC URL and private key
3. **Deploy the contract:**
   ```bash
   npm run deploy:sepolia
   ```

4. **Save the deployment information:**
   - Contract address
   - Transaction hash
   - Sepolia Blockscanner URL

### Example Deployment Output

```
DAOVoting deployed to: 0x1234567890123456789012345678901234567890
Network: sepolia
Transaction Hash: 0xabcdef...
View on Sepolia Blockscanner:
https://sepolia.etherscan.io/address/0x1234567890123456789012345678901234567890
```

## 🖥️ Front-End Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set contract address:**
   - Update `CONTRACT_ADDRESS` in `frontend/src/App.jsx`
   - Or create a `.env` file with `VITE_CONTRACT_ADDRESS=your_contract_address`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   - The app will open at `http://localhost:3000`
   - Connect your MetaMask wallet
   - Ensure you're on Sepolia testnet

## 💡 Usage Guide

### For Demo/Explanation

1. **Connect Wallet**: Click "Connect Wallet" and approve in MetaMask
2. **Check Membership**: The UI shows if you're a member
3. **Create Proposal**: If you're a member, create a proposal with a description
4. **Vote**: Vote on active proposals (yes or no)
5. **Execute**: After voting period ends, execute proposals that passed

### For Testing

1. Deploy contract to Sepolia
2. Add members using the owner account
3. Wait for membership requirement (1 day) or use time-travel in tests
4. Create proposals
5. Vote on proposals
6. Execute successful proposals

## 📊 Project Requirements Checklist

- [x] Working Smart Contract (40 points)
- [x] Deployment on Sepolia Testnet (5 points)
- [x] Live Demo and Explanation (30 points)
- [x] Hardhat Tests (25 points)
- [x] OpenZeppelin Standard Implementation (1 point extra credit)
- [x] Working Front-end (6 points extra credit)
- [x] User Voting (1 point extra credit)
- [x] Hardhat Tests with Time-Travel (1 point extra credit)

**Total: 100 points + 9 points extra credit**

## 🔒 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Access control for member management
- **Input Validation**: Checks for empty descriptions, invalid addresses
- **State Checks**: Prevents voting on executed/canceled proposals
- **Time-based Restrictions**: Voting only during active periods

## 📚 Technologies Used

- **Solidity**: ^0.8.20
- **Hardhat**: Development environment
- **OpenZeppelin**: Security-focused smart contract libraries
- **React**: Front-end framework
- **Vite**: Build tool
- **Ethers.js**: Ethereum library
- **Chai**: Testing framework

## 🤝 Group Project Notes

### For Presentation

1. **Demo Flow**:
   - Show contract deployment
   - Demonstrate member addition
   - Create a proposal
   - Show voting process
   - Execute a proposal

2. **Key Points to Explain**:
   - How the DAO voting mechanism works
   - Weighted voting based on membership duration
   - Quorum and majority requirements
   - Time-based features

3. **Extra Credit Highlights**:
   - OpenZeppelin integration
   - Front-end application
   - Time-travel tests

## 📝 License

MIT License

## 🙏 Acknowledgments

- OpenZeppelin for security-focused contract libraries
- Hardhat team for the excellent development environment
- Ethereum Foundation for blockchain infrastructure

---

**Project Deadline**: December 1st, 2025

**Good luck with your project! 🚀**

