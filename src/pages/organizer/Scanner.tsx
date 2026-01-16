import { useState, useEffect } from "react";
import { Scanner as QRScanner } from "@yudiel/react-qr-scanner";
import { CheckCircle, XCircle, ScanLine } from "lucide-react";
import ScanService from "../../services/scanService";
import { privateAxios } from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import { AxiosError } from "axios";

type ScanResult = {
  status: "success" | "error";
  message: string;
};

function Scanner() {
  const scanService = new ScanService(privateAxios);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleScan(result: string) {
    if (isProcessing || !result) return;

    setIsProcessing(true);
    setIsScanning(false);

    try {
      await scanService.scanTicket(result);
      setScanResult({
        status: "success",
        message: "Ticket scanned successfully! Entry granted.",
      });
    } catch (err) {
      let message = "Invalid ticket or scan failed";
      if (err instanceof AxiosError) {
        message = err.response?.data?.message || message;
      }
      setScanResult({
        status: "error",
        message,
      });
    } finally {
      setIsProcessing(false);
    }
  }

  function handleReset() {
    setScanResult(null);
    setIsScanning(true);
  }

  // Auto-reset after 3 seconds
  useEffect(() => {
    if (scanResult) {
      const timer = setTimeout(() => {
        handleReset();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanResult]);

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="mx-auto max-w-xl px-6">
        <PageHeader
          title="Ticket Scanner"
          subtitle="Scan attendee QR codes to verify entry"
        />

        <div className="mt-8">
          {/* Scanner Container */}
          <div className="relative overflow-hidden rounded-md border border-stone-200 bg-stone-900">
            {isScanning ? (
              <div className="relative aspect-square">
                <QRScanner
                  onScan={(result) => {
                    if (result.length > 0) {
                      handleScan(result[0].rawValue);
                    }
                  }}
                  onError={(error) => console.error("Scanner error:", error)}
                  styles={{
                    container: { width: "100%", height: "100%" },
                    video: { width: "100%", height: "100%", objectFit: "cover" },
                  }}
                />
                {/* Scan overlay */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <ScanLine size={48} className="animate-pulse text-orange-500" />
                    <p className="rounded-md bg-black/50 px-3 py-1 text-sm text-white">
                      Position QR code in frame
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Result Overlay */
              <div
                className={`flex aspect-square flex-col items-center justify-center gap-6 ${
                  scanResult?.status === "success"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              >
                {scanResult?.status === "success" ? (
                  <CheckCircle size={120} className="text-white" />
                ) : (
                  <XCircle size={120} className="text-white" />
                )}
                <p className="max-w-xs text-center text-2xl font-bold text-white">
                  {scanResult?.message}
                </p>
                <button
                  onClick={handleReset}
                  className="rounded-md bg-white/20 px-6 py-2 font-medium text-white hover:bg-white/30"
                >
                  Scan Another
                </button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 rounded-md border border-stone-200 bg-stone-50 p-4">
            <h3 className="font-medium text-stone-700">Instructions</h3>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-stone-500">
              <li>• Point the camera at the attendee's QR code</li>
              <li>• The scanner will automatically detect and verify the ticket</li>
              <li>• Green screen = Entry granted</li>
              <li>• Red screen = Invalid or already used ticket</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Scanner;
