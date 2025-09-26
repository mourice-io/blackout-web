import React, { useState } from 'react';

export default function Reviews(){
  const [sent,setSent] = useState(false);
  if (sent) return <div className="bo-card"><h3 style={{color:'var(--gold)',marginTop:0}}>Thanks!</h3><p>Your review has been submitted.</p></div>;

  return (
    <div className="bo-card">
      <h3 style={{color:'var(--gold)',marginTop:0}}>Reviews</h3>
      <p>Leave a review — it goes straight to our dashboard.</p>
      <form name="blackout-reviews" method="POST" data-netlify="true" onSubmit={()=>setSent(true)}>
        <input type="hidden" name="form-name" value="blackout-reviews" />
        <Input name="name" placeholder="Your name" required />
        <Input name="service" placeholder="Service (Tow, Jump, etc.)" />
        <textarea name="message" placeholder="Your review" required style={ta}/>
        <button className="bo-btn" type="submit">Submit Review</button>
      </form>
    </div>
  );
}
const ta:React.CSSProperties={width:'100%',minHeight:120,padding:'12px',borderRadius:12,border:'1px solid var(--border)',background:'#0e0e0e',color:'#fff',margin:'10px 0'};
function Input(props: React.InputHTMLAttributes<HTMLInputElement>){
  return <input {...props} style={{
    width:'100%',padding:'12px',borderRadius:12,border:'1px solid var(--border)',
    background:'#0e0e0e',color:'#fff',margin:'10px 0'
  }}/>;
}
