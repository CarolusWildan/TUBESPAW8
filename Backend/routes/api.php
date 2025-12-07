<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\FilmController;
use App\Http\Controllers\StudioController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::get('/user', [UserController::class, 'index']);
    Route::post('/user/update/{id}', [UserController::class, 'update']);
    Route::delete('/user/delete/{id}', [UserController::class, 'delete']);
    Route::post('/beli-tiket', [TransaksiController::class, 'beliTiket']);


    Route::get('/films', [FilmController::class, 'index']);
    Route::post('/films/create', [FilmController::class, 'create']);
    Route::post('/films/update/{id}', [FilmController::class, 'update']);
    Route::delete('/films/delete/{id}', [FilmController::class, 'delete']);

    Route::get('/studio', [StudioController::class, 'index']);
    Route::post('/studio/create', [StudioController::class, 'create']);
    Route::post('/studio/update/{id}', [StudioController::class, 'update']);
    Route::delete('/studio/delete/{id}', [StudioController::class, 'delete']);
});
