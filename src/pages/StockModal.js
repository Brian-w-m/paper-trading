import React, { useState } from 'react';

const StockModal = ({ trade, isOpen, onClose, onSell }) => {
  const [sharesToSell, setSharesToSell] = useState('');

  if (!isOpen) return null;

  const handleSellClick = () => {
    const shares = parseInt(sharesToSell, 10);

    if (trade && shares && shares > 0 && shares <= trade.shares) {
      onSell(trade.symbol, shares);
      setSharesToSell(''); // Clear the input field after selling
      onClose();
    } else {
      // Optional: Display an error message if shares input is invalid
      alert('Please enter a valid number of shares to sell.');
    }
  };

  // Safely handle undefined values
  const currentPrice = trade?.currentPrice?.toFixed(2) || 'N/A';
  const sharesOwned = trade?.shares || 'N/A';

  return (
    <div className="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-lg border border-gray-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-6 text-gray-400 hover:text-gray-600 text-4xl"
        >
          &times;
        </button>
        
        <h2 className="text-2xl font-bold mb-4">Sell {trade?.symbol}</h2>
        <p className="text-gray-500 text-sm mb-6">How many units would you like to sell?</p>
        <input
          type="number"
          value={sharesToSell}
          onChange={(e) => setSharesToSell(e.target.value)}
          placeholder="1"
          min="1"
          max={trade?.shares || 0}
          className="border border-gray-300 rounded-lg p-2 w-5/6 mb-4 text-left text-lg"
        />
        <p className="text-gray-500 text-sm mb-4">
          You bought {sharesOwned} units at ${trade?.price} USD
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-white text-black border border-black rounded-lg px-4 py-2 mr-2 hover:bg-gray-100 font-semibold w-24"
          >
            Cancel
          </button>
          <button
            onClick={handleSellClick}
            className="bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 w-24"
          >
            Sell
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockModal;
