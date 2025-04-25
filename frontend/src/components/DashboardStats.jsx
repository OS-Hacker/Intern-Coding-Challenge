import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });

    const { user } = useAuth();
  

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/admin/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  const chartData = {
    labels: ["Users", "Stores", "Ratings"],
    datasets: [
      {
        label: "Platform Statistics",
        data: [stats.totalUsers, stats.totalStores, stats.totalRatings],
        backgroundColor: ["#3b82f6", "#8b5cf6", "#10b981"],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat Cards */}
        {[
          {
            title: "Total Users",
            value: stats.totalUsers,
            bg: "blue",
            text: "blue",
          },
          {
            title: "Total Stores",
            value: stats.totalStores,
            bg: "purple",
            text: "purple",
          },
          {
            title: "Total Ratings",
            value: stats.totalRatings,
            bg: "green",
            text: "green",
          },
        ].map((stat) => (
          <div
            key={stat.title}
            className={`bg-${stat.bg}-50 p-4 rounded-lg shadow`}
          >
            <h3 className={`text-lg font-semibold text-${stat.text}-800`}>
              {stat.title}
            </h3>
            <p className={`text-3xl font-bold text-${stat.text}-600`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Statistics Overview</h2>
        <div className="h-64">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
