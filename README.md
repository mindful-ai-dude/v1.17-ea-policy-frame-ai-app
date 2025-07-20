# 🌟 PolicyFrame: AI-Powered Policy Content Generation Platform

> **Transforming AI Policy Advocacy Through Cognitive Framing and Advanced AI**

A sophisticated web application that combines **Effective Altruism principles** with **George Lakoff's cognitive framing methodology** to generate strategically framed AI policy content. Built for policymakers, advocates, researchers, and organizations working in AI safety, alignment, and policy advocacy.

---

## 🎯 **Mission Statement**

PolicyFrame empowers the AI safety and policy community to create more effective, persuasive content by applying scientifically-backed cognitive framing techniques. Instead of reinforcing opposition narratives, we help advocates build bridges through positive, value-based messaging that resonates across political and cultural boundaries.

---

## ✨ **Key Features**

### 🧠 **Advanced AI Integration**
- **Google Gemini API Integration** with three model options:
  - **Gemini 2.5 Pro**: Ultra-high quality for complex policy analysis
  - **Gemini 2.5 Flash**: Balanced performance for most use cases  
  - **Gemma 3 12B IT**: Cost-effective for high-volume generation
- **Real-time Streaming Generation** with live progress tracking
- **Intelligent Model Selection** with capability comparisons

### 🎭 **Lakoff Cognitive Framing Engine**
- **"Don't Think of an Elephant" Principles** integrated into all content
- **Positive Frame Reinforcement** avoiding opposition language
- **Value-Based Messaging** connecting to universal human values
- **Conceptual Metaphor Analysis** with automatic detection
- **Frame Quality Assessment** and optimization suggestions

### 🌍 **Global Policy Context**
- **Regional Adaptation** for USA, Europe, Australia, and Morocco
- **Policy Framework Integration**:
  - **USA**: Federal AI initiatives, state regulations, NIST frameworks
  - **Europe**: GDPR compliance, AI Act implementation, digital sovereignty
  - **Australia**: AI governance frameworks, responsible AI principles
  - **Morocco**: Digital transformation strategy, African Union AI initiatives
- **Cultural Context Adaptation** for effective regional messaging

### 📝 **Four Specialized Content Types**

#### 1. **Short Daily Blog Posts** (500-800 words)
- SEO-optimized with strategic keyword placement
- Compelling calls-to-action for engagement
- Social media sharing optimization
- Lakoff framing throughout

#### 2. **AI Policy Articles** (1200-1500 words)
- In-depth policy analysis with evidence
- Comprehensive Lakoff framing application
- Automatic citation integration
- Storytelling structure for engagement

#### 3. **Marketing Playbooks**
- Complete strategy frameworks
- Brand story development (Seth Godin methodology)
- A/B testing frameworks
- Conversion optimization strategies
- Multi-channel campaign planning

#### 4. **Social Media Calendars**
- One-month content planning
- Platform-specific optimization
- Hashtag research and trending topics
- Engagement optimization strategies
- Crisis communication protocols

### 🔒 **Enterprise-Grade Security**
- **Encrypted API Key Storage** with client-side encryption
- **Secure User Authentication** via Convex Auth
- **Data Privacy Compliance** with GDPR principles
- **Session Management** with automatic security features

### 📚 **Professional Content Management**
- **Advanced Content Library** with search and filtering
- **Grid/List View Modes** for different workflows
- **Content Analytics** (word count, reading time, frame analysis)
- **Version Control** and editing capabilities
- **Export Options** (HTML, PDF, Text) with professional formatting

### 📊 **Usage Analytics & Insights**
- **Generation Tracking** with detailed statistics
- **Token Usage Monitoring** for cost management
- **Performance Analytics** and optimization insights
- **Lakoff Frame Analysis** with metaphor detection
- **Content Effectiveness Metrics**

---

## 🏗️ **Technical Architecture**

### **Frontend Stack**
- **React 19.1+** with TypeScript for type safety
- **Vite 7.0+** for lightning-fast development
- **Tailwind CSS 3.4+** with custom glassmorphic design system
- **Framer Motion 11.3+** for smooth animations
- **Zustand 4.5+** for efficient state management

### **Backend Infrastructure**
- **Convex** for real-time database and serverless functions
- **Convex Auth** for secure user authentication
- **Convex File Storage** for document management
- **Express.js** for additional API endpoints
- **Node.js 20+** runtime environment

### **AI & External Services**
- **Google Generative AI SDK** for content generation
- **Custom Lakoff Framing Engine** for cognitive analysis
- **Regional Context Service** for policy adaptation
- **Content Generation Pipeline** with streaming responses

### **Database Schema (Convex)**

#### **Users Table**
```typescript
{
  name: string,
  email: string,
  isAnonymous: boolean,
  preferences: {
    defaultModel: string,
    defaultRegion: string,
    defaultContentType: string,
    theme: string
  },
  usage: {
    totalGenerations: number,
    totalTokens: number,
    lastGeneration: string
  },
  createdAt: string,
  updatedAt: string
}
```

#### **Generated Content Table**
```typescript
{
  userId: Id<"users">,
  type: string, // blog, article, playbook, social
  topic: string,
  region: string, // USA, Europe, Australia, Morocco
  model: string, // gemini-2.5-pro, etc.
  content: string,
  metadata: {
    wordCount: number,
    readingTime: number,
    framesUsed: string[],
    metaphorsUsed: string[]
  },
  citations: Citation[],
  createdAt: string,
  updatedAt: string
}
```

#### **API Keys Table**
```typescript
{
  userId: Id<"users">,
  provider: string, // "google"
  encryptedKey: string,
  keyPreview: string,
  createdAt: string,
  updatedAt: string
}
```

#### **Documents Table** (Future Enhancement)
```typescript
{
  userId: Id<"users">,
  title: string,
  content: string,
  metadata: DocumentMetadata,
  storageId: string,
  extractedMetaphors: Metaphor[],
  framingExamples: FramingExample[],
  createdAt: string,
  updatedAt: string
}
```

---

## 🚀 **Quick Start Guide**

### **Prerequisites**
- **Node.js 20+** and **pnpm** package manager
- **Google AI Studio Account** for Gemini API access
- **Convex Account** for backend services

### **1. Clone and Install**
```bash
git clone <repository-url>
cd ea-policy-frame-app
pnpm install
```

### **2. Environment Setup**
```bash
# Copy environment template
cp .env.example .env.local

# Add your Convex deployment URL (generated in step 3)
echo "VITE_CONVEX_URL=your_convex_url_here" >> .env.local
```

### **3. Convex Backend Setup**
```bash
# Install Convex CLI globally
npm install -g convex

# Initialize Convex project
npx convex dev

# Follow prompts to create account and deployment
# This will automatically populate CONVEX_DEPLOYMENT in .env.local
```

### **4. Start Development**
```bash
# Start all services (frontend, backend, Convex)
pnpm run dev

# Or start individually:
pnpm run dev:frontend  # React app on http://localhost:5173
pnpm run dev:backend   # Express server on http://localhost:3001
pnpm run dev:convex    # Convex development server
npx convex dev --typecheck=disable # Convex development server
```

### **5. Get Google Gemini API Key**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. In the app, go to Settings → API Keys
4. Add your API key (it will be encrypted and stored securely)

---

## 🔧 **Useful Commands**

### **Development**
```bash
# Start full development environment
pnpm run dev

# Start only frontend (if backend already running)
pnpm run dev:frontend

# Build for production
pnpm run build

# Run tests
pnpm run test

# Lint code
pnpm run lint
```

### **Convex Database Management**
```bash
# Reset database (clear all data)
for tableName in `npx convex data`; do npx convex import --table $tableName --replace -y --format jsonLines /dev/null; done

# View database tables
npx convex data

# Deploy to production
pnpm run deploy:convex

# View Convex dashboard
npx convex dashboard
```

### **Production Deployment**
```bash
# Build application
pnpm run build

# Deploy Convex backend
npx convex deploy --prod

# Start production server
pnpm run start
```

---

## 🎨 **Design System**

### **Glassmorphic UI Components**
- **GlassCard**: Primary container with backdrop blur
- **GlassButton**: Interactive elements with hover states
- **GlassInput**: Form inputs with glassmorphic styling
- **GlassModal**: Overlay dialogs and modals

### **Color Palette**
- **Primary Gradient**: Blue to light blue (`from-blue-400 to-blue-200`)
- **Glass Effects**: White transparency with backdrop blur
- **Accent Colors**: Green (success), Red (danger), Purple (premium)

### **Typography**
- **Primary Font**: System font stack for optimal performance
- **Headings**: Bold weights with proper hierarchy
- **Body Text**: Optimized for readability across devices

---

## 📖 **User Guide**

### **Getting Started**
1. **Sign Up/Sign In**: Create account or sign in anonymously
2. **Configure API Key**: Add your Google Gemini API key in Settings
3. **Create Content**: Choose topic, region, and content type
4. **Generate**: Select AI model and watch real-time generation
5. **Edit & Export**: Refine content and export in multiple formats

### **Content Creation Workflow**
1. **Landing Page**: Enter topic and optional reference URL
2. **Regional Selection**: Choose policy context (USA, Europe, Australia, Morocco)
3. **Content Type**: Select from blog, article, playbook, or social media
4. **Generation Dashboard**: Choose AI model and monitor progress
5. **Output Display**: Edit, analyze, and export your content
6. **Content Library**: Organize and manage all generated content

### **Advanced Features**
- **Lakoff Analysis**: View detected frames and metaphors
- **Content Analytics**: Track word count, reading time, effectiveness
- **Export Options**: Download as HTML, PDF, or plain text
- **Search & Filter**: Find content by type, region, or keywords
- **Usage Tracking**: Monitor API usage and generation statistics

---

## 🔐 **Security & Privacy**

### **Data Protection**
- **API keys encrypted** before storage using client-side encryption
- **User data isolated** with proper access controls
- **Session security** with automatic timeout and secure tokens
- **HTTPS enforcement** for all communications

### **Privacy Compliance**
- **Minimal data collection** - only what's necessary for functionality
- **User control** over data with export and deletion options
- **Transparent usage** - clear information about data handling
- **GDPR principles** applied throughout the application

---

## 🤝 **Contributing to AI Safety**

### **For EA Organizations**
PolicyFrame is designed to amplify the impact of AI safety and policy work by:
- **Improving message effectiveness** through cognitive framing
- **Scaling content creation** for advocacy campaigns
- **Ensuring consistent messaging** across different contexts
- **Building bridges** rather than reinforcing divisions

### **Integration Opportunities**
- **API endpoints** for integration with existing workflows
- **Bulk content generation** for large-scale campaigns
- **Custom framing models** for specific organizational needs
- **Analytics integration** for measuring content effectiveness

---

## 📊 **Performance & Scalability**

### **Optimization Features**
- **Code splitting** and lazy loading for fast initial load
- **Image optimization** and CDN integration
- **Efficient state management** with minimal re-renders
- **Progressive Web App** capabilities for offline access

### **Scalability**
- **Serverless architecture** with Convex for automatic scaling
- **Real-time synchronization** across multiple devices
- **Efficient database queries** with proper indexing
- **Rate limiting** and error handling for API stability

---

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **API Key Problems**
```bash
# Error: "Invalid API key format"
# Solution: Ensure key starts with "AIza" and is from Google AI Studio

# Error: "API key not configured"
# Solution: Add key in Settings → API Keys tab
```

#### **Generation Failures**
```bash
# Error: "Rate limit exceeded"
# Solution: Wait a moment and try again, or upgrade API plan

# Error: "Model unavailable"
# Solution: Try a different model or check Google AI Studio status
```

#### **Database Issues**
```bash
# Reset database if needed
for tableName in `npx convex data`; do npx convex import --table $tableName --replace -y --format jsonLines /dev/null; done

# Restart Convex development server
npx convex dev --typecheck=disable
```

---

## 📈 **Roadmap & Future Enhancements**

### **Planned Features**
- **Document Upload & Analysis** for reference material integration
- **Team Collaboration** with shared workspaces
- **Advanced Analytics** with A/B testing for content effectiveness
- **API Access** for third-party integrations
- **Multi-language Support** for global advocacy
- **Custom Framing Models** for specific organizational needs

### **AI Safety Integrations**
- **Alignment Forum Integration** for research-based content
- **Policy Database** with real-time updates
- **Stakeholder Analysis** for targeted messaging
- **Impact Measurement** tools for advocacy effectiveness

---

## 📞 **Support & Community**

### **Getting Help**
- **Documentation**: Comprehensive guides and tutorials
- **Community Forum**: Connect with other users and contributors
- **Issue Tracking**: Report bugs and request features
- **Direct Support**: For EA organizations and serious users

### **Contributing**
We welcome contributions from the AI safety and policy community:
- **Code contributions** for new features and improvements
- **Content suggestions** for better framing examples
- **Policy expertise** for regional context improvements
- **User feedback** for continuous improvement

---

## 📄 **License & Attribution**

### **Open Source Commitment**
PolicyFrame is committed to advancing AI safety through open collaboration:
- **MIT License** for maximum accessibility
- **Attribution requirements** for derivative works
- **Community governance** for major decisions
- **Transparent development** with public roadmap

### **Acknowledgments**
- **George Lakoff** for cognitive framing methodology
- **Effective Altruism Community** for inspiration and guidance
- **Google AI** for Gemini API access
- **Convex** for backend infrastructure
- **Open source community** for foundational technologies

---

## 🌟 **Impact Statement**

PolicyFrame represents a new paradigm in AI policy advocacy - one that builds bridges instead of walls, creates understanding instead of division, and advances AI safety through effective communication. By combining cutting-edge AI technology with proven cognitive science, we're empowering advocates to create content that truly changes minds and shapes policy.

**Together, we can frame the future of AI in ways that benefit all of humanity.**

---

*Built with ❤️ for the AI Safety and Effective Altruism communities*

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintained by**: PolicyFrame Team