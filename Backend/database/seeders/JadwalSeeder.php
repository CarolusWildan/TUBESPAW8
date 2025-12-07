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
                'tanggal' => $today,
                'jam_mulai' => '10:00:00',
                'jam_selesai' => '11:45:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_film' => $film1->id_film,
                'id_studio' => $studio->id_studio,
                'tanggal' => $today,
                'jam_mulai' => '14:00:00',
                'jam_selesai' => '15:45:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_film' => ($film2?->id_film ?? $film1->id_film),
                'id_studio' => $studio->id_studio,
                'tanggal' => now()->addDay()->toDateString(),
                'jam_mulai' => '19:00:00',
                'jam_selesai' => '21:10:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
