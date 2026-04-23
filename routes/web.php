<?php

use App\Http\Controllers\RealtimeController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('jeysenn');
});

Route::get('/realtime/changes', [RealtimeController::class, 'stream']);
