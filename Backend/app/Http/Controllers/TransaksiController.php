<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Transaksi;
use App\Models\Tiket;
use App\Models\Kursi;
use App\Models\Film;
use App\Models\Jadwal;

class TransaksiController extends Controller
{
    public function beliTiket(Request $request)
    {
        // Validasi input dari user
        $request->validate([
            'id_film' => 'required|integer',
            'id_jadwal' => 'required|integer',
            'id_kursi' => 'required|integer',
            'jumlah_tiket' => 'required|integer|min:1',
            'harga_tiket' => 'required|numeric',
            'metode' => 'required'
        ]);
        $idUser = Auth::id();

        $film = Film::find($request->id_film);
        if (!$film) {
            return response()->json(['message' => 'Film tidak ditemukan'], 404);
        }

        $jadwal = Jadwal::find($request->id_jadwal);
        if (!$jadwal) {
            return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);
        }

        $kursi = Kursi::find($request->id_kursi);
        if (!$kursi) {
            return response()->json(['message' => 'Kursi tidak ditemukan'], 404);
        }

        if ($kursi->status === 'tidak') {
            return response()->json(['message' => 'Kursi sudah terisi'], 400);
        }

        // CEK apakah kursi sesuai studio pada jadwal
        if ($kursi->id_studio !== $jadwal->id_studio) {
            return response()->json([
                'message' => 'Kursi tidak sesuai dengan studio pada jadwal'
            ], 400);
        }

        // Buat transaksi
        $transaksi = Transaksi::create([
            'id_user' => Auth::id(),
            'total_harga' => $request->jumlah_tiket * $request->harga_tiket,
            'metode' => $request->metode,
            'tanggal_transaksi' => now(),
            'status' => 'booking'
        ]);

        // Buat tiket
        $tiket = Tiket::create([
            'id_transaksi' => $transaksi->id_transaksi,
            'id_film' => $request->id_film,
            'id_user' => Auth::id(),
            'id_kursi' => $request->id_kursi,
            'id_jadwal' => $request->id_jadwal,
            'tanggal_pemesanan' => now(),
            'jumlah_tiket' => $request->jumlah_tiket,
            'harga_tiket' => $request->harga_tiket
        ]);

        // Update kursi menjadi tidak tersedia
        $kursi->update([
            'status' => 'tidak'
        ]);

        return response()->json([
            'message' => 'Tiket berhasil dipesan',
            'transaksi' => $transaksi,
            'tiket' => $tiket
        ], 201);
    }
}
