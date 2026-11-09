<?php

declare(strict_types=1);

namespace App\Dto\Auth;

use Symfony\Component\Validator\Constraints as Assert;

final readonly class AcceptMemberInvitationRequestDto
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Length(max: 100)]
        public string $token,

        #[Assert\NotBlank]
        #[Assert\Length(min: 8, max: 4096, minMessage: 'Le mot de passe doit comporter au moins 8 caractères.')]
        public string $password,
    ) {
    }
}
