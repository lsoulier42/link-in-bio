<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\User;

#[Route('/api')]
class SecurityController extends AbstractController
{
    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(#[CurrentUser] ?User $user): JsonResponse
    {
        if (null === $user) {
            return $this->json(['error' => 'Invalid credentials'], 401);
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'profiles' => array_map(fn($p) => [
                'id' => $p->getId(),
                'slug' => $p->getSlug(),
                'displayName' => $p->getDisplayName(),
            ], $user->getProfiles()->toArray()),
        ]);
    }

    #[Route('/logout', name: 'api_logout', methods: ['GET', 'POST'])]
    public function logout(): never
    {
        throw new \LogicException('This should be handled by the firewall.');
    }

    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'profiles' => array_map(fn($p) => [
                'id' => $p->getId(),
                'slug' => $p->getSlug(),
                'displayName' => $p->getDisplayName(),
                'themeName' => $p->getThemeName(),
                'avatarUrl' => $p->getAvatarUrl(),
                'bio' => $p->getBio(),
            ], $user->getProfiles()->toArray()),
        ]);
    }
}
