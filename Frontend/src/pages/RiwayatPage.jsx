import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RiwayatPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const API_BASE = 'http://localhost:8000/api';
    
    // Asumsi: Backend memiliki endpoint GET /api/transaksi
    // Endpoint ini harusnya secara otomatis memfilter berdasarkan user ID dari token
    const API_TRANSAKSI_URL = `${API_BASE}/transaksi`; 

    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };
    
    // Helper untuk menentukan status Badge
    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case 'sukses':
                return <Badge bg="success">Sukses</Badge>;
            case 'pending':
                return <Badge bg="warning">Menunggu Pembayaran</Badge>;
            case 'gagal':
                return <Badge bg="danger">Gagal</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            const token = localStorage.getItem('auth_token');

            if (!token) {
                toast.error("Anda harus login untuk melihat riwayat transaksi.");
                navigate('/login');
                setLoading(false);
                return;
            }

            try {
                const config = {
                    headers: { 'Authorization': `Bearer ${token}` }
                };

                const response = await axios.get(API_TRANSAKSI_URL, config);
                
                // Asumsi data transaksi ada di response.data.data atau langsung di response.data
                const data = Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
                
                // Simpan data transaksi
                setTransactions(data);

            } catch (err) {
                console.error("Gagal mengambil riwayat transaksi:", err);
                if (err.response?.status === 401) {
                    setError("Sesi Anda habis. Silakan login kembali.");
                } else if (err.code === 'ERR_NETWORK') {
                    setError("Gagal terhubung ke server backend.");
                } else {
                    setError("Terjadi kesalahan saat memuat data.");
                }
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [navigate]);

    return (
        <Container className="py-5" style={{ minHeight: "100vh", background: "#0b0e14" }}>
            <h2 className="fw-bold text-white mb-4">Riwayat Transaksi</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-white-50 mt-3">Memuat riwayat transaksi...</p>
                </div>
            ) : transactions.length === 0 ? (
                <div className="text-center py-5 rounded-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.2)" }}>
                    <i className="bi bi-ticket-perforated fs-1 text-secondary mb-3 d-block"></i>
                    <h4 className="text-white">Belum Ada Transaksi</h4>
                    <p className="text-white-50">Anda belum melakukan pemesanan tiket apapun.</p>
                </div>
            ) : (
                <Row>
                    {transactions.map((t, index) => (
                        <Col lg={12} key={t.id_transaksi || index} className="mb-3">
                            <Card className="border-0 text-white" style={{ background: "#1f2937", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            {/* Film Title & Jadwal */}
                                            <h5 className="fw-bold text-primary mb-1">
                                                {t.jadwal?.film?.judul || "Film Tidak Diketahui"} 
                                            </h5>
                                            <p className="mb-0 text-white-50 small">
                                                {t.tanggal_transaksi || "Tanggal Transaksi"} | {t.jadwal?.jam_tayang?.substring(0, 5) || "Waktu"} 
                                                <span className="mx-2">|</span> 
                                                {t.jadwal?.studio?.nama_studio || "Studio"}
                                            </p>
                                        </div>
                                        <div>
                                            {getStatusBadge(t.status_transaksi || 'Unknown')}
                                        </div>
                                    </div>
                                    <hr style={{borderColor: "rgba(255,255,255,0.1)"}} />

                                    {/* Detail Pembelian */}
                                    <Row>
                                        <Col md={6}>
                                            <div className="d-flex justify-content-between small mb-1">
                                                <span className="text-white-50">Jumlah Tiket:</span>
                                                <span className="fw-medium text-white">{t.jumlah_tiket || 0}</span>
                                            </div>
                                            <div className="d-flex justify-content-between small mb-1">
                                                <span className="text-white-50">Kursi:</span>
                                                {/* Asumsi: Kursi dikirim sebagai array atau string/map. Jika array of objects, perlu normalisasi */}
                                                <span className="fw-medium text-white">
                                                    {t.nomor_kursi || "A1, A2,..."} 
                                                </span>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="d-flex justify-content-between small mb-1">
                                                <span className="text-white-50">Total Pembayaran:</span>
                                                <span className="fw-bold text-warning">{formatRupiah(t.total_harga || 0)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between small mb-1">
                                                <span className="text-white-50">Metode Bayar:</span>
                                                <span className="fw-medium text-white text-uppercase">{t.metode_pembayaran || 'QRIS'}</span>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default RiwayatPage;