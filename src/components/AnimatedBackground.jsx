export default function AnimatedBackground() {
  return (
    <div className="bg-scene" aria-hidden="true">
      <div className="bg-scene__orb bg-scene__orb--1" />
      <div className="bg-scene__orb bg-scene__orb--2" />
      <div className="bg-scene__orb bg-scene__orb--3" />
      <div className="bg-scene__grid" />
      <div className="bg-scene__noise" />
      <div className="bg-scene__particles">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>
    </div>
  );
}
