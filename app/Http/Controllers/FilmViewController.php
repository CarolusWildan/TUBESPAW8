<?php

namespace App\Http\Controllers;

use App\Models\Film;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class FilmViewController extends Controller
{
    public function index()
    {
        $films = Film::all();
        return view('film.index', compact('films'));
    }

    public function create()
    {
        return view('film.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'genre' => 'required|string|max:255',
            'durasi_film' => 'required|date_format:H:i:s',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:comingsoon,showing', 
        ]);

        $statusValue = $request->status == 'comingsoon' ? 'coming soon' : 'showing';

        Film::create([
            'judul' => $request->judul,
            'genre' => $request->genre,
            'durasi_film' => $request->durasi_film,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => $statusValue, 
        ]);

        return redirect()->route('films.index')->with('success', 'Film berhasil dibuat!');
    }

    public function edit($id)
    {
        $film = Film::findOrFail($id);
        return view('film.edit', compact('film'));
    }

    public function update(Request $request, $id)
    {
        $film = Film::findOrFail($id);

        $request->validate([
            'judul' => 'required|string|max:255',
            'genre' => 'required|string|max:255',
            'durasi_film' => 'required|date_format:H:i:s',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:comingsoon,showing', 
        ]);

        
        $statusValue = $request->status == 'comingsoon' ? 'coming soon' : 'showing';

        $film->update([
            'judul' => $request->judul,
            'genre' => $request->genre,
            'durasi_film' => $request->durasi_film,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => $statusValue, 
        ]);

        return redirect()->route('films.index')->with('success', 'Film berhasil diupdate!');
    }

    public function destroy($id)
    {
        $film = Film::findOrFail($id);
        $film->delete();

        return redirect()->route('films.index')->with('success', 'Film berhasil dihapus!');
    }
}