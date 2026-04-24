import { useState, useEffect } from "react";
import API from "../api/axios";
import { FiAward } from "react-icons/fi";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get("/leaderboard");
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetch();
  }, []);

  const getMedal = (index) => {
    if (index === 0) return "bg-yellow-400 text-white";
    if (index === 1) return "bg-gray-400 text-white";
    if (index === 2) return "bg-orange-400 text-white";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <FiAward size={28} className="text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-800">Leaderboard</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {users.map((u, i) => (
          <div key={u.id} className={`flex items-center gap-4 p-4 ${i !== users.length - 1 ? "border-b" : ""}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getMedal(i)}`}>
              {i + 1}
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
              {u.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{u.name}</p>
              <p className="text-sm text-gray-400">Streak: {u.streak} days</p>
            </div>
            <span className="text-indigo-600 font-bold">{u.xpPoints} XP</span>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-center text-gray-400 py-8">No students yet</p>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
