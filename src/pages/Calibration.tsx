import { TopBar } from '@/components/TopBar/TopBar';
import { CalibrationStation } from '@/components/CalibrationStation/CalibrationStation';
import { useTemperatureSimulation } from '@/hooks/useTemperatureSimulation';
import { Settings } from 'lucide-react';

export default function Calibration() {
  useTemperatureSimulation();

  return (
    <div className={`w-screen h-screen flex flex-col bg-cyber-bg overflow-hidden relative`}>
      <div className="absolute inset-0 pointer-events-none cyber-grid opacity-30" />
      <div className="absolute inset-0 pointer-events-none bg-noise" />

      <TopBar />

      <div className="flex-1 flex overflow-hidden relative z-10">
        <div className="w-14 border-r border-cyber-line/70 flex flex-col items-center py-4 gap-2 bg-cyber-panel/30">
          <NavButton
            icon={<Settings size={18} />}
            label="校准台"
            active
          />
        </div>

        <div className="flex-1 min-h-0">
          <CalibrationStation />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent pointer-events-none" />
    </div>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all
      ${active
        ? 'bg-cyber-cyan/20 text-cyber-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]'
        : 'text-slate-500 hover:text-cyber-cyan hover:bg-cyber-cyan/10'
      }`}
    title={label}
  >
    {icon}
  </button>
);
