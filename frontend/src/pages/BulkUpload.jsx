export default function BulkUpload() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bulk Upload</h1>

      <div className="card p-6">
        <p className="text-slate-600">
          Upload Excel file containing invoice data.
        </p>

        <input
          type="file"
          accept=".xlsx,.xls"
          className="mt-4"
        />

        <button className="btn-primary mt-4">
          Upload
        </button>
      </div>
    </div>
  );
}
