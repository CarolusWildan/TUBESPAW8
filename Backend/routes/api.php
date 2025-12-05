<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\FilmController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::get('/user', [UserController::class, 'index']);
    Route::post('/user/update/{id}', [UserController::class, 'update']);
    Route::delete('/user/delete/{id}', [UserController::class, 'delete']);

    Route::get('/films', [FilmController::class, 'index']);
    Route::post('/films/create', [FilmController::class, 'create']);
    Route::post('/films/update/{id}', [FilmController::class, 'update']);
    Route::delete('/films/delete/{id}', [FilmController::class, 'delete']);
});
