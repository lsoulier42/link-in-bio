<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class ThemesController extends AbstractController
{
    #[Route('/api/themes', name: 'api_themes', methods: ['GET'])]
    public function index(): JsonResponse
    {
        return $this->json([
            'themes' => [
                [
                    'name' => 'dark',
                    'label' => 'Midnight',
                    'preview' => ['bg' => '#0f172a', 'card' => '#1e293b', 'accent' => '#8b5cf6', 'text' => '#f8fafc'],
                ],
                [
                    'name' => 'rose',
                    'label' => 'Blossom',
                    'preview' => ['bg' => '#fdf2f8', 'card' => '#ffffff', 'accent' => '#ec4899', 'text' => '#1f2937'],
                ],
                [
                    'name' => 'ocean',
                    'label' => 'Ocean',
                    'preview' => ['bg' => '#0c4a6e', 'card' => '#0e7490', 'accent' => '#22d3ee', 'text' => '#f0fdfa'],
                ],
                [
                    'name' => 'sunset',
                    'label' => 'Golden Hour',
                    'preview' => ['bg' => '#1c1917', 'card' => '#292524', 'accent' => '#f97316', 'text' => '#fef3c7'],
                ],
                [
                    'name' => 'glass',
                    'label' => 'Glass',
                    'preview' => ['bg' => '#f3effa', 'card' => '#ffffff', 'accent' => '#a855f7', 'text' => '#ffffff'],
                ],
            ],
        ]);
    }
}
