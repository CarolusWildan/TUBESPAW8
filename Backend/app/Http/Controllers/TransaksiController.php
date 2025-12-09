<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\Transaksi;
use App\Models\Tiket;
use App\Models\Kursi;
use App\Models\Film;
use App\Models\Jadwal;
use App\Models\User;
use App\Models\KursiJadwal;
use Carbon\Carbon;

class TransaksiController extends Controller
{
    /**
     * Mengambil riwayat transaksi yang hanya dimiliki oleh pengguna yang sedang login.
     */
    public function index()
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $transactions = Transaksi::where('id_user', $userId)
            ->with([
                'film:id_film,judul', 
                'jadwal:id_jadwal,jam_tayang,tanggal_tayang',
                'jadwal.studio:id_studio,nama_studio',
                'tiket.kursi'
            ])
            ->orderBy('created_at', 'desc')
            ->get();
            
        $formattedTransactions = $transactions->map(function($transaksi) {
            $nomorKursi = $transaksi->tiket->map(function($tiket) {
                return $tiket->kursi->nomor_kursi ?? '?';
            })->implode(', ');

            // Karena tidak ada status_transaksi, kita anggap semua transaksi sukses
            $status = 'sukses'; 
            
            return [
                'id_transaksi' => $transaksi->id_transaksi,
                'tanggal_transaksi' => $transaksi->created_at->format('Y-m-d H:i:s'),
                'jumlah_tiket' => $transaksi->jumlah_tiket,
                'total_harga' => $transaksi->total_harga,
                'metode_pembayaran' => $transaksi->metode,
                'status_transaksi' => $status,
                'nomor_kursi' => $nomorKursi,
                'film' => [
                    'judul' => $transaksi->film->judul ?? 'N/A'
                ],
                'jadwal' => [
                    'tanggal_tayang' => $transaksi->jadwal->tanggal_tayang ?? null,
                    'jam_tayang' => $transaksi->jadwal->jam_tayang ?? null,
                    'studio' => [
                        'nama_studio' => $transaksi->jadwal->studio->nama_studio ?? 'N/A'
                    ]
                ]
            ];
        });

        return response()->json([
            'message' => 'Riwayat transaksi berhasil dimuat',
            'data' => $formattedTransactions,
        ], 200);
    }

    public function beliTiket(Request $request)
    {
        $request->validate([
            'id_film' => 'required|integer',
            'id_jadwal' => 'required|integer',
            'id_kursi' => 'required|array|min:1',
            'id_kursi.*' => 'integer',
            'jumlah_tiket' => 'required|integer|min:1',
            'harga_tiket' => 'required|numeric',
            'metode' => 'required'
        ]);
        
        $kursiIds = $request->id_kursi;

        $jadwal = Jadwal::findOrFail($request->id_jadwal);
        $hargaPerTiket = $jadwal->harga;

        // Cek Konflik Kursi
        $sudahDipesan = KursiJadwal::where('id_jadwal', $jadwal->id_jadwal)
            ->whereIn('id_kursi', $kursiIds)
            ->where('status', 'booked')
            ->pluck('id_kursi')
            ->all();

        if (!empty($sudahDipesan)) {
            return response()->json([
                'message' => 'Beberapa kursi sudah tidak tersedia untuk jadwal ini',
                'kursi_tidak_tersedia' => $sudahDipesan,
            ], 422);
        }

        // --- Mulai Transaksi Database ---
        DB::beginTransaction();

        try {
            // 1. Buat Header Transaksi
            $transaksi = Transaksi::create([
                'id_user' => Auth::id(),
                'id_film' => $request->id_film,
                'id_jadwal' => $jadwal->id_jadwal,
                'jumlah_tiket' => count($kursiIds),
                'total_harga' => count($kursiIds) * $hargaPerTiket,
                'metode' => $request->metode,
                // Tidak ada status_transaksi di database
            ]);

            $tiketList = [];
            foreach ($kursiIds as $kursiId) {
                // 2. Buat Tiket (detail transaksi)
                $tiket = Tiket::create([
                    'id_transaksi' => $transaksi->id_transaksi,
                    'id_kursi' => $kursiId,
                ]);
                $tiketList[] = $tiket;

                // 3. Update Status Kursi di Tabel Pivot (KursiJadwal)
                KursiJadwal::updateOrCreate(
                    [
                        'id_jadwal' => $jadwal->id_jadwal,
                        'id_kursi' => $kursiId,
                    ],
                    [
                        'status' => 'booked',
                    ]
                );
            }

            DB::commit();

            return response()->json([
                'message' => 'Tiket berhasil dipesan',
                'transaksi' => $transaksi,
                'tiket' => $tiketList,
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Transaksi gagal diproses karena error internal server.',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sales report per month (Admin Only)
     */
    public function getSalesReport(Request $request)
    {
        try {
            // Validasi user harus admin
            $user = Auth::user();
            if (!$user || $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized: Hanya admin yang dapat mengakses laporan'
                ], 403);
            }

            // Validasi tahun (opsional, default tahun sekarang)
            $year = $request->get('year', date('Y'));
            
            // Query untuk mendapatkan total penjualan per bulan
            // TIDAK ADA FILTER status_transaksi karena kolom tidak ada
            $monthlySales = Transaksi::select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('YEAR(created_at) as year'),
                DB::raw('COUNT(*) as total_transactions'),
                DB::raw('SUM(total_harga) as total_revenue'),
                DB::raw('SUM(jumlah_tiket) as total_tickets')
            )
            ->whereYear('created_at', $year)
            // Tidak ada where status_transaksi karena kolom tidak ada
            ->groupBy(DB::raw('YEAR(created_at)'), DB::raw('MONTH(created_at)'))
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

            // Format nama bulan
            $months = [
                1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
                5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
                9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
            ];

            // Format data untuk chart
            $formattedData = [];
            foreach ($months as $monthNum => $monthName) {
                $monthData = $monthlySales->firstWhere('month', $monthNum);
                
                $formattedData[] = [
                    'month' => $monthName,
                    'total_transactions' => $monthData ? $monthData->total_transactions : 0,
                    'total_revenue' => $monthData ? (int)$monthData->total_revenue : 0,
                    'total_tickets' => $monthData ? (int)$monthData->total_tickets : 0,
                ];
            }

            // Data untuk user performance (top 10 users)
            // Karena tidak ada status_transaksi, kita ambil semua transaksi
            $topUsers = User::select(
                'users.id_user',
                'users.nama',
                'users.email',
                DB::raw('COUNT(transaksi.id_transaksi) as total_transactions'),
                DB::raw('SUM(transaksi.total_harga) as total_spent'),
                DB::raw('SUM(transaksi.jumlah_tiket) as total_tickets')
            )
            ->leftJoin('transaksi', 'users.id_user', '=', 'transaksi.id_user')
            ->groupBy('users.id_user', 'users.nama', 'users.email')
            ->orderBy('total_spent', 'desc')
            ->limit(10)
            ->get();

            // Summary
            $totalRevenue = $monthlySales->sum('total_revenue') ?? 0;
            $totalTransactions = $monthlySales->sum('total_transactions') ?? 0;
            $totalTickets = $monthlySales->sum('total_tickets') ?? 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'monthly_sales' => $formattedData,
                    'top_users' => $topUsers,
                    'year' => $year,
                    'summary' => [
                        'total_revenue' => $totalRevenue,
                        'total_transactions' => $totalTransactions,
                        'total_tickets' => $totalTickets,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data report: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sales by movie/film (Admin Only)
     */
    public function getSalesByMovie(Request $request)
    {
        try {
            // Validasi user harus admin
            $user = Auth::user();
            if (!$user || $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized: Hanya admin yang dapat mengakses laporan'
                ], 403);
            }

            // Query penjualan per film
            $movieSales = DB::table('transaksi')
                ->select(
                    'film.judul',
                    DB::raw('COUNT(transaksi.id_transaksi) as total_sold'),
                    DB::raw('SUM(transaksi.total_harga) as total_revenue'),
                    DB::raw('SUM(transaksi.jumlah_tiket) as total_tickets')
                )
                ->join('film', 'transaksi.id_film', '=', 'film.id_film')
                ->groupBy('film.judul', 'film.id_film')
                ->orderBy('total_revenue', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $movieSales
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data penjualan film: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all transactions for admin
     */
    public function getAllTransactions(Request $request)
    {
        try {
            // Validasi user harus admin
            $user = Auth::user();
            if (!$user || $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized: Hanya admin yang dapat mengakses semua transaksi'
                ], 403);
            }

            $transactions = Transaksi::with([
                    'user:id_user,nama,email',
                    'film:id_film,judul',
                    'jadwal:id_jadwal,jam_tayang,tanggal_tayang',
                    'jadwal.studio:id_studio,nama_studio',
                    'tiket.kursi:id_kursi,nomor_kursi'
                ])
                ->orderBy('created_at', 'desc')
                ->get();

            // Format data untuk tampilan yang lebih baik
            $formattedTransactions = $transactions->map(function($transaksi) {
                $nomorKursi = $transaksi->tiket->map(function($tiket) {
                    return $tiket->kursi->nomor_kursi ?? '?';
                })->implode(', ');

                return [
                    'id_transaksi' => $transaksi->id_transaksi,
                    'tanggal_transaksi' => $transaksi->created_at->format('Y-m-d H:i:s'),
                    'user' => [
                        'nama' => $transaksi->user->nama ?? 'N/A',
                        'email' => $transaksi->user->email ?? 'N/A'
                    ],
                    'film' => $transaksi->film->judul ?? 'N/A',
                    'jadwal' => [
                        'tanggal' => $transaksi->jadwal->tanggal_tayang ?? 'N/A',
                        'jam' => $transaksi->jadwal->jam_tayang ?? 'N/A',
                        'studio' => $transaksi->jadwal->studio->nama_studio ?? 'N/A'
                    ],
                    'jumlah_tiket' => $transaksi->jumlah_tiket,
                    'nomor_kursi' => $nomorKursi,
                    'total_harga' => $transaksi->total_harga,
                    'metode_pembayaran' => $transaksi->metode
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedTransactions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data transaksi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get today's sales summary (Dashboard)
     */
    public function getTodaySales()
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $today = Carbon::today();
            
            $todaySales = Transaksi::whereDate('created_at', $today)
                ->select(
                    DB::raw('COUNT(*) as total_transactions'),
                    DB::raw('SUM(total_harga) as total_revenue'),
                    DB::raw('SUM(jumlah_tiket) as total_tickets')
                )
                ->first();

            // Transaksi hari ini per jam
            $hourlySales = Transaksi::whereDate('created_at', $today)
                ->select(
                    DB::raw('HOUR(created_at) as hour'),
                    DB::raw('COUNT(*) as transactions'),
                    DB::raw('SUM(total_harga) as revenue')
                )
                ->groupBy(DB::raw('HOUR(created_at)'))
                ->orderBy('hour', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'today_summary' => [
                        'total_transactions' => $todaySales->total_transactions ?? 0,
                        'total_revenue' => $todaySales->total_revenue ?? 0,
                        'total_tickets' => $todaySales->total_tickets ?? 0,
                        'date' => $today->format('Y-m-d')
                    ],
                    'hourly_sales' => $hourlySales
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data penjualan hari ini'
            ], 500);
        }
    }
}