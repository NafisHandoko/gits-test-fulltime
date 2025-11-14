<?php

use App\Models\User;
use App\Models\Publisher;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->token = auth('api')->login($this->user);
});

test('unauthenticated user cannot access publishers', function () {
    // Clear any authentication state
    auth('api')->logout();
    
    // Make request without authentication header
    $response = $this->withoutHeader('Authorization')
        ->getJson('/api/publishers');

    $response->assertStatus(401);
});

test('authenticated user can list publishers', function () {
    Publisher::factory()->count(3)->create();

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->getJson('/api/publishers');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'address'],
            ],
            'current_page',
            'total',
        ]);

    expect($response->json('data'))->toHaveCount(3);
});

test('authenticated user can filter publishers by name', function () {
    Publisher::factory()->create(['name' => 'Publisher One']);
    Publisher::factory()->create(['name' => 'Publisher Two']);
    Publisher::factory()->create(['name' => 'Another Publisher']);

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->getJson('/api/publishers?search=Publisher');

    $response->assertStatus(200);
    expect($response->json('data'))->toHaveCount(3);
});

test('authenticated user can create publisher', function () {
    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->postJson('/api/publishers', [
            'name' => 'New Publisher',
            'address' => 'Publisher Address',
        ]);

    $response->assertStatus(201)
        ->assertJson([
            'name' => 'New Publisher',
            'address' => 'Publisher Address',
        ]);

    $this->assertDatabaseHas('publishers', [
        'name' => 'New Publisher',
        'address' => 'Publisher Address',
    ]);
});

test('creating publisher requires name', function () {
    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->postJson('/api/publishers', [
            'address' => 'Publisher Address',
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name']);
});

test('authenticated user can get publisher by id', function () {
    $publisher = Publisher::factory()->create();

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->getJson("/api/publishers/{$publisher->id}");

    $response->assertStatus(200)
        ->assertJson([
            'id' => $publisher->id,
            'name' => $publisher->name,
            'address' => $publisher->address,
        ]);
});

test('authenticated user can update publisher', function () {
    $publisher = Publisher::factory()->create(['name' => 'Old Name']);

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->putJson("/api/publishers/{$publisher->id}", [
            'name' => 'Updated Name',
            'address' => 'Updated Address',
        ]);

    $response->assertStatus(200)
        ->assertJson([
            'name' => 'Updated Name',
            'address' => 'Updated Address',
        ]);

    $this->assertDatabaseHas('publishers', [
        'id' => $publisher->id,
        'name' => 'Updated Name',
        'address' => 'Updated Address',
    ]);
});

test('authenticated user can delete publisher', function () {
    $publisher = Publisher::factory()->create();

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->deleteJson("/api/publishers/{$publisher->id}");

    $response->assertStatus(200)
        ->assertJson(['message' => 'Publisher deleted']);

    $this->assertDatabaseMissing('publishers', ['id' => $publisher->id]);
});

