import React, { useState, useEffect } from 'react';
import { Modal, Input, InputNumber, Button, notification } from 'antd';
import axios from 'axios';

const StockModal = ({ visible, onClose, userId }) => {
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState(0);
  const [action, setAction] = useState('buy');
  const [stockPrice, setStockPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (symbol) {
      const fetchStockPrice = async () => {
        try {
          const response = await axios.get(`/stock/${symbol}`);
          const price = response.data.c;
          setStockPrice(price);
          setTotalPrice(price * shares);
        } catch (error) {
          notification.error({ message: 'Failed to fetch stock price' });
        }
      };
      fetchStockPrice();
    }
  }, [symbol, shares]);

  const handleTrade = async () => {
    try {
      const response = await axios.post('/trade', {
        user_id: userId,
        symbol,
        shares,
        action
      });
      notification.success({ message: response.data.message });
      onClose();
    } catch (error) {
      notification.error({ message: 'Trade failed', description: error.response.data.error });
    }
  };

  return (
    <Modal title="Trade Stock" visible={visible} onCancel={onClose} footer={null}>
      <div>
        <label>Stock Symbol (e.g., AAPL):</label>
        <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
      </div>
      <div>
        <label>Shares to trade:</label>
        <InputNumber min={1} value={shares} onChange={(value) => setShares(value)} />
      </div>
      <div>
        <label>Action:</label>
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </div>
      <div>
        <label>Stock Price:</label>
        <p>${stockPrice.toFixed(2)}</p>
      </div>
      <div>
        <label>Total Price:</label>
        <p>${totalPrice.toFixed(2)}</p>
      </div>
      <Button type="primary" onClick={handleTrade}>Submit Trade</Button>
    </Modal>
  );
};

export default StockModal;
