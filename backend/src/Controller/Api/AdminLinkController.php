<?php

namespace App\Controller\Api;

use App\Entity\Link;
use App\Entity\User;
use App\Repository\CategoryRepository;
use App\Repository\LinkRepository;
use App\Repository\ProfileRepository;
use App\Service\SocialNetworkService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/profiles/{profileId}/links')]
class AdminLinkController extends AbstractController
{
    // Doit rester synchronisé avec le registre d'icônes côté frontend (frontend/src/icons/index.js)
    private const ALLOWED_ICON_NAMES = [
        'x', 'instagram', 'bluesky', 'threads', 'mastodon', 'facebook', 'tiktok', 'snapchat',
        'pinterest', 'youtube', 'tumblr', 'discord', 'reddit', 'linkedin', 'whatsapp',
        'messenger', 'telegram', 'slack', 'onlyfans', 'mym', 'fansly', 'throne', 'twitch',
        'spotify', 'github', 'amazon', 'etsy', 'vinted', 'paypal', 'stripe',
        'external-link', 'link', 'gift', 'heart', 'star', 'globe', 'mail', 'phone',
    ];

    private const DISPLAY_STYLES = ['card', 'icon'];

    public function __construct(
        private readonly SocialNetworkService $socialNetwork,
        private readonly CategoryRepository $categoryRepository,
    ) {}

    private function verifyProfileOwnership(int $profileId, ProfileRepository $profileRepository): ?\App\Entity\Profile
    {
        /** @var User $user */
        $user = $this->getUser();
        $profile = $profileRepository->find($profileId);

        if (!$profile || $profile->getUser() !== $user) {
            return null;
        }

        return $profile;
    }

    private function isValidIconName(?string $iconName): bool
    {
        return $iconName === null || $iconName === '' || in_array($iconName, self::ALLOWED_ICON_NAMES, true);
    }

    private function isValidHttpUrl(string $url): bool
    {
        $parts = parse_url($url);

        return isset($parts['scheme'], $parts['host'])
            && in_array(strtolower($parts['scheme']), ['http', 'https'], true);
    }

    private function sanitizeIconUrl(?string $iconUrl): string|false
    {
        $iconUrl = trim((string) $iconUrl);
        if ($iconUrl === '') {
            return '';
        }
        if (mb_strlen($iconUrl) > 512 || !str_starts_with($iconUrl, '/uploads/')) {
            return false;
        }

        return $iconUrl;
    }

    private function serializeLink(Link $link): array
    {
        return [
            'id' => $link->getId(),
            'title' => $link->getTitle(),
            'url' => $link->getUrl(),
            'iconName' => $link->getIconName(),
            'iconUrl' => $link->getIconUrl(),
            'subtitle' => $link->getSubtitle(),
            'displayStyle' => $link->getDisplayStyle(),
            'networkType' => $link->getNetworkType(),
            'handle' => $link->getHandle(),
            'displayName' => $link->getDisplayName(),
            'avatarUrl' => $link->getAvatarUrl(),
            'categoryId' => $link->getCategory()?->getId(),
            'position' => $link->getPosition(),
            'isActive' => $link->isActive(),
            'clickCount' => $link->getClickCount(),
        ];
    }

    /**
     * Applique le formulaire unifié (6 étapes) sur un lien.
     * Retourne null en cas de succès, sinon un message d'erreur.
     *
     * Accepte aussi les payloads legacy :
     *  - réseau : { networkType, handle }
     *  - custom : { title, url, iconName }
     */
    private function applyLink(Link $link, array $data): ?string
    {
        $mode = $this->resolveMode($data, $link);

        // Titre (obligatoire), avec repli sur le label de la plateforme pour le mode handle
        if (array_key_exists('title', $data)) {
            $title = trim((string) $data['title']);
            if ($title === '' || mb_strlen($title) > 128) {
                return 'Le titre est requis';
            }
        } else {
            $title = $link->getTitle();
        }

        if ($mode === 'handle') {
            $networkType = (string) ($data['networkType'] ?? $data['platform'] ?? $link->getNetworkType() ?? '');
            $handle = (string) ($data['handle'] ?? $link->getHandle() ?? '');
            $network = $this->socialNetwork->getNetwork($networkType);
            if ($network === null) {
                return 'Choisissez une plateforme valide';
            }
            if ($handle === '') {
                return 'Le pseudo est requis';
            }
            $url = $this->socialNetwork->buildUrl($networkType, $handle);
            if ($url === null) {
                return 'Pseudo invalide pour cette plateforme';
            }
            if ($title === null || $title === '') {
                $title = $network['label'];
            }
            $link->setNetworkType($networkType);
            $link->setHandle($this->socialNetwork->normalizeHandle($handle));
            $link->setUrl($url);
        } else {
            $url = trim((string) ($data['url'] ?? $link->getUrl() ?? ''));
            if ($url === '') {
                return 'L’URL est requise';
            }
            if (mb_strlen($url) > 512 || !$this->isValidHttpUrl($url)) {
                return 'Entrez une URL valide (http:// ou https://)';
            }
            $link->setUrl($url);
            $link->setNetworkType(null);
            $link->setHandle(null);
        }

        if ($title === null || $title === '') {
            return 'Le titre est requis';
        }
        $link->setTitle($title);

        // Sous-titre (optionnel)
        if (array_key_exists('subtitle', $data)) {
            $subtitle = trim((string) $data['subtitle']);
            if (mb_strlen($subtitle) > 128) {
                return 'Le sous-titre ne doit pas dépasser 128 caractères';
            }
            $link->setSubtitle($subtitle === '' ? null : $subtitle);
        }

        // Icône : nom whitelisté et/ou image uploadée
        if (array_key_exists('iconName', $data)) {
            if (!$this->isValidIconName($data['iconName'])) {
                return 'Icône invalide';
            }
            $link->setIconName($data['iconName'] === null || $data['iconName'] === '' ? null : $data['iconName']);
        }
        if (array_key_exists('iconUrl', $data)) {
            $iconUrl = $this->sanitizeIconUrl($data['iconUrl']);
            if ($iconUrl === false) {
                return 'Icône personnalisée invalide';
            }
            $link->setIconUrl($iconUrl === '' ? null : $iconUrl);
        }

        // Style d'affichage
        if (array_key_exists('displayStyle', $data)) {
            $displayStyle = $data['displayStyle'];
            if (!in_array($displayStyle, self::DISPLAY_STYLES, true)) {
                return 'Style d’affichage invalide';
            }
            $link->setDisplayStyle($displayStyle);
        }

        // Catégorie (optionnelle)
        if (array_key_exists('categoryId', $data)) {
            $categoryId = $data['categoryId'];
            if ($categoryId === null || $categoryId === '') {
                $link->setCategory(null);
            } else {
                $category = $this->categoryRepository->find($categoryId);
                if (!$category || $category->getProfile() !== $link->getProfile()) {
                    return 'Catégorie invalide';
                }
                $link->setCategory($category);
            }
        }

        return null;
    }

    private function resolveMode(array $data, Link $link): string
    {
        if (array_key_exists('linkMode', $data) && in_array($data['linkMode'], ['handle', 'url'], true)) {
            return $data['linkMode'];
        }

        $hasHandle = !empty($data['handle']) || !empty($data['networkType']) || !empty($data['platform']);

        return $hasHandle || $link->getNetworkType() !== null ? 'handle' : 'url';
    }

    private function isUnifiedPayload(array $data): bool
    {
        foreach (['linkMode', 'platform', 'subtitle', 'iconUrl', 'displayStyle', 'categoryId'] as $key) {
            if (array_key_exists($key, $data)) {
                return true;
            }
        }

        return false;
    }

    #[Route('', name: 'api_admin_links_list', methods: ['GET'])]
    public function index(int $profileId, ProfileRepository $profileRepository): JsonResponse
    {
        $profile = $this->verifyProfileOwnership($profileId, $profileRepository);
        if (!$profile) return $this->json(['error' => 'Profile not found'], 404);

        return $this->json([
            'links' => array_map(
                fn($link) => $this->serializeLink($link),
                $profile->getLinks()->toArray()
            ),
        ]);
    }

    #[Route('', name: 'api_admin_links_create', methods: ['POST'])]
    public function create(int $profileId, Request $request, ProfileRepository $profileRepository, EntityManagerInterface $em): JsonResponse
    {
        $profile = $this->verifyProfileOwnership($profileId, $profileRepository);
        if (!$profile) return $this->json(['error' => 'Profile not found'], 404);

        $data = json_decode($request->getContent(), true);

        $link = new Link();
        $link->setProfile($profile);
        $link->setPosition($data['position'] ?? $profile->getLinks()->count());
        $link->setIsActive($data['isActive'] ?? true);

        if (($error = $this->applyLink($link, $data)) !== null) {
            return $this->json(['error' => $error], 422);
        }

        $em->persist($link);
        $em->flush();

        return $this->json($this->serializeLink($link), 201);
    }

    #[Route('/reorder', name: 'api_admin_links_reorder', methods: ['PUT'])]
    public function reorder(int $profileId, Request $request, ProfileRepository $profileRepository, LinkRepository $linkRepository, EntityManagerInterface $em): JsonResponse
    {
        $profile = $this->verifyProfileOwnership($profileId, $profileRepository);
        if (!$profile) return $this->json(['error' => 'Profile not found'], 404);

        $data = json_decode($request->getContent(), true);
        $ids = $data['ids'] ?? [];

        foreach ($ids as $position => $linkId) {
            $link = $linkRepository->find($linkId);
            if ($link && $link->getProfile() === $profile) {
                $link->setPosition($position);
            }
        }

        $em->flush();

        return $this->json(['success' => true]);
    }

    #[Route('/{id}', name: 'api_admin_links_update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $profileId, int $id, Request $request, ProfileRepository $profileRepository, LinkRepository $linkRepository, EntityManagerInterface $em): JsonResponse
    {
        $profile = $this->verifyProfileOwnership($profileId, $profileRepository);
        if (!$profile) return $this->json(['error' => 'Profile not found'], 404);

        $link = $linkRepository->find($id);
        if (!$link || $link->getProfile() !== $profile) {
            return $this->json(['error' => 'Link not found'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if ($this->isUnifiedPayload($data)) {
            if (($error = $this->applyLink($link, $data)) !== null) {
                return $this->json(['error' => $error], 422);
            }
        } else {
            // Payload partiel legacy : isActive, position, title, url, iconName seuls
            if (isset($data['title'])) $link->setTitle($data['title']);
            if (isset($data['url'])) $link->setUrl($data['url']);
            if (array_key_exists('iconName', $data)) {
                if (!$this->isValidIconName($data['iconName'])) {
                    return $this->json(['error' => 'Icône invalide'], 422);
                }
                $link->setIconName($data['iconName'] === '' ? null : $data['iconName']);
            }
            if (array_key_exists('networkType', $data) || array_key_exists('handle', $data)) {
                $networkType = $data['networkType'] ?? $link->getNetworkType();
                if (!empty($networkType)) {
                    $handle = $data['handle'] ?? $link->getHandle();
                    $url = $this->socialNetwork->buildUrl($networkType, (string) $handle);
                    if ($url === null) {
                        return $this->json(['error' => 'Réseau social ou handle invalide'], 422);
                    }
                    $link->setNetworkType($networkType);
                    $link->setHandle($this->socialNetwork->normalizeHandle((string) $handle));
                    $link->setUrl($url);
                }
            }
        }

        if (isset($data['position'])) $link->setPosition($data['position']);
        if (array_key_exists('isActive', $data)) $link->setIsActive($data['isActive']);

        $em->flush();

        return $this->json($this->serializeLink($link));
    }

    #[Route('/{id}', name: 'api_admin_links_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $profileId, int $id, ProfileRepository $profileRepository, LinkRepository $linkRepository, EntityManagerInterface $em): JsonResponse
    {
        $profile = $this->verifyProfileOwnership($profileId, $profileRepository);
        if (!$profile) return $this->json(['error' => 'Profile not found'], 404);

        $link = $linkRepository->find($id);
        if (!$link || $link->getProfile() !== $profile) {
            return $this->json(['error' => 'Link not found'], 404);
        }

        $em->remove($link);
        $em->flush();

        return $this->json(null, 204);
    }
}
