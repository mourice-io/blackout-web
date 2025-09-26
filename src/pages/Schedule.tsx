import React, { useMemo, useState } from 'react';

// ---- Data ----
const currentYear = new Date().getFullYear();
const YEARS = Array.from({length: 40}, (_,i) => String(currentYear - i)); // 40 years back
const MAKES = ['Ford','Chevrolet','Toyota','Honda','Nissan','Jeep','BMW','Mercedes-Benz','Hyundai','Kia','Tesla'] as const;
const MODELS: Record<(typeof MAKES)[number], string[]> = {
  Ford: ['F-150','Escape','Explorer','Mustang','Focus'],
  Chevrolet: ['Silverado','Equinox','Tahoe','Malibu'],
  Toyota: ['Camry','Corolla','RAV4','Tacoma','Tundra'],
  Honda: ['Civic','Accord','CR-V','Pilot','Ridgeline'],
  Nissan: ['Altima','Sentra','Rogue','Frontier'],
  Jeep: ['Wrangler','Grand Cherokee','Renegade','Gladiator'],
  BMW: ['3 Series','5 Series','X3','X5'],
  'Mercedes-Benz': ['C-Class','E-Class','GLC','GLE'],
  Hyundai: ['Elantra','Sonata','Tucson','Santa Fe'],
  Kia: ['Soul','Sportage','Sorento','Telluride'],
  Tesla: ['Model 3','Model S','Model X','Model Y'],
};

type Step = 1|2|3|4|5|6;

export default function Schedule(){
  const [step,setStep] = useState<Step>(1);
  const [serviceType,setServiceType] = useState('Tow');

  const [vehicleYear, setVehicleYear] = useState<string>('');
  const [vehicleMake, setVehicleMake] = useState<keyof typeof MODELS | ''>('');
  const [vehicleModel, setVehicleModel] = useState<string>('');

  const [loc,setLoc] = useState<{address?:string; lat?:number; lng?:number}>({});
  const [timeType,setTimeType] = useState<'ASAP'|'SCHEDULED'>('ASAP');
  const [loadingGPS,setLoadingGPS] = useState(false);

  const modelsForMake = useMemo(() => (vehicleMake ? MODELS[vehicleMake] : []), [vehicleMake]);
  const mapsLink = loc.lat && loc.lng ? `https://maps.google.com/?q=${loc.lat},${loc.lng}` : undefined;

  async function useMyLocation(){
    try{
      setLoadingGPS(true);
      await new Promise<void>((resolve,reject)=>{
        navigator.geolocation.getCurrentPosition(
          p => { setLoc({lat:p.coords.latitude, lng:p.coords.longitude}); resolve(); },
          e => reject(e), { enableHighAccuracy:true, timeout:12000 }
        );
      });
    } catch{ alert('Allow location or type your address.'); }
    finally{ setLoadingGPS(false); }
  }

  return (
    <div className="bo-card" style={{padding:0, overflow:'hidden'}}>
      {/* Black & Gold "map" header (styled vector) */}
      <div style={{height:240, position:'relative', background:'linear-gradient(180deg,#0a0a0a,#020202)'}}>
        <svg viewBox="0 0 600 240" width="100%" height="100%" style={{opacity:.9}}>
          <defs>
            <radialGradient id="goldGlow" cx="50%" cy="30%">
              <stop offset="0%" stopColor="rgba(212,175,55,.30)"/>
              <stop offset="70%" stopColor="rgba(212,175,55,0)"/>
            </radialGradient>
          </defs>
        <rect width="600" height="240" fill="url(#goldGlow)"/>
        <path d="M50 190 C 120 140, 180 150, 260 110 S 420 120, 540 70"
              stroke="#D4AF37" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="6 10"/>
        {[[50,190],[260,110],[540,70]].map(([x,y],i)=>(
          <g key={i}>
            <circle cx={x} cy={y} r="10" fill="#D4AF37"/>
            <circle cx={x} cy={y} r="18" fill="rgba(212,175,55,.25)"/>
          </g>
        ))}
        </svg>
      </div>

      {/* Body */}
      <div style={{padding:18}}>
        <div style={{color:'#b5b7bd',marginBottom:8}}>Step {step} of 6</div>

        {step===1 && (
          <section style={{display:'grid',gap:12}}>
            <h3 style={{margin:0,color:'var(--gold)'}}>Select your service</h3>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {['Tow','Jump Start','Tire Change','Lockout','Fuel Delivery','Winch'].map(s => (
                <button key={s} className={'bo-btn '+(serviceType===s?'':'outline')} onClick={()=>setServiceType(s)}>{s}</button>
              ))}
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="bo-btn" onClick={()=>setStep(2)}>Continue</button>
            </div>
          </section>
        )}

        {step===2 && (
          <section style={{display:'grid',gap:12}}>
            <h3 style={{margin:0,color:'var(--gold)'}}>Vehicle details</h3>

            <div className="field">
              <label className="label">Year</label>
              <select className="input" value={vehicleYear} onChange={e=>setVehicleYear(e.target.value)}>
                <option value="">Select year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="field">
              <label className="label">Make</label>
              <select
                className="input"
                value={vehicleMake}
                onChange={e=>{
                  const m = e.target.value as keyof typeof MODELS | '';
                  setVehicleMake(m); setVehicleModel('');
                }}>
                <option value="">Select make</option>
                {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="field">
              <label className="label">Model</label>
              <select
                className="input"
                value={vehicleModel}
                onChange={e=>setVehicleModel(e.target.value)}
                disabled={!vehicleMake}
              >
                <option value="">{vehicleMake ? 'Select model' : 'Choose make first'}</option>
                {modelsForMake.map(md => <option key={md} value={md}>{md}</option>)}
              </select>
            </div>

            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="bo-btn outline" onClick={()=>setStep(1)}>Back</button>
              <button className="bo-btn" onClick={()=>setStep(3)}>Continue</button>
            </div>
          </section>
        )}

        {step===3 && (
          <section style={{display:'grid',gap:12}}>
            <h3 style={{margin:0,color:'var(--gold)'}}>Pickup location</h3>
            <div className="field">
              <label className="label">Address / intersection</label>
              <input className="input" value={loc.address||''} onChange={e=>setLoc({...loc,address:e.target.value})} placeholder="123 Main St, City" />
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="bo-btn outline" disabled={loadingGPS} onClick={useMyLocation}>
                {loadingGPS ? 'Getting GPS…' : 'Use my location'}
              </button>
              {mapsLink && <a className="bo-btn outline" href={mapsLink} target="_blank" rel="noreferrer">Open in Maps</a>}
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="bo-btn outline" onClick={()=>setStep(2)}>Back</button>
              <button className="bo-btn" onClick={()=>setStep(4)}>Continue</button>
            </div>
          </section>
        )}

        {step===4 && (
          <section style={{display:'grid',gap:12}}>
            <h3 style={{margin:0,color:'var(--gold)'}}>When?</h3>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className={'bo-btn '+(timeType==='ASAP'?'':'outline')} onClick={()=>setTimeType('ASAP')}>ASAP</button>
              <button className={'bo-btn '+(timeType==='SCHEDULED'?'':'outline')} onClick={()=>setTimeType('SCHEDULED')}>Schedule</button>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="bo-btn outline" onClick={()=>setStep(3)}>Back</button>
              <button className="bo-btn" onClick={()=>setStep(5)}>Continue</button>
            </div>
          </section>
        )}

        {step===5 && (
          <section style={{display:'grid',gap:12}}>
            <h3 style={{margin:0,color:'var(--gold)'}}>Estimate</h3>
            <div className="bo-grid">
              <div className="bo-card"><b>Service:</b> {serviceType}</div>
              <div className="bo-card"><b>Vehicle:</b> {vehicleYear || '—'} {vehicleMake || ''} {vehicleModel || ''}</div>
              <div className="bo-card"><b>Base fee:</b> $85.00</div>
              <div className="bo-card"><b>Miles included:</b> 7</div>
              <div className="bo-card"><b>Per-mile after:</b> $4.00</div>
              <div className="bo-card"><b>GPS:</b> {loc.lat? `${loc.lat.toFixed(5)}, ${loc.lng!.toFixed(5)}`:'—'}</div>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="bo-btn outline" onClick={()=>setStep(4)}>Back</button>
              <button className="bo-btn" onClick={()=>setStep(6)}>Continue</button>
            </div>
          </section>
        )}

        {step===6 && (
          <section style={{display:'grid',gap:12}}>
            <h3 style={{margin:0,color:'var(--gold)'}}>Book now</h3>
            <p style={{color:'#b5b7bd'}}>Collect contact + payment next. For now this confirms the request.</p>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="bo-btn" onClick={()=>alert('Confirmed! (demo)')}>Confirm</button>
              <button className="bo-btn outline" onClick={()=>setStep(5)}>Back</button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
