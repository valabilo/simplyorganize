import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './assets/shared/components/RootLayouts';
import Login from './assets/Pages/Home/login';
import Auth from './assets/Pages/Tasks/Auth';
import Tasks from './assets/Pages/Tasks/tasks';
import './index.css';

const App = () => {
  const [authenticated, setAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuthentication();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <BrowserRouter>
      <RootLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setAuthenticated={setAuthenticated} />} />
          <Route
            path="/tasks/*"
            element={
              authenticated ? (
                <Tasks setAuthenticated={setAuthenticated} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  );
};

const Home = () => {
  return <Navigate to="/tasks" />;
};

export default App;
