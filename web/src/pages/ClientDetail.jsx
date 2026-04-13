import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ClientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [client, setClient] = useState(null);

  useEffect(() => {
    // LocalStorage dan klientni yuklash
    const savedClients = localStorage.getItem('bankCrmClients');

    if (savedClients) {
      const clientsData = JSON.parse(savedClients);
      const foundClient = clientsData.find(c => c.id === parseInt(id));
      setClient(foundClient);
    }
  }, [id]);

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    if (status === 'Tasdiqlangan') return '#10B981';
    if (status === 'Rad etilgan') return '#EF4444';
    return '#F59E0B';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Noma\'lum';
    const date = new Date(dateString);
    return date.toLocaleString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{backgroundColor: '#0AC4E0'}}>
                {client.ism.charAt(0)}{client.familya.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{client.ism} {client.familya}</h1>
                <p className="text-sm text-gray-500">Mijoz ID: {client.id}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Ma'lumotlar kartasi */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5" style={{backgroundColor: '#0AC4E0'}}>
            <h2 className="text-lg font-bold text-white">Mijoz ma'lumotlari</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white"
                  style={{backgroundColor: getStatusColor(client.status)}}
                >
                  {client.status}
                </span>
              </div>

              {/* Telefon */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Telefon raqami</p>
                <p className="text-lg font-bold text-gray-900">{client.telefon}</p>
              </div>

              {/* Hudud */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Hudud</p>
                <p className="text-lg font-bold text-gray-900">{client.hudud}</p>
              </div>

              {/* Kredit summasi */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Kredit summasi</p>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{parseFloat(client.summa).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">UZS</p>
                </div>
              </div>

              {/* Garov */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Garov</p>
                <p className="text-lg font-bold text-gray-900">{client.garov}</p>
              </div>

              {/* Operator */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Operator</p>
                <span
                  className="inline-flex items-center px-4 py-2 rounded-lg text-white font-bold text-sm cursor-default"
                  style={{backgroundColor: '#0AC4E0'}}
                >
                  Operator {client.operatorRaqam}
                </span>
              </div>
            </div>

            {/* Yaratilgan vaqt */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Yaratilgan vaqt</p>
                <p className="text-base text-gray-900">{formatDate(client.createdAt)}</p>
              </div>
            </div>

            {/* Izoh */}
            {client.comment && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Izoh</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{client.comment}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
