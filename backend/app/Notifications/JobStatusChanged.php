<?php

namespace App\Notifications;

use App\Models\Job;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class JobStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public $job;
    public $timeline;

    public function __construct(Job $job, $timeline)
    {
        $this->job = $job;
        $this->timeline = $timeline;
    }

    // 1. Define the channels: Database (Notification Center), Broadcast (Toasts), Mail (Important events)
    public function via(object $notifiable): array
    {
        $channels = ['database', 'broadcast'];
        
        // Only send an email if the status is strictly Completed or Closed
        if (in_array($this->job->status, ['Completed', 'Closed'])) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    // 2. Format the Email
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Job Status Update: ' . $this->job->title)
                    ->greeting('Hello ' . $notifiable->name . ',')
                    ->line('The job status has been updated to: ' . $this->job->status)
                    ->line($this->timeline->description)
                    ->action('View Job', url('/jobs/' . $this->job->id)); 
    }

    // 3. Format the Database Array (For the Notification Page / Bell Icon)
    public function toArray(object $notifiable): array
    {
        return [
            'job_id' => $this->job->id,
            'title' => $this->job->title,
            'status' => $this->job->status,
            'message' => $this->timeline->description,
        ];
    }

    // 4. Format the Real-time WebSocket Broadcast (For the Toast popups)
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'job_id' => $this->job->id,
            'title' => $this->job->title,
            'status' => $this->job->status,
            'message' => $this->timeline->description,
        ]);
    }
}