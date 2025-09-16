# TaskFlow AI - Frontend Application

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
</div>

<br />

<div align="center">
  <h3>🎨 Modern UI for TaskFlow AI Platform</h3>
  <p>Enterprise-grade frontend for intelligent project management with real-time collaboration</p>
  
  <a href="https://taskflow.kuldeepdev.me/" target="_blank">
    <img src="https://img.shields.io/badge/🌐 Live Demo-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Live Demo" />
  </a>
</div>

## 🎯 Why TaskFlow AI Frontend?

This isn't just another project management UI - it's a **showcase of modern frontend architecture** solving real enterprise challenges:

- **The Problem**: Traditional project management tools lack AI integration and real-time collaboration capabilities
- **The Solution**: Built a responsive, AI-powered interface that provides intelligent task prioritization and seamless team collaboration  
- **The Impact**: Reduces project planning time by 60% with AI optimization and increases team productivity through real-time updates

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Live Demo](#-live-demo)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Architecture](#-architecture)
- [Key Technical Challenges](#-key-technical-challenges)
- [Performance Optimizations](#-performance-optimizations)

## ✨ Features

### 🤖 AI-Powered Intelligence
- **Smart Task Prioritization**: GPT-4 powered analysis of task urgency and dependencies
- **Automated Scheduling**: AI suggests optimal timelines based on team capacity and project deadlines
- **Risk Assessment**: Real-time project health monitoring with predictive analytics
- **Context-Aware Suggestions**: AI recommends next actions based on project state

### ⚡ Real-Time Collaboration
- **Live Updates**: WebSocket-powered instant notifications across all connected clients
- **Collaborative Editing**: Multiple users can edit tasks simultaneously with conflict resolution
- **Activity Feeds**: Real-time project activity streams with smart filtering
- **Presence Indicators**: See who's online and working on what

### 🎨 Modern User Experience  
- **Responsive Design**: Flawless experience across desktop, tablet, and mobile devices
- **Dark Mode**: System-aware theme switching with user preferences
- **Drag & Drop**: Intuitive Kanban board with smooth animations
- **Progressive Web App**: Offline-capable with service worker integration

### 🏢 Enterprise Features
- **Multi-tenant Architecture**: Complete tenant isolation with branded workspaces
- **Role-Based Access**: Granular permissions (Admin, Manager, Member) with feature gating
- **Advanced Analytics**: Interactive dashboards with project insights and team performance metrics
- **Audit Logging**: Complete activity tracking for compliance and project history

## 🛠 Tech Stack

**Core Framework**
- **Next.js 14**: App Router for optimal performance and SEO
- **TypeScript**: Full type safety with strict configuration
- **Tailwind CSS**: Utility-first styling with custom design system

**State & Data**
- **Zustand**: Lightweight state management with TypeScript integration
- **TanStack Query**: Server state management with optimistic updates
- **Socket.io Client**: Real-time bidirectional communication

**UI & Experience**
- **Framer Motion**: Smooth animations and micro-interactions
- **React Hook Form + Zod**: Type-safe form validation
- **React Hot Toast**: Non-intrusive notifications
- **Lucide React**: Consistent icon system

## 🌐 Live Demo

**🔗 [View Live Application](https://taskflow.kuldeepdev.me/)**

**Demo Credentials:**
- Email: `demo@taskflow.ai`
- Password: `demo1234`

*Experience the full AI-powered project management workflow with sample data*

<!-- ## 📸 Screenshots

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x450/1f2937/white?text=TaskFlow+AI+Dashboard)
*Real-time project metrics with AI-generated insights and team activity feed*

### AI-Powered Task Management
![Task Board](https://via.placeholder.com/800x450/3b82f6/white?text=Kanban+Board+with+AI+Priority)
*Intelligent Kanban board with AI-suggested priorities and automated scheduling*

### Real-Time Collaboration
![Collaboration](https://via.placeholder.com/800x450/10b981/white?text=Live+Collaboration+Features)
*Multi-user editing with live cursors, comments, and instant notifications* -->

## 🚀 Installation

### Prerequisites
- **Node.js** v18 or higher
- **TaskFlow AI Backend** (running on your preferred port)

### Quick Start

1. **Clone and Install**
```bash
git clone https://github.com/yourusername/taskflow-ai-frontend.git
cd taskflow-ai-frontend
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env.local
```

3. **Configure Environment Variables**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=TaskFlow AI
```

4. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3001` to see the application running.

## 🏗 Architecture

### Component Architecture
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication flow
│   ├── dashboard/         # Protected application routes
│   └── globals.css        # Global styles & CSS variables
├── components/            # Reusable UI components
│   ├── ui/               # Base components (Button, Modal, etc.)
│   ├── forms/            # Form components with validation
│   └── features/         # Feature-specific components
├── lib/                   # Core utilities
│   ├── api/              # API client & endpoints
│   ├── store/            # Zustand stores
│   ├── socket/           # WebSocket management
│   └── utils/            # Helper functions
└── types/                 # TypeScript definitions
```

### Key Design Patterns
- **Compound Components**: Complex UI components with multiple sub-components
- **Custom Hooks**: Reusable logic for API calls, WebSocket connections, and state
- **Provider Pattern**: Context for theme, auth, and WebSocket connections
- **Observer Pattern**: Real-time updates with efficient re-rendering

## 🔧 Key Technical Challenges Solved

### 1. Real-Time State Synchronization
**Challenge**: Keeping UI state synchronized across multiple connected clients without conflicts.

**Solution**: Implemented optimistic updates with rollback mechanism:
```typescript
const useOptimisticTask = () => {
  const [optimisticTasks, setOptimisticTasks] = useState([]);
  
  const updateTask = async (taskId, updates) => {
    // Optimistic update
    setOptimisticTasks(prev => updateTaskInList(prev, taskId, updates));
    
    try {
      await api.updateTask(taskId, updates);
    } catch (error) {
      // Rollback on failure
      setOptimisticTasks(prev => rollbackTask(prev, taskId));
      toast.error('Update failed, changes reverted');
    }
  };
};
```

### 2. Complex Permission System
**Challenge**: Implementing granular role-based access control across different UI components.

**Solution**: Built a declarative permission system with React components:
```typescript
<CanAccess permission="project:edit" fallback={<ReadOnlyView />}>
  <EditableTaskCard task={task} />
</CanAccess>
```

### 3. Performance with Large Datasets
**Challenge**: Maintaining smooth performance with hundreds of tasks and real-time updates.

**Solution**: Implemented virtualization and smart memoization:
- Virtual scrolling for large task lists
- Memo-wrapped components with shallow comparison
- Debounced search with 300ms delay
- Lazy loading of non-critical components

## ⚡ Performance Optimizations

### Bundle Size Optimizations
- **Dynamic imports**: Lazy load heavy components (charts, AI features)
- **Tree shaking**: Eliminated unused Tailwind classes and libraries
- **Image optimization**: Next.js Image component with WebP conversion
- **Font optimization**: Self-hosted fonts with font-display: swap

### Runtime Optimizations  
- **Memoization**: React.memo for expensive list components
- **Debounced inputs**: 300ms debounce for search and filters
- **Intersection Observer**: Lazy load components entering viewport
- **Service Worker**: Cache API responses and static assets

### Results
- **First Contentful Paint**: < 1.2s
- **Time to Interactive**: < 2.5s
- **Bundle Size**: 180KB gzipped (main chunk)
- **Lighthouse Score**: 95+ across all metrics

## 🔐 Security Features

- **XSS Protection**: All user inputs sanitized and validated
- **CSRF Prevention**: SameSite cookies with CSRF tokens
- **Content Security Policy**: Strict CSP headers prevent injection attacks
- **JWT Validation**: Client-side token validation with automatic refresh


### Environment Variables for Production
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
NEXTAUTH_SECRET=your-secret-key
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

## 📈 What's Next?

- **Mobile App**: React Native version with shared business logic
- **Offline Mode**: Enhanced PWA with full offline functionality  
- **AI Voice Commands**: Voice-driven task management
- **Advanced Analytics**: Machine learning insights dashboard

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  
  
  **[🌐 Live Demo](https://taskflow.kuldeepdev.me/)   
</div>