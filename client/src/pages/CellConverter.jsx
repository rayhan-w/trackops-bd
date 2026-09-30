import React, { useState } from 'react';
import {
  Layers,
  Copy,
  Check,
  Calculator,
  AlertTriangle,
  Info,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';

export default function CellConverter() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversionType, setConversionType] = useState('LTE_ECI_TO_ENODEB');
  const [copied, setCopied] = useState(false);

  // Inputs
  const [eciInput, setEciInput] = useState('13456897');
  const [enodebInput, setEnodebInput] = useState('52566');
  const [sectorInput, setSectorInput] = useState('1');
  const [mccInput, setMccInput] = useState('470'); // Bangladesh MCC
  const [mncInput, setMncInput] = useState('01'); // Grameenphone
  const [lacInput, setLacInput] = useState('2415');
  const [cidInput, setCidInput] = useState('49812');

  const [result, setResult] = useState(null);

  const handleConvert = (e) => {
    e.preventDefault();
    setCopied(false);

    if (conversionType === 'LTE_ECI_TO_ENODEB') {
      const eci = parseInt(eciInput, 10);
      if (isNaN(eci) || eci < 0) {
        return setResult({ error: 'Please enter a valid numeric ECI value' });
      }
      // In LTE, ECI is 28 bits: eNodeB ID is the upper 20 bits, Sector/Cell is lower 8 bits
      const enodeb = Math.floor(eci / 256);
      const sector = eci % 256;
      const hex = eci.toString(16).toUpperCase();

      setResult({
        primary: `eNodeB ID: ${enodeb} | Sector/Cell: ${sector}`,
        details: [
          { label: 'E-UTRAN Cell Identifier (ECI)', value: eci.toString() },
          { label: 'Calculated eNodeB ID (Macro Base Station)', value: enodeb.toString() },
          { label: 'Sector / Antenna Cell ID', value: sector.toString() },
          { label: 'Hexadecimal Representation', value: `0x${hex}` },
        ],
      });
    } else if (conversionType === 'LTE_ENODEB_TO_ECI') {
      const enodeb = parseInt(enodebInput, 10);
      const sector = parseInt(sectorInput, 10);
      if (isNaN(enodeb) || isNaN(sector)) {
        return setResult({ error: 'Please enter valid numeric eNodeB and Sector values' });
      }
      const eci = enodeb * 256 + sector;
      const hex = eci.toString(16).toUpperCase();

      setResult({
        primary: `ECI: ${eci} (0x${hex})`,
        details: [
          { label: 'Calculated ECI (28-bit)', value: eci.toString() },
          { label: 'Hexadecimal Value', value: `0x${hex}` },
          { label: 'Input eNodeB ID', value: enodeb.toString() },
          { label: 'Input Sector ID', value: sector.toString() },
        ],
      });
    } else if (conversionType === 'CGI_CALCULATOR') {
      const mcc = mccInput.trim();
      const mnc = mncInput.trim().padStart(2, '0');
      const lac = parseInt(lacInput, 10);
      const cid = parseInt(cidInput, 10);

      if (isNaN(lac) || isNaN(cid)) {
        return setResult({ error: 'Please enter valid numeric LAC and Cell ID' });
      }

      const cgi = `${mcc}-${mnc}-${lac}-${cid}`;
      const lacHex = lac.toString(16).toUpperCase().padStart(4, '0');
      const cidHex = cid.toString(16).toUpperCase().padStart(4, '0');

      setResult({
        primary: `CGI: ${cgi}`,
        details: [
          { label: 'Cell Global Identity (CGI)', value: cgi },
          { label: 'Mobile Country Code (MCC)', value: `${mcc} (Bangladesh)` },
          { label: 'Mobile Network Code (MNC)', value: mnc },
          { label: 'Location Area Code (LAC Dec / Hex)', value: `${lac} (0x${lacHex})` },
          { label: 'Cell Identity (CID Dec / Hex)', value: `${cid} (0x${cidHex})` },
        ],
      });
    }
  };

  const handleCopyResult = () => {
    if (!result || !result.primary) return;
    const textToCopy = `${result.primary}\n` + (result.details ? result.details.map((d) => `${d.label}: ${d.value}`).join('\n') : '');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          title="Cell Format Converter"
          subtitle="Mathematical & telecommunication format calculator for radio access network identifiers."
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl w-full mx-auto">
          {/* Transparency Disclaimer */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs text-slate-300 leading-relaxed">
                <h4 className="font-bold text-sm text-white">
                  Utility Calculation Scope Notice
                </h4>
                <p>
                  This utility performs standardized 3GPP mathematical conversions between telecommunication identifiers (such as converting 4G LTE ECI to eNodeB and Sector ID, or assembling Cell Global Identity CGI).
                </p>
                <p className="text-amber-300 font-medium text-[11px]">
                  <strong>Note:</strong> This tool is purely a format converter and does not intercept, ping, or retrieve live telecommunication tower signals without an authorized data gateway.
                </p>
              </div>
            </div>
          </div>

          {/* Converter Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Conversion Protocol Mode
              </label>
              <select
                value={conversionType}
                onChange={(e) => {
                  setConversionType(e.target.value);
                  setResult(null);
                }}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LTE_ECI_TO_ENODEB">
                  4G LTE: E-UTRAN Cell Identifier (ECI) → eNodeB ID + Sector ID
                </option>
                <option value="LTE_ENODEB_TO_ECI">
                  4G LTE: eNodeB ID + Sector ID → E-UTRAN Cell Identifier (ECI)
                </option>
                <option value="CGI_CALCULATOR">
                  2G / 3G / 4G: MCC + MNC + LAC + Cell ID → Cell Global Identity (CGI)
                </option>
              </select>
            </div>

            <form onSubmit={handleConvert} className="space-y-4">
              {conversionType === 'LTE_ECI_TO_ENODEB' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-UTRAN Cell Identifier (ECI 28-bit Decimal)
                  </label>
                  <input
                    type="number"
                    value={eciInput}
                    onChange={(e) => setEciInput(e.target.value)}
                    placeholder="e.g. 13456897"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Formula: eNodeB = floor(ECI / 256) | Sector ID = ECI mod 256
                  </span>
                </div>
              )}

              {conversionType === 'LTE_ENODEB_TO_ECI' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      eNodeB ID (Macro Base Station)
                    </label>
                    <input
                      type="number"
                      value={enodebInput}
                      onChange={(e) => setEnodebInput(e.target.value)}
                      placeholder="e.g. 52566"
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sector / Cell ID (0 - 255)
                    </label>
                    <input
                      type="number"
                      value={sectorInput}
                      onChange={(e) => setSectorInput(e.target.value)}
                      placeholder="e.g. 1"
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {conversionType === 'CGI_CALCULATOR' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">MCC</label>
                    <input
                      type="text"
                      value={mccInput}
                      onChange={(e) => setMccInput(e.target.value)}
                      placeholder="470"
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">MNC</label>
                    <input
                      type="text"
                      value={mncInput}
                      onChange={(e) => setMncInput(e.target.value)}
                      placeholder="01"
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">LAC</label>
                    <input
                      type="number"
                      value={lacInput}
                      onChange={(e) => setLacInput(e.target.value)}
                      placeholder="2415"
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cell ID (CID)</label>
                    <input
                      type="number"
                      value={cidInput}
                      onChange={(e) => setCidInput(e.target.value)}
                      placeholder="49812"
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md flex items-center space-x-2 transition-all"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Execute Conversion</span>
                </button>
              </div>
            </form>

            {/* Results Section */}
            {result && (
              <div className="pt-4 border-t border-slate-200 space-y-4 animate-fadeIn">
                {result.error ? (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
                    {result.error}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Conversion Output
                      </span>
                      <button
                        onClick={handleCopyResult}
                        className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center space-x-1.5 font-semibold transition-colors shadow-sm"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy Output'}</span>
                      </button>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-sm font-bold font-mono text-blue-700">
                      {result.primary}
                    </div>

                    {result.details && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {result.details.map((d, idx) => (
                          <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                            <span className="text-slate-400 block text-[10px]">{d.label}</span>
                            <span className="font-mono font-semibold text-slate-800">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
