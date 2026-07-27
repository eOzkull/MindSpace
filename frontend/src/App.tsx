import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './pages/ErrorBoundary';
import './index.css';
import './styles/charts.css';

// Lazy-load every page
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Results = lazy(() => import('./pages/Results'));
const Evaluate = lazy(() => import('./pages/Evaluate'));
const Compare = lazy(() => import('./pages/Compare'));
const Edit = lazy(() => import('./pages/Edit'));
const Predict = lazy(() => import('./pages/Predict'));
const Anomalies = lazy(() => import('./pages/Anomalies'));
const Recommendations = lazy(() => import('./pages/Recommendations'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 300_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundary>
          <Suspense fallback={<LoadingScreen message="Loading..." />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="results" element={<Results />} />
                <Route path="evaluate" element={<Evaluate />} />
                <Route path="compare" element={<Compare />} />
                <Route path="edit" element={<Edit />} />
                <Route path="predict" element={<Predict />} />
                <Route path="anomalies" element={<Anomalies />} />
                <Route path="recommendations" element={<Recommendations />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;

