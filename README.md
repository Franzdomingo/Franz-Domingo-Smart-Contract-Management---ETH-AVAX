# ETH ATM Smart Contract Application

A decentralized Ethereum ATM application built with Next.js, Hardhat, and Solidity that enables secure cryptocurrency transactions and earnings through a user-friendly interface.

## 🌟 Features

- Secure MetaMask wallet integration
- ETH deposits and withdrawals with real-time balance updates
- Comprehensive transaction history tracking
- Automated interest calculation and distribution
- Real-time gas fee estimation and optimization
- Responsive UI with dark/light mode support
- Role-based access control system

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Styling**: TailwindCSS with custom theme support
- **State Management**: React Context API
- **UI Components**: Shadcn/UI

### Smart Contract
- **Language**: Solidity ^0.8.20
- **Development**: Hardhat
- **Testing**: Chai & Mocha
- **Web3 Integration**: ethers.js v6
- **Wallet**: MetaMask

## 🚀 Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/eth-atm-dapp.git
   cd eth-atm-dapp
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Configure your environment variables
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Local Blockchain**
   ```bash
   npx hardhat node
   ```

5. **Deploy Smart Contract**
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

6. **Launch Development Server**
   ```bash
   npm run dev
   ```

   Access the application at `http://localhost:3000`

## 💡 Smart Contract Features

### Transaction Limits
- Maximum deposit: 100 ETH per transaction
- Maximum withdrawal: 50 ETH per transaction
- Daily transaction limit: 500 ETH

### Interest System
- Base annual interest rate: 5%
- Compound interest calculation
- Tiered interest rates based on deposit amount
- Weekly interest distribution

### Security Measures
- Reentrancy attack prevention
- Integer overflow protection
- Access control implementation
- Emergency pause functionality
- Rate limiting for transactions

## 🔐 Contract Deployment

### Initial Setup
- Contract deploys with 1 ETH initial liquidity
- Owner address set to deployer
- Default parameters configured


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This software is provided "as is", without warranty of any kind. Use at your own risk.