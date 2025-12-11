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

    // Query dengan struktur yang benar
    $sql = "
        SELECT 
            t.id_transaksi,
            t.jumlah_tiket,
            t.total_harga,
            t.metode,
            t.created_at,
            t.id_film,
            t.id_jadwal,
            f.judul as film_judul,
            j.tanggal_tayang,
            j.jam_tayang,
            s.nomor_studio,
            s.tipe as studio_tipe,
            CONCAT('Studio ', s.nomor_studio, ' (', UPPER(s.tipe), ')') as studio_nama,
            GROUP_CONCAT(DISTINCT k.kode_kursi ORDER BY k.kode_kursi) as kode_kursi_list
        FROM transaksi t
        LEFT JOIN film f ON t.id_film = f.id_film
        LEFT JOIN jadwal j ON t.id_jadwal = j.id_jadwal
        LEFT JOIN studio s ON j.id_studio = s.id_studio
        LEFT JOIN tiket tk ON t.id_transaksi = tk.id_transaksi
        LEFT JOIN kursi k ON tk.id_kursi = k.id_kursi
        WHERE t.id_user = ?
        GROUP BY t.id_transaksi, t.jumlah_tiket, t.total_harga, t.metode, 
                 t.created_at, t.id_film, t.id_jadwal, f.judul, 
                 j.tanggal_tayang, j.jam_tayang, s.nomor_studio, s.tipe
        ORDER BY t.created_at DESC
    ";

    $transactions = DB::select($sql, [$userId]);
    
    \Log::info('Transactions with studio data:', $transactions); // Debug log
        
    $formattedTransactions = array_map(function($trans) {
        $kodeKursi = $trans->kode_kursi_list ?? '';
        
        if (empty($kodeKursi) || $kodeKursi === 'NULL') {
            $kodeKursi = $trans->jumlah_tiket . ' kursi';
        }

        $studioNama = $trans->studio_nama ?? 'Studio N/A';
        if ($trans->nomor_studio && $trans->studio_tipe) {
            $studioNama = "Studio {$trans->nomor_studio} (" . ucfirst($trans->studio_tipe) . ")";
        }

        return [
            'id_transaksi' => $trans->id_transaksi,
            'tanggal_transaksi' => $trans->created_at,
            'jumlah_tiket' => $trans->jumlah_tiket,
            'total_harga' => $trans->total_harga,
            'metode_pembayaran' => $trans->metode,
            'status_transaksi' => 'sukses',
            'nomor_kursi' => $kodeKursi,
            'film' => [
                'judul' => $trans->film_judul ?? 'N/A'
            ],
            'jadwal' => [
                'tanggal_tayang' => $trans->tanggal_tayang ?? null,
                'jam_tayang' => $trans->jam_tayang ?? null,
                'studio' => [
                    'nomor_studio' => $trans->nomor_studio ?? null,
                    'tipe' => $trans->studio_tipe ?? null,
                    'nama_studio' => $studioNama
                ]
            ]
        ];
    }, $transactions);

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

        DB::beginTransaction();

        try {
            $transaksi = Transaksi::create([
                'id_user' => Auth::id(),
                'id_film' => $request->id_film,
                'id_jadwal' => $jadwal->id_jadwal,
                'jumlah_tiket' => count($kursiIds),
                'total_harga' => count($kursiIds) * $hargaPerTiket,
                'metode' => $request->metode,
            ]);

            $tiketList = [];
            foreach ($kursiIds as $kursiId) {
                $tiket = Tiket::create([
                    'id_transaksi' => $transaksi->id_transaksi,
                    'id_kursi' => $kursiId,
                ]);
                $tiketList[] = $tiket;

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

            $year = $request->get('year', date('Y'));
            
            
            $monthlySales = Transaksi::select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('YEAR(created_at) as year'),
                DB::raw('COUNT(*) as total_transactions'),
                DB::raw('SUM(total_harga) as total_revenue'),
                DB::raw('SUM(jumlah_tiket) as total_tickets')
            )
            ->whereYear('created_at', $year)
            ->groupBy(DB::raw('YEAR(created_at)'), DB::raw('MONTH(created_at)'))
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

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