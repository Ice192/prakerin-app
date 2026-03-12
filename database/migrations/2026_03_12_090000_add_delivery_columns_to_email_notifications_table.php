<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('email_notifications', function (Blueprint $table): void {
            $table->string('notification_type')->default('general')->after('user_id');
            $table->timestamp('sent_at')->nullable()->after('sent_status');
            $table->text('error_message')->nullable()->after('sent_at');
            $table->index('notification_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('email_notifications', function (Blueprint $table): void {
            $table->dropIndex(['notification_type']);
            $table->dropColumn(['notification_type', 'sent_at', 'error_message']);
        });
    }
};
