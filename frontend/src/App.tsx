import './App.css'
import MainApp from './pages/MainApp'
import Login from './pages/Login'
import { useEffect, useState } from 'react'

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem('token')) {
      setLoggedIn(true);
    } else {
      const url_params = new URLSearchParams(window.location.search);
      if (url_params.has('token')) {
        sessionStorage.setItem('token', url_params.get('token') || '');
        setLoggedIn(true);
      }
      else{
        sessionStorage.removeItem('token');
        setLoggedIn(false);
      }
    } 
  }, [])
  if(!loggedIn) {
    return <Login />
  }
  else {
    return <MainApp />
  }
}

export default App
