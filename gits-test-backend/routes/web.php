<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/login', function () {
    return response()->json([
        'message' => 'This is an API endpoint. Use POST /api/login to authenticate.',
        'endpoint' => '/api/login',
        'method' => 'POST',
        'body' => [
            'email' => 'string',
            'password' => 'string'
        ]
    ], 401);
})->name('login');

Route::get('/register', function () {
    return response()->json([
        'message' => 'This is an API endpoint. Use POST /api/register to create an account.',
        'endpoint' => '/api/register',
        'method' => 'POST',
        'body' => [
            'name' => 'string',
            'email' => 'string',
            'password' => 'string (min: 6)'
        ]
    ], 200);
})->name('register');
