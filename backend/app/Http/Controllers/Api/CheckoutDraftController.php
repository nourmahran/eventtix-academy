<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutDraftRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;

/**
 * A temporary checkout draft kept in the Laravel server-side session.
 *
 * It holds only the event, the chosen seats and the discount flag. Prices and
 * payment details are never stored here: the booking step recalculates prices
 * on the server, and payment details are not collected at all.
 */
class CheckoutDraftController extends Controller
{
    private const SESSION_KEY = 'checkout_draft';

    private const TTL_MINUTES = 15;

    public function show(Request $request): JsonResponse
    {
        $draft = $this->current($request);

        return $draft === null ? $this->missing() : response()->json($this->present($draft));
    }

    public function store(CheckoutDraftRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $draft = [
            'userId' => (int) $request->user()->id,
            'eventId' => (int) $validated['eventId'],
            'seats' => array_values($validated['seats']),
            'studentDiscount' => $validated['studentDiscount'] && $request->user()->isStudent(),
            'expiresAt' => $this->newExpiry(),
        ];
        $request->session()->put(self::SESSION_KEY, $draft);

        return response()->json([
            'message' => 'Your seats are held for '.self::TTL_MINUTES.' minutes.',
            'draft' => $this->present($draft),
        ], 201);
    }

    public function update(CheckoutDraftRequest $request): JsonResponse
    {
        $draft = $this->current($request);
        if ($draft === null) {
            return $this->missing();
        }

        $validated = $request->validated();
        if (array_key_exists('seats', $validated)) {
            $draft['seats'] = array_values($validated['seats']);
        }
        if (array_key_exists('studentDiscount', $validated)) {
            $draft['studentDiscount'] = $validated['studentDiscount'] && $request->user()->isStudent();
        }
        $draft['expiresAt'] = $this->newExpiry();
        $request->session()->put(self::SESSION_KEY, $draft);

        return response()->json([
            'message' => 'Checkout draft updated.',
            'draft' => $this->present($draft),
        ]);
    }

    public function destroy(Request $request): Response
    {
        $request->session()->forget(self::SESSION_KEY);

        return response()->noContent();
    }

    /** Returns the caller's unexpired draft, and removes a stale or foreign one. */
    private function current(Request $request): ?array
    {
        $draft = $request->session()->get(self::SESSION_KEY);
        if (! is_array($draft)) {
            return null;
        }

        $owned = ($draft['userId'] ?? null) === (int) $request->user()->id;
        $expired = ! isset($draft['expiresAt']) || now()->greaterThanOrEqualTo(Carbon::parse($draft['expiresAt']));
        if (! $owned || $expired) {
            $request->session()->forget(self::SESSION_KEY);

            return null;
        }

        return $draft;
    }

    private function newExpiry(): string
    {
        return now()->addMinutes(self::TTL_MINUTES)->toIso8601String();
    }

    private function missing(): JsonResponse
    {
        return response()->json(['message' => 'There is no active checkout draft. It may have expired.'], 404);
    }

    private function present(array $draft): array
    {
        return [
            'eventId' => $draft['eventId'],
            'seats' => $draft['seats'],
            'studentDiscount' => $draft['studentDiscount'],
            'expiresAt' => $draft['expiresAt'],
        ];
    }
}