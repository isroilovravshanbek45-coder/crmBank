import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOperatorById } from '../../services/operatorService';

const OperatorDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [operatorData, setOperatorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOperator();
  }, [id]);

  const loadOperator = async () => {
    try {
      setLoading(true);
      const response = await getOperatorById(id);
      if (response.success) {
        setOperatorData(response.data);
      }
    } catch (error) {
      console.error('Operatorni yuklashda xatolik:', error);
      alert('Operatorni yuklashda xatolik yuz berdi');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !operatorData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const { operator, stats, clients } = operatorData;
  const efficiency = stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0;

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
              <div className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-2xl"
                style={{backgroundColor: '#3B82F6'}}>
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

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Jami mijozlar</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Tasdiqlangan</h3>
            <p className="text-3xl font-bold" style={{color: '#22C55E'}}>{stats.approved}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Jarayonda</h3>
            <p className="text-3xl font-bold" style={{color: '#F59E0B'}}>{stats.pending}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Rad etilgan</h3>
            <p className="text-3xl font-bold" style={{color: '#EF4444'}}>{stats.rejected}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <h3 className="text-xs font-medium text-gray-600 mb-1">Samaradorlik</h3>
            <p className="text-3xl font-bold text-gray-900">{efficiency}%</p>
          </div>
        </div>

        {/* Jami summa */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Jami summa</h2>
          <p className="text-4xl font-bold text-gray-900">{stats.totalAmount.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">UZS</p>
        </div>

        {/* Mijozlar ro'yxati */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Mijozlar ro'yxati</h2>
            <p className="text-sm text-gray-500 mt-1">Jami: {clients.length} ta mijoz</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mijoz</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Telefon</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Hudud</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Garov</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Summa</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">Bu operator hali mijoz qo'shmagan</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  clients.map((client, index) => (
                    <tr key={client._id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/client/${client._id}`)}>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm"
                            style={{backgroundColor: '#3B82F6'}}>
                            {client.ism.charAt(0)}{client.familya.charAt(0)}
                          </div>
                          <p className="font-semibold text-gray-900">{client.ism} {client.familya}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{client.telefon}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{client.hudud}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{client.garov}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">{parseFloat(client.summa).toLocaleString()}</p>
                          <p className="text-xs text-gray-500">UZS</p>
                        </div>
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
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDetail;
