import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// QR Generator using a free CDN library
export default function QRScannerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'myqr'
  const [scanResult, setScanResult] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [cameraError, setCameraError] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const qrRef = useRef(null);

  const upiId = `${user?.accountNumber}@securebank`;
  const upiDeepLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(user?.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

  // Generate QR code using qrcode.js
  useEffect(() => {
    if (activeTab === 'myqr' && qrRef.current) {
      qrRef.current.innerHTML = '';
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      script.onload = () => {
        if (qrRef.current) {
          new window.QRCode(qrRef.current, {
            text: upiDeepLink,
            width: 200,
            height: 200,
            colorDark: '#4F46E5',
            colorLight: '#ffffff',
            correctLevel: window.QRCode.CorrectLevel.H,
          });
        }
      };
      document.head.appendChild(script);
      return () => { try { document.head.removeChild(script); } catch {} };
    }
  }, [activeTab, upiDeepLink]);

  const startCamera = async () => {
    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setCameraError(true);
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  // Simulate QR scan result for demo
  const simulateScan = () => {
    setScanResult({
      name: 'Ravi Kumar',
      upiId: 'ravi@upi',
      amount: '',
    });
    stopCamera();
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  return (
    <div className="min-h-screen bg-gray-950 max-w-md mx-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white">
          ←
        </button>
        <h1 className="text-white text-lg font-bold">Scan & Pay</h1>
      </div>

      {/* Tabs */}
      <div className="flex mx-4 bg-gray-800 rounded-xl p-1 mb-4">
        {['scan', 'myqr'].map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); stopCamera(); setScanResult(null); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>
            {tab === 'scan' ? '📷 Scan QR' : '🔲 My QR Code'}
          </button>
        ))}
      </div>

      {/* SCAN TAB */}
      {activeTab === 'scan' && (
        <div className="flex-1 flex flex-col px-4">
          {!scanResult ? (
            <>
              {/* Camera viewfinder */}
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-square mb-4">
                {scanning ? (
                  <>
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-56 h-56 relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-400 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-400 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-400 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-400 rounded-br-lg" />
                        {/* Scanning line */}
                        <div className="absolute inset-x-0 h-0.5 bg-purple-400 opacity-80 animate-bounce top-1/2" />
                      </div>
                    </div>
                    <button onClick={simulateScan}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-4 py-2 rounded-full">
                      Simulate Scan (Demo)
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    {cameraError ? (
                      <>
                        <span className="text-5xl">📵</span>
                        <p className="text-gray-400 text-sm text-center px-8">Camera access denied. Please allow camera permission in browser settings.</p>
                      </>
                    ) : (
                      <>
                        <span className="text-6xl">📷</span>
                        <p className="text-gray-400 text-sm">Camera ready to scan</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {!scanning && (
                <button onClick={startCamera}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-2xl mb-3 transition">
                  📷 Open Camera
                </button>
              )}
              {scanning && (
                <button onClick={stopCamera}
                  className="w-full bg-gray-700 text-white font-semibold py-4 rounded-2xl mb-3">
                  Stop Camera
                </button>
              )}

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-gray-500 text-xs">or enter UPI ID manually</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>

              <button onClick={() => navigate('/upi/send')}
                className="w-full border border-gray-700 text-gray-300 font-medium py-3 rounded-2xl text-sm">
                Enter UPI ID / Phone Number
              </button>
            </>
          ) : (
            /* Scan result */
            <div className="bg-gray-900 rounded-2xl p-5 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                  {scanResult.name.charAt(0)}
                </div>
                <p className="text-white font-bold text-lg">{scanResult.name}</p>
                <p className="text-gray-400 text-sm">{scanResult.upiId}</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1.5">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
                  <input type="number" value={scanResult.amount || amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-10 py-4 text-white text-2xl font-bold focus:outline-none focus:border-purple-500 text-center"
                    placeholder="0" />
                </div>
              </div>

              <input type="text" value={note} onChange={e => setNote(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                placeholder="Add a note (optional)" />

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setScanResult(null)}
                  className="bg-gray-800 text-white py-3.5 rounded-xl font-medium">
                  Cancel
                </button>
                <button onClick={() => navigate('/upi/send', { state: { upi: scanResult.upiId, name: scanResult.name, amount, note } })}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold transition">
                  Pay {amount ? formatINR(parseFloat(amount)) : ''}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MY QR TAB */}
      {activeTab === 'myqr' && (
        <div className="flex-1 flex flex-col items-center px-4 pb-8">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center shadow-xl">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-purple-700 text-xl">🏦</span>
              <span className="font-bold text-purple-700 text-lg">SecureBank</span>
            </div>

            {/* QR Code */}
            <div ref={qrRef} className="flex justify-center mb-4" />

            <div className="bg-purple-50 rounded-xl p-3 mb-3">
              <p className="font-bold text-gray-900 text-sm">{user?.name}</p>
              <p className="text-purple-700 text-xs font-mono mt-0.5">{upiId}</p>
            </div>

            {amount && (
              <div className="bg-green-50 rounded-xl p-2 mb-3">
                <p className="text-green-700 font-bold">₹{amount}</p>
              </div>
            )}

            <p className="text-gray-400 text-xs">Scan to pay me on any UPI app</p>
          </div>

          {/* Set amount for QR */}
          <div className="w-full max-w-xs mt-4 space-y-3">
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-center text-lg focus:outline-none focus:border-purple-500"
              placeholder="Set amount (optional)" />
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              placeholder="Add note (optional)" />
            <button className="w-full bg-gray-800 text-white py-3 rounded-xl font-medium text-sm">
              📤 Share QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
