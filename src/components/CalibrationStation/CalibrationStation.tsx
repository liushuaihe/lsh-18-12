import React, { useState, useMemo } from 'react';
import { useMonitorStore } from '../../store/useMonitorStore';
import { Calibration, CalibrationStatus, TempSensor } from '../../types';
import { TempChart } from '../TempMonitor/TempChart';
import {
  Settings, Plus, Trash2, Edit2, Check, X, Clock,
  AlertTriangle, CheckCircle, Calendar, User, FileText,
  ChevronRight, Thermometer, Activity, Eye,
} from 'lucide-react';

const STATUS_STYLES: Record<CalibrationStatus, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  valid: {
    bg: 'bg-emerald-900/30',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    icon: <CheckCircle size={12} />,
  },
  upcoming: {
    bg: 'bg-amber-900/30',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
    icon: <Clock size={12} />,
  },
  expired: {
    bg: 'bg-rose-900/40',
    text: 'text-rose-400',
    border: 'border-rose-500/50',
    icon: <AlertTriangle size={12} />,
  },
};

const STATUS_LABELS: Record<CalibrationStatus, string> = {
  valid: '校准有效',
  upcoming: '即将到期',
  expired: '已过期',
};

const formatDate = (ts: number) => {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatOffset = (offset: number) => {
  const sign = offset >= 0 ? '+' : '';
  return `${sign}${offset.toFixed(2)}°C`;
};

const daysUntil = (ts: number) => {
  const now = Date.now();
  const diff = ts - now;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
};

const buildChartData = (
  sensor: TempSensor,
  deviceName: string,
  previewOffset: number,
  showCalibrated: boolean,
  isExpired: boolean
) => {
  const result: Array<{
    sensor: TempSensor;
    deviceName: string;
    color: string;
    calibrationExpired?: boolean;
    calibratedTemp?: number;
    calibratedHistory?: Array<{ t: number; v: number }>;
  }> = [];

  result.push({
    sensor,
    deviceName: `${deviceName} (原始)`,
    color: '#00F0FF',
    calibrationExpired: isExpired,
  });

  if (showCalibrated) {
    const calibratedHistory = sensor.tempHistory.map(p => ({
      ...p,
      v: p.v + previewOffset,
    }));
    const calibratedTemp = sensor.currentTemp + previewOffset;

    result.push({
      sensor,
      deviceName: `${deviceName} (校准后)`,
      color: previewOffset >= 0 ? '#30D158' : '#FF9500',
      calibratedTemp,
      calibratedHistory,
    });
  }

  return result;
};

interface CalibrationFormProps {
  sensorId: string;
  initialData?: Calibration;
  onSubmit: (data: Omit<Calibration, 'id'>) => void;
  onCancel: () => void;
}

const CalibrationForm: React.FC<CalibrationFormProps> = ({ sensorId, initialData, onSubmit, onCancel }) => {
  const [offset, setOffset] = useState(initialData?.offset ?? 0);
  const [effectiveDate, setEffectiveDate] = useState(
    initialData ? formatDate(initialData.effectiveDate) : formatDate(Date.now())
  );
  const [expiryDays, setExpiryDays] = useState(
    initialData
      ? Math.ceil((initialData.expiryDate - initialData.effectiveDate) / (24 * 60 * 60 * 1000))
      : 365
  );
  const [calibratedBy, setCalibratedBy] = useState(initialData?.calibratedBy ?? '');
  const [note, setNote] = useState(initialData?.note ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effTs = new Date(effectiveDate).getTime();
    const expTs = effTs + expiryDays * 24 * 60 * 60 * 1000;
    onSubmit({
      sensorId,
      offset,
      effectiveDate: effTs,
      expiryDate: expTs,
      calibratedBy: calibratedBy || '未填写',
      note: note || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-mono text-slate-400 mb-1">偏移量 (°C)</label>
          <input
            type="number"
            step="0.1"
            value={offset}
            onChange={e => setOffset(parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1.5 text-sm font-mono bg-slate-900/60 border border-cyber-line rounded
              text-cyber-cyan focus:outline-none focus:border-cyber-cyan/60"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-400 mb-1">有效期 (天)</label>
          <input
            type="number"
            min="1"
            value={expiryDays}
            onChange={e => setExpiryDays(parseInt(e.target.value) || 1)}
            className="w-full px-2 py-1.5 text-sm font-mono bg-slate-900/60 border border-cyber-line rounded
              text-cyber-cyan focus:outline-none focus:border-cyber-cyan/60"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-mono text-slate-400 mb-1">生效日期</label>
        <input
          type="date"
          value={effectiveDate}
          onChange={e => setEffectiveDate(e.target.value)}
          className="w-full px-2 py-1.5 text-sm font-mono bg-slate-900/60 border border-cyber-line rounded
            text-cyber-cyan focus:outline-none focus:border-cyber-cyan/60"
        />
      </div>

      <div>
        <label className="block text-[10px] font-mono text-slate-400 mb-1">校准人员</label>
        <input
          type="text"
          value={calibratedBy}
          onChange={e => setCalibratedBy(e.target.value)}
          placeholder="请输入校准人员姓名"
          className="w-full px-2 py-1.5 text-sm font-mono bg-slate-900/60 border border-cyber-line rounded
            text-cyber-cyan placeholder-slate-600 focus:outline-none focus:border-cyber-cyan/60"
        />
      </div>

      <div>
        <label className="block text-[10px] font-mono text-slate-400 mb-1">备注</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="可选：校准说明或备注信息"
          rows={2}
          className="w-full px-2 py-1.5 text-sm font-mono bg-slate-900/60 border border-cyber-line rounded
            text-cyber-cyan placeholder-slate-600 focus:outline-none focus:border-cyber-cyan/60 resize-none"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-mono
            bg-cyber-cyan/20 border border-cyber-cyan/50 text-cyber-cyan rounded
            hover:bg-cyber-cyan/30 transition-colors"
        >
          <Check size={14} />
          {initialData ? '保存修改' : '添加校准'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-mono
            bg-slate-800/50 border border-slate-600/50 text-slate-400 rounded
            hover:bg-slate-700/50 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </form>
  );
};

export const CalibrationStation: React.FC = () => {
  const sensors = useMonitorStore(state => state.sensors);
  const devices = useMonitorStore(state => state.devices);
  const calibrations = useMonitorStore(state => state.calibrations);
  const addCalibration = useMonitorStore(state => state.addCalibration);
  const updateCalibration = useMonitorStore(state => state.updateCalibration);
  const deleteCalibration = useMonitorStore(state => state.deleteCalibration);

  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewOffset, setPreviewOffset] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const sensorList = useMemo(() => {
    const now = Date.now();
    const UPCOMING_DAYS = 7 * 24 * 60 * 60 * 1000;

    const getStatus = (sensorId: string): CalibrationStatus => {
      const active = Object.values(calibrations)
        .filter(c => c.sensorId === sensorId && c.effectiveDate <= now && c.expiryDate >= now)
        .sort((a, b) => b.effectiveDate - a.effectiveDate)[0];
      if (active) {
        if (active.expiryDate - now <= UPCOMING_DAYS) return 'upcoming';
        return 'valid';
      }
      return 'expired';
    };

    const getActiveCal = (sensorId: string) => {
      const active = Object.values(calibrations)
        .filter(c => c.sensorId === sensorId && c.effectiveDate <= now && c.expiryDate >= now)
        .sort((a, b) => b.effectiveDate - a.effectiveDate);
      return active[0] || null;
    };

    return Object.values(sensors)
      .map(s => {
        const activeCal = getActiveCal(s.id);
        return {
          sensor: s,
          device: devices[s.deviceId],
          status: getStatus(s.id),
          activeCal,
          calibratedTemp: activeCal ? s.currentTemp + activeCal.offset : s.currentTemp,
        };
      })
      .filter(x => x.device)
      .sort((a, b) => {
        const order: Record<CalibrationStatus, number> = { expired: 0, upcoming: 1, valid: 2 };
        return order[a.status] - order[b.status];
      });
  }, [sensors, devices, calibrations]);

  const selectedSensor = sensorList.find(s => s.sensor.id === selectedSensorId);

  const sensorCalibrations = useMemo(() => {
    if (!selectedSensorId) return [];
    return Object.values(calibrations)
      .filter(c => c.sensorId === selectedSensorId)
      .sort((a, b) => b.effectiveDate - a.effectiveDate);
  }, [calibrations, selectedSensorId]);

  const handleAddCalibration = (data: Omit<Calibration, 'id'>) => {
    addCalibration(data);
    setShowForm(false);
  };

  const handleUpdateCalibration = (data: Omit<Calibration, 'id'>) => {
    if (editingId) {
      updateCalibration(editingId, data);
      setEditingId(null);
    }
  };

  const handleDeleteCalibration = (id: string) => {
    if (confirm('确定要删除这条校准记录吗？')) {
      deleteCalibration(id);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-orbitron text-sm tracking-[0.2em] text-cyber-cyan neon-text-cyan flex items-center gap-2">
          <Settings size={16} />
          传感器校准台
        </h2>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-1 rounded bg-emerald-900/30 text-emerald-400 border border-emerald-500/40">
            {sensorList.filter(s => s.status === 'valid').length} 有效
          </span>
          <span className="px-2 py-1 rounded bg-amber-900/30 text-amber-400 border border-amber-500/40">
            {sensorList.filter(s => s.status === 'upcoming').length} 即将到期
          </span>
          <span className="px-2 py-1 rounded bg-rose-900/40 text-rose-400 border border-rose-500/50">
            {sensorList.filter(s => s.status === 'expired').length} 已过期
          </span>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="w-[340px] flex flex-col gap-3 min-h-0">
          <div className="text-[10px] font-mono text-slate-500 px-1">
            传感器列表 · 共 {sensorList.length} 个
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {sensorList.map(item => {
              const style = STATUS_STYLES[item.status];
              const isSelected = selectedSensorId === item.sensor.id;
              return (
                <button
                  key={item.sensor.id}
                  onClick={() => {
                    setSelectedSensorId(item.sensor.id);
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all
                    ${isSelected
                      ? 'bg-cyber-cyan/10 border-cyber-cyan/50 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                      : 'bg-cyber-panel/50 border-cyber-line/60 hover:border-cyber-cyan/40'
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-cyber-cyan truncate">
                        {item.device!.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {item.sensor.id}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono border ${style.bg} ${style.text} ${style.border}`}>
                      {style.icon}
                      {STATUS_LABELS[item.status]}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-[10px] font-mono">
                      <Thermometer size={10} className="text-slate-500" />
                      <span className="text-slate-400">原始:</span>
                      <span className="text-slate-300">{item.sensor.currentTemp.toFixed(1)}°C</span>
                    </div>
                    {item.activeCal && (
                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        <span className="text-slate-500">校准:</span>
                        <span className={item.activeCal.offset >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                          {formatOffset(item.activeCal.offset)}
                        </span>
                        <span className="text-slate-400">= {item.calibratedTemp.toFixed(1)}°</span>
                      </div>
                    )}
                  </div>
                  {item.status === 'expired' && (
                    <div className="mt-2 text-[9px] font-mono text-rose-400/80 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      校准已过期，请重新校准
                    </div>
                  )}
                  {item.status === 'upcoming' && item.activeCal && (
                    <div className="mt-2 text-[9px] font-mono text-amber-400/80 flex items-center gap-1">
                      <Clock size={10} />
                      还剩 {daysUntil(item.activeCal.expiryDate)} 天到期
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {selectedSensor ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-mono text-cyber-cyan">
                    {selectedSensor.device!.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    {selectedSensor.sensor.id}
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border
                    ${STATUS_STYLES[selectedSensor.status].bg}
                    ${STATUS_STYLES[selectedSensor.status].text}
                    ${STATUS_STYLES[selectedSensor.status].border}`}
                  >
                    {STATUS_STYLES[selectedSensor.status].icon}
                    {STATUS_LABELS[selectedSensor.status]}
                  </div>
                </div>
                {!showForm && !editingId && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono
                      bg-emerald-900/30 border border-emerald-500/40 text-emerald-400 rounded
                      hover:bg-emerald-900/50 transition-colors"
                  >
                    <Plus size={14} />
                    新建校准
                  </button>
                )}
              </div>

              {showForm && (
                <div className="p-4 rounded-lg border border-cyber-line bg-cyber-panel/70">
                  <div className="text-[11px] font-mono text-cyber-cyan mb-3 flex items-center gap-1.5">
                    <Plus size={12} />
                    新建校准记录
                  </div>
                  <CalibrationForm
                    sensorId={selectedSensor.sensor.id}
                    onSubmit={handleAddCalibration}
                    onCancel={() => {
                      setShowForm(false);
                      setShowPreview(false);
                    }}
                  />
                </div>
              )}

              {/* Temperature Chart Preview */}
              {selectedSensor && (
                <div className="rounded-lg border border-cyber-line bg-cyber-panel/70 p-3 relative overflow-hidden hud-corner">
                  <div className="absolute inset-0 pointer-events-none opacity-40 bg-grid-cyber" />
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-cyber-grey">
                      <Activity size={12} className="text-cyber-cyan" />
                      温度曲线预览 · 最近60秒
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowPreview(!showPreview);
                          if (!showPreview && selectedSensor.activeCal) {
                            setPreviewOffset(selectedSensor.activeCal.offset);
                          }
                        }}
                        className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded border transition-all
                          ${showPreview
                            ? 'bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/50'
                            : 'bg-slate-800/50 text-slate-400 border-slate-600/50 hover:text-cyber-cyan'
                          }`}
                      >
                        <Eye size={11} />
                        {showPreview ? '隐藏对比' : '显示对比'}
                      </button>
                    </div>
                  </div>

                  {showPreview && (
                    <div className="flex items-center gap-3 mb-2 px-1">
                      <label className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                        <span>预览偏移:</span>
                        <input
                          type="range"
                          min="-10"
                          max="10"
                          step="0.1"
                          value={previewOffset}
                          onChange={e => setPreviewOffset(parseFloat(e.target.value))}
                          className="w-32 accent-cyan-400"
                        />
                        <span className={`font-mono text-xs ${previewOffset >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {formatOffset(previewOffset)}
                        </span>
                      </label>
                    </div>
                  )}

                  <TempChart
                    sensors={buildChartData(selectedSensor.sensor, selectedSensor.device!.name, previewOffset, showPreview, selectedSensor.status === 'expired')}
                    height={160}
                    showCalibrated={showPreview}
                  />
                </div>
              )}

              {editingId && (
                <div className="p-4 rounded-lg border border-cyber-line bg-cyber-panel/70">
                  <div className="text-[11px] font-mono text-cyber-cyan mb-3 flex items-center gap-1.5">
                    <Edit2 size={12} />
                    编辑校准记录
                  </div>
                  <CalibrationForm
                    sensorId={selectedSensor.sensor.id}
                    initialData={calibrations[editingId]}
                    onSubmit={handleUpdateCalibration}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              )}

              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="text-[10px] font-mono text-slate-500 mb-2 px-1">
                  校准记录 · {sensorCalibrations.length} 条
                </div>
                <div className="space-y-2 pr-1">
                  {sensorCalibrations.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm font-mono">
                      <div className="text-cyber-cyan/30 text-3xl mb-2">◎</div>
                      暂无校准记录
                    </div>
                  ) : (
                    sensorCalibrations.map((cal, idx) => {
                      const now = Date.now();
                      const isActive = cal.effectiveDate <= now && cal.expiryDate >= now;
                      const isExpired = cal.expiryDate < now;
                      return (
                        <div
                          key={cal.id}
                          className={`p-3 rounded-lg border transition-all
                            ${isActive
                              ? 'bg-emerald-900/10 border-emerald-500/30'
                              : isExpired
                                ? 'bg-rose-900/10 border-rose-500/30'
                                : 'bg-cyber-panel/50 border-cyber-line/60'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-base font-mono font-bold
                                  ${cal.offset >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}
                                >
                                  {formatOffset(cal.offset)}
                                </span>
                                {isActive && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-mono bg-emerald-900/40 text-emerald-400 border border-emerald-500/40 rounded">
                                    当前有效
                                  </span>
                                )}
                                {isExpired && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-mono bg-rose-900/40 text-rose-400 border border-rose-500/40 rounded">
                                    已过期
                                  </span>
                                )}
                                {!isActive && !isExpired && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-mono bg-slate-700/40 text-slate-400 border border-slate-500/40 rounded">
                                    未生效
                                  </span>
                                )}
                              </div>
                              {cal.note && (
                                <div className="text-[11px] text-slate-400 mt-1.5 flex items-start gap-1.5">
                                  <FileText size={10} className="mt-0.5 flex-shrink-0" />
                                  <span>{cal.note}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Calendar size={10} />
                                  {formatDate(cal.effectiveDate)} ~ {formatDate(cal.expiryDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User size={10} />
                                  {cal.calibratedBy}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingId(cal.id);
                                  setShowForm(false);
                                }}
                                className="p-1.5 text-slate-500 hover:text-cyber-cyan hover:bg-cyber-cyan/10 rounded transition-colors"
                                title="编辑"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteCalibration(cal.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                                title="删除"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          {idx < sensorCalibrations.length - 1 && (
                            <div className="mt-2 pt-2 border-t border-dashed border-slate-700/50">
                              <div className="flex items-center gap-2 text-[9px] font-mono text-slate-600">
                                <ChevronRight size={9} />
                                下一条记录
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <div className="text-cyber-cyan/30 text-5xl mb-3">⚙</div>
                <div className="text-sm font-mono">请选择左侧传感器查看校准信息</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
