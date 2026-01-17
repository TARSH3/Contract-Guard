# ContractGuard - Setup Instructions

## Prerequisites

Before setting up ContractGuard, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## Quick Start Guide

### 1. Clone the Repository

```bash
git clone <repository-url>
cd contractguard
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env

# Edit .env file with your configuration
# Required variables:
# - MONGODB_URI=mongodb://localhost:27017/contractguard
# - JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
# - OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file (optional)
# Create .env file if you need custom API URL
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **API Health Check:** http://localhost:5000/api/health

## Environment Configuration

### Backend Environment Variables (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/contractguard

# JWT Secret (generate a strong secret for production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI API
OPENAI_API_KEY=your-openai-api-key-here

# File Upload Settings
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Settings
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
```

## Getting OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

**Note:** You'll need to add billing information to your OpenAI account to use the API.

## Database Setup

### Option 1: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

### Option 2: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

## Testing the Setup

### 1. Backend Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "ContractGuard API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 2. Frontend Access

Open http://localhost:3000 in your browser. You should see the ContractGuard landing page.

### 3. User Registration

1. Click "Get Started" or "Sign Up"
2. Fill in the registration form
3. You should be redirected to the dashboard

### 4. Contract Upload Test

1. Go to "Upload Contract" page
2. Upload a sample PDF contract (see sample contracts below)
3. Wait for analysis to complete
4. View the results

## Sample Contract for Testing

Create a file called `sample_contract.txt` with this content, then convert to PDF:

```
EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into on January 1, 2024, between TechCorp Inc. ("Company") and John Doe ("Employee").

TERMS AND CONDITIONS:

1. EMPLOYMENT TERM
This agreement shall commence on January 1, 2024, and shall continue for a period of two (2) years, automatically renewing for additional one-year terms unless either party provides ninety (90) days written notice of termination.

2. COMPENSATION
Employee shall receive an annual salary of $75,000, payable in bi-weekly installments.

3. EARLY TERMINATION
In the event of early termination by Employee, Employee agrees to pay Company liquidated damages equal to three (3) months of salary as compensation for recruitment and training costs.

4. NON-COMPETE CLAUSE
Employee agrees not to engage in any business that competes with Company within a fifty (50) mile radius for a period of eighteen (18) months following termination of employment.

5. DISPUTE RESOLUTION
Any disputes arising under this Agreement shall be resolved through binding arbitration. Employee waives the right to trial by jury.

6. ADDITIONAL FEES
Company may charge Employee for administrative costs, training materials, and equipment usage fees as deemed necessary.

By signing below, both parties agree to be bound by the terms of this Agreement.

_________________                    _________________
Company Signature                    Employee Signature
```

**Expected Analysis Results:**
- **Risk Score:** ~75 (High Risk)
- **Recommendation:** "Avoid signing"
- **Risky Clauses Detected:**
  - Auto-renewal clause (Medium Risk)
  - Early termination penalty (High Risk)
  - Non-compete restriction (High Risk)
  - Mandatory arbitration (Medium Risk)
  - Additional fees clause (Medium Risk)

## Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running on your system.

**2. OpenAI API Error**
```
Error: insufficient_quota
```
**Solution:** Add billing information to your OpenAI account or check your API key.

**3. File Upload Error**
```
Error: LIMIT_FILE_SIZE
```
**Solution:** Ensure your PDF is under 10MB.

**4. CORS Error**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Check that `FRONTEND_URL` in backend `.env` matches your frontend URL.

### Port Conflicts

If ports 3000 or 5000 are already in use:

**Backend (change port):**
```bash
# In backend/.env
PORT=5001
```

**Frontend (change port):**
```bash
# Start with custom port
npm run dev -- --port 3001
```

### Clear Database (Reset)

To start fresh with a clean database:

```bash
# Connect to MongoDB
mongo contractguard

# Drop the database
db.dropDatabase()
```

## Production Deployment

### Backend Deployment (Railway/Render)

1. Create account on Railway or Render
2. Connect your GitHub repository
3. Set environment variables in the platform
4. Deploy the backend service

### Frontend Deployment (Vercel)

1. Create account on Vercel
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy the frontend

### Environment Variables for Production

Make sure to update these for production:

```env
NODE_ENV=production
JWT_SECRET=<generate-strong-secret>
MONGODB_URI=<production-mongodb-url>
FRONTEND_URL=<production-frontend-url>
```

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Verify environment variables are set correctly
4. Check that all services are running

For additional help, please refer to the project documentation or create an issue in the repository.