my-finance-app/
│
├── public/                       # Static assets (favicon, images if any)
│
├── data/                         # 🔐 JSON storage for users (this is server-only)
│   ├── krishna/
│   │   ├── details.json          # Account details
│   │   └── transaction.json      # All credit/debit transactions
│   ├── mummy/
│   │   ├── details.json
│   │   └── transaction.json
│
├── pages/
│   ├── index.tsx                 # Dashboard or Home
│   ├── create-user.tsx          # UI to create new user
│   ├── [username]/               # Dynamic route for user's account
│   │   ├── index.tsx             # Show balance + transactions
│   │   └── add-transaction.tsx   # Form to add credit/debit
│
│   └── api/
│       ├── create-user.ts        # API to create user + JSON folder
│       ├── [username]/
│       │   ├── get-details.ts    # Fetch details.json
│       │   ├── get-transactions.ts # Fetch transaction.json
│       │   └── add-transaction.ts # Append new transaction to file
│
├── components/                   # Reusable UI components
│   ├── TransactionList.tsx
│   ├── AddTransactionForm.tsx
│   └── UserCard.tsx
│
├── utils/
│   ├── fsHelpers.ts              # File read/write logic using `fs`
│   └── generateId.ts             # Utility to create unique txn IDs
│
├── styles/                       # Optional custom CSS
│
├── package.json
├── next.config.js
└── tsconfig.json






Create User

Enter name, account number, bank name, opening balance

Creates a folder with user's name

Stores details.json + empty transaction.json

Add Transaction

Choose user

Add credit or debit entry manually

Fill: amount, date, short note, who sent or received, and whose money it is

Auto-update transaction.json

Updates current balance in details.json

Show Transactions

See all past transactions (credit & debit)

Display in newest-first order

Filter by person (e.g., "Mama's money")

Track Balance

Show updated current balance

Calculate person-wise money (optional)

Multiple Users Supported

Each has separate folder and files

You can switch between users/accounts

PWA Ready

Works like an app on phone

Data is permanent (stored in server JSON files)

Accessible even after reinstall or on other devices





Option 1: Start Fresh
"I just want to add the current balance and start logging from now."


 Option 2: Add Old Transactions (Breakup of Current Amount)
"I want to add my current amount and show how it is split between people (like Mama, Bhaiya etc.)"