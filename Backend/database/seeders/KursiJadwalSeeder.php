<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Jadwal;
use App\Models\Kursi;

class KursiJadwalSeeder extends Seeder
{
    public function run(): void
    {
        $jadwals = Jadwal::all();
        if ($jadwals->isEmpty()) {
            return;
        }

        foreach ($jadwals as $jadwal) {
            // Get seats in the same studio as the jadwal
            $seats = Kursi::query()
                ->where('id_studio', $jadwal->id_studio)
                ->orderBy('id_kursi')
                ->limit(5)
                ->get();

            foreach ($seats as $seat) {
                DB::table('kursi_jadwal')->updateOrInsert(
                    [
                        'id_jadwal' => $jadwal->id_jadwal,
                        'id_kursi' => $seat->id_kursi,
                    ],
                    [
                        'status' => 'available',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }
}
