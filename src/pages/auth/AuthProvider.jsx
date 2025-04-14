import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

window.onstorage = () => {
  // console.log("storage ", window.location.href)
  let userDataStore = JSON.parse(localStorage.getItem("userDataStore"));
  
  if (!userDataStore?.access_token && window.location.pathname.startsWith("/dashboard")) {
    window.location.href = "/auth/sign-in";
  }
  
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let userDataStore = JSON.parse(localStorage.getItem("userDataStore"));

    // console.log("token ", userDataStore?.access_token)
    if (userDataStore?.access_token) {
      // Validate the userDataStore?.access_token (e.g., check expiration)
      setUser({ token: userDataStore?.access_token });
    }
  }, []);

  const login = (token) => {
    // localStorage.setItem('token', token);
    setUser({ token });

    console.log("login token ", token)
  };

  const logout = () => {
    // localStorage.removeItem('token');
    setUser(null);

    console.log("logout  ")
  };



  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

