import { useState } from "react";

export default function BulkUpload() {
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    if (!file) {
      alert("Please select an Excel file");
      return;
    }

    alert("Upload feature will be connected in the next step.");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Bulk Upload Invoices</h2>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleUpload}>
        Upload Excel
      </button>
    </div>
  );
}
