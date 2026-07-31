# MongoDB Atlas Connection Guide - HireFlow AI

This guide walks you through setting up a free or dedicated MongoDB Atlas cluster and connecting it to the HireFlow AI backend.

---

## Step 1: Create a MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Register for a free MongoDB Atlas account or sign in with Google/GitHub.

---

## Step 2: Deploy a Free Cluster (M0 Sandbox)

1. Click **Build a Database**.
2. Select the **M0 Free** cluster tier.
3. Choose your preferred Cloud Provider (AWS, GCP, or Azure) and Region close to your users.
4. Name your cluster (e.g. `hireflow-cluster`) and click **Create Cluster**.

---

## Step 3: Create Database User Credentials

1. Under **Security** in the left sidebar, click **Database Access**.
2. Click **Add New Database User**.
3. Select **Password** as the authentication method.
4. Enter a Username (e.g., `hireflow_admin`) and a strong Password.
5. Under **Database User Privileges**, assign `Read and write to any database`.
6. Click **Add User**. Save your password securely.

---

## Step 4: Configure Network Access (IP Whitelist)

1. Under **Security** in the left sidebar, click **Network Access**.
2. Click **Add IP Address**.
3. For development, click **Allow Access from Anywhere** (`0.0.0.0/0`) or enter your current IP.
4. Click **Confirm**.

---

## Step 5: Get Connection String URI

1. In the **Database Deployments** screen, click **Connect** next to your cluster.
2. Select **Drivers** (Node.js).
3. Select Node.js driver version `5.5 or later`.
4. Copy the connection string format:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/hireflow_db?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with the credentials created in Step 3.
6. Set the database name to `hireflow_db`.

---

## Step 6: Configure `.env` in HireFlow AI Backend

Open `backend/.env` and paste your connection string into `MONGO_URI`:

```env
MONGO_URI=mongodb+srv://hireflow_admin:YourSecretPassword123@cluster0.mongodb.net/hireflow_db?retryWrites=true&w=majority
```

---

## Step 7: Test the Connection

Start the backend server:

```bash
cd backend
npm run dev
```

Look for the success message in terminal:
```
[MongoDB Connected]: cluster0-shard-00-00.mongodb.net / Database: hireflow_db
[HireFlow AI Backend Phase 1]
Environment : development
Server Port : 5000
Health Check: http://localhost:5000/api/v1/health
```
