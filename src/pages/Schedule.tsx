import React, { useEffect, useMemo, useRef, useState } from 'react';
import L, { Map as LeafletMap, Marker } from 'leaflet';

/* ---------- Vehicle data (dynamic via NHTSA vPIC API) ----------
   Flow: Vehicle Type -> Fetch Makes -> Pick Make -> Fetch Models.
   Types you can extend: "car", "truck", "mpv", "motorcycle" */
const VEHICLE_TYPES = [
  {key:'car', label:'Car'},
  {key:'truck', label:'Truck'},
  {key:'mpv', label:'MPV'},
  {key:'motorcycle', label:'Motorcycle'},
] as const;

/* ---------- Services (dropdown) ---------- */
const SERVICES = [
  'Tow',
  'Jump Start',
  'Tire Change',
  'Lockout',
  'Fuel Delivery',
  'Winch-Out',
];

type Step = 1|2|3|4|5|6;

export default function Schedule(){
  const [step,setStep] = useState<Step>(1);

  /* Service selection */
  const [serviceType,setServiceType] = useState<string>('Tow');

  /* Vehicle cascading dropdowns */
  const [vehicleType, setVehicleType] = useState<(typeof VEHICLE_TYPES)[number]['key']>('car');
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [vehicleMake, setVehicleMake] = useState<string>('');
  const [vehicleModel, setVehicleModel] = useState<string>('');
  const [vehicleYear, setVehicleYear] = useState<string>('');
  const currentYear = new Date().getFullYear();
  const YEARS = useMemo(() => Array.from({length: 40}, (_,i) => String(currentYear - i)), [currentYear]);

  /* Location + Map */
  const [loc,setLoc] = useState<{address?:string; lat?:number; lng?:number}>({});
  const [loadingGPS,setLoadingGPS] = useState(false);

  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const mapDivRef = useRef<HTMLDivElement | null>(null);

  /* Time selection */
  const [whenType,setWhenType] = useState<'ASAP'|'SCHEDULED'>('ASAP');
  const [schedDate,setSchedDate] = useState<string>(''); // yyyy-mm-dd
  const [schedTime,setSchedTime] = useState<string>(''); // HH:MM

  const mapsLink = loc.lat && loc.lng ? `https://maps.google.com/?q=${loc.lat},${loc.lng}` : undefined;

  /* ---------- Effects ---------- */

  // Init Leaflet map once
  useEffect(() => {
    if (mapRef.current || !mapDivRef.current) return;

    const map = L.map(mapDivRef.current, {
      zoomControl: false,
      attributionControl: false,
      center: [39.5, -98.35], // US center fallback
      zoom: 4,
    });
    mapRef.current = map;

    // Dark basemap (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    // Custom metallic-gold pin (SVG)
    const GoldIcon = L.divIcon({
      className: '',
      html: `
        <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#E8CD76"/>
              <stop offset="55%" stop-color="#D4AF37"/>
              <stop offset="100%" stop-color="#B68E2D"/>
            </linearGradient>
          </defs>
          <path d="M15 0c8.3 0 15 6.6 15 14.8 0 10-11.2 22.4-14.1 26.4a1.2 1.2 0 0 1-1.8 0C11.2 37.2 0 24.8 0 14.8 0 6.6 6.7 0 15 0z" fill="url(#g)"/>
          <circle cx="15" cy="14.5" r="5.5" fill="#000"/>
        </svg>
      `,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
    });

    // Create marker but do not place until we have coords
    markerRef.current = L.marker([0,0], { icon: GoldIcon });
  }, []);

  // When coords change, move map + drop/update marker
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    if (loc.lat && loc.lng) {
      const latlng: [number, number] = [loc.lat, loc.lng];
      if (!map.hasLayer(marker)) marker.addTo(map);
      marker.setLatLng(latlng);
      map.setView(latlng, 15, { animate: true });
    }
  }, [loc.lat, loc.lng]);

  // Fetch makes when vehicleType changes
  useEffect(() => {
    let ignore = false;
    async function run(){
      try{
        const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/${vehicleType}?format=json`;
        const res = await fetch(url);
        const data = await res.json();
        const list = (data?.Results || [])
          .map((r:any)=> String(r.MakeName))
          .filter(Boolean)
          .sort((a:string,b:string)=> a.localeCompare(b));
        if (!ignore){
          setMakes(list);
          setVehicleMake('');
          setModels([]);
          setVehicleModel('');
        }
      } catch(e){
        console.error('Failed to load makes', e);
        if (!ignore){ setMakes([]); }
      }
    }
    run();
    return ()=>{ ignore = true; }
  }, [vehicleType]);

  // Fetch models when make changes
  useEffect(() => {
    let ignore = false;
    async function run(){
      if (!vehicleMake) { setModels([]); setVehicleModel(''); return; }
      try{
        const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(vehicleMake)}?format=json`;
        const res = await fetch(url);
        const data = await res.json();
        const list = (data?.Results || [])
          .map((r:any)=> String(r.Model_Name))
          .filter(Boolean)
          .sort((a:string,b:string)=> a.localeCompare(b));
        if (!ignore){
          setModels(list);
          setVehicleModel('');
        }
      } catch(e){
        console.error('Failed to load models', e);
        if (!ignore){ setModels([]); }
      }
    }
    run();
    return ()=>{ ignore = true; }
  }, [vehicleMake]);

  /* ---------- Actions ---------- */

  async function useMyLocation(){
    try{
      setLoadingGPS(true);
      await new Promise<void>((resolve,reject)=>{
        navigator.geolocation.getCurrentPosition(
          p => { setLoc({lat:p.coords.latitude, lng:p.coords.longitude}); resolve(); },
          e => reject(e),
          { enableHighAccuracy:true, timeout:12000 }
        );
      });
    } catch{
      alert('Please allow location access or enter your address manually.');
    } finally{
      setLoadingGPS(false);
    }
  }

  /* ---------- Render ---------- */

  return (
    <div className="bo-card" style={{padding:0}}>
      {/* Live Map (dark, seamless) */}
      <div className="map-wrap" ref={mapDivRef} />

      <div style={{padding:18}}>
        <div style={{color:'#b5b7bd',marginBottom:8}}>Step {step} of 6</div>

        {/* STEP 1: Service (dropdown) */}
        {step===1 && (
          <section style={{display:'grid',gap:12}}>
            <h3 style={{margin:0,color:'var(--gold)'}}>Select Service</h3>
            <div className="field">
              <label className="label">Service type</label>
              <select className="input" value={serviceType} onChange={e=>setServiceType(e.target.value)}>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="bo-btn" onClick={()=>setStep(2)}>Continue</button>
            </div>
          </section>
        )}

        {/* STEP 2: Vehicle (Type -> Make -> Model + Year) */}
        {step===2 && (
          <section style={{display:'grid',gap:12}}>
            <h3 style={{margin:0,color:'var(--gold)'}}>Vehicle Details</h3>

            <div className="field">
              <label className="label">Vehicle type</label>
              <select className="input" value={vehicleType} onChange={e=>setVehicleType(e.target.value as any)}>
                {VEHICLE_TYPES.map(v => <option key={v.key} value={v.key}>{v.label}</option>)}
              </select>
            </div>

            <div className="field">
              <label className="label">Make</label>
              <select
                className="input"
                value={vehicleMake}
                onChange={e=>setVehicleMake(e.target.value)}
              >
                <option value="">{makes.length? 'Select make':'Loading makes…'}</option>
                {makes.map(m => <option key={m} value={m}>{m}</option>)}
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
                <option value="">{vehicleMake ? (models.length? 'Select model':'Loading models…') : 'Choose make first'}</option>
                {models.map(md => <option key={md} value={md}>{md}</option>)}
              </select>
            </div>

            <div className="field">
              <label className="label">Year</label>
              <select className="input" value={vehicleYear} onChange={e=>setVehicleYear(e.target.value)}>
                <option value="">Select year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="bo-btn outline" onClick={()=>setStep(1)}>Back</button>
              <button className="bo-btn" onClick={()=>setStep(3)} disabled={!vehicleMake || !vehicleModel || !vehicleYear}>Continue</button>
            </div>
          </section>
        )}

        {/* STEP 3: Location */}
        {step===3 && (
          <section style={{display:'grid',gap:12}}>
            <h3 style={{margin:0,color:'var(--gold)'}}>Pickup Location</h3>

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

        {/* STEP 4: When (dropdown ASAP / Schedule for later + date/time) */}
        {step===4 && (
          <section style={{display:'grid',gap:12}}>
            <h3 style={{margin:0,color:'var(--gold)'}}>When?</h3>

            <div className="field">
              <label className="label">Time of service</label>
              <select className="input" value={whenType} onChange={e=>setWhenType(e.target.value as 'ASAP'|'SCHEDULED')}>
                <option value="ASAP">ASAP</option>
                <option value="SCHEDULED">Schedule for later</option>
              </select>
            </div>

            {whenType==='SCHEDULED' && (
              <div style={{display:'grid',gap:12, gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))'}}>
                <div className="field">
                  <label className="label">Date</label>
                  <input
                    className="input"
                    type="date"
                    value={schedDate}
                    onChange={e=>setSchedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="field">
                  <label className="label">Time</label>
                  <input
                    className="input"
                    type="time"
                    value={schedTime}
                    onChange={e=>setSchedTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="bo-btn outline" onClick={()=>setStep(3)}>Back</button>
              <button className="bo-btn" onClick={()=>setStep(5)} disabled={whenType==='SCHEDULED' && (!schedDate || !schedTime)}>Continue</button>
            </div>
          </section>
        )}

        {/* STEP 5: Estimate */}
        {step===5 && (
          <section style={{display:'grid',gap:12}}>
            <h3 style={{margin:0,color:'var(--gold)'}}>Estimate</h3>
            <div className="bo-grid">
              <div className="bo-card"><b>Service:</b> {serviceType}</div>
              <div className="bo-card"><b>Vehicle:</b> {vehicleYear || '—'} {vehicleMake || ''} {vehicleModel || ''}</div>
              <div className="bo-card"><b>When:</b> {whenType==='ASAP' ? 'ASAP' : `${schedDate} ${schedTime}`}</div>
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

        {/* STEP 6: Confirm */}
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
