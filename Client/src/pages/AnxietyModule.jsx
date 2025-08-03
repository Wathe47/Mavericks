import { useState } from "react";
import axiosInstance from "../config/axiosConfig";
import Loading from "../components/Loading";
import AnxietyResultsGauge from "../components/AnxietyResultsGauge";
import AnxietyWheel from "../components/AnxietyWheel";

const AnxietyModule = () => {
  const [formData, setFormData] = useState({
    audio: null,
    facial1: null,
    facial2: null,
    facial3: null,
    transcript: null,
  });

  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resultData, setResultData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.audio ||
      !formData.facial1 ||
      !formData.facial2 ||
      !formData.facial3 ||
      !formData.transcript
    ) {
      setError("Please upload all required files.");
      return;
    }

    setShowModal(true);
    setLoading(true);
    setSuccess(false);
    setResultData({});

    const fileData = new FormData();
    fileData.append("audio", formData.audio);
    fileData.append("facial1", formData.facial1);
    fileData.append("facial2", formData.facial2);
    fileData.append("facial3", formData.facial3);
    fileData.append("transcript", formData.transcript);

    try {
      const response = await axiosInstance.post("/anxiety/predict/", fileData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.prediction) {
        setSuccess(true);
        setResultData(response.data);
        setError(null);
      } else if (response.data && response.data.message) {
        setError(response.data.message);
        setSuccess(false);
      } else {
        setError("Prediction failed. Please try again.");
        setSuccess(false);
      }
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data?.message ||
            JSON.stringify(err.response.data) ||
            `Server error: ${err.response.status}`
        );
      } else if (err.request) {
        setError("No response from server. Check backend status and CORS.");
      } else {
        setError("Network error or server unavailable.");
      }
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setSuccess(false);
    setResultData({});
    setError(null);
    setLoading(false);
  };

  const handleClear = () => {
    setFormData({
      audio: null,
      facial1: null,
      facial2: null,
      facial3: null,
      transcript: null,
    });
    setError(null);
  };

  return (
    <>
      <video
        src={"./src/assets/animations/video5.mp4"}
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-screen h-screen object-cover z-0"
      />
      <div className="fixed top-0 left-0 w-full h-full bg-black/40 z-10 pointer-events-none"></div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-xl shadow-xl p-10 max-w-lg w-full z-10">
            {/* Topic above the wheel */}
            <div className="text-2xl font-bold mb-4 text-center">
              Prediction Result
            </div>
            {/* Always show the wheel, spinning while loading */}
            {/* <AnxietyWheel prediction={loading ? null : resultData.prediction} spinning={loading} /> */}
            {/* Only show result message after loading */}

            <AnxietyResultsGauge
              resultData={resultData}
              loading={loading}
            />
            
            {!loading && !success && (
              <div className="text-center text-red-500">
                <p>{error || "Prediction failed."}</p>
              </div>
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
      )}

      <div className="relative mt-4 z-20">
        <div className="flex flex-col items-center justify-center py-20">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Anxiety Module
          </h1>
          <p className="text-lg md:text-xl text-white text-center max-w-2xl">
            This module is designed to help you understand and manage anxiety. It
            includes resources, exercises, and support to guide you through your
            journey.
          </p>
        </div>

        <div className="min-h-screen text-[#cbd5e1]">
          <div className="relative z-1 flex items-center w-1/2 h-flex mb-5 p-3 border border-n-1/10 rounded-3xl lg:p-15 xl:h-full m-auto bg-[#032436]/60 rounded-3xl backdrop-blur-sm">
            <div className="relative top-0 left-0 w-full h-full p-6">
              <main className="max-w-lg mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {["audio", "facial1", "facial2", "facial3", "transcript"].map((field) => (
                    <div key={field}>
                      <label
                        htmlFor={`${field}-upload`}
                        className="block text-sm font-semibold mb-1"
                      >
                        Upload {field.charAt(0).toUpperCase() + field.slice(1)} File
                      </label>
                      <input
                        id={`${field}-upload`}
                        type="file"
                        name={field}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md bg-[#1e293b] border border-[#334155] text-[#ffffff] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ffffff] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#2563eb] file:text-white hover:file:bg-[#1d4ed8]"
                      />
                    </div>
                  ))}
                  <div className="flex justify-center gap-40 mt-6">
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-4 py-2 bg-[#1e293b] text-white rounded-md hover:bg-red-500 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1e293b] text-white rounded-md hover:bg-[#38f07b] transition-colors"
                      disabled={loading}
                    >
                      Submit
                    </button>
                  </div>
                  <div className="mt-10 text-center">
                    {error && <p className="text-red-500 text-lg mt-10">{error}</p>}
                    {success && (
                      <p className="text-green-500 mt-10">
                        File submitted successfully!
                      </p>
                    )}
                  </div>
                </form>
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnxietyModule;