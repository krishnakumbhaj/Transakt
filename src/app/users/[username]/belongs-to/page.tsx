'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Transaction {
  amount: number;
  from: string;
  note: string;
  belongsTo: string;
  date: string;
  type: 'credit' | 'debit';
}

export default function BelongsToListPage() {
  const { username } = useParams();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [belongsToList, setBelongsToList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    fetch(`/api/${username}/transactions`)
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || []);
        const uniqueBelongs = Array.from(
          new Set(
            data.transactions
              .map((txn: Transaction) => txn.belongsTo.trim())
              .filter(Boolean)
          )
        ) as string[];
        setBelongsToList(uniqueBelongs);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, [username]);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-700 mb-6">Belongs To List</h1>

        {belongsToList.length === 0 ? (
          <p className="text-gray-500">No people found.</p>
        ) : (
          <div className="space-y-4">
            {belongsToList.map((name, idx) => (
              <div
                key={idx}
                onClick={() => router.push(`/users/${username}/belongs-to/${encodeURIComponent(name)}`)}
                className="cursor-pointer p-4 bg-white rounded-lg shadow hover:bg-purple-50 border border-purple-200 flex justify-between items-center"
              >
                <span className="text-lg font-medium text-purple-800">{name}</span>
                <span className="text-sm text-purple-500">View Transactions →</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
