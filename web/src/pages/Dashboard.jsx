import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [allClients, setAllClients] = useState([]);
  const [clients, setClients] = useState([]);
  const operatorId = localStorage.getItem('bankCrmOperatorId') || '401';
  const [formData, setFormData] = useState({
    ism: '',
    familya: '',
    telefon: '',
    hudud: '',
    garov: '',
    summa: '',
    operatorRaqam: localStorage.getItem('bankCrmOperatorId') || '401',
    status: 'Jarayonda',
    comment: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // LocalStorage dan ma'lumotlarni yuklash
  useEffect(() => {
    const savedClients = localStorage.getItem('bankCrmClients');
    if (savedClients) {
      try {
        const allClientsData = JSON.parse(savedClients);
        setAllClients(allClientsData);
        // Faqat o'sha operatorning mijozlarini filtrlash
        const operatorClients = allClientsData.filter(client => client.operatorRaqam === operatorId);
        setClients(operatorClients);
      } catch (error) {
        // Production da console.error ni ko'rsatmaslik
        if (process.env.NODE_ENV === 'development') {
          console.error('LocalStorage dan ma\'lumot yuklashda xatolik:', error);
        }
      }
    }
  }, [operatorId]);

  // AllClients o'zgarganda LocalStorage ga saqlash
  useEffect(() => {
    if (allClients.length > 0) {
      localStorage.setItem('bankCrmClients', JSON.stringify(allClients));
    }
  }, [allClients]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditing) {
      // Tahrirlash rejimi
      const updatedAllClients = allClients.map(client =>
        client.id === editingId ? { ...formData, id: editingId } : client
      );
      setAllClients(updatedAllClients);
      setClients(updatedAllClients.filter(client => client.operatorRaqam === operatorId));
      setIsEditing(false);
      setEditingId(null);
    } else {
      // Yangi mijoz qo'shish
      const newClient = {
        id: allClients.length > 0 ? Math.max(...allClients.map(c => c.id)) + 1 : 1,
        ...formData,
        operatorRaqam: operatorId, // Avtomatik o'sha operatorni o'rnatish
        createdAt: new Date().toISOString()
      };
      const updatedAllClients = [...allClients, newClient];
      setAllClients(updatedAllClients);
      setClients(updatedAllClients.filter(client => client.operatorRaqam === operatorId));
    }

    // Formani tozalash
    setFormData({
      ism: '',
      familya: '',
      telefon: '',
      hudud: '',
      garov: '',
      summa: '',
      operatorRaqam: operatorId,
      status: 'Jarayonda',
      comment: ''
    });
  };

  const handleEdit = (client) => {
    setFormData({
      ism: client.ism,
      familya: client.familya,
      telefon: client.telefon,
      hudud: client.hudud,
      garov: client.garov,
      summa: client.summa,
      operatorRaqam: client.operatorRaqam,
      status: client.status,
      comment: client.comment || ''
    });
    setIsEditing(true);
    setEditingId(client.id);
    // Formaga scroll qilish
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      ism: '',
      familya: '',
      telefon: '',
      hudud: '',
      garov: '',
      summa: '',
      operatorRaqam: operatorId,
      status: 'Jarayonda',
      comment: ''
    });
  };

  // Statistika hisoblash
  const totalClients = clients.length;
  const totalAmount = clients.reduce((sum, client) => sum + (parseFloat(client.summa) || 0), 0);
  const approvedClients = clients.filter(c => c.status === 'Tasdiqlangan').length;
  const pendingClients = clients.filter(c => c.status === 'Jarayonda').length;
  const rejectedClients = clients.filter(c => c.status === 'Rad etilgan').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Bank CRM</h1>
        <button
          onClick={onLogout}
          className="text-red-600 hover:text-red-700 font-semibold transition"
        >
          Chiqish
        </button>
      </header>

      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Jami mijoz</p>
            <p className="text-3xl font-bold text-gray-800">{totalClients}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Jami summa</p>
            <div className="flex items-baseline gap-1 flex-wrap">
              <p className="text-2xl font-bold text-gray-800 break-all">{totalAmount.toLocaleString()}</p>
              <p className="text-sm font-semibold text-gray-600">UZS</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Tasdiqlangan</p>
            <p className="text-3xl font-bold" style={{color: '#22C55E'}}>{approvedClients}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Jarayonda</p>
            <p className="text-3xl font-bold" style={{color: '#F59E0B'}}>{pendingClients}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Rad etilgan</p>
            <p className="text-3xl font-bold" style={{color: '#EF4444'}}>{rejectedClients}</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? 'Mijozni tahrirlash' : 'Yangi mijoz qo\'shish'}
            </h2>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-red-600 hover:text-red-700 font-semibold transition"
              >
                Bekor qilish
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                name="ism"
                value={formData.ism}
                onChange={handleChange}
                placeholder="Ism"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
              <input
                type="text"
                name="familya"
                value={formData.familya}
                onChange={handleChange}
                placeholder="Familya"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
              <input
                type="tel"
                name="telefon"
                value={formData.telefon}
                onChange={handleChange}
                placeholder="+998901234567"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
              <input
                type="text"
                name="hudud"
                value={formData.hudud}
                onChange={handleChange}
                placeholder="Hudud"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input
                type="number"
                name="summa"
                value={formData.summa}
                onChange={handleChange}
                placeholder="Summa"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_0.5rem] bg-no-repeat"
              >
                <option value="Jarayonda">Jarayonda</option>
                <option value="Tasdiqlangan">Tasdiqlangan</option>
                <option value="Rad etilgan">Rad etilgan</option>
              </select>
            </div>

            <input
              type="text"
              name="garov"
              value={formData.garov}
              onChange={handleChange}
              placeholder="Garov"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-6"
              required
            />

            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Izoh (ixtiyoriy)"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-6 resize-none"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {isEditing ? 'Yangilash' : 'Qo\'shish'}
            </button>
          </form>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ism</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Familya</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Telefon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Hudud</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Garov</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Summa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Izoh</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Amallar</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                      Hozircha mijozlar yo'q
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => navigate(`/client/${client.id}`)}>
                      <td className="px-6 py-4 text-sm text-gray-900">{client.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{client.ism}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{client.familya}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{client.telefon}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{client.hudud}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{client.garov}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{parseFloat(client.summa).toLocaleString()} UZS</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                          style={{
                            backgroundColor: client.status === 'Tasdiqlangan' ? '#22C55E' :
                                           client.status === 'Rad etilgan' ? '#EF4444' :
                                           '#F59E0B'
                          }}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={client.comment}>
                        {client.comment || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(client);
                          }}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-yellow-600 transition"
                        >
                          Tahrirlash
                        </button>
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

export default Dashboard;
