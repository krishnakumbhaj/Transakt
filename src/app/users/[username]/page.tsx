'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Transaction {
  id: string;
  amount: number;
  from: string;
  note: string;
  belongsTo: string;
  date: string;
  type: 'credit' | 'debit';
}

interface UserDetails {
  name: string;
  accountNumber: string;
  bank: string;
  currentBalance: number;
  createdAt?: string;
}

export default function UserTransactionsPage() {
  const { username } = useParams();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [belongsToOptions, setBelongsToOptions] = useState<string[]>([]);

  const [form, setForm] = useState({
    amount: '',
    from: '',
    note: '',
    belongsTo: '',
    date: '',
    type: 'credit',
  });

  useEffect(() => {
    if (!username) return;

    fetch(`/api/${username}/transactions`)
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || []);
        setUser(data.user || null);

        const uniqueBelongs = Array.from(
          new Set(
            data.transactions
              .map((txn: Transaction) => txn.belongsTo.trim())
              .filter(Boolean)
          )
        ) as string[];
        setBelongsToOptions(uniqueBelongs);

        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, [username, showModal]);

  const getCurrentBalance = () => {
    if (!user) return 0;
    let balance = user.currentBalance || 0;

    transactions.forEach(txn => {
      if (txn.type === 'credit') {
        balance += txn.amount;
      } else {
        balance -= txn.amount;
      }
    });

    return balance.toFixed(2);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const body = {
      ...form,
      amount: parseFloat(form.amount),
      type: form.type,
    };

    const res = await fetch(`/api/${username}/add-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    alert(data.message);
    setShowModal(false);
    setForm({ amount: '', from: '', note: '', belongsTo: '', date: '', type: 'credit' });
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Are you sure you want to delete this transaction?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/${username}/delete-transaction/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();

      if (res.ok) {
        alert(result.message);
        setTransactions(prev => prev.filter(txn => txn.id !== id));
      } else {
        alert(result.message || 'Failed to delete transaction');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('An error occurred while deleting.');
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user) return <p className="p-6 text-red-600">User not found</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-800">{user.name}</h1>
            <p className="text-gray-600 text-sm">Account: {user.accountNumber} | Bank: {user.bank}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Balance</p>
            <h2 className="text-2xl font-bold text-green-600">₹ {getCurrentBalance()}</h2>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-1 rounded"
              >
                ➕ Add
              </button>
              <button
                onClick={() => router.push(`/users/${username}/belongs-to`)}
                className="bg-purple-600 text-white px-4 py-1 rounded"
              >
                📋 Belongs To
              </button>
            </div>
          </div>
        </div>

        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions found.</p>
        ) : (
          <div className="space-y-4">
            {transactions.map(txn => (
              <div
                key={txn.id}
                className={`p-4 rounded-xl shadow border-l-8 ${
                  txn.type === 'credit' ? 'border-green-400 bg-green-50/50' : 'border-red-400 bg-red-50/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-xl text-gray-700">
                      ₹ {txn.amount.toFixed(2)}{' '}
                      <span
                        className={`ml-2 text-xs px-2 py-1 rounded-full ${
                          txn.type === 'credit'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {txn.type.toUpperCase()}
                      </span>
                    </h2>
                    <p className="text-sm text-gray-500 font-mono">{txn.date}</p>
                    <p className="text-sm mt-1 text-gray-700">
                      <span className="font-medium">From:</span> {txn.from} | <span className="font-medium">To:</span> {txn.belongsTo}
                    </p>
                    {txn.note && (
                      <p className="text-sm italic text-gray-500">Note: {txn.note}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(txn.id)}
                    className="text-sm text-red-600 border border-red-300 px-3 py-1 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Transaction Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl relative border-2 border-blue-100">
              <button
                className="absolute top-3 right-4 text-2xl font-bold text-gray-400 hover:text-red-500 transition"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Add Transaction</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    required
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <input
                    placeholder="From"
                    value={form.from}
                    onChange={e => setForm({ ...form, from: e.target.value })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <input
                    placeholder="Note"
                    value={form.note}
                    onChange={e => setForm({ ...form, note: e.target.value })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Belongs To</label>
                  <input
                    list="belongsToSuggestions"
                    placeholder="Belongs To"
                    value={form.belongsTo}
                    onChange={e => setForm({ ...form, belongsTo: e.target.value })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-black"
                  />
                  <datalist id="belongsToSuggestions">
                    {belongsToOptions.map((option, idx) => (
                      <option key={idx} value={option} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value as 'credit' | 'debit' })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-black"
                  >
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-500 transition mt-2"
                >
                  Save Transaction
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
