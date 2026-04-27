'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import UsageBarChart from '@/components/charts/UsageBarChart';
import TrendLineChart from '@/components/charts/TrendLineChart';
import { useTracking } from '@/hooks/useTracking';
import { LogOut, Filter, BarChart3, TrendingUp, User as UserIcon } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { track } = useTracking();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    startDate: `${new Date().getFullYear()}-01-01`,
    endDate: new Date().toISOString().split('T')[0],
    age: 'All',
    gender: 'All',
  });

  // Load filters from cookies on mount
  useEffect(() => {
    const savedFilters = document.cookie
      .split('; ')
      .find((row) => row.startsWith('dashboard_filters='))
      ?.split('=')[1];

    if (savedFilters) {
      try {
        const parsed = JSON.parse(decodeURIComponent(savedFilters));
        setFilters(parsed);
      } catch (e) {
        console.error('Failed to parse saved filters');
      }
    }
    setIsInitialized(true);
  }, []);

  // Save filters to cookies whenever they change (after initialization)
  useEffect(() => {
    if (isInitialized) {
      document.cookie = `dashboard_filters=${encodeURIComponent(JSON.stringify(filters))}; path=/; max-age=31536000`;
    }
  }, [filters, isInitialized]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/analytics?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isInitialized) {
      fetchData();
    }
  }, [fetchData, isInitialized]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    track(`${key}_filter`);
  };

  const handleBarClick = (feature: string) => {
    setSelectedFeature(feature);
    track('bar_chart_click');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="container animate-fade">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', background: 'linear-gradient(to right, #6366f1, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            InsightDash
          </h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Real-time usage analytics for your product</p>
        </div>
        <button onClick={handleLogout} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'white' }}>
          <LogOut size={18} /> Logout
        </button>
      </header>

      <section className="card" style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', marginBottom: '0.5rem', color: 'var(--primary)' }}>
          <Filter size={18} /> <h3 style={{ fontSize: '1rem' }}>Advanced Filters</h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Start Date</label>
          <input type="date" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>End Date</label>
          <input type="date" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Age Group</label>
          <select value={filters.age} onChange={(e) => handleFilterChange('age', e.target.value)}>
            <option value="All">All Ages</option>
            <option value="<18">&lt; 18</option>
            <option value="18-40">18 - 40</option>
            <option value=">40">&gt; 40</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Gender</label>
          <select value={filters.gender} onChange={(e) => handleFilterChange('gender', e.target.value)}>
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <BarChart3 size={20} color="var(--primary)" />
            <h3>Feature Usage (Total Clicks)</h3>
          </div>
          {loading ? <div className="skeleton" style={{ height: 300 }}></div> : error ? <div style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>{error}</div> : data?.barData?.length > 0 ? (
            <UsageBarChart
              data={data?.barData || []}
              onBarClick={handleBarClick}
              selectedFeature={selectedFeature}
            />
          ) : (
            <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>No data found for these filters.</div>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <TrendingUp size={20} color="var(--accent)" />
            <h3>Time Trend {selectedFeature ? `for ${selectedFeature}` : '(Overall)'}</h3>
          </div>
          {loading ? <div className="skeleton" style={{ height: 300 }}></div> : error ? <div style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>{error}</div> : data?.trendData?.length > 0 ? (
            <TrendLineChart
              data={data?.trendData || []}
              selectedFeature={selectedFeature}
            />
          ) : (
            <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>No trend data found.</div>
          )}
        </div>
      </div>
      
      <footer style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>
        <p>Interactive Product Analytics Dashboard &bull; Built for Performance</p>
      </footer>

      <style jsx>{`
        .skeleton {
          background: linear-gradient(90deg, #1e1e22 25%, #2d2d30 50%, #1e1e22 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 8px;
        }
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
