/src
  /components
    /ApprovalList          # List & item components for token approvals
      ApprovalItem.tsx     
      ApprovalList.tsx     
    /AutoRevokePolicyForm  # Form for auto-revoke policy rules
    /AuditLogView          # Logs and transaction history UI
    /ConnectWalletButton   # Wallet connect button for MetaMask Smart Accounts
    /LoadingSpinner        # Reusable loading indicator

  /hooks
    useEnvioApprovals.ts  # Fetch token approvals from Envio GraphQL
    useSmartAccount.ts    # Initialize/connect MetaMask Smart Account
    useRevocationModule.ts# Contract interaction hooks for revocations

  /lib
    /contract
      revocationModuleABI.json # ABI JSON file
      contract.ts        # Contract instances and helper functions

    /envio
      client.ts          # Envio GraphQL client setup

    /viem
      publicClient.ts    # Viem Public Client instantiation
      bundlerClient.ts   # Viem Bundler Client instantiation

  /context
    SmartAccountContext.tsx # Context & provider for connected smart account

  /utils
    formatters.ts        # Formatting helpers (addresses, dates)
    constants.ts         # Config constants (addresses, network IDs)

  /services
    backend.ts           # Backend API client if applicable (job enqueue, logs)

  App.tsx                # Root component with providers and main UI
  index.tsx              # Entry point rendering <App />

/public                  # Static assets
/styles
  globals.css
  tailwind.config.js

/package.json
/tsconfig.json
