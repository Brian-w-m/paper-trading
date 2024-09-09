import React, { useState, useEffect } from 'react';
import * as Realm from "realm-web";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TradeStockPage = () => {
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [ownedStocks, setOwnedStocks] = useState([]);
  const navigate = useNavigate(); // Hook for navigation

  // Initialize MongoDB Realm app
  const REALM_APP_ID = "application-0-duvkpwv";  // Replace with your MongoDB Realm App ID
  const app = new Realm.App({ id: REALM_APP_ID });

  // Fetch stock price when the symbol changes with retry logic
  useEffect(() => {
    const fetchPrice = async () => {
      if (!symbol) {
        setPrice(null);
        setError('');
        return;
      }

      const retryFetch = async (retries = 3) => {
        try {
          const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
            params: {
              symbol: symbol,
              token: 'creimn1r01qnd5cvgq40creimn1r01qnd5cvgq4g', // Replace with your Finnhub API key
            },
          });

          if (response.data && response.data.c) {
            setPrice(response.data.c);
            setError('');
          } else if (retries > 0) {
            setError('Symbol not found. Retrying...');
            return await retryFetch(retries - 1);
          } else {
            setPrice(null);
            setError('Stock symbol not found after retries.');
          }
        } catch (error) {
          if (retries > 0) {
            setError('Network issue, retrying...');
            return await retryFetch(retries - 1);
          } else {
            setPrice(null);
            setError('Failed to fetch stock price. Please check your connection or stock symbol.');
          }
        }
      };

      retryFetch();
    };

    fetchPrice();
  }, [symbol]);

  // Update total price whenever price or shares change
  useEffect(() => {
    if (price && shares >= 0) {
      setTotalPrice(price * shares);
    } else {
      setTotalPrice(0);
    }
  }, [price, shares]);

  // Fetch all owned stocks when the component mounts or symbol changes
  useEffect(() => {
    const fetchOwnedStocks = async () => {
      try {
        const user = await app.logIn(Realm.Credentials.anonymous());
        const mongodb = app.currentUser.mongoClient("mongodb-atlas");
        const tradesCollection = mongodb.db("paper-trades").collection("trades");

        // Fetch all unique stock symbols from the trades collection
        const trades = await tradesCollection.find();
        const symbols = trades.map(trade => trade.symbol);

        setOwnedStocks(symbols);
      } catch (error) {
        setError("Failed to fetch owned stocks. " + error.message);
      }
    };

    fetchOwnedStocks();
  }, [symbol]);

  const handleTrade = async () => {
    if (!symbol || !price || shares <= 0) {
      setMessage('Please enter valid stock symbol, number of shares, and ensure the price is fetched.');
      return;
    }

    if (ownedStocks.includes(symbol)) {
      setMessage('You have already bought this stock. You cannot buy it again.');
      return;
    }

    try {
      // Log in anonymously to MongoDB Realm
      const user = await app.logIn(Realm.Credentials.anonymous());

      // Get a MongoDB client and access the collections
      const mongodb = app.currentUser.mongoClient("mongodb-atlas");
      const tradesCollection = mongodb.db("paper-trades").collection("trades");
      const usersCollection = mongodb.db("paper-trades").collection("users");

      // Insert the stock trade into the collection
      await tradesCollection.insertOne({
        symbol: symbol,
        shares: shares,
        price: price,
        totalPrice: totalPrice,
        tradeDate: new Date()
      });

      // Update or create user document
      const userDoc = await usersCollection.findOne({ _id: 'totalSpent' }); // Unique identifier for total spent document

      if (userDoc) {
        // Update existing document
        await usersCollection.updateOne(
          { _id: 'totalSpent' },
          { $inc: { totalSpent: totalPrice } }
        );
      } else {
        // Create new document
        await usersCollection.insertOne({
          _id: 'totalSpent',
          totalSpent: totalPrice
        });
      }

      setMessage(`Trade for ${shares} shares of ${symbol} at $${price} each recorded! Total price: $${totalPrice}`);
      setError('');
      
      // Update owned stocks state
      setOwnedStocks(prev => [...prev, symbol]);

    } catch (error) {
      setMessage("Failed to record trade. " + error.message);
    }
  };

  const handleSymbolChange = (e) => {
    // Convert input to uppercase
    setSymbol(e.target.value.toUpperCase());
  };

  const handleSharesChange = (e) => {
    const value = e.target.value;
    // Ensure shares cannot be negative
    setShares(value === '' ? '' : Math.max(Number(value), 0));
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white min-h-screen font-montserrat">
      {/* Header Section */}
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

      {/* Content Section */}
      <div className="flex flex-col items-center w-full max-w-md">
        {/* Top Layer: Buy Stocks */}
        <div className="w-full p-4">
          <h1 className="text-3xl font-bold mb-4">Buy Stocks</h1>
          <div className="flex flex-col">
            <label className="block mb-2">NASDAQ Code</label>
            <input
              type="text"
              value={symbol}
              onChange={handleSymbolChange}
              placeholder="MSFT"
              className="border p-2 rounded-lg w-full placeholder-gray-500"
            />
            <p className="text-gray-500 mt-1">Enter a symbol to get a quote.</p>
          </div>
        </div>

        {/* Bottom Layer: Quantity and Total Value */}
        <div className="w-full p-4">
          <div className="flex mb-4 space-x-4">
            <div className="flex-1">
              <label className="block mb-2">Quantity</label>
              <input
                type="number"
                value={shares}
                onChange={handleSharesChange}
                placeholder="150"
                className="border p-2 rounded-lg w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2">Total Value</label>
              <input
                type="text"
                value={`$${totalPrice.toFixed(2)}`}
                readOnly
                className="border p-2 rounded-lg w-full bg-gray-100 text-gray-700"
              />
            </div>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            onClick={handleTrade}
            className="bg-black text-white p-3 rounded-lg w-full mt-4"
          >
            Buy
          </button>
          {message && <p className="mt-4">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default TradeStockPage;
