# 🛡️ ContractGuard - AI-Powered Legal Contract Analysis

> **Read between the lines** - Intelligent contract analysis to protect you from hidden risks

ContractGuard is a cutting-edge legal-tech platform that uses AI to analyze PDF contracts and identify potential risks, hidden clauses, and provide actionable insights in plain language.

## 🌟 Features

- **📄 PDF Contract Upload** - Drag & drop or browse to upload contracts
- **🤖 AI-Powered Analysis** - Advanced OpenAI integration for intelligent contract review
- **⚠️ Risk Detection** - Identifies high, medium, and low-risk clauses with explanations
- **📊 Risk Scoring** - Comprehensive risk assessment with severity ratings
- **💡 Plain Language Summaries** - Complex legal terms explained simply
- **📈 Dashboard Analytics** - Track your contract analysis history
- **👤 User Authentication** - Secure login/registration system
- **💎 Pro Membership** - Enhanced features with 500 analyses per year
- **📱 Responsive Design** - Works perfectly on desktop and mobile

## 🚀 Live Demo

- **Frontend**: [Your Vercel URL]
- **Backend API**: [Your Railway/Render URL]

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Beautiful notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Multer** - File upload handling
- **PDF-Parse** - PDF text extraction
- **OpenAI API** - AI contract analysis

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- OpenAI API key (optional - has fallback)

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/contractguard.git
cd contractguard
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:3001
- Backend API: http://localhost:5000

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/contractguard
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key-optional
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh-profile` - Refresh user data

### Contract Endpoints
- `POST /api/contracts/upload` - Upload and analyze contract
- `GET /api/contracts` - Get user's contracts
- `GET /api/contracts/:id` - Get specific contract
- `GET /api/contracts/stats/dashboard` - Dashboard statistics

## 🎯 Key Features Explained

### Risk Detection Algorithm
ContractGuard uses a hybrid approach:
1. **AI Analysis** - OpenAI GPT models analyze contract content
2. **Rule-Based Detection** - Fallback system with predefined risk patterns
3. **Risk Scoring** - 0-100 scale with Low/Medium/High categories

### Supported Risk Types
- Termination clauses
- Penalty fees
- Auto-renewal terms
- Non-compete agreements
- Arbitration requirements
- Hidden fees
- Liability limitations
- Refund restrictions

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- File upload validation
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation & sanitization

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
```

### Backend (Railway/Render)
```bash
# Set environment variables
# Deploy to Railway or Render
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- OpenAI for providing powerful AI capabilities
- The open-source community for amazing tools and libraries
- Legal professionals who provided domain expertise

## 📞 Support

If you have any questions or need help, please:
1. Check the [Issues](https://github.com/yourusername/contractguard/issues) page
2. Create a new issue if your problem isn't already reported
3. Contact us at support@contractguard.com

---

⭐ **Star this repository if you found it helpful!**