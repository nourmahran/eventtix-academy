<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\EventSubscriptionConfirmed;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AccountTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.key' => 'base64:'.base64_encode(random_bytes(32)), 'sanctum.stateful' => ['localhost:4200']]);
        $this->withHeader('Origin', 'http://localhost:4200');
    }

    public function test_registration_stores_a_hashed_password_and_cannot_assign_a_staff_role(): void
    {
        $this->postJson('/api/register', $this->registration())
            ->assertCreated()->assertJsonPath('user.username', 'campus_user')
            ->assertJsonPath('user.role', 'student')->assertJsonMissingPath('user.password');

        $user = User::query()->where('username', 'campus_user')->firstOrFail();
        $this->assertTrue(Hash::check('TestPassword!42', $user->password));
        $this->assertAuthenticatedAs($user);
    }

    public function test_registration_validates_password_confirmation_strength_and_duplicates(): void
    {
        User::factory()->create(['username' => 'campus_user', 'email' => 'campus@example.test']);
        $this->postJson('/api/register', [
            ...$this->registration(), 'password' => 'weak', 'password_confirmation' => 'different',
        ])->assertUnprocessable()->assertJsonValidationErrors(['username', 'email', 'password']);
    }

    public function test_login_accepts_an_existing_users_email_and_logout_ends_the_session(): void
    {
        $user = User::factory()->create(['email' => 'existing@example.test']);
        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'bad-password'])
            ->assertUnauthorized();
        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->assertOk()->assertJsonPath('user.email', $user->email);
        $this->postJson('/api/logout')->assertOk();
        Auth::forgetGuards();
        $this->getJson('/api/user')->assertUnauthorized();
    }

    public function test_profile_is_private_validated_and_can_be_deleted_with_the_current_password(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
        $user = User::factory()->create();
        $this->actingAs($user, 'web')->getJson('/api/user')->assertOk()->assertJsonPath('email', $user->email);

        $this->patchJson('/api/user', [
            'name' => 'Updated Student',
            'email' => 'updated@example.test',
            'role' => 'admin',
            'preferences' => ['theme' => 'light', 'notificationsEnabled' => false, 'soundEnabled' => true],
        ])->assertOk()->assertJsonPath('fullName', 'Updated Student')
            ->assertJsonPath('preferences.theme', 'light')->assertJsonPath('role', 'student');

        $this->patchJson('/api/user', [
            'name' => 'Updated Student', 'email' => 'updated@example.test',
            'profilePictureUrl' => 'data:image/png;base64,SGVsbG8=',
        ])->assertUnprocessable()->assertJsonValidationErrors('profilePictureUrl');

        $this->deleteJson('/api/user', ['password' => 'incorrect'])
            ->assertUnprocessable()->assertJsonValidationErrors('password');
        $this->deleteJson('/api/user', ['password' => 'password'])->assertNoContent();
        $this->assertSoftDeleted($user);
        Auth::forgetGuards();
        $this->getJson('/api/user')->assertUnauthorized();
    }

    public function test_accounting_and_admin_can_look_up_students_but_students_cannot(): void
    {
        $student = User::factory()->create(['username' => 'campus_user']);
        $path = '/api/students/by-username/campus_user';
        $this->actingAs($student, 'web')->getJson($path)->assertForbidden();

        foreach (['admin', 'accounting'] as $role) {
            Auth::forgetGuards();
            $staff = User::factory()->create(['role' => $role, 'username' => 'staff_'.$role]);
            $this->actingAs($staff, 'web')->getJson($path)->assertOk()->assertJsonPath('id', (string) $student->id);
            $this->getJson('/api/students/by-username/'.$staff->username)->assertNotFound();
        }
    }

    public function test_subscription_records_opt_in_and_dispatches_only_one_confirmation(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $path = '/api/user/event-updates-subscription';
        $this->postJson($path)->assertUnauthorized();

        $this->actingAs($user, 'web')->postJson($path)->assertOk()->assertJsonPath('eventUpdatesSubscribed', true);
        $this->postJson($path)->assertOk()->assertJsonPath('eventUpdatesSubscribed', true);
        $this->assertNotNull($user->fresh()->event_updates_subscribed_at);
        Notification::assertSentToTimes($user, EventSubscriptionConfirmed::class, 1);
    }

    public function test_registration_and_login_have_separate_rate_limits(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/register', [])->assertUnprocessable();
        }

        $this->postJson('/api/register', $this->registration())->assertTooManyRequests();

        $user = User::factory()->create();
        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])->assertOk();
    }

    public function test_public_registration_requires_a_stateful_session(): void
    {
        $this->withHeader('Origin', 'https://untrusted.example.test')
            ->postJson('/api/register', $this->registration())
            ->assertStatus(419);
        $this->assertDatabaseMissing('users', ['email' => 'campus@example.test']);
    }

    public function test_api_cors_grants_credentials_only_to_explicit_origins(): void
    {
        config([
            'cors.allowed_origins' => ['https://frontend.example.test', 'https://preview.example.test'],
            'cors.supports_credentials' => true,
        ]);

        $headers = ['Access-Control-Request-Method' => 'PATCH'];
        $this->options('/api/user', [], [...$headers, 'Origin' => 'https://frontend.example.test'])
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'https://frontend.example.test')
            ->assertHeader('Access-Control-Allow-Credentials', 'true');

        $this->options('/api/user', [], [...$headers, 'Origin' => 'https://untrusted.example.test'])
            ->assertNoContent()
            ->assertHeaderMissing('Access-Control-Allow-Origin');
    }

    public function test_role_command_requires_a_supported_role_and_an_active_account(): void
    {
        $user = User::factory()->create();
        $this->artisan('eventtix:set-role', ['email' => $user->email, 'role' => 'owner'])->assertExitCode(1);
        $this->assertSame('student', $user->fresh()->role);
        $this->artisan('eventtix:set-role', ['email' => 'missing@example.test', 'role' => 'admin'])->assertExitCode(1);
        $this->artisan('eventtix:set-role', ['email' => strtoupper($user->email), 'role' => 'accounting'])->assertExitCode(0);
        $this->assertSame('accounting', $user->fresh()->role);
    }

    private function registration(): array
    {
        return [
            'name' => 'Campus User',
            'username' => 'CAMPUS_USER',
            'email' => 'CAMPUS@EXAMPLE.TEST',
            'password' => 'TestPassword!42',
            'password_confirmation' => 'TestPassword!42',
            'role' => 'admin',
        ];
    }
}
