<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\FilmViewController;
use App\Http\Controllers\UserViewController;

Route::get('/', function () {
    return view('welcome');
});

Route::resource('users', UserViewController::class);
Route::resource('films', FilmViewController::class);