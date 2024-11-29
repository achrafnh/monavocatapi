import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout } from 'lucide-react';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Layout className="w-16 h-16 mx-auto text-indigo-600 mb-8" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">MonAvocat Platform</h1>
          <p className="text-xl text-gray-600 mb-8">Connect with legal professionals easily and securely</p>
          
          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;