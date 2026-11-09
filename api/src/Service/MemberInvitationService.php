<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\FarmMembership;
use App\Entity\MemberInvitation;
use App\Entity\User;
use App\Repository\MemberInvitationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;

final class MemberInvitationService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly MemberInvitationRepository $invitationRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly EmailSender $emailSender,
        private readonly TokenStorageInterface $tokenStorage,
        private readonly LoggerInterface $logger,
        #[Autowire('%env(FRONTEND_URL)%')]
        private readonly string $frontendUrl,
    ) {
    }

    public function inviteNewAccount(FarmMembership $membership): void
    {
        $token = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
        $invitation = new MemberInvitation(
            $membership,
            hash('sha256', $token),
            new \DateTimeImmutable('+7 days'),
        );
        $this->entityManager->persist($invitation);

        $this->sendInvitation(
            $membership,
            rtrim($this->frontendUrl, '/') . '/accept-invitation?token=' . rawurlencode($token),
            $invitation->getExpiresAt(),
        );
    }

    public function notifyExistingAccount(FarmMembership $membership): void
    {
        $this->sendInvitation(
            $membership,
            rtrim($this->frontendUrl, '/') . '/login',
            null,
        );
    }

    public function resend(FarmMembership $membership): void
    {
        if ($membership->getUser()->isActive()) {
            throw new \InvalidArgumentException('Ce collaborateur possède déjà un compte actif.');
        }

        $this->entityManager->wrapInTransaction(function () use ($membership): void {
            foreach ($this->invitationRepository->findAllForMembership($membership) as $oldInvitation) {
                $this->entityManager->remove($oldInvitation);
            }

            $this->inviteNewAccount($membership);
            $this->entityManager->flush();
        });
    }

    public function accept(string $plainToken, string $newPassword): void
    {
        $token = trim($plainToken);
        if ($token === '' || mb_strlen($newPassword) < 8) {
            throw new \InvalidArgumentException('Le lien ou le mot de passe est invalide.');
        }

        $invitation = $this->invitationRepository->findByPlainToken($token);
        $now = new \DateTimeImmutable();
        if ($invitation === null || !$invitation->isValidAt($now)) {
            throw new \InvalidArgumentException('Ce lien d’invitation est invalide ou a expiré.');
        }

        $membership = $invitation->getMembership();
        $user = $membership->getUser();
        if ($user->isActive()) {
            throw new \InvalidArgumentException('Ce compte est déjà activé. Connectez-vous pour accéder à votre exploitation.');
        }

        $user->setPassword($this->passwordHasher->hashPassword($user, $newPassword));
        $user->setIsActive(true);
        $membership->setIsActive(true);
        $invitation->markAccepted($now);
        $this->entityManager->flush();
    }

    private function sendInvitation(
        FarmMembership $membership,
        string $invitationUrl,
        ?\DateTimeImmutable $expiresAt,
    ): void {
        $inviter = $this->tokenStorage->getToken()?->getUser();
        $inviterName = $inviter instanceof User ? $inviter->getFullName() : 'L’équipe de votre exploitation';

        try {
            $this->emailSender->sendTemplate(
                $membership->getUser()->getEmail(),
                sprintf('Invitation à rejoindre %s sur Poulvia', $membership->getFarm()->getName()),
                'emails/invitation.html.twig',
                [
                    'firstName' => $membership->getUser()->getFirstName(),
                    'inviterName' => $inviterName,
                    'farmName' => $membership->getFarm()->getName(),
                    'invitationUrl' => $invitationUrl,
                    'expiresAt' => $expiresAt,
                ],
            );
        } catch (\Throwable $exception) {
            $this->logger->warning('Échec de livraison d’une invitation de collaborateur.', [
                'exceptionClass' => $exception::class,
                'membershipId' => $membership->getId()?->toBase32(),
            ]);

            // L'ajout reste atomique : ne conserve pas un compte bloqué si l'invitation n'est pas partie.
            throw new ServiceUnavailableHttpException(
                null,
                'L’invitation par e-mail n’a pas pu être envoyée. Vérifiez la configuration de messagerie puis réessayez.',
                $exception,
            );
        }
    }
}
