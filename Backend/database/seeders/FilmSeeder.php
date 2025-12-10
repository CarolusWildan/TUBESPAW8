<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Film;

class FilmSeeder extends Seeder
{
    public function run(): void
    {
        Film::query()->create([
            'judul' => 'Petualangan Senja',
            'genre' => 'Drama',
            'durasi_film' => '01:45:00',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addWeeks(2)->toDateString(),
            'status' => 'showing',
            'cover_path' => '/covers/petualangan-senja.jpg',
        ]);

        Film::query()->create([
            'judul' => 'Galaksi Terdekat',
            'genre' => 'Sci-Fi',
            'durasi_film' => '02:10:00',
            'start_date' => now()->addDays(3)->toDateString(),
            'end_date' => now()->addWeeks(3)->toDateString(),
            'status' => 'coming soon',
            'cover_path' => '/covers/galaksi-terdekat.jpg',
        ]);
    }
}
