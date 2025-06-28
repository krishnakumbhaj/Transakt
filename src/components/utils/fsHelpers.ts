import fs from 'fs-extra';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data');

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  date: string;
  from?: string;
  to?: string;
  note?: string;
  belongsTo: string;
}

const generateId = () => 'txn_' + Math.random().toString(36).substr(2, 9);

export async function createUser(
  username: string,
  accountNumber: string,
  bankName: string,
  openingBalance: number,
  useOldBreakup: boolean = false,
  initialTransactions: Transaction[] = []
) {
  const userDir = path.join(dataPath, username.toLowerCase());

  if (await fs.pathExists(userDir)) {
    throw new Error('User already exists');
  }

  await fs.mkdirp(userDir);

  const transactions: Transaction[] = useOldBreakup
    ? initialTransactions.map(txn => ({
        ...txn,
        id: generateId(),
        date: txn.date || new Date().toISOString()
      }))
    : [];

  await fs.writeJson(path.join(userDir, 'transaction.json'), transactions, { spaces: 2 });

  const details = {
    name: username,
    accountNumber,
    bank: bankName,
    currentBalance: openingBalance,
    createdAt: new Date().toISOString()
  };

  await fs.writeJson(path.join(userDir, 'details.json'), details, { spaces: 2 });

  return { message: 'User created successfully', user: username };
}
