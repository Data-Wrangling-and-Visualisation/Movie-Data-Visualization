import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LineChart from './components/charts/LineChart';

function App() {
  return (
    <div>
      <h1>Top-250 films from Kinopoisk</h1>
      <LineChart />
    </div>
  )
}

export default App