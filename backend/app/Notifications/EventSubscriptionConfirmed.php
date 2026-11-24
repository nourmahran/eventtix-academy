<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventSubscriptionConfirmed extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly string $subscribedEmail)
    {
        $this->afterCommit();
    }

    public function via(User $notifiable): array
    {
        return ['mail'];
    }

    public function shouldSend(User $notifiable, string $channel): bool
    {
        return ! $notifiable->trashed()
            && $notifiable->event_updates_subscribed_at !== null
            && $notifiable->email === $this->subscribedEmail;
    }

    public function toMail(User $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('EventTix event updates subscription confirmed')
            ->line('Your subscription to EventTix academy event announcements is confirmed.');
    }
}
