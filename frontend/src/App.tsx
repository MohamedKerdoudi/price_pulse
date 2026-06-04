import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductForm from './components/ProductForm';
import Dashboard from './components/Dashboard';
import { useCreateProduct } from './hooks/useProducts';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const createMutation = useCreateProduct();

  const handleCreateProduct = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
    } catch (error) {
      console.error('Failed to create product:', error);
      // Error is displayed via createMutation.error in ProductForm
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>PricePulse</h1>
        <p className="subtitle">Smart Price Tracker</p>
      </header>
      <main className="app-main">
        <ProductForm
          onSubmit={handleCreateProduct}
          isLoading={createMutation.isPending}
          error={createMutation.error ? String(createMutation.error) : null}
        />
        <Dashboard />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
