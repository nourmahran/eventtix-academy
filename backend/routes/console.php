<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('eventtix:set-role {email} {role}', function (): int {
    $role = $this->argument('role');
    if (! in_array($role, ['admin', 'accounting', 'student'], true)) {
        $this->error('Choose admin, accounting, or student.');

        return 1;
    }

    $user = User::query()->where('email', strtolower(trim($this->argument('email'))))->first();
    if ($user === null) {
        $this->error('No active account matches that email.');

        return 1;
    }

    $user->role = $role;
    $user->save();
    $this->info('Account role updated.');

    return 0;
})->purpose('Assign an EventTix account role from the server console');
