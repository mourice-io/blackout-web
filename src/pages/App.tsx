import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Schedule from './Schedule';
import Tracking from './Tracking';
import Shop from './Shop';
import Gallery from './Gallery';
import Reviews from './Reviews';
import About from './About';
import Account from './Account';

export default function App() {
  return (
    <div>
      <nav style={{padding:'1rem', background:'#111', color:'#f1c40f'}}>
        <Link to="/" style={{marginRight:'1rem', color:'#f1c40f'}}>Home</Link>
        <Link to="/schedule" style={{marginRight:'1rem', color:'#f1c40f'}}>Schedule</Link>
        <Link to="/tracking" style={{marginRight:'1rem', color:'#f1c40f'}}>Tracking</Link>
        <Link to="/shop" style={{marginRight:'1rem', color:'#f1c40f'}}>Shop</Link>
        <Link to="/gallery" style={{marginRight:'1rem', color:'#f1c40f'}}>Gallery</Link>
        <Link to="/reviews" style={{marginRight:'1rem', color:'#f1c40f'}}>Reviews</Link>
        <Link to="/about" style={{marginRight:'1rem', color:'#f1c40f'}}>About</Link>
        <Link to="/account" style={{marginRight:'1rem', color:'#f1c40f'}}>Account</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/about" element={<About />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </div>
  );
}
