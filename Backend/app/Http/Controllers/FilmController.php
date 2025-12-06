<?php

namespace App\Http\Controllers;

use App\Models\Film;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FilmController extends Controller
{
    public function index()
    {
        $allFilm = Film::all();
        return response()->json($allFilm);
    }
    
    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'poster_film' => 'required|string|max:255',
            'judul' => 'required|string|max:255',
            'genre' => 'required|string|max:255',
            'durasi_film' => 'required|date_format:H:i:s',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:coming soon,showing'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $film = Film::create([
            'poster_film' => $request->judul,
            'judul' => $request->judul,
            'genre' => $request->genre,
            'durasi_film' => $request->durasi_film,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Film Created Successfully',
            'film' => $film,
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        // PERBAIKAN: Cari film berdasarkan id_film (karena primary key adalah id_film)
        $film = Film::where('id_film', $id)->first();

        if(!$film){
            return response()->json(['message' => 'Film tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'poster_film' => 'required|string|max:255',
            'judul' => 'required|string|max:255',
            'genre' => 'required|string|max:255',
            'durasi_film' => 'required|date_format:H:i:s',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:coming soon,showing'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $film->update([
            'poster_film' => $request->judul,
            'judul' => $request->judul,
            'genre' => $request->genre,
            'durasi_film' => $request->durasi_film,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => $request->status,
        ]);
        
        return response()->json([
            'message' => 'Film updated successfully',
            'film' => $film
        ]);
    }

    public function delete(string $id)
    {
        // PERBAIKAN: Cari film berdasarkan id_film
        $film = Film::where('id_film', $id)->first();

        if(!$film){
            return response()->json(['message' => 'Film tidak ditemukan'], 404);
        }

        $film->delete();
        
        return response()->json([
            'message' => 'Film berhasil dihapus'
        ]);
    }

    // PERBAIKAN: Tambahkan method show untuk get film by ID
    public function show(string $id)
    {
        $film = Film::where('id_film', $id)->first();

        if(!$film){
            return response()->json(['message' => 'Film tidak ditemukan'], 404);
        }

        return response()->json($film);
    }

}