import { useState } from 'react'
import './App.css'
import VideoCapture from './VideoCapture'
import Landing from './landing';
import Cheating from './cheating';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {

  return (
    <Router>
      <Routes>
      <Route path="/" element={<Landing/>}/>
      <Route path="/video" element={<VideoCapture />}/>
      <Route path="/cheating" element={<Cheating />}/>

      
      </Routes>
    </Router>
  )
}

export default App
