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

    Route::get('/film', [FilmController::class, 'index']);
    Route::post('/film/create', [FilmController::class, 'create']);
    Route::post('/film/update/{id}', [FilmController::class, 'update']);
    Route::delete('/film/delete/{id}', [FilmController::class, 'delete']);
});
