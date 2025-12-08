<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal', function (Blueprint $table) {
            $table->id('id_jadwal');
            $table->unsignedBigInteger('id_film');
            $table->unsignedBigInteger('id_studio');
            $table->date('tanggal_tayang');
            $table->time('jam_tayang');
            $table->timestamps();

            $table->foreign('id_film')
                ->references('id_film')
                ->on('film')
                ->onDelete('cascade');

            $table->foreign('id_studio')
                ->references('id_studio')
                ->on('studio')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal');
    }
};
