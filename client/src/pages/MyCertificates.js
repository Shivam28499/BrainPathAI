import { useState, useEffect } from "react";
import API from "../api/axios";
import { FiAward, FiDownload } from "react-icons/fi";

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get("/certificates");
        setCertificates(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetch();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <FiAward size={28} className="text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-800">My Certificates</h1>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <FiAward size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No certificates yet</p>
          <p className="text-gray-400 text-sm mt-2">Complete a course to earn your first certificate!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
                <FiAward size={40} className="mx-auto mb-2" />
                <h3 className="text-lg font-bold">Certificate of Completion</h3>
              </div>
              <div className="p-6 text-center">
                <h4 className="font-bold text-xl text-gray-800 mb-2">{cert.Course?.title}</h4>
                <p className="text-sm text-gray-500 mb-1">{cert.Course?.category}</p>
                <p className="text-xs text-gray-400">
                  Issued on {new Date(cert.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCertificates;
