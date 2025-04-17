// src/components/AdminPanel/utils/auth.js
export const handleLogin = (e, username, password, setIsAuthenticated, setIsLoading) => {
    e.preventDefault();
    setIsLoading(true);
  
    setTimeout(() => {
      if (username === 'Admin' && password === 'adminadmin') {
        setIsAuthenticated(true);
      } else {
        alert('Invalid credentials');
      }
      setIsLoading(false);
    }, 800);
  };