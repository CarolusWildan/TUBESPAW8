<?php

namespace App\Http\Controllers;

use App\Models\Film;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

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
            'judul' => 'required|string|max:255',
            'genre' => 'required|string|max:255',
            'durasi_film' => 'required|date_format:H:i:s',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:coming soon,showing',
            'cover_path' => 'required|image|mimes:jpg,jpeg,png|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $coverFile = $request->file('cover_path');
        $coverPath = $coverFile->store('covers', 'public');

        $film = Film::create([
            'judul' => $request->judul,
            'genre' => $request->genre,
            'durasi_film' => $request->durasi_film,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => $request->status,
            'cover_path' => $coverPath,

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

        if (!$film) {
            return response()->json(['message' => 'Film tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'judul' => 'required|string|max:255',
            'genre' => 'required|string|max:255',
            'durasi_film' => 'required|date_format:H:i:s',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:coming soon,showing',
            'cover_path' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('cover_path')) {
            $coverFile = $request->file('cover_path');
            $coverPath = $coverFile->store('covers', 'public');
            $film->cover_path = $coverPath;
        }

        $film->update([
            'judul' => $request->judul,
            'genre' => $request->genre,
            'durasi_film' => $request->durasi_film,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => $request->status,
            'cover_path' => $request->cover_path,
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

        if (!$film) {
            return response()->json(['message' => 'Film tidak ditemukan'], 404);
        }

        if ($film->cover_path && Storage::disk('public')->exists($film->cover_path)) {
            Storage::disk('public')->delete($film->cover_path);
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

        if (!$film) {
            return response()->json(['message' => 'Film tidak ditemukan'], 404);
        }

        return response()->json($film);
    }

}