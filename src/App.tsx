import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './components/HomeScreen/HomeScreen'
import RegisterScreen from './components/register/RegisterScreen'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App