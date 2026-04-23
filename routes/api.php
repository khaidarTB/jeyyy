<?php

use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\PlaylistController;
use Illuminate\Support\Facades\Route;

Route::apiResource('messages', MessageController::class);
Route::apiResource('galleries', GalleryController::class);
Route::apiResource('playlists', PlaylistController::class);
