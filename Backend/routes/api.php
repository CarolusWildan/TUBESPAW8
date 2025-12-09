<?php

use App\Http\Controllers\JadwalController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FilmController;
use App\Http\Controllers\StudioController;
use App\Http\Controllers\TransaksiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// =========================================================
// 1. PUBLIC ROUTES (No Authentication Required)
// =========================================================

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

// Film dapat dilihat oleh publik
Route::get('/films', [FilmController::class, 'index']);
Route::get('/films/{id}', [FilmController::class, 'show']);

// JADWAL DAPAT DILIHAT OLEH PUBLIK (PENTING UNTUK FRONTEND)
// Memungkinkan PilihJadwalPage.jsx mengambil data.
Route::get('/jadwal', [JadwalController::class, 'index']);

// Jadwal detail juga harus diakses tanpa auth jika Anda menggunakan route ini 
// untuk mengambil detail studio/kursi sebelum booking.
Route::get('/jadwal/{id}', [JadwalController::class, 'show']);


// =========================================================
// 2. PROTECTED ROUTES (Requires 'auth:api' Token)
// =========================================================

Route::middleware('auth:api')->group(function () {
    
    // --- User Management ---
    Route::get('/user', [UserController::class, 'index']);
    Route::post('/user/update/{id}', [UserController::class, 'update']);
    Route::delete('/user/delete/{id}', [UserController::class, 'delete']);
    
    // --- Transaksi (Booking) ---
    // Transaksi harus menggunakan otorisasi karena melibatkan data user.
    Route::post('/beli-tiket', [TransaksiController::class, 'beliTiket']);
    Route::post('/transaksi', [TransaksiController::class, 'beliTiket']);
    Route::get('/transaksi', [TransaksiController::class, 'index']);
    
    // --- Admin: Film Management ---
    Route::post('/films/create', [FilmController::class, 'create']);
    Route::put('/films/update/{id}', [FilmController::class, 'update']);
    Route::delete('/films/delete/{id}', [FilmController::class, 'delete']);

    // --- Admin: Studio Management ---
    // Studio management tidak perlu endpoint show/index di sini, tapi di rute admin
    Route::get('/studio', [StudioController::class, 'index']); // Dipertahankan di sini jika Admin mengaksesnya
    Route::post('/studio/create', [StudioController::class, 'create']);
    Route::post('/studio/update/{id}', [StudioController::class, 'update']);
    Route::delete('/studio/delete/{id}', [StudioController::class, 'delete']);
    
    // --- Admin: Jadwal Management ---
    // Route CRUD Jadwal tetap memerlukan otorisasi (hanya admin yang boleh mengubah)
    Route::post('/jadwal/create', [JadwalController::class, 'create']);
    Route::post('/jadwal/update/{id}', [JadwalController::class, 'update']);
    Route::delete('/jadwal/delete/{id}', [JadwalController::class, 'delete']);
});