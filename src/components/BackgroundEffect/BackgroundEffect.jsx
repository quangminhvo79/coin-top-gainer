function BackgroundEffect() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Atmospheric gradient orbs with depth */}
      <div
        className="absolute -top-48 left-1/4 w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[120px] opacity-20"
        style={{
          background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)',
          animation: 'float-slow 20s ease-in-out infinite, pulse-glow 8s ease-in-out infinite'
        }}
      />
      <div
        className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-[120px] opacity-15"
        style={{
          background: 'radial-gradient(circle, #b794f6 0%, transparent 70%)',
          animation: 'float-slow 25s ease-in-out infinite 2s, pulse-glow 10s ease-in-out infinite 1s'
        }}
      />
      <div
        className="absolute -bottom-32 left-1/3 w-[550px] h-[550px] rounded-full mix-blend-screen filter blur-[120px] opacity-18"
        style={{
          background: 'radial-gradient(circle, #00ff88 0%, transparent 70%)',
          animation: 'float-slow 30s ease-in-out infinite 4s, pulse-glow 12s ease-in-out infinite 2s'
        }}
      />

      {/* Refined grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 80%)'
        }}
      />

      {/* Subtle scanline effect */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)'
          }}
        />
      </div>

      {/* Luminous corner accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#00d4ff]/8 via-transparent to-transparent blur-2xl" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#b794f6]/6 via-transparent to-transparent blur-2xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00ff88]/7 via-transparent to-transparent blur-2xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#00d4ff]/6 via-transparent to-transparent blur-2xl" />

      {/* Floating particles */}
      <div className="absolute top-1/4 left-1/2 w-2 h-2 bg-[#00d4ff] rounded-full blur-sm opacity-40 animate-[float-gentle_8s_ease-in-out_infinite]" />
      <div className="absolute top-2/3 left-1/4 w-1.5 h-1.5 bg-[#b794f6] rounded-full blur-sm opacity-30 animate-[float-gentle_10s_ease-in-out_infinite_1s]" />
      <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-[#00ff88] rounded-full blur-sm opacity-35 animate-[float-gentle_12s_ease-in-out_infinite_2s]" />
    </div>
  );
}

export default BackgroundEffect;
