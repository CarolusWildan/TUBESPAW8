<?php

use App\Http\Controllers\JadwalController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FilmController;
use App\Http\Controllers\StudioController;
use App\Http\Controllers\TransaksiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

// Film dapat dilihat oleh publik
Route::get('/films', [FilmController::class, 'index']);
Route::get('/films/{id}', [FilmController::class, 'show']);

// JADWAL DAPAT DILIHAT OLEH PUBLIK
Route::get('/jadwal', [JadwalController::class, 'index']);

// Jadwal detail juga harus diakses tanpa auth jika Anda menggunakan route ini 
Route::get('/jadwal/{id}', [JadwalController::class, 'show']);


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

    // --- REPORT ROUTES (Admin Only) ---
    Route::get('/sales-report', [TransaksiController::class, 'getSalesReport']);
    Route::get('/sales-by-movie', [TransaksiController::class, 'getSalesByMovie']);
    Route::get('/all-transactions', [TransaksiController::class, 'getAllTransactions']);
    Route::get('/today-sales', [TransaksiController::class, 'getTodaySales']);
    
    // --- Admin: Film Management ---
    Route::post('/films/create', [FilmController::class, 'create']);
    Route::put('/films/update/{id}', [FilmController::class, 'update']);
    Route::delete('/films/delete/{id}', [FilmController::class, 'delete']);

    // --- Admin: Studio Management ---
    // Studio management tidak perlu endpoint show/index di sini, tapi di rute admin
    Route::get('/studio', [StudioController::class, 'index']); 
    Route::post('/studio/create', [StudioController::class, 'create']);
    Route::post('/studio/update/{id}', [StudioController::class, 'update']);
    Route::delete('/studio/delete/{id}', [StudioController::class, 'delete']);
    
    // --- Admin: Jadwal Management ---
    Route::post('/jadwal/create', [JadwalController::class, 'create']);
    Route::post('/jadwal/update/{id}', [JadwalController::class, 'update']);
    Route::delete('/jadwal/delete/{id}', [JadwalController::class, 'delete']);
});