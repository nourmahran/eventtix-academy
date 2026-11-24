<?php

namespace App\Http\Requests;

use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterAccountRequest extends AccountProfileRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        if (is_string($this->input('username'))) {
            $this->merge(['username' => Str::lower(trim($this->input('username')))]);
        }
    }

    public function rules(): array
    {
        return [
            ...parent::rules(),
            'email' => ['required', 'email', 'max:255', Rule::unique('users')],
            'username' => ['nullable', 'string', 'regex:/\A[a-z0-9_]{3,30}\z/', Rule::unique('users')],
            'password' => ['required', 'string', 'confirmed', 'max:72', function (string $attribute, string $value, \Closure $fail): void {
                if (strlen($value) > 72) {
                    $fail('The password must be at most 72 bytes.');
                }
            }, Password::min(8)->mixedCase()->numbers()->symbols()],
        ];
    }
}
