import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [operators, setOperators] = useState([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalAmount: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    todayClients: 0,
    thisWeekClients: 0,
    thisMonthClients: 0
  });

  useEffect(() => {
    // Ma'lumotlarni yuklash
    const savedClients = localStorage.getItem('bankCrmClients');
    const savedOperators = localStorage.getItem('bankCrmOperators');

    if (savedClients) {
      const clientsData = JSON.parse(savedClients);
      setClients(clientsData);
      calculateStats(clientsData);
    }

    if (savedOperators) {
      setOperators(JSON.parse(savedOperators));
    } else {
      // Default operatorlar
      const defaultOperators = Array.from({ length: 10 }, (_, i) => ({
        id: 401 + i,
        name: `Operator ${401 + i}`,
        status: 'active',
        clientCount: 0
      }));
      setOperators(defaultOperators);
      localStorage.setItem('bankCrmOperators', JSON.stringify(defaultOperators));
    }
  }, []);

  const calculateStats = (clientsData) => {
    const total = clientsData.length;
    const totalAmount = clientsData.reduce((sum, c) => sum + (parseFloat(c.summa) || 0), 0);
    const approved = clientsData.filter(c => c.status === 'Tasdiqlangan').length;
    const pending = clientsData.filter(c => c.status === 'Jarayonda').length;
    const rejected = clientsData.filter(c => c.status === 'Rad etilgan').length;

    // Bugungi, haftalik, oylik
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayClients = clientsData.filter(c => {
      const createdDate = new Date(c.createdAt || Date.now());
      return createdDate >= today;
    }).length;

    const thisWeekClients = clientsData.filter(c => {
      const createdDate = new Date(c.createdAt || Date.now());
      return createdDate >= weekAgo;
    }).length;

    const thisMonthClients = clientsData.filter(c => {
      const createdDate = new Date(c.createdAt || Date.now());
      return createdDate >= monthAgo;
    }).length;

    setStats({
      totalClients: total,
      totalAmount,
      approved,
      pending,
      rejected,
      todayClients,
      thisWeekClients,
      thisMonthClients
    });
  };

  // Operator bo'yicha statistika
  const getOperatorStats = () => {
    const operatorStats = {};

    clients.forEach(client => {
      const opId = client.operatorRaqam;
      if (!operatorStats[opId]) {
        operatorStats[opId] = {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          totalAmount: 0
        };
      }

      operatorStats[opId].total++;
      operatorStats[opId].totalAmount += parseFloat(client.summa) || 0;

      if (client.status === 'Tasdiqlangan') operatorStats[opId].approved++;
      if (client.status === 'Jarayonda') operatorStats[opId].pending++;
      if (client.status === 'Rad etilgan') operatorStats[opId].rejected++;
    });

    return operatorStats;
  };

  const operatorStats = getOperatorStats();

  const handleLogout = () => {
    localStorage.removeItem('bankCrmAdminLoggedIn');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-purple-100 text-sm mt-1">Bank CRM boshqaruv tizimi</p>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              CRM ga o'tish
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Chiqish
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Umumiy statistika */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Umumiy ko'rsatkichlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-100 text-sm">Jami mijozlar</p>
                <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-4xl font-bold">{stats.totalClients}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-100 text-sm">Jami summa</p>
                <svg className="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-3xl font-bold">{stats.totalAmount.toLocaleString()}</p>
              <p className="text-green-100 text-sm mt-1">UZS</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-100 text-sm">Tasdiqlangan</p>
                <svg className="w-8 h-8 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-4xl font-bold">{stats.approved}</p>
              <p className="text-purple-100 text-sm mt-1">{stats.totalClients > 0 ? ((stats.approved / stats.totalClients) * 100).toFixed(1) : 0}% tasdiqlangan</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-orange-100 text-sm">Jarayonda</p>
                <svg className="w-8 h-8 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-4xl font-bold">{stats.pending}</p>
              <p className="text-orange-100 text-sm mt-1">Kutilmoqda</p>
            </div>
          </div>
        </div>

        {/* Vaqt bo'yicha statistika */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Vaqt bo'yicha tahlil</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">Bugungi mijozlar</p>
              <p className="text-3xl font-bold text-blue-600">{stats.todayClients}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">Bu hafta</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.thisWeekClients}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">Bu oy</p>
              <p className="text-3xl font-bold text-purple-600">{stats.thisMonthClients}</p>
            </div>
          </div>
        </div>

        {/* Operatorlar statistikasi */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Operatorlar ko'rsatkichlari</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Operator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Jami mijozlar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tasdiqlangan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Jarayonda</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Rad etilgan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Jami summa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Samaradorlik</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {operators.map(operator => {
                    const stats = operatorStats[operator.id] || { total: 0, approved: 0, pending: 0, rejected: 0, totalAmount: 0 };
                    const efficiency = stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0;

                    return (
                      <tr key={operator.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                              {operator.id}
                            </div>
                            <span className="ml-3 text-sm font-semibold text-gray-900">{operator.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{stats.total}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">{stats.approved}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-yellow-600">{stats.pending}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-red-600">{stats.rejected}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{stats.totalAmount.toLocaleString()} UZS</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                                style={{ width: `${efficiency}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{efficiency}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Oxirgi mijozlar */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Oxirgi mijozlar</h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-purple-600 hover:text-purple-700 font-semibold transition"
            >
              Barchasini ko'rish →
            </button>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Mijoz</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Telefon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Summa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Operator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.slice(-10).reverse().map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900">{client.ism} {client.familya}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{client.telefon}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{parseFloat(client.summa).toLocaleString()} UZS</td>
                      <td className="px-6 py-4 text-sm font-semibold text-purple-600">{client.operatorRaqam}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          client.status === 'Tasdiqlangan' ? 'bg-green-100 text-green-800' :
                          client.status === 'Rad etilgan' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {clients.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        Hozircha mijozlar yo'q
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
