import L from 'leaflet';

const TRUCK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`;

let pulseStyleInjected = false;
const ensurePulseStyle = () => {
  if (typeof document === 'undefined' || pulseStyleInjected) return;
  const id = 'truck-pin-pulse-style';
  if (document.getElementById(id)) {
    pulseStyleInjected = true;
    return;
  }
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `@keyframes truckPulse { 0% { transform: scale(0.85); opacity: 0.7 } 100% { transform: scale(1.6); opacity: 0 } }`;
  document.head.appendChild(style);
  pulseStyleInjected = true;
};

export const createTruckIcon = (live: boolean) => {
  ensurePulseStyle();
  const ring = live
    ? `<span style="position:absolute;inset:-6px;border-radius:9999px;background:rgba(245,158,11,0.35);animation:truckPulse 1.6s ease-out infinite;"></span>`
    : '';
  const bg = live ? '#f59e0b' : '#fbbf24';
  return L.divIcon({
    className: 'truck-map-marker',
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9999px;background:${bg};color:white;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);">${ring}<div style="position:relative">${TRUCK_SVG}</div></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

export const createUserIcon = () =>
  L.divIcon({
    className: 'user-map-marker',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:#2563eb;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
