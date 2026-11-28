<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutDraftRequest extends FormRequest
{
    public function rules(): array
    {
        $creating = ! $this->isMethod('PATCH');
        $presence = $creating ? 'required' : 'sometimes';

        return [
            // The event is fixed when the draft is created; start a new draft to change it.
            'eventId' => $creating ? ['required', 'integer', 'min:1'] : ['prohibited'],
            'seats' => [$presence, 'array', 'min:1', 'max:10'],
            'seats.*' => ['required', 'string', 'distinct', 'regex:/\A[A-E][1-8]\z/'],
            'studentDiscount' => [$presence, 'boolean:strict'],
        ];
    }
}