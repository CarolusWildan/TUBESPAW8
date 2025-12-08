<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\Transaksi;
use App\Models\Tiket;
use App\Models\TransaksiDetail;
use App\Models\Kursi;
use App\Models\Film;
use App\Models\Jadwal;

class TransaksiController extends Controller
{
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

        return response()->json([
            'message' => 'Tiket berhasil dipesan',
            'transaksi' => $transaksi,
            'tiket' => $tiketList,
        ], 201);
    }
}
