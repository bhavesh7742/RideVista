import React, { useState, useEffect } from 'react';
import scootyImg from '../assets/vehicles/scooty.png';
import bikeImg from '../assets/vehicles/bike.png';
import carImg from '../assets/vehicles/car.png';
import autoImg from '../assets/vehicles/auto.png';

/* ─────────────────────────────────────────────────────────────────
   Vehicle config
   ───────────────────────────────────────────────────────────────── */
const VEHICLES = [
  { id: 'scooty', label: 'Scooty', image: scootyImg },
  { id: 'bike', label: 'Bike', image: bikeImg },
  { id: 'car', label: 'Car', image: carImg },
  { id: 'auto', label: 'Auto Rickshaw', image: autoImg },
];

/* ─────────────────────────────────────────────────────────────────
   RideVistaLoader
   Props:
     size  – 'small' | 'medium' | 'large' | 'hero'
   ───────────────────────────────────────────────────────────────── */
const RideVistaLoader = ({ size = 'medium' }) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const DISPLAY_MS = 1800;   // Show each vehicle slightly longer for premium look
  const TRANSITION_MS = 350;    // Smoother fade/scale transition time

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % VEHICLES.length);
        setVisible(true);
      }, TRANSITION_MS);
    }, DISPLAY_MS + TRANSITION_MS);

    return () => clearInterval(id);
  }, []);

  const { label, image } = VEHICLES[index];

  const cfg = {
    small: { w: 96, h: 58, labelCls: 'text-[9px]  pt-2', dotPad: 'pt-1.5' },
    medium: { w: 140, h: 84, labelCls: 'text-[10px] pt-3', dotPad: 'pt-2' },
    large: { w: 260, h: 156, labelCls: 'text-xs     pt-5', dotPad: 'pt-3' },
    hero: {
      w: 1000,
      h: 180,
      labelCls: 'text-sm',
      dotPad: 'pt-0',
    },
  }[size] ?? { w: 140, h: 84, labelCls: 'text-[10px] pt-3', dotPad: 'pt-2' };

  const transitionStyle = {
    transition: `opacity ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    opacity: visible ? 1 : 0,
    transform: visible ? 'scale(1) translateY(0px)' : 'scale(0.95) translateY(4px)',
    width: '100%',
    maxWidth: `${cfg.w}px`,
    height: `${cfg.h}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-0">
      {/* Vehicle Image */}
      <div style={transitionStyle}>
        <img
          src={image}
          alt={label}
          style={{
            width: 'auto',
            height: '170px',
            objectFit: 'contain',
            display: 'block'
          }}
        />
      </div>

      {/* Vehicle label */}
      <div
        className={`text-yellow-400 font-bold uppercase tracking-[0.22em] text-center ${cfg.labelCls}`}
        style={{ transition: `opacity ${TRANSITION_MS}ms ease`, opacity: visible ? 1 : 0 }}
      >
        {label}
      </div>

      {/* Pagination dots */}
      <div className={`flex items-center justify-center gap-2 ${cfg.dotPad}`}>
        {VEHICLES.map((v, i) => (
          <div
            key={v.id}
            style={{ transition: 'width 350ms ease, opacity 350ms ease' }}
            className={`rounded-full h-1.5 ${i === index ? 'w-6 bg-yellow-500' : 'w-1.5 bg-yellow-500/25'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default RideVistaLoader;
