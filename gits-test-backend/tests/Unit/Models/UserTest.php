<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('user has fillable attributes', function () {
    $user = new User();
    expect($user->getFillable())->toContain('name', 'email', 'password');
});

test('user can be created', function () {
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => Hash::make('password123'),
    ]);

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->id)->toBeInt();
});

test('user password is hashed', function () {
    $password = 'password123';
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test2@example.com',
        'password' => Hash::make($password),
    ]);

    expect(Hash::check($password, $user->password))->toBeTrue();
    expect($user->password)->not->toBe($password);
});

test('user implements JWTSubject', function () {
    expect($this->user)->toBeInstanceOf(\Tymon\JWTAuth\Contracts\JWTSubject::class);
});

test('user has JWT identifier', function () {
    expect($this->user->getJWTIdentifier())->toBe($this->user->getKey());
});

test('user has JWT custom claims', function () {
    expect($this->user->getJWTCustomClaims())->toBeArray();
});

test('user can be updated', function () {
    $this->user->update([
        'name' => 'Updated User',
    ]);

    $this->user->refresh();

    expect($this->user->name)->toBe('Updated User');
});

