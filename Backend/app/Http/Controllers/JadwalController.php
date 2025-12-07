<?php

namespace App\Http\Controllers;

use App\Models\Jadwal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JadwalController extends Controller
{
    public function index()
    {
        $allJadwal = Jadwal::all();
        return response()->json($allJadwal);
    }

    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tanggal_tayang' => 'required|date_format:Y-m-d',
            'jam_tayang'     => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            $jadwal = Jadwal::create([
                'tanggal_tayang' => $request->tanggal_tayang,
                'jam_tayang'     => $request->jam_tayang,
            ]);

            return response()->json([
                'message' => 'Jadwal berhasil ditambahkan',
                'data'    => $jadwal
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menyimpan data',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $jadwal = Jadwal::find($id);

        if (!$jadwal) {
            return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);
        }

        return response()->json([
            'message' => 'Detail Jadwal',
            'data'    => $jadwal
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $jadwal = Jadwal::find($id);

        if (!$jadwal) {
            return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'tanggal_tayang' => 'sometimes|date_format:Y-m-d',
            'jam_tayang'     => 'sometimes|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $jadwal->update($request->only(['tanggal_tayang', 'jam_tayang']));

        return response()->json([
            'message' => 'Jadwal berhasil diupdate',
            'data'    => $jadwal
        ], 200);
    }

    public function delete($id)
    {
        $jadwal = Jadwal::find($id);

        if (!$jadwal) {
            return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);
        }

        $jadwal->delete();

        return response()->json(['message' => 'Jadwal berhasil dihapus'], 200);
    }
}