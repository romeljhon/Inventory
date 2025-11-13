
# Inventory Management System

This is an intelligent, full-stack inventory management application built with Next.js and Firebase. It provides a comprehensive suite of tools for small to medium-sized businesses to manage stock, sales, purchasing, and gain AI-powered insights into their operations.

## Core Features

- **Multi-Tenancy**: Supports multiple businesses and multiple branches within each business.
- **Role-Based Access Control**: Differentiates between Owners, Admins, and Staff, with distinct permissions.
- **Inventory Management**:
    - Tracks both raw materials (**Components**) and finished goods (**Products**).
    - **Recipe Management**: Define recipes to automatically calculate product stock based on available components.
    - Expiration date tracking and low-stock alerts.
- **Point of Sale (POS)**:
    - Smart sales terminal that prevents selling out-of-stock items by checking component availability in real-time.
    - Automatic deduction of component stock upon sale.
    - Support for discounts and multiple payment methods (for record-keeping).
- **Purchasing Workflow**:
    - **Supplier Management**: Maintain a directory of suppliers.
    - **Purchase Orders**: Create, track, and manage purchase orders to suppliers.
    - **Automated PO Suggestions**: Get AI-driven suggestions to create purchase orders when component stock is low.
- **Reporting & Analytics**:
    - **Sales Reports**: Analyze revenue, items sold, and top-selling products.
    - **Inventory Snapshots**: View a read-only snapshot of your inventory from any previous date.
    - **Inventory History**: A complete, immutable log of every stock change.
- **AI-Powered Features**:
    - **Demand Forecasting**: Predict future product demand based on historical sales data.
    - **Category Suggestions**: Get AI-powered suggestions for categorizing new items.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- **Generative AI**: [Genkit (via Google AI)](https://firebase.google.com/docs/genkit)

---

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Running the Development Server

1.  **Install Dependencies**:
    Open a terminal in the project root and run:
    ```bash
    npm install
    ```

2.  **Run the App**:
    To start the Next.js development server, run:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

3.  **Run the Genkit AI Server** (for AI features):
    In a separate terminal, start the Genkit development server:
    ```bash
    npm run genkit:watch
    ```
    This will run the AI flows that power features like demand forecasting and category suggestions.

---

## Project Structure

The project follows a standard Next.js App Router structure. Here are the key directories:

```
.
├── src
│   ├── app/                # All pages and routes for the application.
│   ├── components/         # Reusable React components (UI, forms, dialogs, etc.).
│   ├── firebase/           # Firebase configuration, providers, and custom hooks.
│   ├── hooks/              # Custom React hooks for business logic (e.g., useBusiness, useInventory).
│   ├── lib/                # Utility functions, type definitions, and server actions.
│   └── ai/                 # Genkit flows for all AI-powered features.
├── docs/
│   └── backend.json        # The data schema blueprint for Firestore entities.
└── firestore.rules         # Security rules for the Firestore database.
```

### Key Files

-   `src/app/**/page.tsx`: Each `page.tsx` file corresponds to a public route in the application.
-   `src/hooks/use-business.tsx`: Manages the state for the active business, branches, and employees.
-   `src/hooks/use-inventory.ts`: Contains all the logic for reading and writing inventory data to Firestore.
-   `src/firebase/provider.tsx`: The root provider that initializes and exposes Firebase services to the React tree.
-   `docs/backend.json`: A crucial file that defines the data structure of all entities in Firestore. This serves as a single source of truth for the application's data model.
-   `firestore.rules`: Defines the security rules that control read/write access to the Firestore database, ensuring users can only access their own business data.

---

## Firebase Backend

This project is tightly integrated with Firebase services.

### Firebase Authentication

-   Handles user sign-up and login via email and password.
-   Manages user sessions and provides user information throughout the app.

### Firestore Database

-   Firestore is used as the primary NoSQL database for all application data.
-   The data is structured hierarchically, with all data for a business nested under a top-level `/businesses/{businessId}` document. This ensures strong data isolation between different businesses.
-   **Security Rules**: The `firestore.rules` file is critical for security. It ensures that users can only read or write data they are authorized to access, based on their role (Owner, Admin, or Staff) within a specific business.
