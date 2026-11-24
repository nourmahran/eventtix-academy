<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AccountProfileRequest;
use App\Http\Requests\RegisterAccountRequest;
use App\Http\Resources\AccountResource;
use App\Models\User;
use App\Notifications\EventSubscriptionConfirmed;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterAccountRequest $request): JsonResponse
    {
        abort_unless($request->hasSession(), 419);

        try {
            $user = User::create([
                ...$request->profileAttributes(),
                ...$request->safe()->only(['username', 'password']),
            ]);
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['email' => 'That email or username is already registered.']);
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Registration successful.',
            'user' => AccountResource::make($user->refresh()),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        abort_unless($request->hasSession(), 419);
        $validated = $request->validate([
            'login' => ['required_without:email', 'string', 'max:255'],
            'email' => ['required_without:login', 'email', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ]);
        $identifier = Str::lower(trim($validated['login'] ?? $validated['email']));
        $field = str_contains($identifier, '@') ? 'email' : 'username';

        if (! Auth::guard('web')->attempt([$field => $identifier, 'password' => $validated['password']])) {
            return response()->json(['message' => 'Incorrect username, email or password.'], 401);
        }

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Login successful.',
            'user' => AccountResource::make(Auth::guard('web')->user()),
        ]);
    }

    public function show(Request $request): JsonResponse
    {
        return response()->json(AccountResource::make($request->user()));
    }

    public function update(AccountProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->fill($request->profileAttributes());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
            $user->event_updates_subscribed_at = null;
        }

        try {
            $user->save();
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['email' => 'That email is already registered.']);
        }

        return response()->json(AccountResource::make($user));
    }

    public function destroy(Request $request): Response
    {
        $request->validate(['password' => ['required', 'current_password:web']]);
        $user = $request->user();

        DB::transaction(function () use ($user): void {
            if (config('session.driver') === 'database') {
                DB::connection(config('session.connection'))->table(config('session.table'))->where('user_id', $user->id)->delete();
            }
            $user->delete();
        });
        $this->endSession($request);

        return response()->noContent();
    }

    public function lookupStudent(string $username): JsonResponse
    {
        Gate::authorize('lookup-student-accounts');
        $user = User::query()->where('role', 'student')->where('username', Str::lower($username))->firstOrFail();

        return response()->json(['id' => (string) $user->getKey()]);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request): User {
            $user = User::query()->lockForUpdate()->findOrFail($request->user()->getKey());
            if ($user->event_updates_subscribed_at === null) {
                $user->event_updates_subscribed_at = now();
                $user->save();
                $user->notify(new EventSubscriptionConfirmed($user->email));
            }

            return $user;
        });

        return response()->json(AccountResource::make($user));
    }

    public function logout(Request $request): JsonResponse
    {
        $this->endSession($request);

        return response()->json(['message' => 'Logout successful.']);
    }

    private function endSession(Request $request): void
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}
