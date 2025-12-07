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
        // 1. Validasi Input Dasar
        $validator = Validator::make($request->all(), [
            'id_film'        => 'required|exists:films,id_film',   // Pastikan ID Film ada di tabel films
            'id_studio'      => 'required|exists:studios,id_studio', // Pastikan ID Studio ada di tabel studios
            'tanggal_tayang' => 'required|date|after_or_equal:today',
            'jam_mulai'      => 'required|date_format:H:i',
            'jam_selesai'    => 'required|date_format:H:i|after:jam_mulai', // Jam selesai wajib setelah jam mulai
        ], [
            'id_film.exists' => 'Film tidak ditemukan.',
            'id_studio.exists' => 'Studio tidak ditemukan.',
            'jam_selesai.after' => 'Jam selesai harus lebih akhir dari jam mulai.'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. VALIDASI LOGIKA: Cek Bentrok Jadwal (Overlap Check)
        // Logika: Apakah ada jadwal LAIN di studio YG SAMA pada tanggal YG SAMA
        // dimana rentang waktunya bertabrakan?
        $bentrok = Jadwal::where('id_studio', $request->id_studio)
            ->where('tanggal_tayang', $request->tanggal_tayang)
            ->where(function ($query) use ($request) {
                $query->whereBetween('jam_mulai', [$request->jam_mulai, $request->jam_selesai])
                      ->orWhereBetween('jam_selesai', [$request->jam_mulai, $request->jam_selesai])
                      ->orWhere(function ($q) use ($request) {
                          $q->where('jam_mulai', '<=', $request->jam_mulai)
                            ->where('jam_selesai', '>=', $request->jam_selesai);
                      });
            })
            ->exists();

        if ($bentrok) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jadwal bentrok! Studio ini sudah terpakai pada jam tersebut.'
            ], 409); // 409 Conflict
        }

        // 3. Simpan Data
        try {
            $jadwal = Jadwal::create([
                'id_film' => $request->id_film,
                'id_studio' => $request->id_studio,
                'tanggal_tayang' => $request->tanggal_tayang,
                'jam_mulai' => $request->jam_mulai,
                'jam_selesai' => $request->jam_selesai,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Jadwal berhasil dibuat',
                'data' => $jadwal
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyimpan data',
                'error_detail' => $e->getMessage()
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
            'id_film'        => 'exists:films,id_film',
            'id_studio'      => 'exists:studios,id_studio',
            'tanggal_tayang' => 'date',
            'jam_mulai'      => 'date_format:H:i',
            'jam_selesai'    => 'date_format:H:i|after:jam_mulai',
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
    public function destroy($id)
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