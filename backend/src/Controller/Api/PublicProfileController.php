<?php

namespace App\Controller\Api;

use App\Repository\LinkRepository;
use App\Repository\ProfileRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/api/public')]
class PublicProfileController extends AbstractController
{
    #[Route('', name: 'api_public_profiles', methods: ['GET'])]
    public function index(ProfileRepository $profileRepository): JsonResponse
    {
        $profiles = array_map(fn($p) => [
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
        ], $profileRepository->findAllPublic());

        return $this->json(['profiles' => $profiles]);
    }

    #[Route('/{slug}', name: 'api_public_profile', methods: ['GET'])]
    public function show(string $slug, ProfileRepository $profileRepository): JsonResponse
    {
        $profile = $profileRepository->findBySlugWithLinks($slug);

        if (!$profile) {
            return $this->json(['error' => 'Profile not found'], 404);
        }

        $activeLinks = array_values(
            array_filter(
                $profile->getLinks()->toArray(),
                fn($link) => $link->isActive()
            )
        );

        return $this->json([
            'profile' => [
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
            ],
            'categories' => array_map(fn($category) => [
                'id' => $category->getId(),
                'name' => $category->getName(),
                'position' => $category->getPosition(),
            ], $profile->getCategories()->toArray()),
            'links' => array_map(fn($link) => [
                'id' => $link->getId(),
                'title' => $link->getTitle(),
                'subtitle' => $link->getSubtitle(),
                'url' => $link->getUrl(),
                'iconName' => $link->getIconName(),
                'iconUrl' => $link->getIconUrl(),
                'displayStyle' => $link->getDisplayStyle(),
                'handle' => $link->getHandle(),
                'displayName' => $link->getDisplayName(),
                'avatarUrl' => $link->getAvatarUrl(),
                'categoryId' => $link->getCategory()?->getId(),
                'position' => $link->getPosition(),
            ], $activeLinks),
        ]);
    }

    #[Route('/{slug}/click/{linkId}', name: 'api_public_click', methods: ['POST'])]
    public function click(string $slug, int $linkId, LinkRepository $linkRepository, EntityManagerInterface $em): JsonResponse
    {
        $link = $linkRepository->find($linkId);

        if (!$link || $link->getProfile()->getSlug() !== $slug) {
            return $this->json(['error' => 'Link not found'], 404);
        }

        $link->incrementClickCount();
        $em->flush();

        return $this->json(['clickCount' => $link->getClickCount()]);
    }
}
