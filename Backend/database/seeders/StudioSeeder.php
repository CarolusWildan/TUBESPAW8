<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Studio;

class StudioSeeder extends Seeder
{
    public function run(): void
    {
        // Minimal studio required for foreign keys in jadwal & kursi
        Studio::query()->firstOrCreate(
            ['nomor_studio' => 1],
            ['kapasitas' => 100]
        );
    }
}
