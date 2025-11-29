interface GlitchTextProps {
  text: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
}

export const GlitchText = ({ text, as: Component = 'span', className = '' }: GlitchTextProps) => {
  return (
    <Component className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -ml-0.5 translate-x-[2px] text-red-500 opacity-70 animate-pulse z-0">{text}</span>
      <span className="absolute top-0 left-0 -ml-0.5 -translate-x-[2px] text-cyan-500 opacity-70 animate-pulse delay-75 z-0">{text}</span>
    </Component>
  );
};

