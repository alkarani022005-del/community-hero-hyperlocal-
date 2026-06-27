import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ReportIssue from './pages/ReportIssue';
import IssueDetail from './pages/IssueDetail';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Navbar />
        <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="/report"   element={<ReportIssue />} />
            <Route path="/issue/:id" element={<IssueDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;