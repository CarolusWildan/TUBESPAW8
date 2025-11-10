<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserViewController;

Route::get('/', function () {
    return view('dashboard');
});

Route::get('/user', [UserViewController::class, 'index']);