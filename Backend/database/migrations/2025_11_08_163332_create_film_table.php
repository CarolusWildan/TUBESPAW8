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
        Schema::create('film', function (Blueprint $table) {
            $table->id('id_film');
            $table->string('judul');
            $table->string('genre');
            $table->time('durasi_film');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status',['Akan Tayang', 'Lagi Tayang', 'Selesai Tayang']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('film');
    }
};