import { useState } from 'react'
import './App.css'
import Register from './components/register/register-v2'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <Register />
      </div>
    </>
  )
}

export default App
