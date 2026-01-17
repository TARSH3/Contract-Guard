# ContractGuard - Deployment Guide

This guide covers deploying ContractGuard to production using modern cloud platforms.

## Architecture Overview

```
Frontend (Vercel) → Backend (Railway/Render) → Database (MongoDB Atlas)
```

## Prerequisites

- GitHub account with your ContractGuard repository
- OpenAI API key with billing enabled
- MongoDB Atlas account (free tier available)

## 1. Database Setup (MongoDB Atlas)

### Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (choose free tier)
4. Wait for cluster to be created (2-3 minutes)

### Configure Database Access

1. **Database Access:**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `contractguard`
   - Password: Generate secure password
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

2. **Network Access:**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

### Get Connection String

1. Go to "Clusters" and click "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `contractguard`

Example: `mongodb+srv://contractguard:yourpassword@cluster0.abc123.mongodb.net/contractguard?retryWrites=true&w=majority`

## 2. Backend Deployment (Railway)

### Option A: Railway (Recommended)

1. **Create Railway Account:**
   - Go to [Railway](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend:**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your ContractGuard repository
   - Choose the `backend` folder as root directory

3. **Configure Environment Variables:**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters
   OPENAI_API_KEY=your-openai-api-key
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=./uploads
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Deploy:**
   - Railway will automatically build and deploy
   - Note your backend URL (e.g., `https://contractguard-backend.railway.app`)

### Option B: Render

1. **Create Render Account:**
   - Go to [Render](https://render.com)
   - Sign up with GitHub

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `contractguard-backend`
     - Root Directory: `backend`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`

3. **Add Environment Variables:**
   - Same as Railway configuration above

## 3. Frontend Deployment (Vercel)

### Deploy to Vercel

1. **Create Vercel Account:**
   - Go to [Vercel](https://vercel.com)
   - Sign up with GitHub

2. **Import Project:**
   - Click "New Project"
   - Import your ContractGuard repository
   - Choose `frontend` as root directory

3. **Configure Build Settings:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Environment Variables:**
   ```env
   VITE_API_URL=https://your-backend-domain.railway.app/api
   ```

5. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Note your frontend URL (e.g., `https://contractguard.vercel.app`)

## 4. Update Backend CORS

After frontend deployment, update your backend environment variables:

```env
FRONTEND_URL=https://your-actual-frontend-domain.vercel.app
```

Redeploy the backend service.

## 5. Custom Domain (Optional)

### Frontend Domain (Vercel)

1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `contractguard.com`)
4. Follow DNS configuration instructions

### Backend Domain (Railway)

1. Go to your Railway project
2. Click "Settings" → "Domains"
3. Add custom domain (e.g., `api.contractguard.com`)
4. Update frontend environment variable with new API URL

## 6. Production Checklist

### Security

- [ ] Strong JWT secret (32+ characters)
- [ ] MongoDB user with minimal permissions
- [ ] HTTPS enforced on all endpoints
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] File upload validation active

### Performance

- [ ] Database indexes created
- [ ] File cleanup scheduled
- [ ] Error logging configured
- [ ] Monitoring setup

### Functionality

- [ ] User registration works
- [ ] Contract upload works
- [ ] AI analysis completes
- [ ] PDF reports generate
- [ ] Email notifications (if implemented)

## 7. Monitoring & Maintenance

### Application Monitoring

**Railway:**
- Built-in metrics and logs
- Set up alerts for errors

**Render:**
- Application logs available
- Health check endpoints

### Database Monitoring

**MongoDB Atlas:**
- Performance advisor
- Real-time metrics
- Automated backups

### Error Tracking

Consider adding error tracking:
- [Sentry](https://sentry.io) for error monitoring
- [LogRocket](https://logrocket.com) for user session replay

## 8. Scaling Considerations

### Database Scaling

- **Free Tier:** 512MB storage, shared CPU
- **Paid Tiers:** Dedicated clusters, more storage
- **Sharding:** For very large datasets

### Backend Scaling

- **Railway:** Auto-scaling based on traffic
- **Render:** Manual scaling options
- **Load Balancing:** For high traffic

### Cost Optimization

**Monthly Costs (Estimated):**
- MongoDB Atlas: $0 (free tier) - $57+ (dedicated)
- Railway: $5+ per service
- Vercel: $0 (hobby) - $20+ (pro)
- OpenAI API: ~$0.10 per contract analysis

**Total:** ~$5-100+ per month depending on usage

## 9. Backup & Recovery

### Database Backups

**MongoDB Atlas:**
- Automatic backups enabled by default
- Point-in-time recovery available
- Download backups manually

### Code Backups

- GitHub repository serves as code backup
- Tag releases for version control
- Document deployment procedures

## 10. Troubleshooting

### Common Issues

**Backend won't start:**
- Check environment variables
- Verify MongoDB connection string
- Check OpenAI API key validity

**Frontend can't connect to backend:**
- Verify VITE_API_URL is correct
- Check CORS configuration
- Ensure backend is running

**File uploads fail:**
- Check file size limits
- Verify upload directory permissions
- Check disk space

**AI analysis fails:**
- Verify OpenAI API key
- Check API quota/billing
- Monitor API rate limits

### Debug Commands

**Check backend health:**
```bash
curl https://your-backend-url.railway.app/api/health
```

**Test file upload:**
```bash
curl -X POST -F "contract=@test.pdf" \
  -H "Authorization: Bearer your-jwt-token" \
  https://your-backend-url.railway.app/api/contracts/upload
```

## 11. Production Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/contractguard

# Security
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters-long

# AI Service
OPENAI_API_KEY=sk-your-openai-api-key

# CORS
FRONTEND_URL=https://contractguard.vercel.app

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)

```env
VITE_API_URL=https://contractguard-backend.railway.app/api
```

## 12. Post-Deployment Testing

1. **User Registration:** Create test account
2. **Login:** Verify authentication works
3. **Upload Contract:** Test with sample PDF
4. **Analysis:** Verify AI analysis completes
5. **Download Report:** Test PDF generation
6. **Mobile:** Test on mobile devices

## Support

For deployment issues:
1. Check service logs (Railway/Render dashboard)
2. Verify environment variables
3. Test API endpoints manually
4. Check database connectivity
5. Monitor error rates and performance

Your ContractGuard application should now be live and accessible to users worldwide!