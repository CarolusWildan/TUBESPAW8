<?php

namespace App\Http\Controllers;

use App\Models\Studio;
use App\Models\Kursi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class StudioController extends Controller
{
    public function index()
    {
        $allStudio = Studio::all();
        return response()->json($allStudio);
    }
    
    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nomor_studio' => 'required|integer|min:1|unique:studio,nomor_studio',
            'kapasitas' => 'required|integer|min:1|max:500',
            'tipe' => 'required|string|in:reguler,imax,screenx',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // 1. Buat Studio
            $studio = Studio::create([
                'nomor_studio' => $request->nomor_studio,
                'kapasitas' => $request->kapasitas,
                'tipe' => $request->tipe,
            ]);

            // 2. Generate Kursi Otomatis
            $kapasitas = $request->kapasitas;
            $seatsPerRow = 8; 
            $kursiData = [];
            $now = now(); 

            for ($i = 1; $i <= $kapasitas; $i++) {
                $rowIndex = floor(($i - 1) / $seatsPerRow);
                
                $rowLabel = '';
                $tempIndex = $rowIndex;
                do {
                    $remainder = $tempIndex % 26;
                    $rowLabel = chr(65 + $remainder) . $rowLabel;
                    $tempIndex = floor($tempIndex / 26) - 1;
                } while ($tempIndex >= 0);

                $seatNum = (($i - 1) % $seatsPerRow) + 1;
                $kodeKursi = $rowLabel . $seatNum;

                $kursiData[] = [
                    'id_studio' => $studio->id_studio,
                    'kode_kursi' => $kodeKursi,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            Kursi::insert($kursiData);

            DB::commit();

            return response()->json([
                'message' => 'Studio Created Successfully (Seats Generated)',
                'studio' => $studio,
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Failed to create studio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, string $id)
    {
        $studio = Studio::where('id_studio', $id)->first();

        if(!$studio){
            return response()->json(['message' => 'Studio tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nomor_studio' => 'required|integer|min:1|unique:studio,nomor_studio,'.$studio->id_studio.',id_studio',
            'kapasitas' => 'required|integer|min:1|max:500',
            'tipe' => 'required|string|in:reguler,imax,screenx',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $studio->update([
            'nomor_studio' => $request->nomor_studio,
            'kapasitas' => $request->kapasitas,
            'tipe' => $request->tipe,
        ]);
        
        return response()->json([
            'message' => 'Studio updated successfully',
            'studio' => $studio
        ]);
    }

    public function delete(string $id)
    {
        $studio = Studio::where('id_studio', $id)->first();

        if(!$studio){
            return response()->json(['message' => 'Studio tidak ditemukan'], 404);
        }

        $studio->delete();
        
        return response()->json([
            'message' => 'Studio berhasil dihapus'
        ]);
    }

    public function show(string $id)
    {
        $studio = Studio::where('id_studio', $id)->first();

        if(!$studio){
            return response()->json(['message' => 'Studio tidak ditemukan'], 404);
        }

        return response()->json($studio);
    }
}