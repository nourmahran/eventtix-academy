<?php

namespace App\Http;

use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Cookie as ResponseCookie;

final class AppearanceCookie
{
    public const NAME = 'eventtix_theme';

    public static function make(string $theme): ResponseCookie
    {
        return Cookie::make(
            name: self::NAME,
            value: $theme === 'light' ? 'light' : 'dark',
            minutes: 525600,
            path: '/',
            domain: null,
            secure: config('session.secure'),
            httpOnly: false,
            sameSite: 'lax',
        );
    }
}
