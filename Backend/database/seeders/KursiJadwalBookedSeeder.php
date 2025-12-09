<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Jadwal;
use App\Models\Kursi;
use App\Models\KursiJadwal;

class KursiJadwalBookedSeeder extends Seeder
{
    public function run(): void
    {
        $jadwal = Jadwal::query()->orderBy('id_jadwal')->first();
        if (!$jadwal) {
            return;
        }

        // Pick first 2 seats in the same studio and mark as booked
        $seats = Kursi::query()
            ->where('id_studio', $jadwal->id_studio)
            ->orderBy('id_kursi')
            ->limit(2)
            ->get();

        foreach ($seats as $seat) {
            KursiJadwal::updateOrCreate(
                [
                    'id_jadwal' => $jadwal->id_jadwal,
                    'id_kursi' => $seat->id_kursi,
                ],
                [
                    'status' => 'booked',
                ]
            );
        }
    }
}
