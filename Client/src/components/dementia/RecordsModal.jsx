const RecordsModal = ({ showRecords, records, handleClose }) => {
  if (!showRecords) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-xl shadow-xl p-10 max-w-5xl w-full z-10">
        {records && Array.isArray(records) && records.length > 0 ? (
          <div>
            <h2 className="text-xl font-bold mb-4 text-center text-black">
              Previous Records
            </h2>
            <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr>
                    {Object.keys(records[0]).map((key) => (
                      <th 
                        key={key} 
                        className="px-4 py-2 border-b font-semibold text-black whitespace-nowrap"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, idx) => (
                    <tr key={idx} className="hover:bg-gray-100">
                      {Object.values(record).map((value, i) => (
                        <td 
                          key={i} 
                          className="px-4 py-2 border-b text-black whitespace-nowrap"
                        >
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-center text-black">No records found.</p>
        )}

        <button
          className="absolute top-4 right-4 text-2xl text-gray-700 hover:text-red-500 focus:outline-none z-20"
          onClick={handleClose}
          aria-label="Close"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default RecordsModal;
