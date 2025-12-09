<?php

namespace App\Http\Controllers;

use App\Models\Jadwal;
use App\Models\Film;
use App\Models\Kursi; // PASTEKAN INI ADA
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class JadwalController extends Controller
{
    public function index()
    {
        $jadwal = Jadwal::with(['film', 'studio'])
            ->orderBy('tanggal_tayang', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $jadwal
        ], 200);
    }

    public function create(Request $request)
    {
        // ... (Kode create sama seperti sebelumnya) ...
        // Agar tidak panjang, saya skip bagian create yang sudah berjalan
        // Fokus ke method SHOW di bawah
        
        $validator = Validator::make($request->all(), [
            'id_film' => 'required|exists:film,id_film',
            'id_studio' => 'required|exists:studio,id_studio',
            'tanggal_tayang' => 'required|date|after_or_equal:today',
            'jam_tayang' => 'required|date_format:H:i',
            'harga' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $jadwal = Jadwal::create([
                'id_film' => $request->id_film,
                'id_studio' => $request->id_studio,
                'tanggal_tayang' => $request->tanggal_tayang,
                'jam_tayang' => $request->jam_tayang,
                'harga' => $request->harga,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Jadwal berhasil dibuat',
                'data' => $jadwal
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menyimpan data', 'error' => $e->getMessage()], 500);
        }
    }

    // === BAGIAN INI YANG HARUS DIPERBAIKI ===
    public function show($id)
    {
        // 1. Load Jadwal + Relasi (Film, Studio)
        // Load juga 'kursiJadwal' yang statusnya 'booked' untuk tahu kursi mana yang merah
        $jadwal = Jadwal::with(['film', 'studio', 'kursiJadwal' => function($q) {
            $q->where('status', 'booked');
        }])->find($id);

        if (!$jadwal) {
            return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);
        }

        // 2. Ambil ID kursi yang sudah dibooking (Array of IDs)
        $bookedSeats = $jadwal->kursiJadwal->pluck('id_kursi');

        // 3. Ambil Master Data Kursi (Fisik Kursi)
        // PERBAIKAN: Gunakan ->get() tanpa parameter spesifik dulu untuk menghindari error "Column not found"
        // Nanti Frontend akan membaca properti yang tersedia (nomor_kursi atau kode_kursi)
        $allSeats = Kursi::where('id_studio', $jadwal->id_studio)
            ->get(); 
            // ->get(['id_kursi', 'nomor_kursi']); // Dulu kita spesifik, sekarang kita ambil semua (*) biar aman.

        // Inject data tambahan ke response JSON
        $jadwal->setAttribute('booked_seats', $bookedSeats);
        $jadwal->setAttribute('all_seats', $allSeats);

        return response()->json([
            'status' => 'success',
            'data' => $jadwal
        ], 200);
    }
    // ==========================================

    public function update(Request $request, $id)
    {
        $jadwal = Jadwal::find($id);
        if (!$jadwal) return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);

        $jadwal->update($request->all());
        return response()->json(['status' => 'success', 'data' => $jadwal], 200);
    }

    public function delete($id)
    {
        $jadwal = Jadwal::find($id);
        if (!$jadwal) return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);
        $jadwal->delete();
        return response()->json(['status' => 'success', 'message' => 'Jadwal dihapus'], 200);
    }
}