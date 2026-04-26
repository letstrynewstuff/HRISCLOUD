// src/components/Loader.jsx

import React from "react";

const Loader = () => {
  return (
    <div className="relative w-[110px] h-[110px] flex items-center justify-center">
      {/* Outer rotating ring */}
      <div className="absolute w-full h-full border-4 border-transparent border-t-[#4F46E5] border-r-[#4F46E5] rounded-full animate-[spin_1.6s_linear_infinite]" />

      {/* Glowing center orb */}
      <div className="absolute w-9 h-9 bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] rounded-full shadow-[0_0_25px_#4F46E5,0_0_50px_#06B6D4] animate-[pulse_1.8s_ease-in-out_infinite]" />

      {/* Orbiting dots */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 bg-white rounded-full shadow-md"
          style={{
            top: "50%",
            left: "50%",
            transform: `rotate(${i * 60}deg) translate(46px)`,
            animation: `orbit 2.4s linear infinite`,
            animationDelay: `-${i * 0.4}s`,
          }}
        />
      ))}

      {/* Optional: Loading text */}
      <div className="absolute -bottom-10 text-sm font-medium text-slate-400 tracking-wider">
        LOADING
      </div>
    </div>
  );
};

export default Loader;
