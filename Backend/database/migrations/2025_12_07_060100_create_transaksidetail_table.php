<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaksidetail', function (Blueprint $table) {
            $table->id('id_transaksi_detail');

            $table->unsignedBigInteger('id_transaksi');
            $table->unsignedBigInteger('id_tiket');

            $table->timestamps();

            $table->foreign('id_transaksi')
                ->references('id_transaksi')
                ->on('transaksi')
                ->onDelete('cascade');

            $table->foreign('id_tiket')
                ->references('id_tiket')
                ->on('tiket')
                ->onDelete('cascade');

            $table->unique(['id_transaksi', 'id_tiket']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksidetail');
    }
};
