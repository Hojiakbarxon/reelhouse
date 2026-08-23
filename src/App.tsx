import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/query-client';
import { router } from '@/routes/router';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1b2230',
            color: '#f6f4ee',
            border: '1px solid #262e3f',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#e8b94d', secondary: '#0b0e14' } },
          error: { iconTheme: { primary: '#d64550', secondary: '#0b0e14' } },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
