import { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, 
  Form, Spinner, Alert, Badge 
} from 'react-bootstrap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { toast } from 'sonner';

const ReportPage = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [movieSales, setMovieSales] = useState([]);
  
  // Warna untuk chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  // Urutan bulan yang benar
  const MONTH_ORDER = {
    'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4,
    'Mei': 5, 'Juni': 6, 'Juli': 7, 'Agustus': 8,
    'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
  };

  // Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Fungsi untuk mengurutkan data bulan
  const sortMonthlyData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    // Buat salinan array terlebih dahulu
    const dataCopy = [...data];
    
    return dataCopy.sort((a, b) => {
      // Jika ada month_num, gunakan itu
      if (a.month_num !== undefined && b.month_num !== undefined) {
        return a.month_num - b.month_num;
      }
      
      // Jika tidak, gunakan mapping nama bulan
      return MONTH_ORDER[a.month] - MONTH_ORDER[b.month];
    });
  };

  // Fungsi untuk memastikan semua bulan ada
  const ensureAllMonths = (monthlyData = []) => {
    const allMonths = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    return allMonths.map(month => {
      const existingData = monthlyData.find(item => item.month === month);
      return existingData || {
        month: month,
        month_num: MONTH_ORDER[month],
        total_transactions: 0,
        total_revenue: 0,
        total_tickets: 0
      };
    });
  };

  // Fetch sales report
  const fetchSalesReport = async (year) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/sales-report?year=${year}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Pastikan semua bulan ada dan urut
        const completeData = ensureAllMonths(result.data.monthly_sales);
        const sortedData = sortMonthlyData(completeData);
        
        setReportData({
          ...result.data,
          monthly_sales: sortedData
        });
      } else {
        toast.error(result.message || 'Gagal mengambil data report');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch movie sales
  const fetchMovieSales = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/sales-by-movie', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setMovieSales(result.data);
      }
    } catch (error) {
      console.error('Error fetching movie sales:', error);
    }
  };

  useEffect(() => {
    fetchSalesReport(selectedYear);
    fetchMovieSales();
  }, [selectedYear]);

  // Generate tahun pilihan (3 tahun terakhir)
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 2, currentYear - 1, currentYear];

  if (loading && !reportData) {
    return (
      <Container className="my-5 pt-4 d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  // Data yang sudah diurutkan untuk chart
  const chartData = reportData?.monthly_sales || [];

  return (
    <Container className="my-5 pt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-white fw-bold">Laporan Penjualan</h2>
          <p className="text-white-50">Analisis penjualan tiket bioskop per bulan</p>
        </div>
        <Form.Group className="mb-3" style={{ width: '150px' }}>
          <Form.Select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-dark text-white border-secondary"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="border-0 shadow" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Card.Body className="text-white">
              <h5 className="text-white-50">Total Pendapatan</h5>
              <h2 className="fw-bold">{reportData ? formatRupiah(reportData.summary.total_revenue) : 'Rp 0'}</h2>
              <small>Tahun {selectedYear}</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Card.Body className="text-white">
              <h5 className="text-white-50">Total Transaksi</h5>
              <h2 className="fw-bold">{reportData ? reportData.summary.total_transactions : 0}</h2>
              <small>Tahun {selectedYear}</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Card.Body className="text-white">
              <h5 className="text-white-50">Total Tiket Terjual</h5>
              <h2 className="fw-bold">{reportData ? reportData.summary.total_tickets : 0}</h2>
              <small>Tahun {selectedYear}</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        {/* Chart 1: Pendapatan per Bulan */}
        <Col lg={14}>
          <Card className="border-0 shadow mb-4" style={{ background: 'rgba(30, 30, 40, 0.8)' }}>
            <Card.Body>
              <h5 className="text-white mb-3">Pendapatan per Bulan ({selectedYear})</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="month" stroke="#aaa" />
                  <YAxis stroke="#aaa" tickFormatter={(value) => `Rp ${value/1000000}Jt`} />
                  <Tooltip 
                    formatter={(value) => [formatRupiah(value), 'Pendapatan']}
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#444' }}
                  />
                  <Legend />
                  <Bar dataKey="total_revenue" name="Pendapatan" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Chart 2: Tiket Terjual per Bulan */}
        <Col>
          <Card className="border-0 shadow mb-4" style={{ background: 'rgba(30, 30, 40, 0.8)' }}>
            <Card.Body>
              <h5 className="text-white mb-3">Tiket Terjual per Bulan</h5>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="month" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#444' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total_tickets" name="Tiket Terjual" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top Users dan Movie Sales */}
      <Row>
        {/* Top 10 Users */}
        <Col lg={6}>
          <Card className="border-0 shadow mb-4" style={{ background: 'rgba(30, 30, 40, 0.8)' }}>
            <Card.Body>
              <h5 className="text-white mb-3">Top 10 Pengguna</h5>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table hover variant="dark" size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nama</th>
                      <th>Transaksi</th>
                      <th>Total Belanja</th>
                      <th>Tiket</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData?.top_users?.map((user, index) => (
                      <tr key={user.id_user || index}>
                        <td>{index + 1}</td>
                        <td>{user.nama || 'N/A'}</td>
                        <td>
                          <Badge bg="info">{user.total_transactions || 0}</Badge>
                        </td>
                        <td>{formatRupiah(user.total_spent || 0)}</td>
                        <td>
                          <Badge bg="success">{user.total_tickets || 0}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Penjualan per Film */}
        <Col lg={6}>
          <Card className="border-0 shadow mb-4" style={{ background: 'rgba(30, 30, 40, 0.8)' }}>
            <Card.Body>
              <h5 className="text-white mb-3">Penjualan per Film</h5>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table hover variant="dark" size="sm">
                  <thead>
                    <tr>
                      <th>Film</th>
                      <th>Tiket Terjual</th>
                      <th>Pendapatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movieSales.map((movie, index) => (
                      <tr key={index}>
                        <td className="text-truncate" style={{ maxWidth: '200px' }} title={movie.judul}>
                          {movie.judul || 'N/A'}
                        </td>
                        <td>
                          <Badge bg="warning">{movie.total_sold || 0}</Badge>
                        </td>
                        <td>{formatRupiah(movie.total_revenue || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Data Table Bulanan */}
      <Card className="border-0 shadow mt-4" style={{ background: 'rgba(30, 30, 40, 0.8)' }}>
        <Card.Body>
          <h5 className="text-white mb-3">Data Detail Per Bulan ({selectedYear})</h5>
          <Table hover variant="dark" responsive>
            <thead>
              <tr>
                <th>Bulan</th>
                <th>Transaksi</th>
                <th>Tiket Terjual</th>
                <th>Pendapatan</th>
                <th>Rata-rata/Transaksi</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((month, index) => (
                <tr key={index}>
                  <td className="fw-bold">{month.month}</td>
                  <td>{month.total_transactions || 0}</td>
                  <td>{month.total_tickets || 0}</td>
                  <td>{formatRupiah(month.total_revenue || 0)}</td>
                  <td>
                    {month.total_transactions > 0 
                      ? formatRupiah(month.total_revenue / month.total_transactions)
                      : 'Rp 0'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
            {reportData && (
              <tfoot className="fw-bold">
                <tr>
                  <td>TOTAL</td>
                  <td>{reportData.summary.total_transactions || 0}</td>
                  <td>{reportData.summary.total_tickets || 0}</td>
                  <td>{formatRupiah(reportData.summary.total_revenue || 0)}</td>
                  <td>
                    {reportData.summary.total_transactions > 0
                      ? formatRupiah(reportData.summary.total_revenue / reportData.summary.total_transactions)
                      : 'Rp 0'
                    }
                  </td>
                </tr>
              </tfoot>
            )}
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ReportPage;