<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kursi_jadwal', function (Blueprint $table) {
            $table->id('id_kursi_jadwal');
            $table->unsignedBigInteger('id_jadwal');
            $table->unsignedBigInteger('id_kursi');
            $table->enum('status', ['available', 'booked'])->default('available');
            $table->timestamps();

            $table->foreign('id_jadwal')
                ->references('id_jadwal')
                ->on('jadwal')
                ->onDelete('cascade');

            $table->foreign('id_kursi')
                ->references('id_kursi')
                ->on('kursi')
                ->onDelete('cascade');

            $table->unique(['id_jadwal', 'id_kursi']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kursi_jadwal');
    }
};
