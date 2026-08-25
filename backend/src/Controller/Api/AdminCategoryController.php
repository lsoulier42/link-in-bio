<?php

namespace App\Controller\Api;

use App\Entity\Category;
use App\Entity\User;
use App\Repository\CategoryRepository;
use App\Repository\ProfileRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/profiles/{profileId}/categories')]
class AdminCategoryController extends AbstractController
{
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

    private function serializeCategory(Category $category): array
    {
        return [
            'id' => $category->getId(),
            'name' => $category->getName(),
            'position' => $category->getPosition(),
            'linkCount' => $category->getLinks()->count(),
        ];
    }

    private function validateName(?string $name): ?string
    {
        $name = trim((string) $name);
        if ($name === '' || mb_strlen($name) > 128) {
            return 'Category name is required (max 128 characters)';
        }

        return null;
    }

    #[Route('', name: 'api_admin_categories_list', methods: ['GET'])]
    public function index(int $profileId, ProfileRepository $profileRepository, CategoryRepository $categoryRepository): JsonResponse
    {
        $profile = $this->verifyProfileOwnership($profileId, $profileRepository);
        if (!$profile) return $this->json(['error' => 'Profile not found'], 404);

        $categories = $categoryRepository->findByProfileOrdered($profileId);

        return $this->json([
            'categories' => array_map(fn($category) => $this->serializeCategory($category), $categories),
        ]);
    }

    #[Route('', name: 'api_admin_categories_create', methods: ['POST'])]
    public function create(int $profileId, Request $request, ProfileRepository $profileRepository, EntityManagerInterface $em): JsonResponse
    {
        $profile = $this->verifyProfileOwnership($profileId, $profileRepository);
        if (!$profile) return $this->json(['error' => 'Profile not found'], 404);

        $data = json_decode($request->getContent(), true) ?? [];

        if (($error = $this->validateName($data['name'] ?? null)) !== null) {
            return $this->json(['error' => $error], 422);
        }

        $category = new Category();
        $category->setName(trim((string) $data['name']));
        $category->setPosition($data['position'] ?? $profile->getCategories()->count());
        $profile->addCategory($category);

        $em->persist($category);
        $em->flush();

        return $this->json($this->serializeCategory($category), 201);
    }

    #[Route('/reorder', name: 'api_admin_categories_reorder', methods: ['PUT'])]
    public function reorder(int $profileId, Request $request, ProfileRepository $profileRepository, CategoryRepository $categoryRepository, EntityManagerInterface $em): JsonResponse
    {
        $profile = $this->verifyProfileOwnership($profileId, $profileRepository);
        if (!$profile) return $this->json(['error' => 'Profile not found'], 404);

        $data = json_decode($request->getContent(), true);
        $ids = $data['ids'] ?? [];

        foreach ($ids as $position => $categoryId) {
            $category = $categoryRepository->find($categoryId);
            if ($category && $category->getProfile() === $profile) {
                $category->setPosition($position);
            }
        }

        $em->flush();

        return $this->json(['success' => true]);
    }

    #[Route('/{id}', name: 'api_admin_categories_update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $profileId, int $id, Request $request, ProfileRepository $profileRepository, CategoryRepository $categoryRepository, EntityManagerInterface $em): JsonResponse
    {
        $profile = $this->verifyProfileOwnership($profileId, $profileRepository);
        if (!$profile) return $this->json(['error' => 'Profile not found'], 404);

        $category = $categoryRepository->find($id);
        if (!$category || $category->getProfile() !== $profile) {
            return $this->json(['error' => 'Category not found'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (array_key_exists('name', $data)) {
            if (($error = $this->validateName($data['name'])) !== null) {
                return $this->json(['error' => $error], 422);
            }
            $category->setName(trim((string) $data['name']));
        }
        if (isset($data['position'])) {
            $category->setPosition((int) $data['position']);
        }

        $em->flush();

        return $this->json($this->serializeCategory($category));
    }

    #[Route('/{id}', name: 'api_admin_categories_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $profileId, int $id, ProfileRepository $profileRepository, CategoryRepository $categoryRepository, EntityManagerInterface $em): JsonResponse
    {
        $profile = $this->verifyProfileOwnership($profileId, $profileRepository);
        if (!$profile) return $this->json(['error' => 'Profile not found'], 404);

        $category = $categoryRepository->find($id);
        if (!$category || $category->getProfile() !== $profile) {
            return $this->json(['error' => 'Category not found'], 404);
        }

        foreach ($category->getLinks() as $link) {
            $link->setCategory(null);
        }
        $profile->removeCategory($category);
        $em->remove($category);
        $em->flush();

        return $this->json(null, 204);
    }
}
