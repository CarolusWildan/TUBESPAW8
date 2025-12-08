<?php

namespace App\Http\Controllers;

use App\Models\Studio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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

        $studio = Studio::create([
            'nomor_studio' => $request->nomor_studio,
            'kapasitas' => $request->kapasitas,
            'tipe' => $request->tipe, // TAMBAHAN: Simpan tipe ke DB
        ]);

        return response()->json([
            'message' => 'Studio Created Successfully',
            'studio' => $studio,
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        // PERBAIKAN: Cari film berdasarkan id_film (karena primary key adalah id_film)
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
            'tipe' => $request->tipe, // TAMBAHAN: Update tipe
        ]);
        
        return response()->json([
            'message' => 'Studio updated successfully',
            'studio' => $studio
        ]);
    }

    public function delete(string $id)
    {
        // PERBAIKAN: Cari film berdasarkan id_film
        $studio = Studio::where('id_studio', $id)->first();

        if(!$studio){
            return response()->json(['message' => 'Studio tidak ditemukan'], 404);
        }

        $studio->delete();
        
        return response()->json([
            'message' => 'Studio berhasil dihapus'
        ]);
    }

    // PERBAIKAN: Tambahkan method show untuk get film by ID
    public function show(string $id)
    {
        $studio = Studio::where('id_studio', $id)->first();

        if(!$studio){
            return response()->json(['message' => 'Studio tidak ditemukan'], 404);
        }

        return response()->json($studio);
    }

}