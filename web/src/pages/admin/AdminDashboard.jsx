import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllClients } from '../../services/clientService';
import { getAllOperators, getTopOperators } from '../../services/operatorService';
import { logout } from '../../services/authService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [operators, setOperators] = useState([]);
  const [topOperators, setTopOperators] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalAmount: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (clients.length > 0) {
      calculateStats(clients);
    }
  }, [clients]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [clientsRes, operatorsRes, topOperatorsRes] = await Promise.all([
        getAllClients(),
        getAllOperators(),
        getTopOperators(5)
      ]);

      if (clientsRes.success) {
        // Backend pagination format: { data: { data: [...], pagination: {...} } }
        const clientsData = clientsRes.data?.data || clientsRes.data || [];
        setClients(Array.isArray(clientsData) ? clientsData : []);
      }

      if (operatorsRes.success) {
        // Backend format: { data: { count: N, data: [...] } }
        const operatorsData = operatorsRes.data?.data || operatorsRes.data || [];
        setOperators(Array.isArray(operatorsData) ? operatorsData : []);
      }

      if (topOperatorsRes.success) {
        // Backend format: { data: [...] }
        const topOpsData = topOperatorsRes.data || [];
        setTopOperators(Array.isArray(topOpsData) ? topOpsData : []);
      }
    } catch (error) {
      console.error('Ma\'lumotlarni yuklashda xatolik:', error);
      alert('Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (clientsData) => {
    const total = clientsData.length;
    const totalAmount = clientsData.reduce((sum, c) => sum + (parseFloat(c.summa) || 0), 0);
    const approved = clientsData.filter(c => c.status === 'Tasdiqlangan').length;
    const pending = clientsData.filter(c => c.status === 'Jarayonda').length;
    const rejected = clientsData.filter(c => c.status === 'Rad etilgan').length;

    setStats({
      totalClients: total,
      totalAmount,
      approved,
      pending,
      rejected
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getFilteredClients = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch(selectedPeriod) {
      case 'today':
        return clients.filter(c => {
          if (!c.createdAt) return false;
          const createdDate = new Date(c.createdAt);
          return createdDate >= today && createdDate < tomorrow;
        });
      case 'week':
        return clients.filter(c => {
          if (!c.createdAt) return false;
          return new Date(c.createdAt) >= weekAgo;
        });
      case 'month':
        return clients.filter(c => {
          if (!c.createdAt) return false;
          return new Date(c.createdAt) >= monthAgo;
        });
      default:
        return clients;
    }
  };

  const filteredClients = getFilteredClients();

  const getPeriodStats = () => {
    return {
      total: filteredClients.length,
      approved: filteredClients.filter(c => c.status === 'Tasdiqlangan').length,
      pending: filteredClients.filter(c => c.status === 'Jarayonda').length,
      rejected: filteredClients.filter(c => c.status === 'Rad etilgan').length,
      totalAmount: filteredClients.reduce((sum, c) => sum + (parseFloat(c.summa) || 0), 0)
    };
  };

  const periodStats = getPeriodStats();

  const getLast24HoursClients = () => {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return clients.filter(c => {
      if (!c.createdAt) return false;
      const createdDate = new Date(c.createdAt);
      return createdDate >= last24Hours;
    });
  };

  const last24HoursClients = getLast24HoursClients();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Bank CRM Boshqaruv Paneli</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                CRM Panel
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 text-white rounded-lg font-medium transition-colors"
                style={{backgroundColor: '#3B82F6'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2563EB'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3B82F6'}
              >
                Chiqish
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Main Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Clients */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{backgroundColor: '#3B82F6'}}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jami</span>
            </div>
            <h3 className="text-xs font-medium text-gray-600 mb-1">Jami Mijozlar</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalClients}</p>
          </div>

          {/* Total Amount */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{backgroundColor: '#3B82F6'}}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">UZS</span>
            </div>
            <h3 className="text-xs font-medium text-gray-600 mb-1">Jami Summa</h3>
            <p className="text-2xl font-bold text-gray-900">{(stats.totalAmount / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-gray-500 mt-0.5">{stats.totalAmount.toLocaleString()} so'm</p>
          </div>

          {/* Approved */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{backgroundColor: '#3B82F6'}}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{backgroundColor: '#DBEAFE', color: '#3B82F6'}}>
                {stats.totalClients > 0 ? ((stats.approved / stats.totalClients) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <h3 className="text-xs font-medium text-gray-600 mb-1">Tasdiqlangan</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
              <div
                className="rounded-full h-1.5 transition-all duration-500"
                style={{
                  width: `${stats.totalClients > 0 ? (stats.approved / stats.totalClients) * 100 : 0}%`,
                  backgroundColor: '#3B82F6'
                }}
              ></div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{backgroundColor: '#3B82F6'}}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{backgroundColor: '#3B82F6'}}></span>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{backgroundColor: '#3B82F6', animationDelay: '0.2s'}}></span>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{backgroundColor: '#3B82F6', animationDelay: '0.4s'}}></span>
              </span>
            </div>
            <h3 className="text-xs font-medium text-gray-600 mb-1">Jarayonda</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          </div>
        </div>

        {/* Time Period Stats */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Vaqt bo'yicha tahlil</h2>
            <div className="flex gap-2">
              {['all', 'today', 'week', 'month'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === period
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={selectedPeriod === period ? {backgroundColor: '#3B82F6'} : {}}
                >
                  {period === 'all' && 'Hammasi'}
                  {period === 'today' && 'Bugun'}
                  {period === 'week' && 'Hafta'}
                  {period === 'month' && 'Oy'}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Jami mijozlar */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{backgroundColor: '#DBEAFE'}}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#3B82F6'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    {selectedPeriod === 'all' && 'Jami mijozlar'}
                    {selectedPeriod === 'today' && 'Bugungi mijozlar'}
                    {selectedPeriod === 'week' && 'Bu haftadagi mijozlar'}
                    {selectedPeriod === 'month' && 'Bu oydagi mijozlar'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">{periodStats.total}</p>
                </div>
              </div>
            </div>

            {/* Tasdiqlangan */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{backgroundColor: '#D1FAE5'}}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#22C55E'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Tasdiqlangan</p>
                  <p className="text-2xl font-bold" style={{color: '#22C55E'}}>{periodStats.approved}</p>
                </div>
              </div>
            </div>

            {/* Jarayonda */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{backgroundColor: '#FEF3C7'}}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#F59E0B'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Jarayonda</p>
                  <p className="text-2xl font-bold" style={{color: '#F59E0B'}}>{periodStats.pending}</p>
                </div>
              </div>
            </div>

            {/* Rad etilgan */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{backgroundColor: '#FEE2E2'}}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#EF4444'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Rad etilgan</p>
                  <p className="text-2xl font-bold" style={{color: '#EF4444'}}>{periodStats.rejected}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Operators */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Top 5 Eng yaxshi operatorlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topOperators.map((operator, index) => (
              <div key={operator.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                style={{borderColor: index === 0 ? '#3B82F6' : ''}}
                onClick={() => navigate(`/admin/operator/${operator.id}`)}>
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md`}
                      style={{
                        backgroundColor: index === 0 ? '#3B82F6' :
                                       index === 1 ? '#60A5FA' :
                                       index === 2 ? '#93C5FD' :
                                       index === 3 ? '#BFDBFE' :
                                       '#DBEAFE'
                      }}
                    >
                      {operator.id}
                    </div>
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm" style={{border: `2px solid ${index === 0 ? '#3B82F6' : '#E0E0E0'}`}}>
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 mb-1 text-sm">{operator.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-0.5">{operator.stats.approved}</p>
                  <p className="text-xs text-gray-500">tasdiqlangan</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Operators Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Barcha operatorlar</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Operator</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Jami</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Tasdiqlangan</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Jarayonda</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Rad etilgan</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Jami summa</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Samaradorlik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {operators.map((operator) => {
                  const stats = operator.stats || { total: 0, approved: 0, pending: 0, rejected: 0, totalAmount: 0 };
                  const efficiency = stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0;

                  return (
                    <tr key={operator.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/operator/${operator.id}`)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{backgroundColor: '#3B82F6'}}>
                            {operator.id}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{operator.name}</p>
                            <p className="text-xs text-gray-500">ID: {operator.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-900 font-bold text-sm">
                          {stats.total}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold text-sm" style={{backgroundColor: '#22C55E'}}>
                          {stats.approved}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold text-sm" style={{backgroundColor: '#F59E0B'}}>
                          {stats.pending}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold text-sm" style={{backgroundColor: '#EF4444'}}>
                          {stats.rejected}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">{stats.totalAmount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">UZS</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ width: `${efficiency}%`, backgroundColor: '#3B82F6' }}
                            ></div>
                          </div>
                          <span className="font-bold text-sm text-gray-900 min-w-[45px]">
                            {efficiency}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Clients - Last 24 Hours */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Oxirgi 24 soatlik mijozlar</h2>
              <p className="text-xs text-gray-500 mt-1">Jami: {last24HoursClients.length} ta mijoz</p>
            </div>
            <button
              onClick={() => navigate('/admin/clients')}
              className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
              style={{backgroundColor: '#3B82F6'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2563EB'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#3B82F6'}
            >
              Barchasini ko'rish →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mijoz</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Telefon</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Hudud</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Summa</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Operator</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Qo'shilgan vaqt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {last24HoursClients.slice(-10).reverse().map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/client/${client._id}`)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm" style={{backgroundColor: '#3B82F6'}}>
                          {client.ism.charAt(0)}{client.familya.charAt(0)}
                        </div>
                        <p className="font-semibold text-gray-900">{client.ism} {client.familya}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{client.telefon}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{client.hudud}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900">{parseFloat(client.summa).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">UZS</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-white font-bold text-sm" style={{backgroundColor: '#3B82F6'}}>
                        {client.operatorRaqam}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold text-white"
                      style={{
                        backgroundColor: client.status === 'Tasdiqlangan' ? '#22C55E' :
                                       client.status === 'Rad etilgan' ? '#EF4444' :
                                       '#F59E0B'
                      }}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {client.createdAt
                        ? new Date(client.createdAt).toLocaleString('uz-UZ', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
                {last24HoursClients.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">Oxirgi 24 soatda mijozlar yo'q</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
