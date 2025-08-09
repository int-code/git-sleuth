import './App.css'
import MainApp from './pages/MainApp'
import Login from './pages/Login'
import { useState } from 'react'

function App() {
  const [loggedIn, setLoggedIn] = useState(true)
  if(!loggedIn) {
    return <Login />
  }
  else {
    return <MainApp />
  }
}

export default App
