<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Film;
use App\Models\Studio;

class JadwalSeeder extends Seeder
{
    public function run(): void
    {
        $film1 = Film::query()->orderBy('id_film')->first();
        $film2 = Film::query()->orderBy('id_film')->skip(1)->first();
        $studio = Studio::query()->first();

        if (!$film1 || !$studio) {
            return; // prerequisites missing
        }

        $today = now()->toDateString();

        DB::table('jadwal')->insert([
            [
                'id_film' => $film1->id_film,
                'id_studio' => $studio->id_studio,
                'tanggal_tayang' => $today,
                'jam_tayang' => '10:00:00',
                'harga' => 50000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_film' => $film1->id_film,
                'id_studio' => $studio->id_studio,
                'tanggal_tayang' => $today,
                'jam_tayang' => '14:00:00',
                'harga' => 55000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_film' => ($film2?->id_film ?? $film1->id_film),
                'id_studio' => $studio->id_studio,
                'tanggal_tayang' => now()->addDay()->toDateString(),
                'jam_tayang' => '19:00:00',
                'harga' => 60000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
