import React from 'react';
import { Link } from 'react-router-dom';

export default function Home(){
  return (
    <div>
      <section className="bo-card" style={{display:'grid',gap:10}}>
        <h2 style={{margin:0,color:'var(--gold)'}}>Roadside help, done right.</h2>
        <p style={{margin:0,color:'#cfd1d5'}}>Fast ETAs • Live link • Upfront pricing.</p>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:6}}>
          <Link to="/schedule" className="bo-btn">Request Service</Link>
          <Link to="/reviews" className="bo-btn outline">See Reviews</Link>
        </div>
      </section>

      <div className="bo-hr" />

      <div className="bo-grid">
        <div className="bo-card">
          <b style={{color:'var(--gold)'}}>Services</b>
          <ul style={{margin:'8px 0 0 16px',lineHeight:'1.7'}}>
            <li>Towing (light & medium)</li>
            <li>Jump start • Lockout • Tire change • Fuel delivery</li>
            <li>Winch-outs • Private impound</li>
          </ul>
        </div>
        <div className="bo-card">
          <b style={{color:'var(--gold)'}}>Pricing (sample)</b>
          <ul style={{margin:'8px 0 0 16px',lineHeight:'1.7'}}>
            <li>Base fee: $85 (includes 7 miles)</li>
            <li>After 7 miles: $4 per mile</li>
            <li>After-hours: +$20</li>
          </ul>
          <p style={{marginTop:8,color:'#b5b7bd'}}>Final price depends on distance and service type.</p>
        </div>
        <div className="bo-card">
          <b style={{color:'var(--gold)'}}>Service Area</b>
          <p style={{margin:'8px 0 0 0'}}>Local & regional coverage. Call for long-distance tows.</p>
          <p style={{margin:'6px 0 0 0',color:'#b5b7bd'}}>24/7 availability.</p>
        </div>
      </div>
    </div>
  );
}
