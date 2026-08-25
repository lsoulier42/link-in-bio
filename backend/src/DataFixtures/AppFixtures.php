<?php

namespace App\DataFixtures;

use App\Entity\Category;
use App\Entity\Link;
use App\Entity\Profile;
use App\Entity\User;
use App\Service\SocialNetworkService;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher,
        private SocialNetworkService $socialNetwork,
    ) {}

    private function createCategory(array $data): Category
    {
        $category = new Category();
        $category->setName($data['name']);
        $category->setPosition($data['position']);

        return $category;
    }

    private function createLink(array $linkData, ?Category $category = null): Link
    {
        $link = new Link();
        if (($linkData['type'] ?? 'custom') === 'network') {
            $networkType = $linkData['networkType'];
            $network = $this->socialNetwork->getNetwork($networkType);
            $link->setNetworkType($networkType);
            $link->setHandle($linkData['handle']);
            $link->setUrl($this->socialNetwork->buildUrl($networkType, $linkData['handle']));
            $link->setTitle($network['label'] ?? $linkData['handle']);
            $link->setSubtitle('@' . ltrim($linkData['handle'], '@'));
            $link->setIconName($this->socialNetwork->getIconName($networkType));
        } else {
            $link->setTitle($linkData['title']);
            $link->setUrl($linkData['url']);
            $link->setIconName($linkData['iconName']);
        }
        $link->setPosition($linkData['position']);
        $link->setDisplayStyle($linkData['displayStyle'] ?? 'card');
        if ($category !== null) {
            $link->setCategory($category);
        }

        return $link;
    }

    public function load(ObjectManager $manager): void
    {
        // User 1: Alice
        $user1 = new User();
        $user1->setEmail('demo@example.com');
        $user1->setRoles(['ROLE_ADMIN']);
        $user1->setPassword($this->passwordHasher->hashPassword($user1, 'password123'));

        $profile1 = new Profile();
        $profile1->setSlug('alice');
        $profile1->setDisplayName('Alice');
        $profile1->setBio('Passionate developer & creative ✨');
        $profile1->setThemeName('rose');
        $user1->addProfile($profile1);

        $categories1 = [
            ['name' => 'Social media', 'position' => 0],
            ['name' => 'Useful links', 'position' => 1],
        ];

        $category1Social = $this->createCategory($categories1[0]);
        $category1Useful = $this->createCategory($categories1[1]);
        $profile1->addCategory($category1Social);
        $profile1->addCategory($category1Useful);

        $links1 = [
            ['type' => 'network', 'networkType' => 'instagram', 'handle' => 'alice', 'position' => 0],
            ['type' => 'network', 'networkType' => 'github', 'handle' => 'alice', 'position' => 1],
            ['type' => 'custom', 'title' => 'Portfolio', 'url' => 'https://alice.example.com', 'iconName' => 'globe', 'position' => 2],
            ['type' => 'custom', 'title' => 'Wishlist', 'url' => 'https://example.com/wishlist', 'iconName' => 'gift', 'position' => 3],
        ];

        foreach ($links1 as $i => $linkData) {
            $category = $i < 2 ? $category1Social : $category1Useful;
            $profile1->addLink($this->createLink($linkData, $category));
        }

        $manager->persist($user1);

        // User 2: Bob
        $user2 = new User();
        $user2->setEmail('demo2@example.com');
        $user2->setRoles(['ROLE_ADMIN']);
        $user2->setPassword($this->passwordHasher->hashPassword($user2, 'password123'));

        $profile2 = new Profile();
        $profile2->setSlug('bob');
        $profile2->setDisplayName('Bob');
        $profile2->setBio('Traveler, musician & lover of life 🎵');
        $profile2->setThemeName('ocean');
        $user2->addProfile($profile2);

        $links2 = [
            ['type' => 'network', 'networkType' => 'linkedin', 'handle' => 'bob', 'position' => 0],
            ['type' => 'custom', 'title' => 'Blog', 'url' => 'https://blog.example.com', 'iconName' => 'link', 'position' => 1],
            ['type' => 'custom', 'title' => 'Spotify', 'url' => 'https://open.spotify.com/user/bob', 'iconName' => 'link', 'position' => 2],
            ['type' => 'custom', 'title' => 'Gift list', 'url' => 'https://example.com/gifts', 'iconName' => 'gift', 'position' => 3, 'displayStyle' => 'icon'],
        ];

        foreach ($links2 as $linkData) {
            $profile2->addLink($this->createLink($linkData));
        }

        $manager->persist($user2);

        $manager->flush();
    }
}
