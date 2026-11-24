<?php

use App\Http\AppearanceCookie;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/api/appearance', function (Request $request): JsonResponse {
    $theme = $request->cookie(AppearanceCookie::NAME);
    $response = response()->json([
        'theme' => $theme === 'light' ? 'light' : 'dark',
    ])->header('Cache-Control', 'private, no-store');

    if (! in_array($theme, ['dark', 'light'], true)) {
        $response->withCookie(AppearanceCookie::make('dark'));
    }

    return $response;
});
