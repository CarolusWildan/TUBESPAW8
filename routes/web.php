<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserViewController;
use App\Http\Controllers\FilmViewController;

Route::get('/', function () {
    return view('welcome');
});

Route::resource('users', UserViewController::class);
Route::resource('films', FilmViewController::class);