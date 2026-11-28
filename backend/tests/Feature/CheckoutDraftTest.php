<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutDraftTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.key' => 'base64:'.base64_encode(random_bytes(32)), 'sanctum.stateful' => ['localhost:4200']]);
        $this->withHeader('Origin', 'http://localhost:4200');
    }

    private function draft(array $overrides = []): array
    {
        return [...['eventId' => 3, 'seats' => ['A1', 'B2'], 'studentDiscount' => true], ...$overrides];
    }

    public function test_guests_cannot_use_the_checkout_draft(): void
    {
        $this->getJson('/api/checkout-draft')->assertUnauthorized();
        $this->postJson('/api/checkout-draft', $this->draft())->assertUnauthorized();
        $this->patchJson('/api/checkout-draft', ['seats' => ['A1']])->assertUnauthorized();
        $this->deleteJson('/api/checkout-draft')->assertUnauthorized();
    }

    public function test_a_draft_is_created_in_the_session_and_can_be_retrieved(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'web');

        $this->postJson('/api/checkout-draft', $this->draft())
            ->assertCreated()
            ->assertJsonStructure(['message', 'draft' => ['eventId', 'seats', 'studentDiscount', 'expiresAt']])
            ->assertJsonPath('draft.eventId', 3)
            ->assertJsonPath('draft.seats', ['A1', 'B2'])
            ->assertJsonPath('draft.studentDiscount', true)
            ->assertJsonMissingPath('draft.userId')
            ->assertSessionHas('checkout_draft');

        $this->getJson('/api/checkout-draft')
            ->assertOk()
            ->assertJsonPath('eventId', 3)
            ->assertJsonPath('seats', ['A1', 'B2']);
    }

    public function test_invalid_drafts_are_rejected_and_nothing_is_stored(): void
    {
        $this->actingAs(User::factory()->create(), 'web');

        $this->postJson('/api/checkout-draft', $this->draft(['eventId' => null]))
            ->assertUnprocessable()->assertJsonValidationErrors(['eventId']);
        $this->postJson('/api/checkout-draft', $this->draft(['seats' => []]))
            ->assertUnprocessable()->assertJsonValidationErrors(['seats']);
        $this->postJson('/api/checkout-draft', $this->draft(['seats' => ['Z9']]))
            ->assertUnprocessable()->assertJsonValidationErrors(['seats.0']);
        $this->postJson('/api/checkout-draft', $this->draft(['seats' => ['A1', 'A1']]))
            ->assertUnprocessable();
        $this->postJson('/api/checkout-draft', $this->draft(['studentDiscount' => 'yes']))
            ->assertUnprocessable()->assertJsonValidationErrors(['studentDiscount'])
            ->assertSessionMissing('checkout_draft');
    }

    public function test_the_student_discount_is_granted_by_the_server_only_to_students(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'web');

        $this->postJson('/api/checkout-draft', $this->draft(['studentDiscount' => true]))
            ->assertCreated()->assertJsonPath('draft.studentDiscount', false);
    }

    public function test_a_draft_can_be_updated_and_its_event_cannot_be_changed(): void
    {
        $this->actingAs(User::factory()->create(), 'web');

        $this->patchJson('/api/checkout-draft', ['seats' => ['C3']])->assertNotFound();

        $this->postJson('/api/checkout-draft', $this->draft())->assertCreated();
        $this->patchJson('/api/checkout-draft', ['seats' => ['C3', 'C4'], 'studentDiscount' => false])
            ->assertOk()
            ->assertJsonPath('draft.seats', ['C3', 'C4'])
            ->assertJsonPath('draft.studentDiscount', false)
            ->assertJsonPath('draft.eventId', 3);
        $this->patchJson('/api/checkout-draft', ['eventId' => 9])
            ->assertUnprocessable()->assertJsonValidationErrors(['eventId']);
    }

    public function test_a_draft_expires_after_fifteen_minutes_and_is_removed(): void
    {
        $this->actingAs(User::factory()->create(), 'web');
        $this->postJson('/api/checkout-draft', $this->draft())->assertCreated();

        $this->travel(14)->minutes();
        $this->getJson('/api/checkout-draft')->assertOk();

        $this->travel(2)->minutes();
        $this->getJson('/api/checkout-draft')->assertNotFound()->assertSessionMissing('checkout_draft');
    }

    public function test_a_draft_can_be_cleared(): void
    {
        $this->actingAs(User::factory()->create(), 'web');
        $this->postJson('/api/checkout-draft', $this->draft())->assertCreated();

        $this->deleteJson('/api/checkout-draft')->assertNoContent()->assertSessionMissing('checkout_draft');
        $this->getJson('/api/checkout-draft')->assertNotFound();
    }

    public function test_a_draft_belonging_to_another_account_is_ignored_and_removed(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $draft = ['userId' => $owner->id, 'eventId' => 3, 'seats' => ['A1'], 'studentDiscount' => false,
            'expiresAt' => now()->addMinutes(10)->toIso8601String()];

        $this->actingAs($other, 'web')->withSession(['checkout_draft' => $draft])
            ->getJson('/api/checkout-draft')->assertNotFound()->assertSessionMissing('checkout_draft');
    }

    public function test_signing_out_clears_the_draft(): void
    {
        $this->actingAs(User::factory()->create(), 'web');
        $this->postJson('/api/checkout-draft', $this->draft())
            ->assertCreated()->assertSessionHas('checkout_draft');

        $this->postJson('/api/logout')->assertOk()->assertSessionMissing('checkout_draft');
    }
}