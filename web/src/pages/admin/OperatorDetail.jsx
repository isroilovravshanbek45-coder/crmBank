import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const OperatorDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [operator, setOperator] = useState(null);
  const [clients, setClients] = useState([]);
  const [operatorStats, setOperatorStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalAmount: 0
  });

  useEffect(() => {
    // Ma'lumotlarni yuklash
    const savedClients = localStorage.getItem('bankCrmClients');
    const savedOperators = localStorage.getItem('bankCrmOperators');

    if (savedOperators) {
      const operatorsData = JSON.parse(savedOperators);
      const foundOperator = operatorsData.find(op => op.id === parseInt(id));
      setOperator(foundOperator);
    }

    if (savedClients) {
      const clientsData = JSON.parse(savedClients);
      const operatorClients = clientsData.filter(client => client.operatorRaqam === id);
      setClients(operatorClients);

      // Statistikani hisoblash
      const stats = {
        total: operatorClients.length,
        approved: operatorClients.filter(c => c.status === 'Tasdiqlangan').length,
        pending: operatorClients.filter(c => c.status === 'Jarayonda').length,
        rejected: operatorClients.filter(c => c.status === 'Rad etilgan').length,
        totalAmount: operatorClients.reduce((sum, c) => sum + (parseFloat(c.summa) || 0), 0)
      };
      setOperatorStats(stats);
    }
  }, [id]);

  if (!operator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{backgroundColor: '#0AC4E0'}}>
                {operator.id}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{operator.name}</h1>
                <p className="text-sm text-gray-500">Operator ID: {operator.id}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Statistika kartalari */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{backgroundColor: '#E6F9FD'}}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#0AC4E0'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xs font-medium text-gray-600 mb-1">Jami Mijozlar</h3>
            <p className="text-3xl font-bold text-gray-900">{operatorStats.total}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{backgroundColor: '#D1FAE5'}}>
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xs font-medium text-gray-600 mb-1">Tasdiqlangan</h3>
            <p className="text-3xl font-bold text-green-600">{operatorStats.approved}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{backgroundColor: '#FEF3C7'}}>
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xs font-medium text-gray-600 mb-1">Jarayonda</h3>
            <p className="text-3xl font-bold text-yellow-600">{operatorStats.pending}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{backgroundColor: '#FEE2E2'}}>
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xs font-medium text-gray-600 mb-1">Rad etilgan</h3>
            <p className="text-3xl font-bold text-red-600">{operatorStats.rejected}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{backgroundColor: '#0AC4E0'}}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xs font-medium text-gray-600 mb-1">Jami Summa</h3>
            <p className="text-2xl font-bold text-gray-900">{(operatorStats.totalAmount / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-gray-500 mt-0.5">{operatorStats.totalAmount.toLocaleString()} so'm</p>
          </div>
        </div>

        {/* Mijozlar ro'yxati */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Mijozlar ro'yxati ({clients.length})</h2>
          </div>

          {clients.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Bu operatorda hozircha mijozlar yo'q</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mijoz</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Telefon</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Hudud</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Summa</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Garov</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/client/${client.id}`)}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">{client.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm" style={{backgroundColor: '#0AC4E0'}}>
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
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold text-white"
                          style={{
                            backgroundColor: client.status === 'Tasdiqlangan' ? '#10B981' :
                                           client.status === 'Rad etilgan' ? '#EF4444' :
                                           '#F59E0B'
                          }}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{client.garov}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperatorDetail;
