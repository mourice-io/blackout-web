import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Tracking from './pages/Tracking';
import Shop from './pages/Shop';
import Gallery from './pages/Gallery';
import Reviews from './pages/Reviews';
import About from './pages/About';
import Account from './pages/Account';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout/>}>
        <Route path="/" element={<Home/>} />
        <Route path="/schedule" element={<Schedule/>} />
        <Route path="/tracking" element={<Tracking/>} />
        <Route path="/shop" element={<Shop/>} />
        <Route path="/gallery" element={<Gallery/>} />
        <Route path="/reviews" element={<Reviews/>} />
        <Route path="/about" element={<About/>} />
        <Route path="/account" element={<Account/>} />
      </Route>
    </Routes>
  );
}
