import { useState, useEffect } from 'react';
import { 
  Container, Card, Row, Col, Button, 
  Table, Badge, Spinner, Alert, Modal,
  Accordion, Image
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const RiwayatPesananPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [userData, setUserData] = useState(null);

  // Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Format tanggal
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format tanggal tayang
  const formatTanggalTayang = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate barcode (simulasi dengan div)
  const generateBarcode = (text) => {
    return (
      <div className="barcode-simulation">
        {text.split('').map((char, index) => (
          <div 
            key={index} 
            className="barcode-bar" 
            style={{
              height: '30px',
              width: '2px',
              backgroundColor: '#000',
              display: 'inline-block',
              margin: '0 1px',
              opacity: 0.7 + Math.random() * 0.3 // Random opacity untuk efek barcode
            }}
          />
        ))}
      </div>
    );
  };

  // Fetch user data
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        setUserData(JSON.parse(user));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Fetch transaction history
  useEffect(() => {
    const fetchTransactionHistory = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setError('Anda harus login untuk melihat riwayat pesanan');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:8000/api/transaksi', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        const result = await response.json();
        
        if (response.ok) {
          // Pastikan data dalam format yang benar
          if (result.data && Array.isArray(result.data)) {
            setTransactions(result.data);
          } else if (result.transactions && Array.isArray(result.transactions)) {
            // Alternatif jika response format berbeda
            setTransactions(result.transactions);
          } else {
            setTransactions([]);
          }
        } else {
          setError(result.message || 'Gagal mengambil data transaksi');
          toast.error(result.message || 'Gagal mengambil data transaksi');
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError('Terjadi kesalahan saat mengambil data. Coba lagi nanti.');
        toast.error('Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionHistory();
  }, []);

  // Handle lihat tiket
  const handleViewTicket = (transaction) => {
    const ticketData = {
      ...transaction,
      user: userData,
      ticketId: `TIX${transaction.id_transaksi?.toString().padStart(6, '0') || '000000'}`,
      tanggalTayang: transaction.jadwal?.tanggal_tayang || 'N/A',
      jamTayang: transaction.jadwal?.jam_tayang || 'N/A',
      studio: transaction.jadwal?.studio?.nama_studio || 'N/A',
      film: transaction.film?.judul || 'N/A'
    };
    setSelectedTicket(ticketData);
    setShowTicketModal(true);
  };

  // Handle cetak tiket
  const handlePrintTicket = () => {
    window.print();
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'sukses':
      case 'completed':
      case 'success':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'gagal':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Method badge color
  const getMethodColor = (method) => {
    if (!method) return 'dark';
    
    const methodLower = method.toLowerCase();
    if (methodLower.includes('transfer')) return 'primary';
    if (methodLower.includes('qris')) return 'success';
    if (methodLower.includes('credit') || methodLower.includes('card')) return 'info';
    if (methodLower.includes('debit')) return 'secondary';
    if (methodLower.includes('gopay') || methodLower.includes('dana') || methodLower.includes('ovo')) return 'warning';
    return 'dark';
  };

  if (loading) {
    return (
      <Container className="my-5 pt-4 d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 text-white">Memuat riwayat pesanan...</span>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5 pt-4">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Gagal Memuat Data</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex justify-content-center gap-2 mt-3">
            <Button 
              variant="primary" 
              onClick={() => window.location.reload()}
            >
              <i className="bi bi-arrow-clockwise me-1"></i> Coba Lagi
            </Button>
            <Button 
              variant="outline-primary" 
              onClick={() => navigate('/')}
            >
              <i className="bi bi-house me-1"></i> Kembali ke Beranda
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (transactions.length === 0) {
    return (
      <Container className="my-5 pt-4">
        <div className="text-center text-white py-5">
          <div className="mb-4">
            <i className="bi bi-receipt" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
          </div>
          <h3 className="mb-3">Belum Ada Riwayat Pesanan</h3>
          <p className="text-white-50 mb-4">
            Anda belum memiliki riwayat transaksi. Mulai pesan tiket untuk menonton film favorit Anda!
          </p>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => navigate('/movies')}
            style={{
              background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)",
              border: "none",
            }}
          >
            <i className="bi bi-film me-2"></i> Pesan Tiket Sekarang
          </Button>
        </div>
      </Container>
    );
  }

  // Hitung statistik
  const totalTickets = transactions.reduce((sum, t) => sum + (t.jumlah_tiket || 0), 0);
  const totalSpent = transactions.reduce((sum, t) => sum + (t.total_harga || 0), 0);
  const latestTransaction = transactions.length > 0 ? transactions[0] : null;

  return (
    <Container className="my-5 pt-4" style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-white fw-bold mb-2">Riwayat Pesanan</h1>
        <p className="text-white-50 mb-4">
          Selamat datang, <span className="fw-bold text-white">{userData?.nama || 'User'}</span>. 
          Berikut adalah riwayat pembelian tiket Anda.
        </p>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Card.Body className="text-white">
              <h5 className="text-white-50">Total Transaksi</h5>
              <h2 className="fw-bold">{transactions.length}</h2>
              <small>Semua waktu</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Card.Body className="text-white">
              <h5 className="text-white-50">Total Tiket</h5>
              <h2 className="fw-bold">{totalTickets}</h2>
              <small>Tiket yang dibeli</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Card.Body className="text-white">
              <h5 className="text-white-50">Total Pengeluaran</h5>
              <h2 className="fw-bold">{formatRupiah(totalSpent)}</h2>
              <small>Semua transaksi</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <Card.Body className="text-white">
              <h5 className="text-white-50">Transaksi Terakhir</h5>
              <h4 className="fw-bold mb-1">
                {latestTransaction ? formatRupiah(latestTransaction.total_harga) : 'Rp 0'}
              </h4>
              <small className="d-block">{latestTransaction?.film?.judul || 'Belum ada'}</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Transactions List */}
      <Card className="border-0 shadow mb-4" style={{ background: 'rgba(30, 30, 40, 0.8)' }}>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover variant="dark" className="mb-0">
              <thead>
                <tr>
                  <th style={{ width: '10%' }}>ID</th>
                  <th style={{ width: '25%' }}>Film & Jadwal</th>
                  <th style={{ width: '15%' }}>Tanggal Transaksi</th>
                  <th style={{ width: '10%' }}>Kursi</th>
                  <th style={{ width: '10%' }}>Total</th>
                  <th style={{ width: '10%' }}>Status</th>
                  <th style={{ width: '20%' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={transaction.id_transaksi || index}>
                    <td className="fw-bold text-primary">
                      #{transaction.id_transaksi?.toString().padStart(6, '0') || 'N/A'}
                    </td>
                    <td>
                      <div>
                        <div className="fw-bold text-white">
                          {transaction.film?.judul || transaction.jadwal?.film?.judul || 'N/A'}
                        </div>
                        <div className="small text-white-50">
                          <i className="bi bi-calendar me-1"></i>
                          {transaction.jadwal?.tanggal_tayang 
                            ? formatTanggalTayang(transaction.jadwal.tanggal_tayang) 
                            : 'Tanggal N/A'
                          }
                          {' • '}
                          <i className="bi bi-clock me-1"></i>
                          {transaction.jadwal?.jam_tayang || 'Jam N/A'}
                        </div>
                        <div className="small text-white-50">
                          <i className="bi bi-building me-1"></i>
                          {transaction.jadwal?.studio?.nama_studio || 'Studio N/A'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-white">
                        {transaction.tanggal_transaksi 
                          ? formatDate(transaction.tanggal_transaksi)
                          : 'Tanggal tidak tersedia'
                        }
                      </div>
                    </td>
                    <td>
                      <Badge bg="info" className="fs-6 p-2">
                        {transaction.nomor_kursi || `${transaction.jumlah_tiket || 0} kursi`}
                      </Badge>
                    </td>
                    <td className="fw-bold text-success">
                      {formatRupiah(transaction.total_harga || 0)}
                    </td>
                    <td>
                      <Badge bg={getStatusColor(transaction.status_transaksi)} className="p-2 mb-1">
                        {transaction.status_transaksi || 'Sukses'}
                      </Badge>
                      <div className="small">
                        <Badge bg={getMethodColor(transaction.metode_pembayaran)}>
                          {transaction.metode_pembayaran || 'Transfer'}
                        </Badge>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleViewTicket(transaction)}
                        >
                          <i className="bi bi-ticket-detailed me-1"></i> Tiket
                        </Button>
                        <Button 
                          variant="outline-light" 
                          size="sm"
                          onClick={() => navigate('/movies')}
                        >
                          <i className="bi bi-film me-1"></i> Pesan Lagi
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Detailed Accordion View */}
      <Card className="border-0 shadow mb-5" style={{ background: 'rgba(30, 30, 40, 0.8)' }}>
        <Card.Header className="bg-transparent border-secondary">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="text-white mb-0">Detail Semua Pesanan</h5>
            <span className="text-white-50 small">
              {transactions.length} transaksi ditemukan
            </span>
          </div>
        </Card.Header>
        <Card.Body>
          <Accordion>
            {transactions.map((transaction, index) => (
              <Accordion.Item 
                key={transaction.id_transaksi || index} 
                eventKey={index.toString()}
                className="bg-transparent border-secondary mb-2"
              >
                <Accordion.Header className="text-white">
                  <div className="d-flex justify-content-between w-100 me-3 align-items-center">
                    <div>
                      <span className="fw-bold">
                        #{transaction.id_transaksi?.toString().padStart(6, '0') || 'N/A'}
                      </span>
                      <span className="ms-3">{transaction.film?.judul || 'N/A'}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <Badge bg="primary" className="me-3">
                        {transaction.jumlah_tiket || 0} Tiket
                      </Badge>
                      <span className="text-success fw-bold">
                        {formatRupiah(transaction.total_harga || 0)}
                      </span>
                    </div>
                  </div>
                </Accordion.Header>
                <Accordion.Body className="text-white">
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <h6 className="text-white-50 mb-3">
                          <i className="bi bi-film me-2"></i>Detail Film
                        </h6>
                        <p className="mb-2">
                          <strong>Judul:</strong> {transaction.film?.judul || 'N/A'}
                        </p>
                        <p className="mb-2">
                          <strong>Studio:</strong> {transaction.jadwal?.studio?.nama_studio || 'N/A'}
                        </p>
                        <p className="mb-2">
                          <strong>Tanggal Tayang:</strong> {formatTanggalTayang(transaction.jadwal?.tanggal_tayang)}
                        </p>
                        <p className="mb-2">
                          <strong>Jam Tayang:</strong> {transaction.jadwal?.jam_tayang || 'N/A'}
                        </p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <h6 className="text-white-50 mb-3">
                          <i className="bi bi-receipt me-2"></i>Detail Transaksi
                        </h6>
                        <p className="mb-2">
                          <strong>Tanggal Transaksi:</strong> {formatDate(transaction.tanggal_transaksi)}
                        </p>
                        <p className="mb-2">
                          <strong>Kursi:</strong> {transaction.nomor_kursi || 'N/A'}
                        </p>
                        <p className="mb-2">
                          <strong>Jumlah Tiket:</strong> {transaction.jumlah_tiket || 0}
                        </p>
                        <p className="mb-2">
                          <strong>Metode Pembayaran:</strong> {transaction.metode_pembayaran || 'N/A'}
                        </p>
                        <p className="mb-2">
                          <strong>Status:</strong> 
                          <Badge bg={getStatusColor(transaction.status_transaksi)} className="ms-2">
                            {transaction.status_transaksi || 'Sukses'}
                          </Badge>
                        </p>
                      </div>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-end mt-3">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleViewTicket(transaction)}
                      className="me-2"
                    >
                      <i className="bi bi-ticket-detailed me-1"></i> Lihat Tiket
                    </Button>
                    <Button 
                      variant="outline-success" 
                      size="sm"
                      onClick={() => navigate('/movies')}
                    >
                      <i className="bi bi-cart-plus me-1"></i> Pesan Lagi
                    </Button>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Card.Body>
      </Card>

      {/* Ticket Detail Modal */}
      <Modal 
        show={showTicketModal} 
        onHide={() => setShowTicketModal(false)}
        centered
        size="lg"
        className="ticket-modal"
      >
        <Modal.Header closeButton className="bg-dark text-white border-secondary">
          <Modal.Title>Detail Tiket</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white p-0">
          {selectedTicket && (
            <div className="ticket-detail p-4" style={{ 
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              minHeight: '400px'
            }}>
              {/* Ticket Header */}
              <div className="text-center mb-4">
                <h2 className="fw-bold text-white mb-2">
                  <i className="bi bi-ticket-detailed me-2"></i>TIXIFY TICKET
                </h2>
                <div className="d-flex justify-content-center align-items-center">
                  <div className="me-3">
                    <Badge bg="warning" className="p-2 fs-6">VALID</Badge>
                  </div>
                  <div className="text-white-50">
                    ID: {selectedTicket.ticketId}
                  </div>
                </div>
              </div>

              {/* Ticket Content */}
              <Row className="mb-4">
                <Col md={8}>
                  <div className="bg-white text-dark p-3 rounded mb-3 shadow">
                    <h4 className="fw-bold mb-3 text-primary">{selectedTicket.film || 'N/A'}</h4>
                    <Row>
                      <Col md={6}>
                        <p className="mb-2">
                          <strong><i className="bi bi-calendar-date me-2"></i>Tanggal:</strong><br/>
                          {formatTanggalTayang(selectedTicket.tanggalTayang)}
                        </p>
                        <p className="mb-2">
                          <strong><i className="bi bi-clock me-2"></i>Jam:</strong><br/>
                          {selectedTicket.jamTayang}
                        </p>
                      </Col>
                      <Col md={6}>
                        <p className="mb-2">
                          <strong><i className="bi bi-building me-2"></i>Studio:</strong><br/>
                          {selectedTicket.studio}
                        </p>
                        <p className="mb-2">
                          <strong><i className="bi bi-people me-2"></i>Kursi:</strong><br/>
                          {selectedTicket.nomor_kursi || selectedTicket.jumlah_tiket + ' kursi'}
                        </p>
                      </Col>
                    </Row>
                  </div>
                </Col>
                <Col md={4} className="d-flex align-items-center justify-content-center">
                  <div className="bg-white p-3 rounded text-center shadow" style={{ width: '100%' }}>
                    <div className="mb-2" style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3c72' }}>
                      TIXIFY
                    </div>
                    <div className="text-center mb-2">
                      {generateBarcode(selectedTicket.ticketId)}
                    </div>
                    <div className="text-dark small fw-bold mb-2">
                      {selectedTicket.ticketId}
                    </div>
                    <div className="text-dark small">
                      <Badge bg="success" className="mb-2">{selectedTicket.status_transaksi || 'Sukses'}</Badge>
                    </div>
                    <p className="mt-2 mb-0 small text-dark">Tunjukkan barcode saat masuk</p>
                  </div>
                </Col>
              </Row>

              {/* Ticket Footer */}
              <div className="bg-white text-dark p-3 rounded shadow">
                <Row>
                  <Col md={4}>
                    <p className="mb-1">
                      <strong>Pemesan:</strong><br/>
                      {userData?.nama || 'N/A'}
                    </p>
                  </Col>
                  <Col md={4}>
                    <p className="mb-1">
                      <strong>Jumlah Tiket:</strong><br/>
                      {selectedTicket.jumlah_tiket || 1} tiket
                    </p>
                  </Col>
                  <Col md={4}>
                    <p className="mb-1">
                      <strong>Total:</strong><br/>
                      {formatRupiah(selectedTicket.total_harga || 0)}
                    </p>
                  </Col>
                </Row>
                <hr/>
                <div className="text-center small text-muted">
                  <p className="mb-0">
                    <i className="bi bi-info-circle me-1"></i>
                    Harap datang 30 menit sebelum film dimulai. Tiket berlaku hanya untuk 1x penggunaan.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
          <Button variant="secondary" onClick={() => setShowTicketModal(false)}>
            <i className="bi bi-x-lg me-1"></i> Tutup
          </Button>
          <Button variant="primary" onClick={handlePrintTicket}>
            <i className="bi bi-printer me-1"></i> Cetak Tiket
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Custom Styles */}
      <style jsx global>{`
        @media print {
          .navbar, .modal-footer, button, .no-print {
            display: none !important;
          }
          
          .ticket-detail {
            background: white !important;
            color: black !important;
            padding: 20px !important;
            border: 2px solid black !important;
          }
          
          .modal-content {
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
          
          /* Style barcode untuk print */
          .barcode-bar {
            height: 30px !important;
            background-color: black !important;
          }
        }
        
        /* Custom scrollbar */
        .table-responsive::-webkit-scrollbar {
          height: 8px;
        }
        
        .table-responsive::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        .table-responsive::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
          border-radius: 4px;
        }
        
        /* Barcode simulation styling */
        .barcode-simulation {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          height: 50px;
          margin: 10px 0;
          overflow: hidden;
        }
        
        .barcode-bar {
          transition: all 0.3s;
        }
        
        /* Modal styling */
        .ticket-modal .modal-content {
          background: transparent;
          border: none;
        }
        
        /* Hover effects */
        .accordion-button:not(.collapsed) {
          background-color: rgba(59, 130, 246, 0.1) !important;
          color: white !important;
        }
        
        .accordion-button:focus {
          box-shadow: none;
          border-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </Container>
  );
};

export default RiwayatPesananPage;