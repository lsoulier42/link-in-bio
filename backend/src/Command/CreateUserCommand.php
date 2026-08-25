<?php

namespace App\Command;

use App\Entity\Profile;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-user',
    description: 'Create an admin user with a profile',
)]
class CreateUserCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'User email address')
            ->addArgument('password', InputArgument::REQUIRED, 'User password')
            ->addArgument('slug', InputArgument::REQUIRED, 'Profile slug (e.g. "alice")')
            ->addArgument('displayName', InputArgument::REQUIRED, 'Display name')
            ->addOption('bio', null, InputOption::VALUE_OPTIONAL, 'Profile bio', null)
            ->addOption('theme', null, InputOption::VALUE_OPTIONAL, 'Theme name (dark, rose, ocean, sunset, glass)', 'dark')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $email = $input->getArgument('email');
        $password = $input->getArgument('password');
        $slug = $input->getArgument('slug');
        $displayName = $input->getArgument('displayName');
        $bio = $input->getOption('bio');
        $theme = $input->getOption('theme');

        // Check if email already exists
        $existing = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($existing) {
            $io->error(sprintf('A user with email "%s" already exists.', $email));
            return Command::FAILURE;
        }

        // Check if slug already exists
        $existingProfile = $this->em->getRepository(Profile::class)->findOneBy(['slug' => $slug]);
        if ($existingProfile) {
            $io->error(sprintf('A profile with slug "%s" already exists.', $slug));
            return Command::FAILURE;
        }

        // Create user
        $user = new User();
        $user->setEmail($email);
        $user->setRoles(['ROLE_ADMIN']);
        $user->setPassword($this->passwordHasher->hashPassword($user, $password));

        // Create profile
        $profile = new Profile();
        $profile->setSlug($slug);
        $profile->setDisplayName($displayName);
        $profile->setBio($bio);
        $profile->setThemeName($theme);
        $user->addProfile($profile);

        $this->em->persist($user);
        $this->em->flush();

        $io->success(sprintf(
            'User "%s" created with profile "/%s" (theme: %s)',
            $email,
            $slug,
            $theme,
        ));

        $io->table(
            ['Field', 'Value'],
            [
                ['Email', $email],
                ['Slug', '/' . $slug],
                ['Display Name', $displayName],
                ['Theme', $theme],
                ['Bio', $bio ?: '(none)'],
            ]
        );

        return Command::SUCCESS;
    }
}
