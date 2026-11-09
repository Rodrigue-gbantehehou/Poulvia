<?php

declare(strict_types=1);

namespace App\Security\Voter;

use App\Entity\Contact;
use App\Entity\Farm;
use App\Entity\FarmMembership;
use App\Entity\User;
use App\Repository\FarmMembershipRepository;
use App\Security\ApiKeySecurityChecker;
use App\Security\FarmPermissionChecker;
use App\Security\Permission;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/**
 * @extends Voter<string, Contact|Farm>
 */
class ContactVoter extends Voter
{
    public const VIEW = 'CONTACT_VIEW';
    public const MANAGE = 'CONTACT_MANAGE';
    public const DELETE = 'CONTACT_DELETE';

    public function __construct(
        private readonly FarmMembershipRepository $membershipRepository,
        private readonly ApiKeySecurityChecker $apiKeyChecker,
        private readonly FarmPermissionChecker $permissionChecker,
    ) {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (!in_array($attribute, [self::VIEW, self::MANAGE, self::DELETE], true)) {
            return false;
        }

        return $subject instanceof Contact || $subject instanceof Farm;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token, #[\SensitiveParameter] mixed $vote = null): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        $farm = match (true) {
            $subject instanceof Contact => $subject->getFarm(),
            $subject instanceof Farm => $subject,
            default => null,
        };

        if ($farm === null) {
            return false;
        }

        $requiredPermission = match ($attribute) {
            self::VIEW => Permission::CONTACT_VIEW,
            self::MANAGE, self::DELETE => Permission::CONTACT_CREATE,
            default => 'none',
        };

        if (!$this->permissionChecker->moduleAllows($farm, $requiredPermission)) {
            return false;
        }

        $apiKey = $this->apiKeyChecker->getApiKey();
        if ($apiKey !== null) {
            if (!$this->apiKeyChecker->isAccessAllowed($farm, $requiredPermission)) {
                return false;
            }
        } elseif (in_array('ROLE_ADMIN', $user->getRoles(), true)) {
            return true;
        }

        $membership = $this->membershipRepository->findOneBy([
            'farm' => $farm,
            'user' => $user,
            'isActive' => true,
        ]);

        if (!$membership instanceof FarmMembership) {
            return false;
        }

        return match ($attribute) {
            self::VIEW => $this->permissionChecker->allows($membership, Permission::CONTACT_VIEW, false),
            self::MANAGE, self::DELETE => $this->permissionChecker->allows($membership, Permission::CONTACT_CREATE),
            default => false,
        };
    }
}
