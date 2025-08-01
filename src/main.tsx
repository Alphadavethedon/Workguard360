import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ✅ Import from React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ✅ Create a client instance
const queryClient = new QueryClient();

// ✅ Wrap App in the provider
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
