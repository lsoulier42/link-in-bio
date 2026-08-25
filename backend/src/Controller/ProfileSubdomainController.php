<?php

namespace App\Controller;

use App\Repository\ProfileRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Renders the public page of a profile on its subdomain.
 *
 * E.g. alice.example.com -> profile whose slug is "alice".
 * The subdomain -> slug mapping is fully dynamic: any new subdomain
 * <slug>.example.com automatically maps to the matching profile,
 * without any extra configuration.
 */
class ProfileSubdomainController extends AbstractController
{
    #[Route('/', name: 'profile_subdomain', host: '{slug}.example.com', requirements: ['slug' => '(?!www\.|app\.|api\.)[a-z0-9-]+'], methods: ['GET'])]
    public function index(string $slug, ProfileRepository $profiles): Response
    {
        if (!$profiles->findOneBy(['slug' => $slug])) {
            throw $this->createNotFoundException('Profile not found');
        }

        $index = $this->getParameter('kernel.project_dir').'/public/app/index.html';

        return new Response(
            file_get_contents($index) ?: throw $this->createNotFoundException('Frontend build missing'),
            Response::HTTP_OK,
            ['Content-Type' => 'text/html; charset=UTF-8']
        );
    }
}
