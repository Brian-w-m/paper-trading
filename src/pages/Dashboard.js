import React, { useState, useEffect } from 'react';
import * as Realm from "realm-web";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import StockModal from './StockModal';
import '../index.css'; // Import your CSS file if using global styles

const Dashboard = () => {
  const [trades, setTrades] = useState([]);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalProfitLoss, setTotalProfitLoss] = useState(0);
  const [error, setError] = useState('');
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Initialize MongoDB Realm app
  const REALM_APP_ID = "application-0-duvkpwv";
  const app = new Realm.App({ id: REALM_APP_ID });

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const user = await app.logIn(Realm.Credentials.anonymous());
        const mongodb = app.currentUser.mongoClient("mongodb-atlas");
        const tradesCollection = mongodb.db("paper-trades").collection("trades");

        const tradesData = await tradesCollection.find();
        setTrades(tradesData);

        const totalSpentAmount = tradesData.reduce((acc, trade) => acc + trade.totalPrice, 0);
        setTotalSpent(totalSpentAmount);

        let totalValue = 0;
        let totalProfitLossAmount = 0;
        const updatedTrades = await Promise.all(
          tradesData.map(async (trade) => {
            try {
              const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
                params: {
                  symbol: trade.symbol,
                  token: 'creimn1r01qnd5cvgq40creimn1r01qnd5cvgq4g'
                }
              });

              if (response.data && response.data.c) {
                const currentPrice = response.data.c;
                const stockValue = currentPrice * trade.shares;
                const profitLoss = (currentPrice - trade.price) * trade.shares;
                totalValue += stockValue;
                totalProfitLossAmount += profitLoss;
                return { ...trade, currentPrice, profitLoss };
              } else {
                setError(`Failed to fetch price for ${trade.symbol}`);
                return { ...trade, currentPrice: null, profitLoss: 0 };
              }
            } catch (error) {
              setError(`Failed to fetch price for ${trade.symbol}. Error: ${error.message}`);
              return { ...trade, currentPrice: null, profitLoss: 0 };
            }
          })
        );

        setTrades(updatedTrades);
        setTotalPortfolioValue(totalValue);
        setTotalProfitLoss(totalProfitLossAmount);
      } catch (error) {
        setError('Failed to fetch trades. ' + error.message);
      }
    };

    fetchTrades();
  }, []);

  const recalculateTotals = async () => {
    try {
      const user = await app.logIn(Realm.Credentials.anonymous());
      const mongodb = app.currentUser.mongoClient("mongodb-atlas");
      const tradesCollection = mongodb.db("paper-trades").collection("trades");

      const tradesData = await tradesCollection.find();
      setTrades(tradesData);

      const totalSpentAmount = tradesData.reduce((acc, trade) => acc + trade.totalPrice, 0);
      setTotalSpent(totalSpentAmount);

      let totalValue = 0;
      let totalProfitLossAmount = 0;
      const updatedTrades = await Promise.all(
        tradesData.map(async (trade) => {
          try {
            const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
              params: {
                symbol: trade.symbol,
                token: 'creimn1r01qnd5cvgq40creimn1r01qnd5cvgq4g'
              }
            });

            if (response.data && response.data.c) {
              const currentPrice = response.data.c;
              const stockValue = currentPrice * trade.shares;
              const profitLoss = (currentPrice - trade.price) * trade.shares;
              totalValue += stockValue;
              totalProfitLossAmount += profitLoss;
              return { ...trade, currentPrice, profitLoss };
            } else {
              setError(`Failed to fetch price for ${trade.symbol}`);
              return { ...trade, currentPrice: null, profitLoss: 0 };
            }
          } catch (error) {
            setError(`Failed to fetch price for ${trade.symbol}. Error: ${error.message}`);
            return { ...trade, currentPrice: null, profitLoss: 0 };
          }
        })
      );

      setTrades(updatedTrades);
      setTotalPortfolioValue(totalValue);
      setTotalProfitLoss(totalProfitLossAmount);
    } catch (error) {
      setError('Failed to recalculate totals. ' + error.message);
    }
  };

  const handleSell = async (symbol, sharesToSell) => {
    try {
      const user = await app.logIn(Realm.Credentials.anonymous());
      const mongodb = app.currentUser.mongoClient("mongodb-atlas");
      const tradesCollection = mongodb.db("paper-trades").collection("trades");

      const trade = trades.find(t => t.symbol === symbol);

      if (!trade || sharesToSell > trade.shares) {
        setError(`Invalid number of shares to sell for ${symbol}.`);
        return;
      }

      if (sharesToSell === trade.shares) {
        await tradesCollection.deleteOne({ _id: trade._id });
        setTrades(trades.filter(t => t.symbol !== symbol));
      } else {
        const updatedShares = trade.shares - sharesToSell;
        await tradesCollection.updateOne(
          { _id: trade._id },
          { $set: { shares: updatedShares } }
        );

        setTrades(trades.map(t => t.symbol === symbol ? { ...t, shares: updatedShares } : t));
      }

      setError('');
      recalculateTotals();
    } catch (error) {
      setError('Failed to sell shares. ' + error.message);
    }
  };

  const openModal = (trade) => {
    setSelectedTrade(trade);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTrade(null);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white min-h-screen font-montserrat">
      <header className="relative w-full py-16">
        {/* Logo and MAC Text */}
        <div className="absolute left-[20%] top-6 flex items-center">
          <img src="/mac-logo.svg" alt="MAC Logo" className="w-8 h-8 mr-2" />
          <span className="text-black text-lg font-bold">MAC</span>
        </div>

        {/* Buttons */}
        <div className="absolute left-[70%] top-6 flex">
          <button
            onClick={() => navigate('/')}
            className="text-black text-lg font-bold mx-2"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/trade-stock')}
            className="text-black text-lg font-bold mx-2"
          >
            Buy
          </button>
        </div>
      </header>

      <div className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold mb-4 text-left">Dashboard</h1>
        <div className="flex justify-between space-x-4">
          <div className="bg-white p-4 rounded-xl border border-gray-300 w-1/2">
            <h2 className="text-lg text-gray-600 mb-2">Total Value</h2>
            <div className="flex items-center">
              <img src="/value-icon.svg" alt="Value Icon" className="w-6 h-6 mr-2" />
              <p className="font-semibold text-base text-gray-600">${totalPortfolioValue.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-300 w-1/2">
            <h2 className="text-lg text-gray-600 mb-2">Total Profit/Loss</h2>
            <div className="flex items-center">
              <img src="/profit-icon.svg" alt="Value Icon" className="w-6 h-6 mr-2" />
            <p className={`text-base ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalProfitLoss.toFixed(2)}
            </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md space-y-4">
          <h1 className="text-3xl font-bold mb-2 pt-8">Portfolio</h1>
          <p className="text-lg mb-4 text-left text-gray-600">Click on a stock to sell it!</p>
          {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
          <ul className="space-y-4">
            {trades.map((trade, index) => (
              <li
                key={index}
                onClick={() => openModal(trade)}
                className="p-4 bg-white rounded-lg border border-gray-300 shadow hover:bg-gray-200 cursor-pointer transition duration-200"
              >
                <div className="flex justify-between text-lg font-bold text-gray-600">
                  <span>{trade.symbol}</span>
                  <span>{trade.currentPrice ? `Current Price: $${trade.currentPrice.toFixed(2)}` : 'Current Price: N/A'}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>{trade.shares} units</span>
                  <span className={`${trade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Profit/Loss: ${trade.profitLoss?.toFixed(2) || 'N/A'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isModalOpen && (
        <StockModal
          isOpen={isModalOpen}
          onClose={closeModal}
          trade={selectedTrade}
          onSell={handleSell}
        />
      )}
    </div>
  );
};

export default Dashboard;
