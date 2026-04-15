import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AllClients = () => {
  const navigate = useNavigate();
  const [allClients, setAllClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOperator, setFilterOperator] = useState('all');

  useEffect(() => {
    const savedClients = localStorage.getItem('bankCrmClients');
    if (savedClients) {
      const clientsData = JSON.parse(savedClients);
      setAllClients(clientsData);
      setFilteredClients(clientsData);
    }
  }, []);

  useEffect(() => {
    let filtered = [...allClients];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.ism.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.familya.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.telefon.includes(searchTerm) ||
        client.hudud.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(client => client.status === filterStatus);
    }

    // Operator filter
    if (filterOperator !== 'all') {
      filtered = filtered.filter(client => client.operatorRaqam === filterOperator);
    }

    setFilteredClients(filtered);
  }, [searchTerm, filterStatus, filterOperator, allClients]);

  // Excel export funksiyasi
  const exportToExcel = () => {
    if (filteredClients.length === 0) {
      alert('Ma\'lumot yo\'q!');
      return;
    }

    // CSV formatida yaratish (Excel ochadi)
    let csvContent = '\uFEFF'; // UTF-8 BOM

    // Header
    csvContent += 'ID,Ism,Familya,Telefon,Hudud,Garov,Summa (UZS),Operator,Status,Izoh,Yaratilgan sana\n';

    // Data
    filteredClients.forEach(client => {
      const createdDate = client.createdAt
        ? new Date(client.createdAt).toLocaleString('uz-UZ')
        : 'Noma\'lum';

      csvContent += [
        client.id,
        `"${client.ism}"`,
        `"${client.familya}"`,
        client.telefon,
        `"${client.hudud}"`,
        `"${client.garov}"`,
        client.summa,
        client.operatorRaqam,
        `"${client.status}"`,
        `"${client.comment || ''}"`,
        `"${createdDate}"`
      ].join(',') + '\n';
    });

    // Download qilish
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `mijozlar_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getUniqueOperators = () => {
    const operators = [...new Set(allClients.map(c => c.operatorRaqam))];
    return operators.sort();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Barcha mijozlar</h1>
                <p className="text-sm text-gray-500 mt-1">Jami: {filteredClients.length} ta mijoz</p>
              </div>
            </div>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg font-medium transition-colors"
              style={{backgroundColor: '#22C55E'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#16A34A'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#22C55E'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel yuklash
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Qidiruv</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ism, telefon, hudud..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">Hammasi</option>
                <option value="Jarayonda">Jarayonda</option>
                <option value="Tasdiqlangan">Tasdiqlangan</option>
                <option value="Rad etilgan">Rad etilgan</option>
              </select>
            </div>

            {/* Operator filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operator</label>
              <select
                value={filterOperator}
                onChange={(e) => setFilterOperator(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">Hammasi</option>
                {getUniqueOperators().map(op => (
                  <option key={op} value={op}>Operator {op}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
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
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Operator</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">Mijozlar topilmadi</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/client/${client.id}`)}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{client.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm" style={{backgroundColor: '#3B82F6'}}>
                            {client.ism.charAt(0)}{client.familya.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{client.ism} {client.familya}</p>
                          </div>
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
                          ? new Date(client.createdAt).toLocaleDateString('uz-UZ')
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

export default AllClients;
