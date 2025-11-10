<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Film;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FilmController extends Controller
{
    public function index()
    {
        $allFilm = User::all();
        return response()->json($allFilm);
    }

    public function create(Request $request)
    {
        $validateData = $request->validate([
            'judul' => 'required',
            'genre' => 'required',
            'durasi_film' => 'required',
            'start_date' => 'required',
            'end_date' => 'required',
            'status' => 'required',
        ]);

        $userId = Auth::id();
        $film = Film::create([
            'user_id' => $userId,
            'judul' => $validateData['judul'],
            'genre' => $validateData['genre'],
            'durasi_film' => $validateData['durasi_film'],
            'start_date' => $validateData['start_date'],
            'end_date' => $validateData['end_date'],
            'status' => $validateData['status'],
        ]);

        return response()->json([
            'message' => 'Film Created Successfully',
            'post' => $film,
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $validateData = $request->validate([
            'judul' => 'required',
            'genre' => 'required',
            'durasi_film' => 'required',
            'start_date' => 'required',
            'end_date' => 'required',
            'status' => 'required',
        ]);

        $userId = Auth::id();
        $film = Film::where('judul', $request->judul)->first();

        if(!$film){
            return response()->json(['message' => 'Film tidak ditemukan'], 403);
        }

        $film->update($validateData);
        return response()->json($film);
    }

    public function delete(string $id)
    {
        $userId = Auth::id();
        $film = Film::find($id);

        if(!$film){
            return response()->json(['message' => 'Film tidak ditemukan'], 403);
        }

        $film->delete();
        return response()->json(['message' => 'Film berhasil dihapus']);
    }
}
