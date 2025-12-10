<?php

namespace Database\Seeders;

use App\Models\Transaksi;
use App\Models\Tiket;
use App\Models\User;
use App\Models\Film;
use App\Models\Jadwal;
use App\Models\Kursi;
use App\Models\KursiJadwal;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransaksiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing data
        $users = User::all();
        $jadwals = Jadwal::all();
        $kursis = Kursi::all();

        if ($users->isEmpty() || $jadwals->isEmpty() || $kursis->isEmpty()) {
            $this->command->warn('Please run FilmSeeder, StudioSeeder, JadwalSeeder, KursiSeeder first!');
            return;
        }

        // Create sample transactions
        $metodes = ['cash', 'qris', 'transfer'];
        $transactionCount = 0;

        // Transaction 1: User 1 buys 2 tickets for Jadwal 1
        if ($users->count() > 0 && $jadwals->count() > 0) {
            $transaksi1 = Transaksi::create([
                'id_user' => $users->first()->id_user,
                'id_film' => $jadwals->first()->id_film,
                'id_jadwal' => $jadwals->first()->id_jadwal,
                'jumlah_tiket' => 2,
                'total_harga' => $jadwals->first()->harga * 2,
                'metode' => 'qris',
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
            ]);

            // Create tickets for this transaction
            if ($kursis->count() >= 2) {
                Tiket::create([
                    'id_transaksi' => $transaksi1->id_transaksi,
                    'id_kursi' => $kursis->get(0)->id_kursi,
                ]);

                Tiket::create([
                    'id_transaksi' => $transaksi1->id_transaksi,
                    'id_kursi' => $kursis->get(1)->id_kursi,
                ]);

                // Mark seats as booked
                KursiJadwal::updateOrCreate(
                    [
                        'id_jadwal' => $transaksi1->id_jadwal,
                        'id_kursi' => $kursis->get(0)->id_kursi,
                    ],
                    ['status' => 'booked']
                );

                KursiJadwal::updateOrCreate(
                    [
                        'id_jadwal' => $transaksi1->id_jadwal,
                        'id_kursi' => $kursis->get(1)->id_kursi,
                    ],
                    ['status' => 'booked']
                );

                $transactionCount++;
            }
        }

        // Transaction 2: User 1 buys 1 ticket for Jadwal 2
        if ($users->count() > 0 && $jadwals->count() > 1) {
            $transaksi2 = Transaksi::create([
                'id_user' => $users->first()->id_user,
                'id_film' => $jadwals->get(1)->id_film,
                'id_jadwal' => $jadwals->get(1)->id_jadwal,
                'jumlah_tiket' => 1,
                'total_harga' => $jadwals->get(1)->harga,
                'metode' => 'cash',
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3),
            ]);

            // Create ticket for this transaction
            if ($kursis->count() >= 3) {
                Tiket::create([
                    'id_transaksi' => $transaksi2->id_transaksi,
                    'id_kursi' => $kursis->get(2)->id_kursi,
                ]);

                // Mark seat as booked
                KursiJadwal::updateOrCreate(
                    [
                        'id_jadwal' => $transaksi2->id_jadwal,
                        'id_kursi' => $kursis->get(2)->id_kursi,
                    ],
                    ['status' => 'booked']
                );

                $transactionCount++;
            }
        }

        // Transaction 3: User 1 buys 3 tickets for Jadwal 3
        if ($users->count() > 0 && $jadwals->count() > 2) {
            $transaksi3 = Transaksi::create([
                'id_user' => $users->first()->id_user,
                'id_film' => $jadwals->get(2)->id_film,
                'id_jadwal' => $jadwals->get(2)->id_jadwal,
                'jumlah_tiket' => 3,
                'total_harga' => $jadwals->get(2)->harga * 3,
                'metode' => 'transfer',
                'created_at' => Carbon::now()->subDay(),
                'updated_at' => Carbon::now()->subDay(),
            ]);

            // Create tickets for this transaction
            if ($kursis->count() >= 5) {
                Tiket::create([
                    'id_transaksi' => $transaksi3->id_transaksi,
                    'id_kursi' => $kursis->get(2)->id_kursi,
                ]);

                Tiket::create([
                    'id_transaksi' => $transaksi3->id_transaksi,
                    'id_kursi' => $kursis->get(3)->id_kursi,
                ]);

                Tiket::create([
                    'id_transaksi' => $transaksi3->id_transaksi,
                    'id_kursi' => $kursis->get(4)->id_kursi,
                ]);

                // Mark seats as booked
                for ($i = 2; $i < 5; $i++) {
                    KursiJadwal::updateOrCreate(
                        [
                            'id_jadwal' => $transaksi3->id_jadwal,
                            'id_kursi' => $kursis->get($i)->id_kursi,
                        ],
                        ['status' => 'booked']
                    );
                }

                $transactionCount++;
            }
        }

        // Transaction 4: If there's a second user, create a transaction
        if ($users->count() > 1 && $jadwals->count() > 0) {
            $transaksi4 = Transaksi::create([
                'id_user' => $users->get(1)->id_user,
                'id_film' => $jadwals->first()->id_film,
                'id_jadwal' => $jadwals->first()->id_jadwal,
                'jumlah_tiket' => 1,
                'total_harga' => $jadwals->first()->harga,
                'metode' => 'qris',
                'created_at' => Carbon::now()->subHours(2),
                'updated_at' => Carbon::now()->subHours(2),
            ]);

            // Create ticket for this transaction
            if ($kursis->count() >= 4) {
                Tiket::create([
                    'id_transaksi' => $transaksi4->id_transaksi,
                    'id_kursi' => $kursis->get(3)->id_kursi,
                ]);

                // Mark seat as booked
                KursiJadwal::updateOrCreate(
                    [
                        'id_jadwal' => $transaksi4->id_jadwal,
                        'id_kursi' => $kursis->get(3)->id_kursi,
                    ],
                    ['status' => 'booked']
                );

                $transactionCount++;
            }
        }

        $this->command->info("TransaksiSeeder completed! Created {$transactionCount} transactions with tickets.");
    }
}
