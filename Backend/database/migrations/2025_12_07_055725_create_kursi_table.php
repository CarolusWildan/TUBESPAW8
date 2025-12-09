<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kursi', function (Blueprint $table) {
            $table->id('id_kursi');
            $table->unsignedBigInteger('id_studio');
            $table->string('kode_kursi'); // contoh: A1, B2, C7
            // $table->enum('status', ['tersedia', 'terpesan'])->default('tersedia');
            $table->timestamps();

            $table->foreign('id_studio')
                ->references('id_studio')
                ->on('studio')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kursi');
    }
};
