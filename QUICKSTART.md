# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment
Create a `.env` file:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Step 3: Compile Contract
```bash
npm run compile
```

### Step 4: Run Tests
```bash
npm test
```

### Step 5: Deploy to Sepolia
```bash
npm run deploy:sepolia
```

**Save the contract address and transaction hash!**

### Step 6: Set Up Front-End
```bash
cd frontend
npm install
```

Update `frontend/src/App.jsx` with your contract address:
```javascript
const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS'
```

### Step 7: Run Front-End
```bash
npm run dev
```

## 📝 Important Notes

1. **OpenZeppelin Import**: If you get import errors, the ReentrancyGuard path might need adjustment:
   - Try: `@openzeppelin/contracts/utils/ReentrancyGuard.sol`
   - Or: `@openzeppelin/contracts/security/ReentrancyGuard.sol`
   - Or downgrade to OpenZeppelin v4: `npm install @openzeppelin/contracts@^4.9.0`

2. **Contract Address**: After deployment, update the front-end with your contract address

3. **Adding Members**: Use the `addInitialMembers.js` script or call `addMember()` directly from the owner account

4. **Testing**: All tests should pass. If time-travel tests fail, ensure you have the latest Hardhat version

