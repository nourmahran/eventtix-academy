<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('eventtix-register', fn (Request $request): Limit => Limit::perMinute(5)->by($request->ip()));
        RateLimiter::for('eventtix-login', fn (Request $request): Limit => Limit::perMinute(5)->by($request->ip()));

        Gate::define('manage-events', fn (User $user): bool => $user->isAdmin());
        Gate::define('manage-finance', fn (User $user): bool => $user->isAdmin() || $user->isAccounting());
        Gate::define('lookup-student-accounts', fn (User $user): bool => $user->can('manage-finance'));
    }
}
