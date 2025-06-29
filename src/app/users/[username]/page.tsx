'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useNavigation } from '../../NavigationLoaderProvider'; // Adjust path as necessary

interface Transaction {
  id?: string;
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
  // const router = useRouter();
     const { navigate } = useNavigation();
  

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [belongsToOptions, setBelongsToOptions] = useState<string[]>([]);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });


  const [form, setForm] = useState({
    amount: '',
    from: '',
    note: '',
    belongsTo: '',
    date: '',
    type: 'credit' as 'credit' | 'debit',
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderSticky(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
 const showNotification = (type: string, message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 5000);
  };
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
  if (!user) return '0.00';

  let balance = Number(user.currentBalance) || 0;

  transactions.forEach(txn => {
    const amount = Number(txn.amount) || 0;
    balance += txn.type === 'credit' ? amount : -amount;
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
    if (res.ok) {
      setTransactions(prev => [...prev, { ...body, id: data.id, date: form.date }]);
      showNotification('success', 'Transaction added successfully');
    } else {
      showNotification('error', data.message || 'Failed to add transaction');
    }
    setShowModal(false);
    setForm({ amount: '', from: '', note: '', belongsTo: '', date: '', type: 'credit' });
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      const res = await fetch(`/api/${username}/delete-transaction/${transactionToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      
      if (res.ok) {
        setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
        showNotification('success', 'Transaction deleted successfully');
        
      } else {
        showNotification('error', data.message || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('error', 'Failed to delete transaction');
    }

    setShowDeleteModal(false);
    setTransactionToDelete(null);
  };

  const openDeleteModal = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-200 rounded-full mb-4 animate-bounce"></div>
          <p className="text-lg text-gray-600">Loading your transactions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-4xl">❌</span>
          </div>
          <p className="text-xl text-red-600 font-semibold">User not found</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sticky Header */}
      <div className={`sticky top-0 z-40 transition-all duration-300 ${
        isHeaderSticky 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-blue-100' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto p-4">
          <div className={`transition-all duration-300 ${
            isHeaderSticky 
              ? 'flex items-center justify-between' 
              : 'hidden'
          }`}>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg">
                {user.name[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-sm text-gray-600">₹ {getCurrentBalance()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm font-semibold"
              >
                <span className="text-lg">➕</span>
                <span className="hidden sm:inline">Add</span>
              </button>
              <button
                onClick={() => navigate(`/users/${username}/belongs-to`)}
                className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm font-semibold"
              >
                <span>📋</span>
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Main Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
           <button
              onClick={() => navigate(`/users`)}
              className="group bg-white/80 backdrop-blur-lg hover:bg-white text-purple-700 hover:text-purple-800 w-12 h-12 rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 border border-purple-200"
              title="Back to Transactions"
            >
              <span className="text-xl group-hover:animate-bounce-x">←</span>
            </button>
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl w-20 h-20 flex items-center justify-center text-4xl font-bold shadow-2xl border-4 border-white animate-bounce-gentle">
              {user.name[0]}
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
                {user.name}
              </h1>
              <p className="text-gray-600 font-medium">Financial Dashboard</p>
            </div>
          </div>

          {/* Enhanced User Info Card */}
          <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Account Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 text-xl">🏦</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Account Number</p>
                    <p className="text-lg font-bold text-gray-800">{user.accountNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-green-600 text-xl">🏛️</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Bank</p>
                    <p className="text-lg font-bold text-gray-800">{user.bank}</p>
                  </div>
                </div>

                {user.createdAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-purple-600 text-xl">📅</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Member Since</p>
                      <p className="text-lg font-bold text-gray-800">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Balance & Actions */}
              <div className="flex flex-col justify-between">
                <div className="text-center lg:text-right mb-6">
                  <p className="text-gray-600 font-semibold mb-2">Current Balance</p>
                  <div className="relative">
                    <span className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent animate-pulse-gentle">
                      ₹ {getCurrentBalance()}
                    </span>
                    <div className="absolute -inset-2 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-2xl blur-xl animate-pulse"></div>
                  </div>
                </div>

                {/* Action Buttons - Redesigned for better mobile experience */}
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white px-3 py-2 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 group"
                  >
                    <span className="text-2xl group-hover:animate-bounce">➕</span>
                    Add Transaction
                  </button>

                  <button
                    onClick={() => navigate(`/users/${username}/belongs-to`)}
                    className="flex-1 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 text-white px-3 py-2 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 group"
                  >
                    <span className="text-2xl group-hover:animate-bounce">📋</span>
                    Belongs To List
                  </button>
                  <button
                    onClick={() => navigate(`/users/${username}/notes`)}
                    className="flex-1 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 text-white px-3 py-2 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 group"
                  >
                    <span className="text-2xl group-hover:animate-bounce">📋</span>
                    Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Transactions Section */}
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6 animate-float">
              <span className="text-6xl">💳</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Transactions Yet</h3>
            <p className="text-gray-500 text-center max-w-md mb-8">
              Start tracking your finances by adding your first transaction. It's quick and easy!
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 font-bold flex items-center gap-3"
            >
              <span className="text-xl">➕</span>
              Add Your First Transaction
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Recent Transactions</h2>
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                {transactions.length} total
              </span>
            </div>

            {transactions.map((txn, idx) => (
              <div
                key={idx}
                className={`group relative p-6 rounded-2xl shadow-lg border-l-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-slide-up ${
                  txn.type === 'credit' 
                    ? 'border-green-500 bg-gradient-to-r from-green-50/80 to-emerald-50/80 hover:from-green-50 hover:to-emerald-50' 
                    : 'border-red-500 bg-gradient-to-r from-red-50/80 to-rose-50/80 hover:from-red-50 hover:to-rose-50'
                } backdrop-blur-lg border border-white/50`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Delete Button */}
                <button
                  onClick={() => openDeleteModal(txn)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg"
                  title="Delete Transaction"
                >
                  🗑️
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg ${
                      txn.type === 'credit' 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
                        : 'bg-gradient-to-br from-red-500 to-rose-600 text-white'
                    }`}>
                      {txn.type === 'credit' ? '↗️' : '↙️'}
                    </div>
                    
                    <div>
                     <div className="flex items-center gap-3 mb-2">
  <span
    className={`text-2xl font-black ${
      txn.type === 'credit' ? 'text-green-700' : 'text-red-700'
    }`}
  >
    ₹ {Number(txn.amount).toFixed(2)}
  </span>
  <span
    className={`px-3 py-1 rounded-full text-xs font-bold ${
      txn.type === 'credit'
        ? 'bg-green-200 text-green-800'
        : 'bg-red-200 text-red-800'
    }`}
  >
    {txn.type.toUpperCase()}
  </span>
</div>

                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-semibold">From:</span>
                          <span className="bg-white/70 px-2 py-1 rounded-lg">{txn.from}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-semibold">Belong to:</span>
                          <span className="bg-white/70 px-2 py-1 rounded-lg">{txn.belongsTo}</span>
                        </div>
                        {txn.note && (
                          <div className="flex items-center gap-2 text-gray-600 italic">
                            <span className="font-semibold not-italic">Note:</span>
                            <span>{txn.note}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="bg-white/70 px-4 py-2 rounded-xl">
                      <span className="text-sm font-bold text-gray-600">{txn.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Add Transaction Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-3xl relative border-2 border-blue-100 animate-modal-slide-up max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-red-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-400 hover:text-red-500 transition-all duration-200 transform hover:scale-110"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💰</span>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                  Add Transaction
                </h2>
                <p className="text-gray-600 mt-2">Record your financial activity</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={e => setForm({ ...form, amount: e.target.value })}
                      required
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-black text-lg font-semibold transition-all duration-200"
                    />
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Type *</label>
                    <select
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value as 'credit' | 'debit' })}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-black text-lg font-semibold transition-all duration-200"
                    >
                      <option value="credit">💚 Credit</option>
                      <option value="debit">❤️ Debit</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">From</label>
                  <input
                    placeholder="Source of transaction"
                    value={form.from}
                    onChange={e => setForm({ ...form, from: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-black transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Belong to</label>
                  <input
                    list="belongsToSuggestions"
                    placeholder="Transaction Belong to"
                    value={form.belongsTo}
                    onChange={e => setForm({ ...form, belongsTo: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-black transition-all duration-200"
                  />
                  <datalist id="belongsToSuggestions">
                    {belongsToOptions.map((option, idx) => (
                      <option key={idx} value={option} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Note</label>
                  <textarea
                    placeholder="Additional details..."
                    value={form.note}
                    onChange={e => setForm({ ...form, note: e.target.value })}
                    rows={3}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-black transition-all duration-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-black transition-all duration-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span className="text-xl">💾</span>
                  Save Transaction
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && transactionToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-3xl relative animate-modal-slide-up">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">⚠️</span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Delete Transaction</h3>
                <p className="text-gray-600 mb-2">Are you sure you want to delete this transaction?</p>
                
                <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Amount:</span>
                    <span className={`font-bold ${transactionToDelete.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      ₹ {transactionToDelete.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">From:</span>
                    <span>{transactionToDelete.from}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Date:</span>
                    <span>{transactionToDelete.date}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteTransaction}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes modal-slide-up {
          from { 
            opacity: 0; 
            transform: translateY(50px) scale(0.9); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes pulse-gentle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out both;
        }
        
        .animate-modal-slide-up {
          animation: modal-slide-up 0.4s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}