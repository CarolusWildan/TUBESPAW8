<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Studio;

class StudioSeeder extends Seeder
{
    public function run(): void
    {
        Studio::query()->firstOrCreate(
            ['nomor_studio' => 1],
            ['kapasitas' => 100],
                ['tipe' => 'reguler']
        );
    }
}
