const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const OpenAI = require('openai');
const tf = require('@tensorflow/tfjs');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

// Currency API Integration
const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY || 'demo';
const CURRENCY_API_URL = `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}`;

// Cache for exchange rates (5 minute TTL)
const exchangeRateCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getExchangeRates(fromCurrency) {
  const cacheKey = fromCurrency;
  const cached = exchangeRateCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Using cached rates for ${fromCurrency}`);
    return cached.data;
  }
  
  console.log(`Fetching live rates for ${fromCurrency} from API...`);
  console.log(`API URL: ${CURRENCY_API_URL}/latest/${fromCurrency}`);
  
  try {
    const response = await axios.get(`${CURRENCY_API_URL}/latest/${fromCurrency}`, { timeout: 5000 });
    const data = response.data;
    
    console.log('API Response:', data.result);
    
    if (data.result === 'success') {
      console.log(`Live rates fetched for ${fromCurrency}:`, Object.keys(data.conversion_rates).slice(0, 5));
      exchangeRateCache.set(cacheKey, {
        data: data.conversion_rates,
        timestamp: Date.now()
      });
      return data.conversion_rates;
    } else {
      console.error('API returned error:', data);
    }
  } catch (error) {
    console.error('Currency API error:', error.message);
    if (error.response) {
      console.error('API Error Response:', error.response.data);
    }
  }
  
  console.log('Falling back to mock rates');
  // Fallback to mock rates if API fails
  return {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    INR: 83.5,
    JPY: 110.0
  };
}

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'neoconvert-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// ======== GOOGLE OAUTH CONFIGURATION ========
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'demo-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'demo-client-secret',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || `${BACKEND_URL}/auth/google/callback`
},
(accessToken, refreshToken, profile, done) => {
  // Create or find user
  const user = {
    id: profile.id,
    name: profile.displayName,
    email: profile.emails?.[0]?.value,
    picture: profile.photos?.[0]?.value,
    provider: 'google',
    createdAt: new Date()
  };
  users.set(profile.id, user);
  return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = users.get(id);
  done(null, user);
});

// Initialize OpenAI (use mock if no key)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// ======== USER MODEL ========
const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  password: String,
  provider: String,
  providerId: String,
  createdAt: { type: Date, default: Date.now }
});

// In-memory storage (replace with MongoDB in production)
const users = new Map();
const twins = new Map();
const conversions = [];
const dbUsers = new Map(); // Simulated database

// ======== AUTHENTICATION HELPER FUNCTIONS ========
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'neoconvert-secret-key', { expiresIn: '24h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'neoconvert-secret-key');
  } catch (err) {
    return null;
  }
}

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
  
  req.userId = decoded.id;
  next();
}

// ======== ML MODELS ========
// Simple TensorFlow model for stress detection
let stressModel;
async function initStressModel() {
  stressModel = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [3], units: 8, activation: 'relu' }),
      tf.layers.dense({ units: 4, activation: 'relu' }),
      tf.layers.dense({ units: 1, activation: 'sigmoid' })
    ]
  });
  stressModel.compile({ optimizer: 'adam', loss: 'binaryCrossentropy' });
  console.log('✅ Stress detection ML model initialized');
}
initStressModel();

// ======== NEW FEATURE 1: ALL WORLD CURRENCIES API ========
app.get('/api/currencies', async (req, res) => {
  try {
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/codes`
    );
    res.json(response.data.supported_codes || []);
  } catch (err) {
    console.error('Currency API error:', err.message);
    res.status(500).json({
      error: 'Failed to load currencies'
    });
  }
});

// ======== NEW FEATURE 2: USER REGISTRATION & LOGIN ========
// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'All fields required' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match' });
    }
    
    if (dbUsers.has(email)) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }
    
    const hashed = await bcryptjs.hash(password, 10);
    const userId = uuidv4();
    
    const newUser = {
      id: userId,
      name,
      email,
      password: hashed,
      provider: 'local',
      createdAt: new Date()
    };
    
    dbUsers.set(email, newUser);
    
    const token = generateToken(userId);
    
    res.json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: userId, name, email }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    
    const user = Array.from(dbUsers.values()).find(u => u.email === email);
    
    if (!user) {
      return res.status(400).json({ success: false, error: 'User not found' });
    }
    
    const validPassword = await bcryptjs.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(400).json({ success: false, error: 'Invalid password' });
    }
    
    const token = generateToken(user.id);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current user
app.get('/api/me', authMiddleware, (req, res) => {
  try {
    const user = Array.from(dbUsers.values()).find(u => u.id === req.userId);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json({ success: true, user: userWithoutPassword });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ======== REAL EXCHANGE RATES ========
const realRates = {
  INR: { USD: 0.012, EUR: 0.011, GBP: 0.0095, JPY: 1.77 },
  USD: { INR: 83.12, EUR: 0.92, GBP: 0.79, JPY: 148.5 },
  EUR: { INR: 90.35, USD: 1.09, GBP: 0.86, JPY: 161.4 },
  GBP: { INR: 105.1, USD: 1.27, EUR: 1.16, JPY: 187.3 }
};

// ======== SPACE ECONOMY RATES ========
const spaceRates = {
  earth: { USD: 1, INR: 83.12, EUR: 0.92 },
  mars: { USD: 2.5, INR: 207.8, EUR: 2.3 }, // 2.5x Earth (scarcity)
  moon: { USD: 1.8, INR: 149.6, EUR: 1.66 }, // 1.8x Earth
  titan: { USD: 4.0, INR: 332.5, EUR: 3.68 }, // 4x Earth
  asteroid: { USD: 3.2, INR: 266, EUR: 2.94 }
};

// ======== INDIA PPP DATA (UNIVERSAL VALUE INDEX) ========
const indiaPPPData = {
  bengaluru: { hourlyWage: 85, costOfLiving: 25000, category: 'IT Hub' },
  mumbai: { hourlyWage: 75, costOfLiving: 35000, category: 'Financial' },
  delhi: { hourlyWage: 70, costOfLiving: 30000, category: 'Capital' },
  chennai: { hourlyWage: 65, costOfLiving: 22000, category: 'Manufacturing' },
  hyderabad: { hourlyWage: 68, costOfLiving: 20000, category: 'Tech' },
  pune: { hourlyWage: 62, costOfLiving: 18000, category: 'Auto' },
  kolkata: { hourlyWage: 50, costOfLiving: 15000, category: 'Metro' },
  rural_bihar: { hourlyWage: 25, costOfLiving: 8000, category: 'Agricultural' },
  rural_up: { hourlyWage: 30, costOfLiving: 9000, category: 'Mixed' },
  rural_maharashtra: { hourlyWage: 40, costOfLiving: 12000, category: 'Mixed' }
};

// ======== REALITY SIMULATION DATA ========
const realityData = {
  usa: { rent: 1500, food: 400, transport: 100, utilities: 150, taxRate: 0.24, lifestyle: 'High' },
  uk: { rent: 1200, food: 350, transport: 90, utilities: 120, taxRate: 0.20, lifestyle: 'High' },
  germany: { rent: 900, food: 300, transport: 80, utilities: 100, taxRate: 0.26, lifestyle: 'Medium-High' },
  japan: { rent: 800, food: 350, transport: 100, utilities: 110, taxRate: 0.23, lifestyle: 'High' },
  singapore: { rent: 1400, food: 320, transport: 70, utilities: 90, taxRate: 0.22, lifestyle: 'High' },
  india_bengaluru: { rent: 300, food: 150, transport: 30, utilities: 40, taxRate: 0.30, lifestyle: 'Medium' }
};

// ======== API ROUTES ========

// 1. CONVERT API
app.post('/api/convert', async (req, res) => {
  try {
    const { from, to, amount, mode = 'earth' } = req.body;
    
    let rate, convertedAmount, metadata = {};
    
    switch(mode) {
      case 'earth':
        const rates = await getExchangeRates(from);
        rate = rates[to] || 1;
        convertedAmount = amount * rate;
        console.log(`Conversion: ${amount} ${from} → ${convertedAmount} ${to} (rate: ${rate})`);
        metadata = { type: 'fiat', rate, mode, source: 'exchangerate-api' };
        break;
        
      case 'space':
        const earthToUSD = realRates[from]?.USD || 1;
        const usdAmount = amount * earthToUSD;
        const spaceRate = spaceRates[to.toLowerCase()]?.USD || 1;
        convertedAmount = usdAmount / spaceRate;
        rate = 1 / spaceRate;
        metadata = { 
          type: 'space', 
          rate, 
          spaceLocation: to,
          resourceBased: true
        };
        break;
        
      case 'quantum':
        const uncertainty = (Math.random() - 0.5) * 0.1;
        rate = (Math.random() * 2) + uncertainty;
        convertedAmount = amount * rate;
        metadata = { 
          type: 'quantum', 
          rate, 
          uncertainty: uncertainty.toFixed(4),
          quantumEffect: true
        };
        break;
        
      default:
        rate = 1;
        convertedAmount = amount;
        metadata = { type: 'unknown', rate: 1 };
    }
    
    result = {
      original: { amount, currency: from },
      converted: { amount: convertedAmount, currency: to },
      rate: rate.toFixed(4),
      timestamp: new Date().toISOString(),
      metadata
    };

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ success: false, error: 'Conversion failed' });
  }
});

// 2. AI FINANCIAL TWIN API
app.post('/api/twin', async (req, res) => {
  try {
    const { userData, query, context } = req.body;
    const userId = userData.id || uuidv4();
    
    // Create or update twin
    if (!twins.has(userId)) {
      twins.set(userId, {
        id: userId,
        created: new Date(),
        profile: userData,
        memories: [],
        decisions: []
      });
    }
    
    const twin = twins.get(userId);
    
    // Generate AI response (mock or real)
    let aiResponse;
    if (openai) {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a financial AI twin for a user with these characteristics: ${JSON.stringify(userData)}. Give personalized financial advice in a conversational, thoughtful manner.`
          },
          { role: "user", content: query }
        ]
      });
      aiResponse = completion.choices[0].message.content;
    } else {
      // Mock AI twin response
      aiResponse = generateMockTwinResponse(userData, query, context);
    }
    
    // Store decision memory
    twin.memories.push({
      query,
      response: aiResponse,
      context,
      timestamp: new Date()
    });
    
    // Limit memories to last 50
    if (twin.memories.length > 50) twin.memories.shift();
    
    res.json({
      success: true,
      data: {
        twinId: userId,
        response: aiResponse,
        confidence: Math.floor(Math.random() * 20 + 75), // 75-95%
        alternatives: generateAlternatives(context),
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. UNIVERSAL VALUE INDEX API
app.get('/api/universal/:amount/:location?', (req, res) => {
  try {
    const { amount, location = 'bengaluru' } = req.params;
    const amt = parseFloat(amount);
    
    const locationData = indiaPPPData[location.toLowerCase()] || indiaPPPData.bengaluru;
    const hoursRequired = amt / locationData.hourlyWage;
    
    // Calculate for all locations
    const allLocations = Object.entries(indiaPPPData).map(([city, data]) => ({
      city: city.replace('_', ' ').toUpperCase(),
      hours: (amt / data.hourlyWage).toFixed(1),
      hourlyWage: data.hourlyWage,
      category: data.category,
      costOfLiving: data.costOfLiving
    }));
    
    // Compare with global
    const globalComparison = [
      { country: 'USA (USD)', hours: (amt / 1500).toFixed(1), wage: 1500 },
      { country: 'UK (GBP)', hours: (amt / 1200).toFixed(1), wage: 1200 },
      { country: 'Germany (EUR)', hours: (amt / 1100).toFixed(1), wage: 1100 },
      { country: 'Japan (JPY)', hours: (amt / 1000).toFixed(1), wage: 1000 },
      { country: 'Singapore (SGD)', hours: (amt / 1300).toFixed(1), wage: 1300 },
      { country: 'UAE (AED)', hours: (amt / 900).toFixed(1), wage: 900 },
      { country: 'Australia (AUD)', hours: (amt / 1400).toFixed(1), wage: 1400 },
      { country: 'Canada (CAD)', hours: (amt / 1250).toFixed(1), wage: 1250 },
      { country: 'South Africa (ZAR)', hours: (amt / 450).toFixed(1), wage: 450 },
      { country: 'Brazil (BRL)', hours: (amt / 500).toFixed(1), wage: 500 }
    ];
    
    res.json({
      success: true,
      data: {
        amount: amt,
        currency: 'INR',
        selectedLocation: {
          name: location.replace('_', ' ').toUpperCase(),
          hoursRequired: hoursRequired.toFixed(1),
          hourlyWage: locationData.hourlyWage,
          category: locationData.category
        },
        allLocations,
        globalComparison,
        insight: `₹${amt} requires ${hoursRequired.toFixed(1)} hours of work in ${location}, but only ${(amt / 1500).toFixed(1)} hours in USA`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. REALITY SIMULATION API
app.post('/api/simulate', (req, res) => {
  try {
    const { amount, fromCountry = 'india', toCountry = 'usa', duration = 1 } = req.body;
    const amt = parseFloat(amount);
    
    const reality = realityData[toCountry.toLowerCase()];
    if (!reality) {
      return res.status(400).json({ success: false, error: 'Country not supported' });
    }
    
    const monthlyCosts = reality.rent + reality.food + reality.transport + reality.utilities;
    const taxAmount = amt * reality.taxRate;
    const disposableIncome = amt - taxAmount;
    const monthsSupported = Math.floor(disposableIncome / monthlyCosts);
    
    const lifestyle = {
      rent: { percent: ((reality.rent / monthlyCosts) * 100).toFixed(1), amount: reality.rent },
      food: { percent: ((reality.food / monthlyCosts) * 100).toFixed(1), amount: reality.food },
      transport: { percent: ((reality.transport / monthlyCosts) * 100).toFixed(1), amount: reality.transport },
      utilities: { percent: ((reality.utilities / monthlyCosts) * 100).toFixed(1), amount: reality.utilities }
    };
    
    res.json({
      success: true,
      data: {
        original: { amount: amt, country: fromCountry },
        simulated: {
          country: toCountry.toUpperCase(),
          afterTax: disposableIncome.toFixed(2),
          taxPaid: taxAmount.toFixed(2),
          taxRate: (reality.taxRate * 100).toFixed(0) + '%',
          monthlyCosts,
          monthsSupported,
          lifestyleBreakdown: lifestyle,
          lifestyleCategory: reality.lifestyle,
          verdict: monthsSupported >= duration ? 'Comfortable' : monthsSupported >= duration * 0.5 ? 'Moderate' : 'Struggle'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. AUTONOMOUS AGENT API
app.post('/api/agent/decide', (req, res) => {
  try {
    const { userId, conditions, proposedAction } = req.body;
    
    // Evaluate conditions
    let shouldExecute = true;
    const reasonLog = [];
    
    if (conditions.minRate && realRates[proposedAction.from]?.[proposedAction.to] < conditions.minRate) {
      shouldExecute = false;
      reasonLog.push(`Rate ${realRates[proposedAction.from][proposedAction.to]} below minimum ${conditions.minRate}`);
    }
    
    if (conditions.maxAmount && proposedAction.amount > conditions.maxAmount) {
      shouldExecute = false;
      reasonLog.push(`Amount exceeds maximum ${conditions.maxAmount}`);
    }
    
    if (conditions.timeWindow) {
      const now = new Date().getHours();
      if (now < conditions.timeWindow.start || now > conditions.timeWindow.end) {
        shouldExecute = false;
        reasonLog.push(`Outside time window ${conditions.timeWindow.start}:00-${conditions.timeWindow.end}:00`);
      }
    }
    
    const decision = {
      id: uuidv4(),
      timestamp: new Date(),
      shouldExecute,
      action: proposedAction,
      confidence: shouldExecute ? Math.floor(Math.random() * 15 + 80) : Math.floor(Math.random() * 20 + 50),
      reasons: reasonLog.length > 0 ? reasonLog : ['All conditions met'],
      requiresApproval: !shouldExecute || proposedAction.amount > 100000
    };
    
    res.json({
      success: true,
      data: decision
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. BIO-ADAPTIVE STRESS API
app.post('/api/stress', async (req, res) => {
  try {
    const { heartRate, hrv, sleepQuality, userId } = req.body;
    
    // Use ML model if available, otherwise use heuristic
    let riskScore;
    
    if (stressModel && heartRate && hrv) {
      const input = tf.tensor2d([[heartRate / 100, hrv / 50, sleepQuality / 8]]);
      const prediction = stressModel.predict(input);
      riskScore = (await prediction.data())[0];
      input.dispose();
      prediction.dispose();
    } else {
      // Heuristic fallback
      riskScore = calculateStressHeuristic(heartRate, hrv, sleepQuality);
    }
    
    const riskLevel = riskScore > 0.7 ? 'HIGH' : riskScore > 0.4 ? 'MODERATE' : 'LOW';
    const maxTransaction = riskScore > 0.7 ? 1000 : riskScore > 0.4 ? 10000 : 100000;
    
    res.json({
      success: true,
      data: {
        riskScore: (riskScore * 100).toFixed(1),
        riskLevel,
        recommendation: riskLevel === 'HIGH' ? 'BLOCK_LARGE_TRANSACTIONS' : riskLevel === 'MODERATE' ? 'LIMIT_RISK' : 'NORMAL',
        maxTransactionAllowed: maxTransaction,
        warningMessage: riskLevel === 'HIGH' ? '⚠️ High stress detected. Large transactions restricted.' : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. QUANTUM PREDICTION API
app.post('/api/quantum', (req, res) => {
  try {
    const { from, to, amount, timeHorizon = 7 } = req.body;
    
    const baseRate = realRates[from]?.[to] || 1;
    const scenarios = [];
    
    // Generate 1000 quantum branches
    for (let i = 0; i < 1000; i++) {
      const randomFactor = 1 + (Math.random() - 0.5) * 0.1; // ±5% volatility
      scenarios.push(amount * baseRate * randomFactor);
    }
    
    scenarios.sort((a, b) => a - b);
    
    res.json({
      success: true,
      data: {
        baseRate,
        timeHorizon: `${timeHorizon} days`,
        superposition: {
          best: { value: scenarios[990].toFixed(2), percentile: '99th' },
          expected: { value: scenarios[500].toFixed(2), percentile: '50th' },
          worst: { value: scenarios[10].toFixed(2), percentile: '1st' },
          confidenceInterval: {
            lower: scenarios[250].toFixed(2),
            upper: scenarios[750].toFixed(2)
          }
        },
        recommendation: scenarios[500] > amount * baseRate ? 'WAIT' : 'CONVERT_NOW',
        quantumState: 'SUPERPOSITION'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. ETHICAL ANALYSIS API
app.post('/api/ethical', (req, res) => {
  try {
    const { currency, amount } = req.body;
    
    const ethicalScores = {
      INR: { stability: 85, inclusivity: 70, sustainability: 60, transparency: 75, fairness: 65, overall: 71 },
      USD: { stability: 90, inclusivity: 65, sustainability: 55, transparency: 80, fairness: 60, overall: 70 },
      EUR: { stability: 88, inclusivity: 80, sustainability: 75, transparency: 85, fairness: 78, overall: 81 },
      GBP: { stability: 85, inclusivity: 75, sustainability: 70, transparency: 82, fairness: 72, overall: 77 }
    };
    
    const scores = ethicalScores[currency] || ethicalScores.INR;
    
    res.json({
      success: true,
      data: {
        currency,
        scores,
        grade: scores.overall >= 80 ? 'A' : scores.overall >= 70 ? 'B' : scores.overall >= 60 ? 'C' : 'D',
        impact: scores.overall >= 80 ? 'POSITIVE' : scores.overall >= 60 ? 'NEUTRAL' : 'NEGATIVE',
        recommendation: scores.sustainability < 60 ? 'Consider more sustainable alternatives' : 'Ethical choice'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// 9. FLOATING ASSISTANT (GEMINI + FALLBACK)
app.post('/api/assistant', async (req, res) => {
  try {
    const { question } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ success: false, error: 'question is required' });
    }

    const answer = await askGemini(question);
    return res.json({ success: true, data: { answer } });
  } catch (error) {
    console.error('Assistant error:', error.message);
    return res.json({ success: true, data: { answer: getBasicAssistantReply(req.body?.question || '') } });
  }
});
// ======== AUTHENTICATION ROUTES ========

// Google OAuth login
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
app.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${FRONTEND_URL}?error=auth_failed`,
    session: true
  }),
  (req, res) => {
    // Successful authentication - save user to session
    if (req.user) {
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.redirect(`${FRONTEND_URL}?error=session_failed`);
        }
        res.redirect(`${FRONTEND_URL}?auth=success`);
      });
    } else {
      res.redirect(`${FRONTEND_URL}?error=no_user`);
    }
  }
);

// Get current user
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ success: true, user: req.user });
  } else {
    res.json({ success: false, user: null });
  }
});

// Logout
app.post('/api/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), version: '1.0.0' });
});

// Helper functions
function generateMockTwinResponse(userData, query, context) {
  const responses = [
    `As your financial twin, I see you have ${userData.riskTolerance || 'moderate'} risk tolerance. Based on your past patterns, I'd suggest waiting for a better rate. Your confidence score is 78%.`,
    `Analyzing your profile: income ₹${userData.income || '50000'}, goals: ${userData.goals?.join(', ') || 'savings'}. My simulation shows 3 outcomes: Best (+5%), Expected (current), Worst (-3%).`,
    `I've learned from your 50+ past decisions. For this conversion, I recommend: ${context?.amount > 50000 ? 'proceed with caution' : 'execute now'}. Trust score: 85%.`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateAlternatives(context) {
  return [
    { action: 'CONVERT_NOW', confidence: 75, expectedOutcome: 'Current rate' },
    { action: 'WAIT_24H', confidence: 65, expectedOutcome: '+2% potential' },
    { action: 'SPLIT_AMOUNT', confidence: 80, expectedOutcome: 'Risk distribution' }
  ];
}

function getBasicAssistantReply(question) {
  const q = (question || '').toLowerCase();
  if (q.includes('how can i use travel feature') || q.includes('how to use travel') || q.includes('travel feature')) {
    return 'To use Travel mode: 1) Open the Travel tab. 2) Choose your destination. 3) Enter your total budget and base currency. 4) Add expected categories like hotel, food, transport, and activities. 5) Review converted local costs and adjust your budget before your trip. You can pair this with Cost of Living mode for deeper planning.';
  }
  if (q.includes('currency') || q.includes('rate') || q.includes('convert')) {
    return 'You can use the Convert mode to get live rates. Rates are fetched from ExchangeRate API with a short cache, and fallback values are used only if the provider is unavailable.';
  }
  if (q.includes('universal') || q.includes('value index') || q.includes('ppp')) {
    return 'Use Value Index mode to compare purchasing power and work-hours required across locations.';
  }
  if (q.includes('space')) {
    return 'Space mode simulates exchange in off-earth economies such as Mars, Moon, and Titan.';
  }
  if (q.includes('quantum')) {
    return 'Quantum mode provides scenario-based projections with best, expected, and worst outcomes.';
  }
  if (q.includes('ethical')) {
    return 'Ethical mode scores currencies on fairness, transparency, sustainability, and stability.';
  }
  if (q.includes('travel') || q.includes('cost of living') || q.includes('receipt') || q.includes('split')) {
    return 'Use Travel mode for trip budgeting, Cost of Living mode to compare affordability by country/city, and Receipt Split to divide shared expenses in different currencies.';
  }
  if (q.includes('bio') || q.includes('stress')) {
    return 'Bio mode estimates stress risk and can suggest safer transaction limits based on inputs.';
  }
  if (q.includes('agent') || q.includes('automation')) {
    return 'Agent mode evaluates rules and decides whether a conversion action should be executed.';
  }
  if (q.includes('map')) {
    return 'Open the Map mode to view country-focused currency conversion on top of OpenStreetMap.';
  }
  if (q.includes('login') || q.includes('register') || q.includes('account')) {
    return 'Use Register to create an account, then Login. After login you can access all conversion and analysis modes.';
  }
  if (q.includes('feature') || q.includes('app')) {
    return 'This app supports conversion, AI twin, universal value index, space economy, simulations, quantum predictions, ethical analysis, travel and map tools.';
  }
  return 'I can help with currency conversion, exchange-rate questions, and how to use this app. Ask something like "How do I convert USD to INR?"';
}

async function askGemini(question) {
  if (!GEMINI_API_KEY) {
    return getBasicAssistantReply(question);
  }

  const prompt = [
    'You are NeoConvert Assistant.',
    'Answer briefly and clearly, using practical app steps when useful.',
    'Scope: ALL app features and currency workflows in NeoConvert.',
    'Supported areas include: Convert, AI Twin, Universal Value Index, Space, Reality Simulation, Autonomous Agent, Bio-Adaptive, Quantum Prediction, Ethical Analysis, Travel, Cost of Living, Receipt Split, Accessibility, and Currency Map.',
    'You must answer these common app questions clearly when asked: how to convert USD to INR, what Universal Value Index means, how Quantum Prediction works, which mode fits travel budgeting, how Currency Map works, Earth vs Space vs Quantum conversion difference, bill splitting across currencies, Bio-Adaptive impact, Ethical Analysis score meaning, using AI Twin, comparing cost of living, and voice assistant usage.',
    'When asked "how to use" any feature, return short numbered steps specific to that feature.',
    'If a user asks non-app topics, politely redirect to currency/app help.',
    `User question: ${question}`
  ].join('\n');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const response = await axios.post(url, {
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  }, { timeout: 10000 });

  const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || getBasicAssistantReply(question);
}

function calculateStressHeuristic(heartRate, hrv, sleepQuality) {
  let score = 0.3; // baseline
  if (heartRate > 100) score += 0.3;
  if (hrv < 30) score += 0.2;
  if (sleepQuality < 5) score += 0.2;
  return Math.min(score, 1.0);
}

// Start server
const PORT = process.env.PORT || 5000;
const httpServer = app.listen(PORT, () => {
  console.log(`🚀 NeoConvert AI Backend running on port ${PORT}`);
  console.log(`📡 API endpoints ready:`);
  console.log(`   POST /api/convert - Currency conversion`);
  console.log(`   POST /api/twin - AI Financial Twin`);
  console.log(`   GET /api/universal/:amount - Universal Value Index`);
  console.log(`   POST /api/simulate - Reality Simulation`);
  console.log(`   POST /api/agent/decide - Autonomous Agent`);
  console.log(`   POST /api/stress - Bio-adaptive stress detection`);
  console.log(`   POST /api/quantum - Quantum predictions`);
  console.log(`   POST /api/ethical - Ethical analysis`);
});

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} already in use — API likely at http://localhost:${PORT}`);
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});


