<?php

namespace App\Http\Controllers;

use App\Models\Jadwal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JadwalController extends Controller
{
    /**
     * GET /api/jadwal
     * Menampilkan semua jadwal beserta info Film dan Studio-nya.
     */
    public function index()
    {
        // Menggunakan 'with' untuk Eager Loading (Optimasi Query)
        // Agar frontend langsung dapat nama film & studio, bukan cuma ID-nya.
        $jadwal = Jadwal::with(['film', 'studio'])
            ->orderBy('tanggal_tayang', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $jadwal
        ], 200);
    }

    /**
     * POST /api/jadwal
     * Membuat jadwal baru dengan validasi anti-bentrok.
     */
    public function create(Request $request)
    {
        // 1. Validasi Input (Hanya jam_tayang)
        $validator = Validator::make($request->all(), [
            'id_film' => 'required|exists:film,id_film',
            'id_studio' => 'required|exists:studio,id_studio',
            'tanggal_tayang' => 'required|date|after_or_equal:today',
            'jam_tayang' => 'required|date_format:H:i', // Input user cuma ini
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. AMBIL DATA FILM (Wajib untuk hitung durasi)
        // Kita butuh durasi untuk tahu kapan film ini selesai,
        // supaya tidak menimpa jadwal film lain.
        $filmBaru = \App\Models\Film::find($request->id_film);

        // Konversi jam tayang baru ke object Carbon
        $mulaiBaru = \Carbon\Carbon::createFromFormat('H:i', $request->jam_tayang);
        // Hitung jam selesai berdasarkan durasi film (asumsi durasi dalam menit)
        $selesaiBaru = $mulaiBaru->copy()->addMinutes($filmBaru->durasi);

        // 3. LOGIKA BENTROK YANG LEBIH RUMIT
        // Karena tabel jadwal tidak punya jam_selesai, kita harus join ke tabel film
        // untuk menghitung waktu selesai dari jadwal-jadwal yang SUDAH ADA.

        $bentrok = Jadwal::with('film') // Eager load film untuk akses durasi
            ->where('id_studio', $request->id_studio)
            ->where('tanggal_tayang', $request->tanggal_tayang)
            ->get() // Ambil semua jadwal di hari & studio itu
            ->filter(function ($jadwalAda) use ($mulaiBaru, $selesaiBaru) {
                // Kita hitung manual di PHP (Logic Layer)
                // karena melakukan kalkulasi waktu dinamis di Query SQL itu rumit & berat
    
                $mulaiAda = \Carbon\Carbon::createFromFormat('H:i:s', $jadwalAda->jam_tayang);
                $selesaiAda = $mulaiAda->copy()->addMinutes($jadwalAda->film->durasi);

                // Logika Overlap:
                // (StartA < EndB) AND (EndA > StartB)
                return $mulaiBaru->lessThan($selesaiAda) && $selesaiBaru->greaterThan($mulaiAda);
            });

        if ($bentrok->isNotEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jadwal bentrok! Ada film lain yang belum selesai pada jam tersebut.'
            ], 409);
        }

        // 4. Simpan Data (Sederhana, cuma jam_tayang)
        try {
            $jadwal = Jadwal::create([
                'id_film' => $request->id_film,
                'id_studio' => $request->id_studio,
                'tanggal_tayang' => $request->tanggal_tayang,
                'jam_tayang' => $request->jam_tayang, // Sesuai request Anda
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Jadwal berhasil dibuat',
                'data' => $jadwal
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menyimpan data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/jadwal/{id}
     * Menampilkan detail satu jadwal.
     */
    public function show($id)
    {
        $jadwal = Jadwal::with(['film', 'studio'])->find($id);

        if (!$jadwal) {
            return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);
        }

        return response()->json(['data' => $jadwal], 200);
    }

    /**
     * PUT /api/jadwal/{id}
     * Update jadwal.
     */
    public function update(Request $request, $id)
    {
        $jadwal = Jadwal::find($id);

        if (!$jadwal) {
            return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);
        }

        // Validasi input (bisa disesuaikan jika tidak semua field wajib diupdate)
        $validator = Validator::make($request->all(), [
            'id_film' => 'exists:films,id_film',
            'id_studio' => 'exists:studios,id_studio',
            'tanggal_tayang' => 'date',
            'jam_tayang' => 'date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // TODO: Anda bisa menambahkan logika cek bentrok di sini juga, 
        // tapi pastikan mengecualikan ID jadwal yang sedang diedit (where('id_jadwal', '!=', $id))

        try {
            $jadwal->update($request->all());
            return response()->json([
                'status' => 'success',
                'message' => 'Jadwal berhasil diperbarui',
                'data' => $jadwal
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal update'], 500);
        }
    }

    /**
     * DELETE /api/jadwal/{id}
     */
    public function delete($id)
    {
        $jadwal = Jadwal::find($id);

        if (!$jadwal) {
            return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);
        }

        $jadwal->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Jadwal berhasil dihapus'
        ], 200);
    }
}