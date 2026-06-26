import { useState } from "react";

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an Excel file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      const response = await fetch(
  "https://invoicegeneration-production-e627.up.railway.app/api/invoices/bulk-upload",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  }
);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      alert(data.message || "Invoices uploaded successfully!");

      setFile(null);

      document.querySelector("input[type='file']").value = "";
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Bulk Upload Invoices</h2>

      <p>
        Upload an Excel (.xlsx/.xls) file containing multiple invoice details.
      </p>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br />
      <br />

      <button
        onClick={handleUpload}
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        {loading ? "Uploading..." : "Upload Excel"}
      </button>
    </div>
  );
}
