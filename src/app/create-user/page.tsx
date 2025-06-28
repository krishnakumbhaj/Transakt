'use client';

import { useState } from 'react';

export default function CreateUserPage() {
  const [form, setForm] = useState({
    username: '',
    accountNumber: '',
    bankName: '',
    openingBalance: '',
    useOldBreakup: false,
  });

  const [initialTxns, setInitialTxns] = useState([
    { amount: '', from: '', note: '', belongsTo: '', date: '' }
  ]);

  const handleTxnChange = (index: number, key: string, value: string) => {
    const copy = [...initialTxns];
    (copy[index] as any)[key] = value;
    setInitialTxns(copy);
  };

  const addTxn = () => {
    setInitialTxns([
      ...initialTxns,
      { amount: '', from: '', note: '', belongsTo: '', date: '' },
    ]);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const body = {
      ...form,
      openingBalance: parseFloat(parseFloat(form.openingBalance).toFixed(2)), // 👈 ensure XXX.XX
      initialTransactions: form.useOldBreakup
        ? initialTxns.map(txn => ({
            ...txn,
            type: 'credit',
            id: '',
          }))
        : [],
    };

    const res = await fetch('/api/create-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    alert(result.message);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-white shadow-2xl rounded-2xl mt-12 border border-blue-100">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-700 tracking-tight">
        Create New User
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Name</label>
            <input
              className="w-full p-3 border border-blue-200 text-black rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              placeholder="Enter user name"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Account Number</label>
            <input
              className="w-full p-3 border border-blue-200 text-black rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              placeholder="Account Number"
              value={form.accountNumber}
              onChange={e => setForm({ ...form, accountNumber: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Bank Name</label>
            <input
              className="w-full p-3 border border-blue-200 text-black rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              placeholder="Bank Name"
              value={form.bankName}
              onChange={e => setForm({ ...form, bankName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Opening Balance</label>
            <input
              className="w-full p-3 border border-blue-200 text-black rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              type="number"
              step="0.01"
              placeholder="Opening Balance"
              value={form.openingBalance}
              onChange={e => setForm({ ...form, openingBalance: e.target.value })}
              required
            />
          </div>
        </div>

        <label className="flex items-center space-x-3 mt-2">
          <input
            type="checkbox"
            checked={form.useOldBreakup}
            onChange={e =>
              setForm({ ...form, useOldBreakup: e.target.checked })
            }
            className="accent-blue-600 w-5 h-5"
          />
          <span className="text-base text-blue-800 font-medium">
            Use Old Transaction Breakup
          </span>
        </label>

        {form.useOldBreakup && (
          <div className="space-y-6 mt-4">
            {initialTxns.map((txn, i) => (
              <div
                key={i}
                className="border border-blue-200 p-6 rounded-xl bg-blue-50 shadow-sm"
              >
                <h2 className="font-semibold mb-4 text-blue-700 text-lg flex items-center">
                  <span className="mr-2 bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs">{i + 1}</span>
                  Transaction
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-blue-900 mb-1">Amount</label>
                    <input
                      className="w-full p-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none"
                      placeholder="Amount"
                      value={txn.amount}
                      onChange={e => handleTxnChange(i, 'amount', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-blue-900 mb-1">From</label>
                    <input
                      className="w-full p-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none"
                      placeholder="From"
                      value={txn.from}
                      onChange={e => handleTxnChange(i, 'from', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-blue-900 mb-1">Note</label>
                    <input
                      className="w-full p-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none"
                      placeholder="Note"
                      value={txn.note}
                      onChange={e => handleTxnChange(i, 'note', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-blue-900 mb-1">Belongs To</label>
                    <input
                      className="w-full p-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none"
                      placeholder="Belongs To"
                      value={txn.belongsTo}
                      onChange={e => handleTxnChange(i, 'belongsTo', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-blue-900 mb-1">Date</label>
                    <input
                      className="w-full p-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none"
                      type="date"
                      value={txn.date}
                      onChange={e => handleTxnChange(i, 'date', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addTxn}
              className="flex items-center text-sm text-blue-700 font-semibold hover:underline mt-2"
            >
              <span className="text-xl mr-1">➕</span> Add Another Transaction
            </button>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-md hover:from-blue-700 hover:to-blue-600 transition"
        >
          Create User
        </button>
      </form>
    </div>
  );
}
