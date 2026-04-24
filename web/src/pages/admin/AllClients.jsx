import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { getAllClients, archiveClients } from '../../services/clientService';

const AllClients = () => {
  const navigate = useNavigate();
  const [allClients, setAllClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOperator, setFilterOperator] = useState('all');
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    loadClients();
  }, [showArchived]);

  const loadClients = async () => {
    // Agar yuklanayotgan bo'lsa, qayta yuklashni oldini olish
    if (refreshing) return;

    try {
      // Faqat birinchi yuklashda loading spinner ko'rsatish
      if (initialLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await getAllClients(showArchived ? 'all' : false);
      if (response.success) {
        // Backend pagination format: { data: { data: [...], pagination: {...} } }
        const clientsData = response.data?.data || response.data || [];
        const clients = Array.isArray(clientsData) ? clientsData : [];
        setAllClients(clients);
        setFilteredClients(clients);
      }
    } catch (error) {
      console.error('Mijozlarni yuklashda xatolik:', error);
      // Faqat birinchi yuklashda alert ko'rsatish
      if (initialLoad) {
        alert('Mijozlarni yuklashda xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setInitialLoad(false);
    }
  };

  const handleArchive = async () => {
    if (!window.confirm("Barcha 'Tasdiqlangan' va 'Rad etilgan' statusidagi mijozlarni arxivga o'tkazasizmi? Ular endi ro'yxatda ko'rinmaydi, lekin statistikada hisobga olinadi.")) {
      return;
    }
    
    try {
      setIsArchiving(true);
      const res = await archiveClients();
      if (res.success) {
        alert(res.message || "Mijozlar arxivlandi");
        loadClients();
      }
    } catch (error) {
      console.error('Arxivlashda xatolik:', error);
      alert("Xatolik yuz berdi");
    } finally {
      setIsArchiving(false);
    }
  };

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

  // Rangli Excel export funksiyasi
  const exportToExcel = () => {
    if (filteredClients.length === 0) {
      alert('Ma\'lumot yo\'q!');
      return;
    }

    // Ma'lumotlarni tayyorlash
    const data = filteredClients.map(client => {
      const createdDate = client.createdAt
        ? new Date(client.createdAt).toLocaleString('uz-UZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Noma\'lum';

      return {
        'ID': client._id,
        'Ism': client.ism,
        'Familya': client.familya,
        'Telefon': client.telefon,
        'Hudud': client.hudud,
        'Garov': client.garov,
        'Summa (UZS)': parseFloat(client.summa),
        'Operator': client.operatorRaqam,
        'Status': client.status,
        'Arxivlangan': client.archived ? 'Ha' : 'Yo\'q',
        'Izoh': client.comment || '',
        'Yaratilgan sana': createdDate
      };
    });

    // Worksheet yaratish
    const ws = XLSX.utils.json_to_sheet(data);

    // Ustunlar kengligini sozlash
    const colWidths = [
      { wch: 8 },  // ID
      { wch: 15 }, // Ism
      { wch: 15 }, // Familya
      { wch: 15 }, // Telefon
      { wch: 15 }, // Hudud
      { wch: 20 }, // Garov
      { wch: 15 }, // Summa
      { wch: 10 }, // Operator
      { wch: 15 }, // Status
      { wch: 30 }, // Izoh
      { wch: 18 }  // Yaratilgan sana
    ];
    ws['!cols'] = colWidths;

    // Header ranglarini qo'shish
    const range = XLSX.utils.decode_range(ws['!ref']);

    // Header qatorini ranglash (A1:K1)
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;

      ws[cellAddress].s = {
        fill: {
          fgColor: { rgb: "3B82F6" } // Ko'k rang
        },
        font: {
          bold: true,
          color: { rgb: "FFFFFF" }, // Oq matn
          sz: 12
        },
        alignment: {
          horizontal: "center",
          vertical: "center"
        }
      };
    }

    // Status ustunini ranglash (I ustun)
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const statusCell = ws[XLSX.utils.encode_cell({ r: row, c: 8 })]; // Status ustuni (I)

      if (statusCell && statusCell.v) {
        let fillColor = '';

        if (statusCell.v === 'Tasdiqlangan') {
          fillColor = '22C55E'; // Yashil
        } else if (statusCell.v === 'Jarayonda') {
          fillColor = 'F59E0B'; // Sariq
        } else if (statusCell.v === 'Rad etilgan') {
          fillColor = 'EF4444'; // Qizil
        }

        if (fillColor) {
          statusCell.s = {
            fill: {
              fgColor: { rgb: fillColor }
            },
            font: {
              color: { rgb: "FFFFFF" }, // Oq matn
              bold: true
            },
            alignment: {
              horizontal: "center",
              vertical: "center"
            }
          };
        }
      }
    }

    // Workbook yaratish
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mijozlar');

    // Faylni yuklab olish
    const fileName = `mijozlar_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const getUniqueOperators = () => {
    const operators = [...new Set(allClients.map(c => c.operatorRaqam))];
    return operators.sort();
  };

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
            <div className="flex gap-3">
              <button
                onClick={handleArchive}
                disabled={isArchiving}
                className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-lg font-medium transition-colors ${
                  isArchiving ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <svg className={`w-5 h-5 ${isArchiving ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                {isArchiving ? 'Arxivlanmoqda...' : 'Tugallanganlarni arxivlash'}
              </button>
              <button
                onClick={() => loadClients()}
                disabled={refreshing}
                className={`flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg font-medium transition-colors ${
                  refreshing ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? 'Yuklanmoqda...' : 'Yangilash'}
              </button>
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
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            {/* Archive toggle */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer h-[42px] px-2 w-full bg-slate-50 border border-gray-300 rounded-lg justify-center hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Arxivlanganlarni ko'rsatish</span>
              </label>
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
                  filteredClients.map((client, index) => (
                    <tr
                      key={client._id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/client/${client._id}`)}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{index + 1}</td>
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
                        {client.archived && (
                          <span className="block mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Arxivlangan
                          </span>
                        )}
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

export default AllClients;
