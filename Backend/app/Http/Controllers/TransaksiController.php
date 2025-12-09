<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\Transaksi;
use App\Models\Tiket;
use App\Models\TransaksiDetail; // Catatan: Anda tidak menggunakan model ini.
use App\Models\Kursi;
use App\Models\Film;
use App\Models\Jadwal;
// Pastikan model KursiJadwal juga diimpor jika tidak ada
// use App\Models\KursiJadwal; 

class TransaksiController extends Controller
{
    /**
     * Mengambil riwayat transaksi yang hanya dimiliki oleh pengguna yang sedang login.
     * Endpoint: GET /api/transaksi
     * Memerlukan middleware 'auth:api'.
     */
    public function index()
    {
        // Mendapatkan ID user yang sedang login melalui token otorisasi
        $userId = Auth::id();

        if (!$userId) {
            // Seharusnya tidak terjadi jika route dilindungi 'auth:api', 
            // tapi ini adalah pengecekan keamanan tambahan.
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Ambil semua transaksi milik user tersebut
        // Menggunakan with() untuk eager loading relasi yang diperlukan oleh frontend (RiwayatPage.jsx)
        // Relasi yang dipanggil: 
        // 1. 'jadwal' (untuk jam tayang, studio)
        // 2. 'jadwal.film' (untuk judul film)
        // 3. 'jadwal.studio' (untuk nama studio)
        // 4. 'tiket.kursi' (untuk mendapatkan nomor kursi yang dibeli)
        
        $transactions = Transaksi::where('id_user', $userId)
            ->with([
                'jadwal.film', 
                'jadwal.studio',
                'tiket.kursi'
            ])
            ->orderBy('created_at', 'desc') // Urutkan dari yang terbaru
            ->get();
            
        // Formatting data agar mudah dikonsumsi oleh frontend
        $formattedTransactions = $transactions->map(function($transaksi) {
            
            // Mengumpulkan semua nomor kursi dari semua tiket yang dibeli dalam transaksi ini
            $nomorKursi = $transaksi->tiket->map(function($tiket) {
                return $tiket->kursi->nomor_kursi ?? '?';
            })->implode(', '); // Gabungkan menjadi string (misal: "A1, A2, B3")

            // Menentukan status transaksi (Anda mungkin perlu menyesuaikan ini
            // agar sesuai dengan kolom status yang ada di model Transaksi Anda)
            // Asumsi kolom status_transaksi adalah 'status_transaksi' di database.
            $status = $transaksi->status_transaksi ?? 'Sukses'; 
            
            return [
                'id_transaksi' => $transaksi->id_transaksi,
                'tanggal_transaksi' => $transaksi->created_at->format('Y-m-d'),
                'jumlah_tiket' => $transaksi->jumlah_tiket,
                'total_harga' => $transaksi->total_harga,
                'metode_pembayaran' => $transaksi->metode,
                'status_transaksi' => $status,
                'nomor_kursi' => $nomorKursi, // Data kursi yang sudah digabungkan
                'jadwal' => [
                    'jam_tayang' => $transaksi->jadwal->jam_tayang ?? null,
                    'studio' => [
                        'nama_studio' => $transaksi->jadwal->studio->nama_studio ?? 'N/A'
                    ],
                    'film' => [
                        'judul' => $transaksi->jadwal->film->judul ?? 'N/A'
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

        // Cek Konflik Kursi (Logika Anti-Race Condition)
        $sudahDipesan = \App\Models\KursiJadwal::query()
            ->where('id_jadwal', $jadwal->id_jadwal)
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
                'status_transaksi' => 'sukses', // Set status langsung sukses jika pembayaran diasumsikan langsung
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
                \App\Models\KursiJadwal::updateOrCreate(
                    [
                        'id_jadwal' => $jadwal->id_jadwal,
                        'id_kursi' => $kursiId,
                    ],
                    [
                        'status' => 'booked',
                    ]
                );
            }

            DB::commit(); // Commit semua perubahan

            return response()->json([
                'message' => 'Tiket berhasil dipesan',
                'transaksi' => $transaksi,
                'tiket' => $tiketList,
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack(); // Batalkan semua jika ada error
            // Tambahkan logging error yang lebih detail di lingkungan nyata
            return response()->json([
                'message' => 'Transaksi gagal diproses karena error internal server.',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }
}