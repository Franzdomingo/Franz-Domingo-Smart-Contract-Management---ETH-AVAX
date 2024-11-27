// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

/**
 * @title Assessment Smart Contract
 * @dev Implements a basic banking system with interest calculations
 * @notice This contract allows deposits, withdrawals, and interest accrual
 */
contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint256 public interestRate; // Annual interest rate in basis points (1% = 100)
    uint256 public lastInterestCalculation;
    uint256 public constant MAX_WITHDRAWAL = 50 ether;
    uint256 public constant MAX_DEPOSIT = 100 ether;
    
    struct Transaction {
        uint256 amount;
        uint256 timestamp;
        string txType;
        uint256 balance;
    }
    
    Transaction[] public transactions;
    
    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event InterestAccrued(uint256 amount);

    /**
     * @dev Contract constructor
     * @param initBalance Initial balance to set
     */
    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        interestRate = 500; // 5% annual interest rate
        lastInterestCalculation = block.timestamp;
    }

    /**
     * @dev Returns current balance
     * @return uint256 Current balance
     */
    function getBalance() public view returns(uint256) {
        return balance;
    }

    /**
     * @dev Returns current interest rate
     * @return uint256 Interest rate in basis points
     */
    function getInterestRate() public view returns(uint256) {
        return interestRate;
    }

    /**
     * @dev Returns all transactions
     * @return Transaction[] Array of all transactions
     */
    function getTransactionHistory() public view returns(Transaction[] memory) {
        return transactions;
    }

    /**
     * @dev Sets new interest rate
     * @param newRate New interest rate in basis points
     */
    function setInterestRate(uint256 newRate) public {
        require(msg.sender == owner, "Only owner can set interest rate");
        require(newRate <= 1000, "Interest rate cannot exceed 10%");
        interestRate = newRate;
    }

    /**
     * @dev Calculates and adds interest to balance
     * @return uint256 Amount of interest accrued
     */
    function calculateInterest() public returns(uint256) {
        require(msg.sender == owner, "Only owner can calculate interest");
        
        uint256 timeElapsed = block.timestamp - lastInterestCalculation;
        uint256 yearInSeconds = 365 days;
        
        if (timeElapsed < 1 days) {
            return 0;
        }
        
        uint256 interest = (balance * interestRate * timeElapsed) / (yearInSeconds * 10000);
        
        if (interest > 0) {
            balance += interest;
            lastInterestCalculation = block.timestamp;
            emit InterestAccrued(interest);
            
            transactions.push(Transaction({
                amount: interest,
                timestamp: block.timestamp,
                txType: "Interest",
                balance: balance
            }));
        }
        
        return interest;
    }

    /**
     * @dev Deposits amount to balance
     * @param _amount Amount to deposit
     */
    function deposit(uint256 _amount) public payable {
        require(msg.sender == owner, "You are not the owner of this account");
        require(_amount <= MAX_DEPOSIT, "Amount exceeds maximum deposit limit");
        require(balance + _amount <= MAX_DEPOSIT, "Total balance would exceed maximum limit");
        
        uint _previousBalance = balance;
        balance += _amount;
        assert(balance == _previousBalance + _amount);
        
        transactions.push(Transaction({
            amount: _amount,
            timestamp: block.timestamp,
            txType: "Deposit",
            balance: balance
        }));
        
        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    /**
     * @dev Withdraws amount from balance
     * @param _withdrawAmount Amount to withdraw
     */
    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(_withdrawAmount <= MAX_WITHDRAWAL, "Amount exceeds maximum withdrawal limit");
        
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }
        
        balance -= _withdrawAmount;
        assert(balance == (_previousBalance - _withdrawAmount));
        
        transactions.push(Transaction({
            amount: _withdrawAmount,
            timestamp: block.timestamp,
            txType: "Withdrawal",
            balance: balance
        }));
        
        emit Withdraw(_withdrawAmount);
    }
}