<?php

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AccountProfileRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => Str::lower(trim($this->input('email')))]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($this->user())],
            'preferences' => ['sometimes', 'array:theme,notificationsEnabled,soundEnabled', 'required_array_keys:theme,notificationsEnabled,soundEnabled'],
            'preferences.theme' => ['sometimes', Rule::in(['dark', 'light'])],
            'preferences.notificationsEnabled' => ['sometimes', 'boolean:strict'],
            'preferences.soundEnabled' => ['sometimes', 'boolean:strict'],
            'paymentMethodLabel' => ['nullable', Rule::in(['Demo Visa •••• 4242', 'Demo Mastercard •••• 4444'])],
            'profilePictureUrl' => ['bail', 'nullable', 'string', 'max:180000', function (string $attribute, string $value, Closure $fail): void {
                if (! preg_match('/\Adata:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+\/=]+)\z/', $value, $matches)) {
                    $fail('Choose a valid PNG, JPEG or WebP picture.');

                    return;
                }

                $bytes = base64_decode($matches[2], true);
                $image = $bytes === false ? false : @getimagesizefromstring($bytes);
                if ($image === false || $image['mime'] !== $matches[1] || $image[0] > 4096 || $image[1] > 4096) {
                    $fail('Choose a valid PNG, JPEG or WebP picture no larger than 4096 pixels per side.');
                }
            }],
        ];
    }

    public function profileAttributes(): array
    {
        $attributes = $this->safe()->only(['name', 'email', 'preferences']);
        foreach (['profilePictureUrl' => 'profile_picture', 'paymentMethodLabel' => 'sample_card'] as $input => $column) {
            if (array_key_exists($input, $this->validated())) {
                $attributes[$column] = $this->validated($input);
            }
        }

        return $attributes;
    }
}
