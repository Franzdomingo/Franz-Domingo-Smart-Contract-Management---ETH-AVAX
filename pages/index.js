import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [interestRate, setInterestRate] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [gasPrice, setGasPrice] = useState(undefined);
  const [transactionFees, setTransactionFees] = useState({});

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getGasPrice = async() => {
    if (ethWallet) {
      const provider = new ethers.providers.Web3Provider(ethWallet);
      const price = await provider.getGasPrice();
      setGasPrice(price);
    }
  }

  const estimateTransactionFee = async(type, amount) => {
    if (!atm || !gasPrice) return "0";
    
    try {
      const gasLimit = await atm.estimateGas[type](amount);
      const fee = gasLimit.mul(gasPrice);
      return ethers.utils.formatEther(fee);
    } catch (error) {
      console.error("Error estimating gas:", error);
      return "0";
    }
  }

  // Update transaction fees for all transactions
  const updateTransactionFees = async () => {
    const fees = {};
    for (let tx of transactions) {
      const fee = tx.txType === "Interest" ? 
        await estimateTransactionFee("calculateInterest", []) :
        await estimateTransactionFee(tx.txType.toLowerCase(), tx.amount);
      fees[tx.timestamp.toString()] = fee;
    }
    setTransactionFees(fees);
  };

  // Update fees when transactions or gas price changes
  useEffect(() => {
    if (transactions.length > 0 && atm) {
      updateTransactionFees();
    }
  }, [transactions, gasPrice]);

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log ("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    getATMContract();
    getGasPrice();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
 
    setATM(atmContract);
  }

  const updateData = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      const interestRate = await atm.getInterestRate();
      const txHistory = await atm.getTransactionHistory();
      
      setBalance(ethers.utils.formatEther(balance));
      setInterestRate(interestRate.toNumber());
      setTransactions(txHistory);
      getGasPrice();
    }
  }

  const calculateInterest = async() => {
    if (atm) {
      try {
        const estimatedFee = await estimateTransactionFee("calculateInterest", []);
        if (window.confirm(`Estimated transaction fee: ${estimatedFee} ETH. Continue?`)) {
          let tx = await atm.calculateInterest();
          await tx.wait();
          updateData();
        }
      } catch (error) {
        console.error("Error:", error);
        alert(error.message);
      }
    }
  }

  const deposit = async() => {
    if (atm && depositAmount) {
      try {
        const amount = ethers.utils.parseEther(depositAmount);
        const estimatedFee = await estimateTransactionFee("deposit", amount);
        if (window.confirm(`Estimated transaction fee: ${estimatedFee} ETH. Continue?`)) {
          let tx = await atm.deposit(amount);
          await tx.wait();
          setDepositAmount('');
          updateData();
        }
      } catch (error) {
        console.error("Error:", error);
        alert(error.message);
      }
    }
  }

  const withdraw = async() => {
    if (atm && withdrawAmount) {
      try {
        const amount = ethers.utils.parseEther(withdrawAmount);
        const estimatedFee = await estimateTransactionFee("withdraw", amount);
        if (window.confirm(`Estimated transaction fee: ${estimatedFee} ETH. Continue?`)) {
          let tx = await atm.withdraw(amount);
          await tx.wait();
          setWithdrawAmount('');
          updateData();
        }
      } catch (error) {
        console.error("Error:", error);
        alert(error.message);
      }
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  }

  const initUser = () => {
    if (!ethWallet) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-lg text-gray-600">Please install Metamask to use this ATM.</p>
        </div>
      );
    }

    if (!account) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <button 
            onClick={connectAccount}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Connect Metamask Wallet
          </button>
        </div>
      );
    }

    if (balance === undefined) {
      updateData();
    }

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <p className="text-sm text-gray-600 mb-2">Account: {account && `${account[0].substring(0, 6)}...${account[0].substring(38)}`}</p>
          <p className="text-2xl font-bold mb-2">Balance: {balance} ETH</p>
          <p className="text-sm text-gray-600 mb-4">Interest Rate: {interestRate/100}%</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex gap-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Amount to deposit"
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button 
                onClick={deposit}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Deposit
              </button>
            </div>
            
            <div className="flex gap-2">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Amount to withdraw"
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button 
                onClick={withdraw}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>
          
          <button 
            onClick={calculateInterest}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
          >
            Calculate Interest
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Transaction History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Balance</th>
                  <th className="text-left py-2">Est. Fee</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => {
                  const displayAmount = tx.txType === "Interest" ? 
                    `${ethers.utils.formatEther(tx.amount)} ETH (${((Number(ethers.utils.formatEther(tx.amount)) / Number(ethers.utils.formatEther(tx.balance))) * 100).toFixed(2)}%)` : 
                    `${ethers.utils.formatEther(tx.amount)} ETH`;
                  return (
                    <tr key={index} className="border-b">
                      <td className="py-2">{tx.txType}</td>
                      <td className="py-2">{displayAmount}</td>
                      <td className="py-2">{ethers.utils.formatEther(tx.balance)} ETH</td>
                      <td className="py-2">{transactionFees[tx.timestamp.toString()] || '0'} ETH</td>
                      <td className="py-2">{formatDate(tx.timestamp.toString())}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto py-6">
          <h1 className="text-2xl font-bold text-gray-900">Metacrafters ATM</h1>
        </div>
      </header>
      {initUser()}
    </main>
  );
}