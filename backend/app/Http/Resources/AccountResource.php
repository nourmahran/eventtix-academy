<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->getKey(),
            'username' => $this->username ?? '',
            'fullName' => $this->name,
            'name' => $this->name,
            'email' => $this->email,
            'eventUpdatesSubscribed' => $this->event_updates_subscribed_at !== null,
            'role' => $this->role,
            'preferences' => $this->preferences ?? [
                'theme' => 'dark',
                'notificationsEnabled' => true,
                'soundEnabled' => false,
            ],
            'profilePictureUrl' => $this->profile_picture,
            'paymentMethodLabel' => $this->sample_card,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
