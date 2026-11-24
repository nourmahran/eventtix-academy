<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 30)->nullable()->unique();
            $table->json('preferences')->nullable();
            $table->mediumText('profile_picture')->nullable();
            $table->string('sample_card', 64)->nullable();
            $table->timestamp('event_updates_subscribed_at')->nullable();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['username']);
            $table->dropColumn(['username', 'preferences', 'profile_picture', 'sample_card', 'event_updates_subscribed_at', 'deleted_at']);
        });
    }
};
