export default function Aurora() {
  return (
    <div className="admin-orbs" aria-hidden="true">
      <div
        className="anim-drift absolute w-[34rem] h-[34rem] rounded-full blur-3xl opacity-25"
        style={{ background: '#6d28d9', top: '-12%', left: '-8%' }}
      />
      <div
        className="anim-drift absolute w-[28rem] h-[28rem] rounded-full blur-3xl opacity-15"
        style={{ background: '#22d3ee', top: '4%', right: '-10%', animationDelay: '-8s' }}
      />
      <div
        className="anim-drift absolute w-[36rem] h-[36rem] rounded-full blur-3xl opacity-20"
        style={{ background: '#8b5cf6', bottom: '-16%', left: '20%', animationDelay: '-14s' }}
      />
      <div
        className="anim-drift absolute w-[22rem] h-[22rem] rounded-full blur-3xl opacity-12"
        style={{ background: '#ec4899', top: '58%', right: '8%', animationDelay: '-4s' }}
      />
    </div>
  );
}
