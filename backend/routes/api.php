<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CheckoutDraftController;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:eventtix-register');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:eventtix-login');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'show']);
    Route::patch('/user', [AuthController::class, 'update']);
    Route::delete('/user', [AuthController::class, 'destroy'])->middleware('throttle:5,1');
    Route::post('/user/event-updates-subscription', [AuthController::class, 'subscribe'])->middleware('throttle:5,1');
    Route::get('/students/by-username/{username}', [AuthController::class, 'lookupStudent'])
        ->where('username', '[A-Za-z0-9_]{3,30}')
        ->middleware('throttle:30,1');
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::middleware(['auth:sanctum', 'throttle:60,1'])
    ->prefix('checkout-draft')
    ->controller(CheckoutDraftController::class)
    ->group(function () {
        Route::get('/', 'show');
        Route::post('/', 'store');
        Route::patch('/', 'update');
        Route::delete('/', 'destroy');
    });