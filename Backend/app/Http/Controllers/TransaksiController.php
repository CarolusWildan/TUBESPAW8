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

        $transaksi = Transaksi::create([
            'id_user' => Auth::id(),
            'id_film' => $request->id_film,
            'id_jadwal' => $request->id_jadwal,
            'jumlah_tiket' => count($kursiIds),
            'total_harga' => count($kursiIds) * $request->harga_tiket,
            'metode' => $request->metode,
        ]);

        $tiketList = [];
        foreach ($kursiIds as $kursiId) {
            // Tiket table only has id_transaksi, id_kursi, timestamps per migration
            $tiket = Tiket::create([
                'id_transaksi' => $transaksi->id_transaksi,
                'id_kursi' => $kursiId,
            ]);
            $tiketList[] = $tiket;
            TransaksiDetail::create([
                'id_transaksi' => $transaksi->id_transaksi,
                'id_tiket' => $tiket->id_tiket,
            ]);
        }

        Kursi::whereIn('id_kursi', $kursiIds)->update(['status' => 'terpesan']);

        return response()->json([
            'message' => 'Tiket berhasil dipesan',
            'transaksi' => $transaksi,
            'tiket' => $tiketList,
            'transaksidetail' => 'created successfully'
        ], 201);
    }
}
