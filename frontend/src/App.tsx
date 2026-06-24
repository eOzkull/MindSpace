
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Results from './pages/Results';
import Evaluate from './pages/Evaluate';
import Compare from './pages/Compare';
import Edit from './pages/Edit';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="results" element={<Results />} />
          <Route path="evaluate" element={<Evaluate />} />
          <Route path="compare" element={<Compare />} />
          <Route path="edit" element={<Edit />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
