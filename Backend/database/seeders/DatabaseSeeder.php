<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed a basic user matching your schema
        User::query()->create([
            'nama' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        // Seed film (2), studio (1), jadwal (3), kursi (5)
        $this->call([
            FilmSeeder::class,
            StudioSeeder::class,
            JadwalSeeder::class,
            KursiSeeder::class,
            KursiJadwalSeeder::class,
            KursiJadwalBookedSeeder::class,
        ]);
    }
}
