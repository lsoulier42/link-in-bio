<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\ProfileRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/profiles')]
class AdminProfileController extends AbstractController
{
    #[Route('', name: 'api_admin_profiles', methods: ['GET'])]
    public function index(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        return $this->json([
            'profiles' => array_map(fn($p) => [
                'id' => $p->getId(),
                'slug' => $p->getSlug(),
                'displayName' => $p->getDisplayName(),
                'bio' => $p->getBio(),
                'avatarUrl' => $p->getAvatarUrl(),
                'themeName' => $p->getThemeName(),
                'backgroundUrl' => $p->getBackgroundUrl(),
                'backgroundOverlay' => $p->getBackgroundOverlay(),
                'backgroundSize' => $p->getBackgroundSize(),
                'backgroundPosition' => $p->getBackgroundPosition(),
                'nameColor' => $p->getNameColor(),
                'bioColor' => $p->getBioColor(),
                'categoryColor' => $p->getCategoryColor(),
                'nameFont' => $p->getNameFont(),
                'bioFont' => $p->getBioFont(),
                'categoryFont' => $p->getCategoryFont(),
            ], $user->getProfiles()->toArray()),
        ]);
    }

    #[Route('/{id}', name: 'api_admin_profile_update', methods: ['PUT'])]
    public function update(int $id, Request $request, ProfileRepository $profileRepository, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $profile = $profileRepository->find($id);

        if (!$profile || $profile->getUser() !== $user) {
            return $this->json(['error' => 'Profile not found'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['slug'])) {
            $slug = strtolower(trim((string) $data['slug']));
            if ($slug === '' || !preg_match('/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/', $slug)) {
                return $this->json(['error' => 'Invalid slug: lowercase letters, digits and hyphens only.'], 422);
            }
            $existing = $profileRepository->findOneBy(['slug' => $slug]);
            if ($existing && $existing->getId() !== $profile->getId()) {
                return $this->json(['error' => 'This slug is already used by another profile.'], 409);
            }
            $profile->setSlug($slug);
        }

        if (isset($data['displayName'])) $profile->setDisplayName($data['displayName']);
        if (isset($data['bio'])) $profile->setBio($data['bio']);
        if (isset($data['avatarUrl'])) $profile->setAvatarUrl($data['avatarUrl']);
        if (isset($data['themeName'])) $profile->setThemeName($data['themeName']);
        if (array_key_exists('backgroundUrl', $data)) $profile->setBackgroundUrl($data['backgroundUrl'] !== '' ? $data['backgroundUrl'] : null);
        if (isset($data['backgroundOverlay'])) $profile->setBackgroundOverlay(max(0, min(100, (int) $data['backgroundOverlay'])));
        if (isset($data['backgroundSize']) && in_array($data['backgroundSize'], ['cover', 'contain'], true)) $profile->setBackgroundSize($data['backgroundSize']);
        if (isset($data['backgroundPosition']) && in_array($data['backgroundPosition'], ['top', 'center', 'bottom'], true)) $profile->setBackgroundPosition($data['backgroundPosition']);

        foreach (['nameColor' => 'setNameColor', 'bioColor' => 'setBioColor', 'categoryColor' => 'setCategoryColor'] as $field => $setter) {
            if (!array_key_exists($field, $data)) {
                continue;
            }
            $color = $data[$field] !== null ? trim((string) $data[$field]) : null;
            if ($color !== null && $color !== '' && !preg_match('/^#[0-9a-fA-F]{6}$/', $color)) {
                return $this->json(['error' => ucfirst($field) . ' invalid: expected format #RRGGBB.'], 422);
            }
            $profile->{$setter}($color !== '' ? $color : null);
        }

        $allowedFonts = ['sans', 'serif', 'mono', 'cursive', 'display'];
        foreach (['nameFont' => 'setNameFont', 'bioFont' => 'setBioFont', 'categoryFont' => 'setCategoryFont'] as $field => $setter) {
            if (!array_key_exists($field, $data)) {
                continue;
            }
            $font = $data[$field] !== null ? trim((string) $data[$field]) : null;
            if ($font !== null && $font !== '' && !in_array($font, $allowedFonts, true)) {
                return $this->json(['error' => ucfirst($field) . ' invalid: unknown font.'], 422);
            }
            $profile->{$setter}($font !== '' ? $font : null);
        }

        $em->flush();

        return $this->json([
            'id' => $profile->getId(),
            'slug' => $profile->getSlug(),
            'displayName' => $profile->getDisplayName(),
            'bio' => $profile->getBio(),
            'avatarUrl' => $profile->getAvatarUrl(),
            'themeName' => $profile->getThemeName(),
            'backgroundUrl' => $profile->getBackgroundUrl(),
            'backgroundOverlay' => $profile->getBackgroundOverlay(),
            'backgroundSize' => $profile->getBackgroundSize(),
            'backgroundPosition' => $profile->getBackgroundPosition(),
            'nameColor' => $profile->getNameColor(),
            'bioColor' => $profile->getBioColor(),
            'categoryColor' => $profile->getCategoryColor(),
            'nameFont' => $profile->getNameFont(),
            'bioFont' => $profile->getBioFont(),
            'categoryFont' => $profile->getCategoryFont(),
        ]);
    }
}
