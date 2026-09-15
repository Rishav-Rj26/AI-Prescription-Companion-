"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useCurrentUser } from "@/lib/queries/user";
import { useEffect, useRef, useState } from "react";

interface MetricsResponse {
  total_runs: number;
  failure_rate: number;
  avg_latency_ms: number;
  avg_confidence: number;
  retrieval_hit_rate: number;
  trends: {
    confidence: { date: string; value: number }[];
    latency: { date: string; value: number }[];
  };
}

interface FailureLog {
  id: number;
  run_type: string;
  prescription_id: number | null;
  error_summary: string | null;
  latency_ms: number | null;
  created_at: string;
}

function SimpleLineChart({ data, label }: { data: { date: string; value: number }[], label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const padding = 20;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    
    const maxVal = Math.max(...data.map(d => d.value), 1); // Avoid div by 0
    
    ctx.beginPath();
    ctx.strokeStyle = "#4f46e5"; // Indigo 600
    ctx.lineWidth = 2;
    
    data.forEach((point, i) => {
      const x = padding + (i / Math.max(data.length - 1, 1)) * width;
      const y = padding + height - (point.value / maxVal) * height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      // Draw points
      ctx.fillStyle = "#4f46e5";
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.stroke();
  }, [data]);

  return (
    <div className="bg-white p-4 rounded-lg shadow border flex flex-col h-[250px]">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{label}</h3>
      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" width={400} height={200} />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{data.length > 0 ? data[0].date : ''}</span>
        <span>{data.length > 0 ? data[data.length - 1].date : ''}</span>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const [days, setDays] = useState(30);

  const { data: metrics, isLoading: isMetricsLoading, error: metricsError } = useQuery<MetricsResponse>({
    queryKey: ["admin_metrics", days],
    queryFn: async () => {
      const { data } = await api.get(`/admin/dashboard/metrics?days=${days}`);
      return data;
    },
    enabled: !!user?.is_admin,
  });

  const { data: failures, isLoading: isFailuresLoading } = useQuery<FailureLog[]>({
    queryKey: ["admin_recent_failures"],
    queryFn: async () => {
      const { data } = await api.get("/admin/dashboard/recent-failures");
      return data;
    },
    enabled: !!user?.is_admin,
  });

  if (isUserLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  if (!user || !user.is_admin) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">You do not have permission to view the admin dashboard.</p>
      </div>
    );
  }

  if (metricsError) {
    return <div className="p-8 text-red-600">Failed to load metrics. Please try again.</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Telemetry Overview</h2>
        <select 
          className="border rounded-md px-3 py-1.5 text-sm"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
      </div>

      {isMetricsLoading ? (
        <div className="text-center py-10">Loading metrics...</div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-lg shadow border">
              <p className="text-sm text-gray-500 mb-1">Total Runs</p>
              <p className="text-3xl font-bold text-gray-800">{metrics?.total_runs}</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow border">
              <p className="text-sm text-gray-500 mb-1">Failure Rate</p>
              <p className="text-3xl font-bold text-red-600">{metrics?.failure_rate.toFixed(1)}%</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow border">
              <p className="text-sm text-gray-500 mb-1">Avg Latency</p>
              <p className="text-3xl font-bold text-amber-600">{metrics?.avg_latency_ms.toFixed(0)} ms</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow border">
              <p className="text-sm text-gray-500 mb-1">RAG Hit Rate</p>
              <p className="text-3xl font-bold text-green-600">{metrics?.retrieval_hit_rate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SimpleLineChart data={metrics?.trends.confidence || []} label="Avg Confidence Trend (0-1)" />
            <SimpleLineChart data={metrics?.trends.latency || []} label="Avg Latency Trend (ms)" />
          </div>
        </>
      )}

      {/* Recent Failures Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden mt-8">
        <div className="px-5 py-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800">Recent Failures</h3>
        </div>
        
        {isFailuresLoading ? (
          <div className="p-5 text-center text-gray-500">Loading failures...</div>
        ) : failures?.length === 0 ? (
          <div className="p-5 text-center text-gray-500">No recent failures recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Prescription ID</th>
                  <th className="px-5 py-3">Latency</th>
                  <th className="px-5 py-3 w-1/2">Error Summary</th>
                </tr>
              </thead>
              <tbody>
                {failures?.map((failure) => (
                  <tr key={failure.id} className="border-b hover:bg-gray-50">
                    <td className="px-5 py-3 whitespace-nowrap">{new Date(failure.created_at).toLocaleString()}</td>
                    <td className="px-5 py-3">{failure.run_type}</td>
                    <td className="px-5 py-3">{failure.prescription_id || 'N/A'}</td>
                    <td className="px-5 py-3">{failure.latency_ms ? `${failure.latency_ms} ms` : '-'}</td>
                    <td className="px-5 py-3 text-red-600 truncate max-w-xs" title={failure.error_summary || 'Unknown Error'}>
                      {failure.error_summary || 'Unknown Error'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
