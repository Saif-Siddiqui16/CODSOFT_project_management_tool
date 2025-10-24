import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-xl p-12 text-center max-w-md">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Dashboard
        </h1>
        <p className="text-gray-500 text-lg mb-6">
          Ready to create your workspace and manage your projects efficiently?
        </p>
        <button
          onClick={() => navigate("/workspace")}
          className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition"
        >
          Create Workspace
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
