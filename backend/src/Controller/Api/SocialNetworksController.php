<?php

namespace App\Controller\Api;

use App\Service\SocialNetworkService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class SocialNetworksController extends AbstractController
{
    #[Route('/api/social-networks', name: 'api_social_networks', methods: ['GET'])]
    public function index(SocialNetworkService $socialNetwork): JsonResponse
    {
        return $this->json([
            'networks' => $socialNetwork->getNetworks(),
        ]);
    }
}
