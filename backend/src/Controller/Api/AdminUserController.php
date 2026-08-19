<?php

namespace App\Controller\Api;

use App\Entity\Profile;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/admin/users')]
class AdminUserController extends AbstractController
{
    private const ALLOWED_ROLES = ['ROLE_ADMIN'];

    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private ValidatorInterface $validator,
    ) {}

    #[Route('', name: 'api_admin_users', methods: ['GET'])]
    public function index(UserRepository $userRepository): JsonResponse
    {
        $users = $userRepository->findBy([], ['createdAt' => 'DESC']);

        return $this->json([
            'users' => array_map(fn(User $u) => $this->serialize($u), $users),
        ]);
    }

    #[Route('/{id}', name: 'api_admin_user_show', methods: ['GET'])]
    public function show(int $id, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable'], 404);
        }

        return $this->json($this->serialize($user));
    }

    #[Route('', name: 'api_admin_user_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $email = trim((string) ($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');
        $roles = $this->normalizeRoles($data['roles'] ?? []);

        if ($email === '') {
            return $this->json(['error' => 'L\'email est requis'], 422);
        }
        if ($password === '') {
            return $this->json(['error' => 'Le mot de passe est requis'], 422);
        }
        if ($this->em->getRepository(User::class)->findOneBy(['email' => $email])) {
            return $this->json(['error' => 'Un utilisateur avec cet email existe déjà'], 409);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setRoles($roles);
        $user->setPassword($this->passwordHasher->hashPassword($user, $password));

        $profileData = $data['profile'] ?? null;
        if (is_array($profileData) && !empty($profileData['slug'])) {
            $slug = strtolower(trim((string) $profileData['slug']));
            if (!preg_match('/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/', $slug)) {
                return $this->json(['error' => 'Slug invalide : lettres minuscules, chiffres et tirets uniquement.'], 422);
            }
            if ($this->em->getRepository(Profile::class)->findOneBy(['slug' => $slug])) {
                return $this->json(['error' => 'Un profil avec ce slug existe déjà'], 409);
            }
            $profile = new Profile();
            $profile->setSlug($slug);
            $profile->setDisplayName(trim((string) ($profileData['displayName'] ?? $slug)));
            $profile->setBio(isset($profileData['bio']) ? trim((string) $profileData['bio']) : null);
            $profile->setThemeName((string) ($profileData['themeName'] ?? 'dark'));
            $user->addProfile($profile);
        }

        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            return $this->json(['error' => (string) $errors], 422);
        }

        $this->em->persist($user);
        $this->em->flush();

        return $this->json($this->serialize($user), 201);
    }

    #[Route('/{id}', name: 'api_admin_user_update', methods: ['PUT'])]
    public function update(int $id, Request $request, UserRepository $userRepository): JsonResponse
    {
        /** @var User $current */
        $current = $this->getUser();
        $user = $userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (isset($data['email'])) {
            $email = trim((string) $data['email']);
            if ($email === '') {
                return $this->json(['error' => 'L\'email est requis'], 422);
            }
            $existing = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
            if ($existing && $existing->getId() !== $user->getId()) {
                return $this->json(['error' => 'Un utilisateur avec cet email existe déjà'], 409);
            }
            $user->setEmail($email);
        }

        if (isset($data['password']) && $data['password'] !== '') {
            $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));
        }

        if (array_key_exists('roles', $data)) {
            $newRoles = $this->normalizeRoles($data['roles']);
            $wasAdmin = in_array('ROLE_ADMIN', $user->getRoles(), true);
            $isAdmin = in_array('ROLE_ADMIN', $newRoles, true);

            if (!$isAdmin && $user->getId() === $current->getId()) {
                return $this->json(['error' => 'Vous ne pouvez pas retirer votre propre rôle administrateur'], 403);
            }
            if (!$isAdmin && $wasAdmin && $this->isLastAdmin()) {
                return $this->json(['error' => 'Impossible de retirer le rôle administrateur du dernier admin'], 403);
            }
            $user->setRoles($newRoles);
        }

        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            return $this->json(['error' => (string) $errors], 422);
        }

        $this->em->flush();

        return $this->json($this->serialize($user));
    }

    #[Route('/{id}', name: 'api_admin_user_delete', methods: ['DELETE'])]
    public function delete(int $id, UserRepository $userRepository): JsonResponse
    {
        /** @var User $current */
        $current = $this->getUser();
        $user = $userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable'], 404);
        }
        if ($user->getId() === $current->getId()) {
            return $this->json(['error' => 'Vous ne pouvez pas supprimer votre propre compte'], 403);
        }
        if (in_array('ROLE_ADMIN', $user->getRoles(), true) && $this->isLastAdmin()) {
            return $this->json(['error' => 'Impossible de supprimer le dernier administrateur'], 403);
        }

        $this->em->remove($user);
        $this->em->flush();

        return $this->json(null, 204);
    }

    /** @return list<string> */
    private function normalizeRoles(mixed $roles): array
    {
        $given = is_array($roles) ? $roles : [$roles];
        $normalized = array_values(array_filter($given, fn($role) => in_array($role, self::ALLOWED_ROLES, true)));

        return array_unique($normalized);
    }

    private function isLastAdmin(): bool
    {
        return $this->em->getRepository(User::class)->countAdmins() <= 1;
    }

    /** @return array<string, mixed> */
    private function serialize(User $user): array
    {
        return [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'createdAt' => $user->getCreatedAt()?->format('c'),
            'profiles' => array_map(fn(Profile $p) => [
                'id' => $p->getId(),
                'slug' => $p->getSlug(),
                'displayName' => $p->getDisplayName(),
            ], $user->getProfiles()->toArray()),
        ];
    }
}
