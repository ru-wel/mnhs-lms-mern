import { useState, useEffect, createContext, useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const AuthContext = createContext();

const AuthWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const checkTokenAndRole = async () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('User_Role');

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/validate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok && data.valid) {
          setIsAuthenticated(true);
          setRole(userRole);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        setIsAuthenticated(false);
      }
    };

    checkTokenAndRole();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AuthContext.Provider value={{ role }}>
      <Outlet />
    </AuthContext.Provider>
  );
};

const AdminWrapper = () => {
  const { role } = useContext(AuthContext);

  if (role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const GuestWrapper = () => {
  const [isValidToken, setIsValidToken] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsValidToken(true);
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/validate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.valid) {
          setIsValidToken(false);
        } else {
          setIsValidToken(true);
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        setIsValidToken(true);
      }
    };

    checkToken();
  }, []);

  if (isValidToken === null) {
    return <div>Loading...</div>;
  }

  if (!isValidToken) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export { AuthWrapper, AdminWrapper, GuestWrapper };
