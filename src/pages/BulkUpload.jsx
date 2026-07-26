import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, Download, Eye, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { api, computeTotals, formatINR } from "../lib/api";
import { generateInvoicePDF } from "../lib/pdfGenerator";

export default function BulkUpload() {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [generated, setGenerated] = useState([]);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    setGenerated([]);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (jsonData.length === 0) {
          setError("No data found in the uploaded file.");
          return;
        }

        // Map Excel columns to invoice fields
        const mapped = jsonData.map((row, idx) => mapRowToInvoice(row, idx));
        setRows(mapped);
      } catch (err) {
        setError("Failed to parse Excel file. Please check the format.");
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  /**
   * Maps an Excel row to an invoice-compatible object.
   * Supports the format shown in the screenshot with columns like:
   * Date, Reference, Vendor, A/C Type, Service, PHR, Description,
   * Pax/Gust, Base Amount, TCS, Other Taxes, Service, Commission, TDS,
   * Amount, Bank PG charge, GST, Net Amount, Ledger Balance, Status
   */
  function mapRowToInvoice(row, idx) {
    // Flexible column name matching (case-insensitive, partial match)
    const get = (keys) => {
      for (const key of keys) {
        const found = Object.keys(row).find(
          (k) => k.toLowerCase().trim().includes(key.toLowerCase())
        );
        if (found && row[found] !== "" && row[found] !== undefined) return row[found];
      }
      return "";
    };

    const customerName = get(["vendor", "customer", "name", "client"]) || `Customer ${idx + 1}`;
    const mobile = get(["mobile", "phone", "contact"]) || "";
    const email = get(["email", "mail"]) || "";
    const packageName = get(["description", "package", "service", "tour"]) || get(["a/c type"]) || "";
    const sourceLocation = get(["source", "from", "origin"]) || "";
    const destinationLocation = get(["destination", "to", "dest"]) || "";
    const reference = get(["reference", "ref", "invoice"]) || "";
    const phr = get(["phr"]) || "";
    const service = get(["service"]) || "";

    // Date parsing
    let travelDate = "";
    const rawDate = get(["date", "travel date", "booking date"]);
    if (rawDate) {
      if (typeof rawDate === "number") {
        // Excel serial date
        const excelDate = XLSX.SSF.parse_date_code(rawDate);
        travelDate = `${excelDate.y}-${String(excelDate.m).padStart(2, "0")}-${String(excelDate.d).padStart(2, "0")}`;
      } else {
        // Try parsing string date
        const parsed = new Date(rawDate);
        if (!isNaN(parsed)) {
          travelDate = parsed.toISOString().split("T")[0];
        }
      }
    }
    if (!travelDate) travelDate = new Date().toISOString().split("T")[0];

    // Numeric fields
    const travelersCount = Math.max(1, parseInt(get(["pax", "gust", "travelers", "guests", "qty"])) || 1);
    const baseAmount = parseFloat(get(["base amount", "base", "amount", "cost", "package cost"])) || 0;
    const gstAmount = parseFloat(get(["gst", "tax"])) || 0;
    const additionalCharges = parseFloat(get(["other taxes", "additional", "tcs", "bank pg"])) || 0;
    const netAmount = parseFloat(get(["net amount", "net", "total", "grand total"])) || 0;

    // Calculate GST percentage from amounts if available
    let gstPercentage = 0;
    const subtotalCalc = baseAmount * travelersCount + additionalCharges;
    if (subtotalCalc > 0 && gstAmount > 0) {
      gstPercentage = Math.round((gstAmount / subtotalCalc) * 100 * 100) / 100;
    } else if (netAmount > 0 && baseAmount > 0 && netAmount > baseAmount) {
      // Infer GST from net - base
      const inferredGst = netAmount - baseAmount - additionalCharges;
      if (inferredGst > 0) {
        gstPercentage = Math.round((inferredGst / baseAmount) * 100 * 100) / 100;
      }
    }

    // If no gst percentage could be determined, default to 0
    const packageCost = baseAmount || (netAmount > 0 ? netAmount : 0);

    return {
      customerName,
      mobile,
      email,
      packageName: packageName || service || "Travel Service",
      sourceLocation,
      destinationLocation,
      travelDate,
      travelersCount,
      packageCost: packageCost / travelersCount || packageCost, // per traveler
      gstPercentage,
      additionalCharges,
      reference,
      _originalRow: row,
    };
  }

  const removeRow = (idx) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const generateAll = async () => {
    if (rows.length === 0) return;
    setProcessing(true);
    setError("");

    try {
      const results = [];
      for (const row of rows) {
        const invoice = await api.createInvoice(row);
        results.push(invoice);
      }
      setGenerated(results);
      setRows([]);
    } catch (err) {
      setError("Error generating invoices: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const downloadAllPDFs = async () => {
    if (generated.length === 0) return;
    setProcessing(true);

    try {
      if (generated.length === 1) {
        // Single PDF direct download
        const doc = generateInvoicePDF(generated[0]);
        doc.save(`${generated[0].invoiceNumber}.pdf`);
      } else {
        // Multiple PDFs — zip them
        const zip = new JSZip();
        for (const invoice of generated) {
          const doc = generateInvoicePDF(invoice);
          const pdfBlob = doc.output("blob");
          zip.file(`${invoice.invoiceNumber}.pdf`, pdfBlob);
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, "BOSS_Travels_Invoices.zip");
      }
    } catch (err) {
      setError("Error generating PDFs: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const downloadSampleExcel = () => {
    const sampleData = [
      {
        "Date": "2024-01-15",
        "Reference": "REF-001",
        "Vendor": "John Doe",
        "Mobile": "9876543210",
        "Email": "john@example.com",
        "A/C Type": "ITINERARY",
        "Service": "Flight",
        "Description": "Mumbai to Dubai Package",
        "Source": "Mumbai",
        "Destination": "Dubai",
        "Pax/Gust": 2,
        "Base Amount": 25000,
        "Other Taxes": 500,
        "GST": 4590,
        "Net Amount": 30090,
      },
      {
        "Date": "2024-01-16",
        "Reference": "REF-002",
        "Vendor": "Jane Smith",
        "Mobile": "9876543211",
        "Email": "jane@example.com",
        "A/C Type": "ITINERARY",
        "Service": "Hotel",
        "Description": "Goa Beach Holiday",
        "Source": "Bangalore",
        "Destination": "Goa",
        "Pax/Gust": 4,
        "Base Amount": 15000,
        "Other Taxes": 300,
        "GST": 2754,
        "Net Amount": 18054,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, "BOSS_Travels_Sample_Upload.xlsx");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Bulk Upload</h2>
          <p className="text-slate-500 text-sm">Upload an Excel file to generate multiple invoices at once</p>
        </div>
        <button
          onClick={downloadSampleExcel}
          className="inline-flex items-center text-sm border border-brand-600 text-brand-600 hover:bg-brand-50 px-4 py-2 rounded-lg"
        >
          <Download className="w-4 h-4 mr-2" /> Download Sample Excel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Upload Area */}
      {generated.length === 0 && (
        <div
          className="bg-white rounded-xl shadow-sm border-2 border-dashed border-slate-300 hover:border-brand-400 transition-colors p-10 text-center cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="font-medium text-lg">Click to upload Excel file</p>
              <p className="text-sm text-slate-500 mt-1">Supports .xlsx, .xls, .csv formats</p>
            </div>
            {fileName && (
              <div className="mt-2 inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg text-sm">
                <FileSpreadsheet className="w-4 h-4" />
                {fileName}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Table */}
      {rows.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex items-center justify-between p-5 border-b">
            <div>
              <h3 className="font-semibold">Preview ({rows.length} invoices)</h3>
              <p className="text-xs text-slate-500 mt-1">Review the data before generating invoices</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setRows([]); setFileName(""); }}
                className="inline-flex items-center px-3 py-2 text-sm border rounded-lg hover:bg-slate-50"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Clear
              </button>
              <button
                onClick={generateAll}
                disabled={processing}
                className="inline-flex items-center px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-60"
              >
                {processing ? "Generating..." : `Generate ${rows.length} Invoices`}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto p-5">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b">
                <tr>
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3">Package</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Pax</th>
                  <th className="py-2 pr-3 text-right">Cost</th>
                  <th className="py-2 pr-3 text-right">GST%</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const totals = computeTotals(row);
                  return (
                    <tr key={idx} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-3 pr-3 text-slate-500">{idx + 1}</td>
                      <td className="py-3 pr-3 font-medium">{row.customerName}</td>
                      <td className="py-3 pr-3">{row.packageName}</td>
                      <td className="py-3 pr-3">{row.travelDate}</td>
                      <td className="py-3 pr-3">{row.travelersCount}</td>
                      <td className="py-3 pr-3 text-right">{formatINR(totals.grandTotal)}</td>
                      <td className="py-3 pr-3 text-right">{row.gstPercentage}%</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => removeRow(idx)}
                          className="inline-flex items-center px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Success / Download area */}
      {generated.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-700">
                {generated.length} Invoice{generated.length > 1 ? "s" : ""} Generated Successfully!
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                All invoices have been saved. Download them as PDFs below.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={downloadAllPDFs}
                disabled={processing}
                className="inline-flex items-center px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-60 font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                {processing
                  ? "Generating PDFs..."
                  : generated.length > 1
                  ? "Download All PDFs (ZIP)"
                  : "Download PDF"}
              </button>
              <button
                onClick={() => { setGenerated([]); setFileName(""); }}
                className="inline-flex items-center px-5 py-2.5 border rounded-lg hover:bg-slate-50"
              >
                Upload Another File
              </button>
            </div>
          </div>

          {/* List generated invoices */}
          <div className="border-t p-5">
            <h4 className="font-semibold text-sm mb-3">Generated Invoices</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500 border-b">
                  <tr>
                    <th className="py-2 pr-3">Invoice #</th>
                    <th className="py-2 pr-3">Customer</th>
                    <th className="py-2 pr-3">Package</th>
                    <th className="py-2 pr-3 text-right">Total</th>
                    <th className="py-2 text-right">PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {generated.map((inv) => (
                    <tr key={inv.id} className="border-b last:border-0">
                      <td className="py-3 pr-3 font-mono text-xs">{inv.invoiceNumber}</td>
                      <td className="py-3 pr-3">{inv.customerName}</td>
                      <td className="py-3 pr-3">{inv.packageName}</td>
                      <td className="py-3 pr-3 text-right font-medium">{formatINR(inv.grandTotal)}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            const doc = generateInvoicePDF(inv);
                            doc.save(`${inv.invoiceNumber}.pdf`);
                          }}
                          className="inline-flex items-center px-2 py-1 text-brand-600 hover:bg-brand-50 rounded"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Format Info */}
      <div className="bg-slate-50 rounded-xl border p-5">
        <h3 className="font-semibold text-sm mb-3">Supported Excel Columns</h3>
        <p className="text-xs text-slate-500 mb-3">
          The system automatically maps common column names. Below are the recognized columns:
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
          {[
            "Date / Travel Date",
            "Reference / Ref",
            "Vendor / Customer / Name",
            "Mobile / Phone",
            "Email",
            "A/C Type",
            "Service",
            "Description / Package",
            "Source / From",
            "Destination / To",
            "Pax/Gust / Travelers",
            "Base Amount / Cost",
            "Other Taxes / Additional",
            "GST / Tax",
            "Net Amount / Total",
          ].map((col) => (
            <div key={col} className="bg-white border rounded px-2 py-1.5 text-slate-600">
              {col}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
