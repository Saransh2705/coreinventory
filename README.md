# Core Stock Hub

**Enterprise Inventory Management System**

A modern, full-stack inventory management system built with Next.js, React, and Bun. Core Stock Hub provides comprehensive tools for managing warehouse operations, tracking inventory, and handling logistics workflows.

## 🎯 Overview

Core Stock Hub is a production-ready inventory management platform designed for businesses that need to track products across multiple warehouses and locations. The system provides real-time stock visibility, automated workflows for receipts and deliveries, and comprehensive reporting capabilities.

## ✨ Features

### Inventory Management
- **Product Catalog**: Complete product management with SKU tracking, categories, and stock levels
- **Multi-Warehouse Support**: Manage inventory across multiple warehouses and locations
- **Stock Overview**: Real-time visibility of stock distribution and availability
- **Reorder Level Alerts**: Automated low-stock notifications

### Warehouse Operations
- **Receipts Management**: Track incoming stock from suppliers
- **Deliveries**: Process outgoing shipments to customers
- **Internal Transfers**: Move inventory between locations
- **Stock Adjustments**: Correct inventory discrepancies
- **Move History**: Complete audit trail of all inventory movements

### Infrastructure
- **Warehouse Management**: Configure warehouses with custom locations
- **Location Tracking**: Rack and shelf-level organization
- **User Management**: Role-based access control
- **Settings**: Customizable system configuration

### Dashboard & Analytics
- **KPI Cards**: Key performance indicators at a glance
- **Real-time Monitoring**: Live updates on pending operations
- **Activity Feed**: Recent transactions and movements
- **Status Tracking**: Visual status indicators for all operations

## 🛠 Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Framework**: [Next.js 15](https://nextjs.org/) - React framework with App Router
- **UI Library**: [React 18](https://react.dev/) - Component-based UI
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- **Component Library**: [shadcn/ui](https://ui.shadcn.com/) - Re-usable components
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful icon set
- **Animation**: [Framer Motion](https://www.framer.com/motion/) - Production-ready animations
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) - Type-safe form validation
- **State Management**: [TanStack Query](https://tanstack.com/query) - Data fetching and caching
- **TypeScript**: Full type safety across the application

## 📁 Project Structure

```
core-stock-hub/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Dashboard page
│   │   ├── providers.tsx       # Client-side providers
│   │   ├── globals.css         # Global styles
│   │   ├── products/           # Product management
│   │   ├── warehouses/         # Warehouse management
│   │   ├── receipts/           # Receipt processing
│   │   ├── deliveries/         # Delivery management
│   │   ├── transfers/          # Internal transfers
│   │   └── ...                 # Other pages
│   ├── components/
│   │   ├── layout/             # Layout components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopNav.tsx
│   │   ├── shared/             # Shared components
│   │   │   ├── DataTable.tsx
│   │   │   ├── KPICard.tsx
│   │   │   └── PageHeader.tsx
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   ├── utils.ts            # Utility functions
│   │   └── mock-data.ts        # Sample data
│   └── hooks/                  # Custom React hooks
├── public/                     # Static assets
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- Node.js 18+ (if not using Bun exclusively)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd core-stock-hub
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

### Development

Start the development server:

```bash
bun run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Building for Production

Create an optimized production build:

```bash
bun run build
```

Start the production server:

```bash
bun run start
```

### Linting

Run ESLint to check code quality:

```bash
bun run lint
```

## 🎨 Design System

The application uses a carefully crafted design system with:

- **Color Palette**: Semantic color tokens for consistent theming
- **Typography**: Inter font family with OpenType features
- **Spacing**: 8px grid system
- **Components**: Accessible, reusable UI components from shadcn/ui
- **Dark Mode**: Built-in dark mode support (extendable)
- **Responsive**: Mobile-first responsive design

## 📄 Key Pages

- `/` - Dashboard with KPIs and recent activity
- `/products` - Product catalog and management
- `/products/[id]` - Individual product details
- `/warehouses` - Warehouse configuration
- `/locations` - Location management
- `/stock-overview` - Real-time stock distribution
- `/receipts` - Incoming stock processing
- `/deliveries` - Outgoing shipment management
- `/transfers` - Inter-location transfers
- `/adjustments` - Inventory adjustments
- `/move-history` - Complete movement audit log
- `/users` - User management
- `/roles` - Role and permissions
- `/profile` - User profile
- `/settings` - System settings

## 🔒 Authentication

The application includes a login page at `/login`. Authentication logic can be integrated with your preferred auth provider (NextAuth.js, Clerk, etc.).

## 🤝 Contributing

This is a production application. If you need to contribute:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

This project is private and proprietary.

## 🆘 Support

For support, please contact your system administrator or project maintainer.

---

**Built with ❤️ using modern web technologies**

