'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Transaction {
  amount: number;
  from: string;
  note: string;
  belongsTo: string;
  date: string;
  type: 'credit' | 'debit';
}

export default function BelongsToTransactionsPage() {
  const { username, person } = useParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username || !person) return;

    fetch(`/api/${username}/transactions`)
      .then(res => res.json())
      .then(data => {
        const filtered = (data.transactions || []).filter(
          (txn: Transaction) => txn.belongsTo.trim().toLowerCase() === decodeURIComponent(Array.isArray(person) ? person[0] : person).toLowerCase()
        );
        setTransactions(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, [username, person]);

  const getTotalAmount = () => {
    let total = 0;
    transactions.forEach(txn => {
      if (txn.type === 'credit') total += txn.amount;
      else total -= txn.amount;
    });
    return total.toFixed(2);
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">
          Transactions with: <span className="text-black">{decodeURIComponent(person as string)}</span>
        </h1>

        <div className="mb-6">
          <p className="text-gray-600 font-medium">
            Total Net Amount: <span className={`font-bold ${parseFloat(getTotalAmount()) >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹ {getTotalAmount()}</span>
          </p>
        </div>

        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions found with this person.</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((txn, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl shadow border-l-8 ${
                  txn.type === 'credit' ? 'border-green-400 bg-green-50/50' : 'border-red-400 bg-red-50/50'
                }`}
              >
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-800">
                    ₹ {txn.amount.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 font-mono">{txn.date}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">From:</span> {txn.from}
                </p>
                {txn.note && (
                  <p className="text-sm italic text-gray-500">
                    <span className="not-italic font-medium">Note:</span> {txn.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
