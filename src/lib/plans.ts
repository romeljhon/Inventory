
export const planLimits = {
  free: {
    name: 'Starter',
    items: 100,
    sales: 100,
    purchaseOrders: 10,
    aiScans: 5,
    users: 1,
    branches: 1,
  },
  growth: {
    name: 'Growth',
    items: 2000,
    sales: 2000,
    purchaseOrders: 100,
    aiScans: 75,
    users: 5,
    branches: 3,
  },
  scale: {
    name: 'Scale',
    items: Infinity,
    sales: Infinity,
    purchaseOrders: Infinity,
    aiScans: 200,
    users: Infinity,
    branches: Infinity,
  },
};

export type PlanId = keyof typeof planLimits;

export const PLANS = [
  {
    name: 'Starter',
    tierId: 'free',
    price: 'Free',
    priceNumeric: 0,
    description: 'Perfect for solo business owners, new online sellers, or first-time users who want to explore the system risk-free.',
    features: [
      { text: '1 User (Owner)', included: true },
      { text: '1 Branch', included: true },
      { text: '100 Inventory Items', included: true },
      { text: '100 Sales per month', included: true },
      { text: '10 Purchase Orders per month', included: true },
      { text: '5 AI Receipt Scans per month', included: true },
      { text: '5 AI Demand Forecasts per month', included: true },
      { text: 'Community Support', included: true },
    ],
  },
  {
    name: 'Growth',
    tierId: 'growth',
    price: '₱1,499',
    priceNumeric: 1499,
    description: 'For growing cafés, restaurants, or small retailers managing multiple staff or branches.',
    isPopular: true,
    features: [
      { text: 'Up to 5 Users', included: true },
      { text: 'Up to 3 Branches', included: true },
      { text: '2,000 Inventory Items', included: true },
      { text: '2,000 Sales per month', included: true },
      { text: '100 Purchase Orders per month', included: true },
      { text: '75 AI Receipt Scans per month', included: true },
      { text: '75 AI Demand Forecasts per month', included: true },
      { text: 'Email Support', included: true },
      { text: 'Automated PO Suggestions', included: true },
    ],
  },
  {
    name: 'Scale',
    tierId: 'scale',
    price: '₱3,999',
    priceNumeric: 3999,
    description: 'For enterprises, restaurant chains, or distributors managing multiple branches and high volume.',
    features: [
      { text: 'Unlimited Users', included: true },
      { text: 'Unlimited Branches', included: true },
      { text: 'Unlimited Inventory Items', included: true },
      { text: 'Unlimited Sales & POs', included: true },
      { text: '200 AI Receipt Scans per month', included: true },
      { text: '200 AI Demand Forecasts per month', included: true },
      { text: 'Priority Support', included: true },
      { text: 'API Access & Early AI Features', included: true },
    ],
  },
];
