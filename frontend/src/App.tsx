
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Results from './pages/Results';
import Evaluate from './pages/Evaluate';
import Compare from './pages/Compare';
import Edit from './pages/Edit';
import Predict from './pages/Predict';
import Anomalies from './pages/Anomalies';
import Recommendations from './pages/Recommendations';
import NotFound from './pages/NotFound';
import ErrorBoundary from './pages/ErrorBoundary';
import './index.css';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      gcTime: 300000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundary>
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
        </ErrorBoundary>
      </Router>

      {import.meta.env.DEV && (
  <ReactQueryDevtools initialIsOpen={false} />
)}
    </QueryClientProvider>
  );
}

export default App;
