<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\PublisherController;
use Illuminate\Support\Facades\Route;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
});

Route::middleware('auth:api')->group(function () {
    Route::apiResource('authors', AuthorController::class);
    Route::apiResource('publishers', PublisherController::class);
    Route::apiResource('books', BookController::class);
});

Route::get('/ping', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'API is reachable 🚀',
    ]);
});
