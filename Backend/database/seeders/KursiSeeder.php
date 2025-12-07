<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Studio;

class KursiSeeder extends Seeder
{
    public function run(): void
    {
        $studio = Studio::query()->first();
        if (!$studio) {
            return;
        }

        $seats = ['A1','A2','A3','B1','B2'];
        $rows = [];
        foreach ($seats as $code) {
            $rows[] = [
                'id_studio' => $studio->id_studio,
                'kode_kursi' => $code,
                'status' => 'tersedia',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('kursi')->insert($rows);
    }
}
