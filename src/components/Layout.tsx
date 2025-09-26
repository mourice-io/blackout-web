import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../theme.css';

function IconHome({active}:{active?:boolean}) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9.5z"
        stroke={active ? '#D4AF37' : '#b5b7bd'} strokeWidth="1.5" fill="none" />
    </svg>
  );
}
function IconTruck() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M2 13h10V9H9l-2 2H2v2zM14 9h3l3 3v5h-2a2 2 0 1 1-4 0h-2a2 2 0 1 1-4 0H6"
        stroke="#000" strokeWidth="1.6" />
      <circle cx="9" cy="17" r="1.8" fill="#000"/>
      <circle cx="18" cy="17" r="1.8" fill="#000"/>
    </svg>
  );
}
function IconMore({active}:{active?:boolean}) {
  const c = active ? '#D4AF37' : '#b5b7bd';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="5" cy="12" r="2" fill={c}/>
      <circle cx="12" cy="12" r="2" fill={c}/>
      <circle cx="19" cy="12" r="2" fill={c}/>
    </svg>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const nav = useNavigate();

  const moreLinks = [
    ['/tracking','Tracking'],
    ['/shop','Shop'],
    ['/gallery','Gallery'],
    ['/reviews','Reviews'],
    ['/about','About'],
    ['/account','Account'],
  ] as const;

  return (
    <div className="bo-root">
      {/* NO TOP BAR — only page content */}
      <main className="bo-main">
        <Outlet />
      </main>

      {/* Bottom Tab Bar */}
      <div className="bo-tabbar" role="navigation" aria-label="Primary">
        <button
          className={'tab-btn' + (pathname === '/' ? ' active' : '')}
          onClick={() => nav('/')}
        >
          <IconHome active={pathname==='/'}/>
          <span>Home</span>
        </button>

        <button className="tab-center" onClick={() => nav('/schedule')} aria-label="Schedule">
          <IconTruck />
        </button>

        <button
          className={'tab-btn' + (open ? ' active' : '')}
          onClick={() => setOpen(true)}
        >
          <IconMore active={open}/>
          <span>More</span>
        </button>
      </div>

      {/* Slide-up sheet for More */}
      {open && (
        <div className="sheet-overlay" onClick={() => setOpen(false)}>
          <div className="sheet" onClick={e=>e.stopPropagation()}>
            <div className="sheet-title">More</div>
            <div className="sheet-links">
              {moreLinks.map(([to, label]) => (
                <NavLink key={to} to={to} className="sheet-link" onClick={()=>setOpen(false)}>
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No footer (keeps the page clean). If you want it back, add it here. */}
    </div>
  );
}
