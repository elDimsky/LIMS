import React, { useState } from 'react';
import { X, CheckCircle2, Check, AlertCircle } from 'lucide-react';
import { TestType } from '../../types/lims';
import { useLims } from '../../context/LimsContext';

interface LabTestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LabTestFormModal: React.FC<LabTestFormModalProps> = ({ isOpen, onClose }) => {
  const { samples, researchProjects, createLabTest, currentUser } = useLims();

  const [sampleId, setSampleId] = useState(samples[0]?.id || '');
  const [testType, setTestType] = useState<TestType>('THICKNESS_TEST');
  const [testName, setTestName] = useState('Pengukuran Ketebalan Lapisan Enamel');
  const [testDate, setTestDate] = useState(new Date().toISOString().slice(0, 10));
  const [methodStandard, setMethodStandard] = useState('ASTM D1186 / ISO 2178');
  const [specificationTarget, setSpecificationTarget] = useState('150 - 240 µm');
  const [resultValue, setResultValue] = useState('195 µm');
  const [unit, setUnit] = useState('µm');
  const [status, setStatus] = useState<'PASS' | 'FAIL' | 'PENDING'>('PASS');
  const [remarks, setRemarks] = useState('Ketebalan enamel seragam di seluruh permukaan lengkung wajan.');

  if (!isOpen) return null;

  const selectedSample = samples.find((s) => s.id === sampleId) || samples[0];

  const handleTestTypeChange = (type: TestType) => {
    setTestType(type);
    switch (type) {
      case 'THICKNESS_TEST':
        setTestName('Pengukuran Ketebalan Lapisan Enamel (Magnetic Induction Gauge)');
        setMethodStandard('ASTM D1186 / ISO 2178');
        setSpecificationTarget('150 - 240 µm');
        setResultValue('195 µm');
        setUnit('µm');
        break;
      case 'ADHESION_TEST':
        setTestName('Uji Adhesi Cross-Cut & Tape Peeling Test');
        setMethodStandard('ISO 2409 / ASTM D3359 Method B');
        setSpecificationTarget('Class 0 (0% flaking)');
        setResultValue('Class 0');
        setUnit('Class');
        break;
      case 'THERMAL_SHOCK_TEST':
        setTestName('Uji Ketahanan Kejut Suhu Panas ke Air Dingin (Thermal Shock)');
        setMethodStandard('ISO 28706-2 / EN 12983-1');
        setSpecificationTarget('220°C ke air 20°C min. 5 siklus');
        setResultValue('5 siklus lolos tanpa retak rambut');
        setUnit('Cycles');
        break;
      case 'ACID_RESISTANCE_TEST':
        setTestName('Uji Ketahanan Rebus Asam Sitrat 10% (Citric Acid Boiling)');
        setMethodStandard('ISO 28706-1 / DIN 51157');
        setSpecificationTarget('Mass loss < 2.0 g/m² (Class AA/A)');
        setResultValue('0.92 g/m² (Class AA)');
        setUnit('g/m²');
        break;
      case 'HARDNESS_TEST':
        setTestName('Uji Kekerasan Pensil Permukaan Enamel (Pencil Hardness)');
        setMethodStandard('ASTM D3363 / ISO 15184');
        setSpecificationTarget('Minimal 6H');
        setResultValue('7H lolos');
        setUnit('H');
        break;
      case 'IMPACT_TEST':
        setTestName('Uji Ketahanan Benturan Beban Jatuh (Wegner Impact Tester)');
        setMethodStandard('ISO 4532 / ASTM C368');
        setSpecificationTarget('1.5 N.m tanpa flaking serpihan kaca');
        setResultValue('1.8 N.m lolos');
        setUnit('N.m');
        break;
      default:
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createLabTest({
      sampleId: selectedSample.id,
      sampleCode: selectedSample.sampleCode,
      researchProjectId: selectedSample.researchProjectId,
      researchProjectTitle: selectedSample.researchProjectTitle,
      testType,
      testName,
      testDate,
      methodStandard,
      specificationTarget,
      resultValue,
      unit,
      status,
      testedBy: currentUser.name,
      verifiedBy: 'Ayu Jamilatul Janah',
      remarks,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-teal-50/50">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">Input Hasil Pengujian Laboratorium QC</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Sample Benda Uji *</label>
            <select
              value={sampleId}
              onChange={(e) => setSampleId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
            >
              {samples.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sampleCode} - {s.productName} ({s.researchProjectTitle})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenis Pengujian *</label>
              <select
                value={testType}
                onChange={(e) => handleTestTypeChange(e.target.value as TestType)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="THICKNESS_TEST">Thickness Test (Ketebalan)</option>
                <option value="ADHESION_TEST">Adhesion Cross-Cut Test (Daya Rekat)</option>
                <option value="THERMAL_SHOCK_TEST">Thermal Shock Test (Kejut Panas)</option>
                <option value="ACID_RESISTANCE_TEST">Acid Resistance Test (Asam Sitrat)</option>
                <option value="HARDNESS_TEST">Hardness Test (Kekerasan Pensil)</option>
                <option value="IMPACT_TEST">Impact Resistance Test (Benturan)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Uji *</label>
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Standar Metode Pengujian *</label>
            <input
              type="text"
              value={methodStandard}
              onChange={(e) => setMethodStandard(e.target.value)}
              required
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Batas Standar *</label>
              <input
                type="text"
                value={specificationTarget}
                onChange={(e) => setSpecificationTarget(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hasil Terukur / Nilai *</label>
              <input
                type="text"
                value={resultValue}
                onChange={(e) => setResultValue(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Pass / Fail Status */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status Kelolosan Uji (Verdict) *</label>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-emerald-800">
                <input
                  type="radio"
                  name="verdict"
                  checked={status === 'PASS'}
                  onChange={() => setStatus('PASS')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>PASS (Lolos Spesifikasi)</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-rose-800">
                <input
                  type="radio"
                  name="verdict"
                  checked={status === 'FAIL'}
                  onChange={() => setStatus('FAIL')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>FAIL (Gagal / Defect)</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-amber-800">
                <input
                  type="radio"
                  name="verdict"
                  checked={status === 'PENDING'}
                  onChange={() => setStatus('PENDING')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span>PENDING</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Analis Laboratorium</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Hasil Pengujian</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
