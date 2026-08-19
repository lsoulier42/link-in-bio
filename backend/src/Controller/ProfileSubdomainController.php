<?php

namespace App\Controller;

use App\Repository\ProfileRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Affiche la page publique d'un profil sur son sous-domaine.
 *
 * Ex. : heloise.example.com -> profil dont le slug est "heloise".
 * La correspondance sous-domaine -> slug est 100 % dynamique : tout nouveau
 * sous-domaine <slug>.example.com mappe automatiquement le profil
 * correspondant, sans aucune configuration supplémentaire.
 */
class ProfileSubdomainController extends AbstractController
{
    #[Route('/', name: 'profile_subdomain', host: '{slug}.example.com', requirements: ['slug' => '(?!www\.|app\.|api\.)[a-z0-9-]+'], methods: ['GET'])]
    public function index(string $slug, ProfileRepository $profiles): Response
    {
        if (!$profiles->findOneBy(['slug' => $slug])) {
            throw $this->createNotFoundException('Profil introuvable');
        }

        $index = $this->getParameter('kernel.project_dir').'/public/app/index.html';

        return new Response(
            file_get_contents($index) ?: throw $this->createNotFoundException('Frontend manquant'),
            Response::HTTP_OK,
            ['Content-Type' => 'text/html; charset=UTF-8']
        );
    }
}
