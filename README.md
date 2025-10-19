# RevokeMe

**Your Automated Security Guard for Monad. Set it, and forget it.**

![Hackathon](https://img.shields.io/badge/Hackathon-MetaMask%20x%20Monad-blue)
![Status](https://img.shields.io/badge/status-Prototype-orange)
![Tech](https://img.shields.io/badge/Tech-Monad%20%7C%20Envio%20%7C%20MSA-brightgreen)
![License](https://img.shields.io/badge/License-MIT-yellow)

**RevokeMe** is a full-stack dApp designed to put users back in control of their wallet security. It provides a seamless, user-friendly experience for managing token approvals and leverages **MetaMask Smart Accounts** to deliver powerful automated protections.

---

## Quick Links

* **[🚀 Live Demo](https://revoke-me.vercel.app/)**
* **[📹 Video Demo](https://youtu.be/PISKWNU-0Yc)**
* **[📄 Pitch Deck](https://gamma.app/docs/AutoRevoke--lqz7wypgwl21w1j)**


---

## ✨ The Problem: Web3's "Ticking Time Bomb"

In Web3, we click `Approve` all the time to use dApps. What many don't realize is that this often grants **unlimited, permanent permission** for that dApp to spend your tokens.

This is how millions of dollars are lost in hacks. Old, forgotten approvals are a "ticking time bomb" in every wallet. Existing tools are clunky, manual, and reactive—you only use them *after* a hack is announced.

---

## ✨ The Solution: RevokeMe

RevokeMe bridges this gap. We empower users with a "set-and-forget" security system.

* **For Normal Users:** A clear dashboard to see all your risks in one place.
* **For Power Users:** An automated agent that watches your back 24/7.

This unlocks a new level of trust and safety, making Web3 adoption more secure for the next million users.

---

## Key Features

* ✅ **Seamless Smart Account Onboarding:** Connect your existing wallet, and RevokeMe instantly provisions a new, more secure MetaMask Smart Account for you using the **Delegation Toolkit**.
* 🔄 **Unified Command Center:** Manage both your original wallet (EOA) and your new Smart Account from a single, clean interface.
* 🔥 **Gas-Saving Batch Revocation:** The Smart Account enables you to select multiple approvals and revoke them all in **one single transaction**, saving time and gas.
* 🤖 **Auto-Revoke Terminal:** Our "set-it-and-forget-it" agent. With a single, one-time signature, you authorize a client-side agent to monitor your wallet.
* 🛡️ **Automated, Client-Side Agent:** This agent runs securely in your browser, polls our Envio indexer for new threats, and automatically sends revocation transactions for any non-whitelisted approvals.
* ⚡ **Instant Data, Powered by Envio:** The entire dashboard loads instantly. All approval data is served in real-time from our high-performance Envio Hyper Indexer.
* 🌐 **Global Risk Explorer:** Our homepage features a global feed of recent approvals and a search bar to check the security posture of *any* address on Monad.

---

## 🛠️ How It Works: The Architecture

Our architecture is divided into two primary flows: the one-time user setup and the continuous automated backend cycle.

### Diagram 1: User Onboarding & Manual Revocation

This diagram shows how a user connects, gets their Smart Account, and manually revokes approvals.

1. User connects their MetaMask EOA.
2. `useSmartAccount.tsx` hook (using `@metamask/delegation-toolkit`) provisions a new Smart Account.
3. The frontend queries the **Envio Indexer** to fetch all active approvals for both the EOA and the Smart Account.
4. User selects 3 approvals on their Smart Account and clicks "Revoke Selected".
5. `permissionless.js` bundles these 3 revocations into a single User Operation.
6. The UserOp is sent to the **Pimlico Bundler** and executed on the Monad testnet as one transaction.

### Diagram 2: Automated Auto-Revoke Cycle

This diagram illustrates the "magic" behind the scenes, where our agent uses Envio to find due payments and executes them on behalf of the user.

1. User navigates to the "Auto-Revoke Terminal" and clicks "Authorize Service".
2. User signs an EIP-712 (delegation) message, creating a "session key" for the agent.
3. The `useAutoRevoke.tsx` hook (the "agent") starts its **Watcher Interval**.
4. **[CRITICAL ENVIO STEP]** Every 15 seconds, the agent queries the **Envio Indexer** for new approvals on the user's Smart Account.
5. A new, non-whitelisted approval is detected.
6. The agent's **Batcher Interval** picks up this approval, constructs a revocation User Operation, and sends it to the **Pimlico Bundler** to be executed automatically.

---

## 🏆 Our Use of Envio

Envio is not an add-on; it is the **central data backbone** that makes RevokeMe possible. Our real-time, automated features are critically dependent on Envio's high-performance indexing.

Here is how we meet and exceed the bounty's qualification requirements:

### ✅ A working indexer using Envio

The `/indexer` directory in our repository contains the complete, working configuration (`config.yaml`), data schema (`schema.graphql`), and event handling logic (`src/EventHandlers.ts`). It is deployed and actively indexing all `Approval` events on the Monad testnet.

### ✅ Queries or endpoints generated by Envio being consumed in the project

Our entire application consumes the Envio-generated GraphQL endpoint.

1. **Frontend:** The `ManualRevokePanel.tsx` component fetches data from Envio to display all approvals.
2. **Backend Agent:** The `useAutoRevoke.tsx` hook (our agent) **constantly polls the Envio endpoint** to function.

This is the exact query our agent runs every 15 seconds to find new threats:

```graphql
query GetAllApprovals($addr: String!) { 
  Approval(
    where: {
      owner: {_eq: $addr}, 
      amount: {_gt: "0"}
    }
  ) { 
    id 
    tokenAddress 
    spender 
    owner 
    amount 
  } 
}
```

This real-time data feed is the trigger for our entire automation logic.

### ✅ Documentation and code that show Envio actively supporting the project's functionality

* Architecture Diagram 2 (above) explicitly shows the Envio Indexer as the trigger for the Backend Agent.
* The `useAutoRevoke.tsx` hook's `watcherCallbackRef` contains the fetch call to the Envio GraphQL endpoint.
* The `fetchApprovalsByAddress.ts` utility file shows the query being used by the frontend.

In summary, RevokeMe is a prime example of a project built for a high-performance indexer. Envio allows our agent to be stateless, fast, and scalable, making it the perfect choice for the Best use of Envio bounty.

---

## 💻 Tech Stack

* **Frontend:** React (Vite), TypeScript, TailwindCSS, Framer Motion
* **Web3:** wagmi, viem
* **Smart Accounts:** permissionless.js, @metamask/delegation-toolkit
* **Blockchain:** Monad Testnet, Solidity
* **Indexer:** Envio
* **Bundler:** Pimlico

---

## 📄 Deployed Contract Addresses (Monad Testnet)

* **Revocation Module Address:** `0x48C801c7a52DfD092686ba97781E198A80dEa566`
* **Revocation Module Factory Address:** `0x3833502FF256aa1D9B19Aea5a62Aa86B4283Ce75`

---

## 🏆 Hackathon Submission

This project is submitted for the **MetaMask Smart Accounts x Monad Dev Cook Off**. We are competing for the following prize categories:

* **Best on-chain automation:** Our **Auto-Revoke Terminal** is the exact "revoke.cash but automated" concept suggested in the prize description, using a client-side agent to execute revocations.
* **Best consumer application:** We provide a simple, intuitive "Web2" interface for a complex and critical Web3 security task, complete with real-time data and dual-wallet management.
* **Most innovative use of Delegations:** Our agent's ability to act on a user's behalf is powered by a scoped, secure delegation (an EIP-712 signature) that acts as a temporary "session key."
* **Best use of Envio & Envio Bonus:** Our architecture is **critically dependent** on Envio for all core functionality, from fetching approvals to powering the automated agent.

### Hackathon Proof & Screenshots

![Hackathon Proof 1](https://cdn.gamma.app/bkh32grw0my2jw1/af7cd38e15e14cf781ebc7eaba56c1b3/original/WhatsApp-Image-2025-10-17-at-22.05.34_33ca9eb3.jpg)

![Hackathon Proof 2](https://cdn.gamma.app/bkh32grw0my2jw1/00ac279479f9436095cdcd6dcdad8e8b/original/WhatsApp-Image-2025-10-17-at-22.06.32_ae315efb.jpg)

---

## 🚀 Setup and Installation

Follow these steps to run the project locally.

### 1. Prerequisites

* Node.js (v18 or later)
* pnpm package manager
* A wallet with Monad Testnet ETH.

### 2. Clone the Repository

```bash
git clone [Your-GitHub-Repo-Link]
cd revokeme-project
```

### 3. Envio Indexer Setup

The indexer powers the entire app. Run it first.

```bash
# Navigate to the indexer directory
cd indexer

# Install dependencies
pnpm install

# Start the indexer
pnpm dev
```

This will start the indexer and a GraphQL API at `http://localhost:8080/v1/graphql`.

### 4. Frontend Application Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
pnpm install

# Create a .env file from the example
cp .env.example .env
```

Now, open the new `.env` file and add your credentials:

```env
# Your Pimlico API Key
VITE_PIMLICO_API_KEY="YOUR_PIMLICO_API_KEY"

# The GraphQL endpoint for your *locally running* Envio Indexer
VITE_INDEXER_URL="http://localhost:8080/v1/graphql"
```

```bash
# Start the frontend app in a new terminal
pnpm dev
```

Your local application should now be running at `http://localhost:5173`.

---

![GigMeme](https://user-images.githubusercontent.com/93007558/216892041-5599d3d8-50e0-4d46-8171-5021d69d7745.gif)
