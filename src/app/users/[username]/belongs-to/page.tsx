'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useNavigation } from '../../../NavigationLoaderProvider'; // Adjust path as necessary

interface Transaction {
  id?: string;
  amount: number;
  from: string;
  note: string;
  belongsTo: string;
  date: string;
  type: 'credit' | 'debit';
}

interface BelongsToSummary {
  name: string;
  totalTransactions: number;
  totalCredit: number;
  totalDebit: number;
  netAmount: number;
  lastTransaction: string;
  transactions: Transaction[];
}

export default function BelongsToListPage() {
  const { username } = useParams();
  const { navigate } = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [belongsToSummaries, setBelongsToSummaries] = useState<BelongsToSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'transactions' | 'recent'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (!username) return;

    fetch(`/api/${username}/transactions`)
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || []);
        
        // Process belongs to summaries
        const belongsToMap = new Map<string, Transaction[]>();
        
        data.transactions?.forEach((txn: Transaction) => {
          const belongsTo = txn.belongsTo.trim();
          if (belongsTo) {
            if (!belongsToMap.has(belongsTo)) {
              belongsToMap.set(belongsTo, []);
            }
            belongsToMap.get(belongsTo)?.push(txn);
          }
        });

        const summaries: BelongsToSummary[] = Array.from(belongsToMap.entries()).map(([name, txns]) => {
          const totalCredit = txns.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
          const totalDebit = txns.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
          const netAmount = totalCredit - totalDebit;
          
          // Sort transactions by date to get the most recent
          const sortedTxns = [...txns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          return {
            name,
            totalTransactions: txns.length,
            totalCredit,
            totalDebit,
            netAmount,
            lastTransaction: sortedTxns[0]?.date || '',
            transactions: txns
          };
        });

        setBelongsToSummaries(summaries);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, [username]);

  const filteredAndSortedSummaries = belongsToSummaries
    .filter(summary => 
      summary.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'amount':
          aValue = Math.abs(a.netAmount);
          bValue = Math.abs(b.netAmount);
          break;
        case 'transactions':
          aValue = a.totalTransactions;
          bValue = b.totalTransactions;
          break;
        case 'recent':
          aValue = new Date(a.lastTransaction).getTime();
          bValue = new Date(b.lastTransaction).getTime();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const getTotalStats = () => {
    const totalCredit = belongsToSummaries.reduce((sum, s) => sum + s.totalCredit, 0);
    const totalDebit = belongsToSummaries.reduce((sum, s) => sum + s.totalDebit, 0);
    const totalTransactions = belongsToSummaries.reduce((sum, s) => sum + s.totalTransactions, 0);
    
    return { totalCredit, totalDebit, totalTransactions, netAmount: totalCredit - totalDebit };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 bg-purple-200 rounded-full mb-4 animate-bounce"></div>
          <p className="text-lg text-gray-600">Loading associate...</p>
        </div>
      </div>
    );
  }

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Enhanced Header with Back Button */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(`/users/${username}`)}
              className="group bg-white/80 backdrop-blur-lg hover:bg-white text-purple-700 hover:text-purple-800 w-12 h-12 rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 border border-purple-200"
              title="Back to Transactions"
            >
              <span className="text-xl group-hover:animate-bounce-x">←</span>
            </button>
            
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-800 via-pink-700 to-indigo-800 bg-clip-text text-transparent mb-2">
                Transaction associate
              </h1>
              <p className="text-gray-600 font-medium">Organize your finances by category</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-lg p-3 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-2xl">📊</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total associate</p>
                  <p className="text-2xl font-bold text-gray-800">{belongsToSummaries.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg p-3 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-2xl">💰</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalTransactions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg p-3 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-2xl">📈</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Credit</p>
                  <p className="text-2xl font-bold text-green-600">₹ {Number(stats.totalCredit).toFixed(2)}
</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg p-3 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-2xl">📉</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Debit</p>
                  <p className="text-2xl font-bold text-red-600">₹ {Number(stats.totalDebit).toFixed(2)}
</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-white/50 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xl">🔍</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Search associate..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 text-gray-800 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Sort Controls */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleSort('name')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                    sortBy === 'name'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                
                <button
                  onClick={() => handleSort('amount')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                    sortBy === 'amount'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                
                <button
                  onClick={() => handleSort('transactions')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                    sortBy === 'transactions'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Count {sortBy === 'transactions' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                
                <button
                  onClick={() => handleSort('recent')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                    sortBy === 'recent'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Recent {sortBy === 'recent' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* associate List */}
        {filteredAndSortedSummaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mb-6 animate-float">
              <span className="text-6xl">📂</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              {searchTerm ? 'No matching associate found' : 'No associate available'}
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-8">
              {searchTerm 
                ? `No associate match "${searchTerm}". Try a different search term.`
                : 'Start adding transactions with associate to see them organized here.'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 font-semibold"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedSummaries.map((summary, idx) => (
              <div
                key={summary.name}
                onClick={() => navigate(`/users/${username}/belongs-to/${encodeURIComponent(summary.name)}`)}
                className="group cursor-pointer bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl hover:bg-white transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 animate-slide-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-purple-700 transition-colors duration-200">
                      {summary.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {summary.totalTransactions} transaction{summary.totalTransactions !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <span className="text-white text-xl">👤</span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 text-lg">📈</span>
                      <span className="text-sm font-medium text-green-700">Credit</span>
                    </div>
                    <span className="font-bold text-green-600">₹ {Number(summary.totalCredit).toFixed(2)}
</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 text-lg">📉</span>
                      <span className="text-sm font-medium text-red-700">Debit</span>
                    </div>
                    <span className="font-bold text-red-600">₹ {Number(summary.totalDebit).toFixed(2)}
</span>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-2xl ${
                    summary.netAmount >= 0 ? 'bg-blue-50' : 'bg-orange-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg ${summary.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {summary.netAmount >= 0 ? '💰' : '⚖️'}
                      </span>
                      <span className={`text-sm font-medium ${
                        summary.netAmount >= 0 ? 'text-blue-700' : 'text-orange-700'
                      }`}>
                        Net Amount
                      </span>
                    </div>
                    <span className={`font-bold ${
                      summary.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      ₹ {Number(Math.abs(summary.netAmount)).toFixed(2)}

                    </span>
                  </div>
                </div>

                {/* Last Transaction */}
                {summary.lastTransaction && (
                  <div className="text-center pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Last transaction</p>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(summary.lastTransaction).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {/* Hover Arrow */}
                <div className="flex items-center justify-center mt-4 pt-3 border-t border-gray-200">
                  <span className="text-purple-500 font-semibold group-hover:text-purple-700 transition-colors duration-200 flex items-center gap-2">
                    View Details
                    <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions Footer */}
        
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-3px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out both;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-bounce-x {
          animation: bounce-x 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}