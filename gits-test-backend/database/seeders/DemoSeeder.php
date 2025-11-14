<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\Book;
use App\Models\Publisher;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $authors = Author::factory()->count(8)->create();
        $publishers = Publisher::factory()->count(6)->create();

        foreach ($authors as $author) {
            Book::factory()->count(2)->create([
                'author_id' => $author->id,
                'publisher_id' => $publishers->random()->id,
            ]);
        }
    }
}
