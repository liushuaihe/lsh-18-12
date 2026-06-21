import { TopBar } from '@/components/TopBar/TopBar';
import { CalibrationStation } from '@/components/CalibrationStation/CalibrationStation';
import { useTemperatureSimulation } from '@/hooks/useTemperatureSimulation';

export default function Calibration() {
  useTemperatureSimulation();

  return (
    <div className={`w-screen h-screen flex flex-col bg-cyber-bg overflow-hidden relative`}>
      <div className="absolute inset-0 pointer-events-none cyber-grid opacity-30" />
      <div className="absolute inset-0 pointer-events-none bg-noise" />

      <TopBar />

      <div className="flex-1 flex overflow-hidden relative z-10">
        <div className="flex-1 min-h-0">
          <CalibrationStation />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent pointer-events-none" />
    </div>
  );
}
